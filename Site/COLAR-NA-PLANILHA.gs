// =====================================================================
//  CÓDIGO PARA COLAR NA PLANILHA (Extensões → Apps Script)
//  Recebe os cadastros da página e grava na aba "Base leads".
//  Também já está pronto para a pesquisa gravar na aba "Base pesquisa".
// =====================================================================

var ABA_LEADS = 'Base leads';
var ABA_PESQUISA = 'Base pesquisa';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var dados = JSON.parse(e.postData.contents);

    // Campo invisível que só robôs preenchem: ignora sem gravar
    if (dados.website) return responder({ ok: true });

    var email = String(dados.email || '').trim().toLowerCase();
    var telefone = String(dados.telefone || '').trim();
    if (!emailValido(email)) return responder({ ok: false, error: 'invalid_email' });
    if (!telefoneValido(telefone)) return responder({ ok: false, error: 'invalid_phone' });

    var linha;
    var aba;
    if (dados.tipo === 'pesquisa') {
      // Data/Hora | E-mail | Telefone | resposta 1 | resposta 2 | ...
      aba = pegarAba(ABA_PESQUISA);
      linha = [new Date(), email, telefone].concat((dados.respostas || []).map(String));
    } else {
      // Data/Hora | E-mail | Telefone | utm_source | utm_medium | utm_campaign | utm_content | utm_term
      var u = dados.utms || {};
      aba = pegarAba(ABA_LEADS);
      linha = [new Date(), email, telefone,
        u.utm_source, u.utm_medium, u.utm_campaign, u.utm_content, u.utm_term];
    }

    // Espera a vez: se duas pessoas se cadastram no mesmo segundo, uma grava depois da outra
    lock.waitLock(20000);
    aba.appendRow(linha.map(comoTexto));
    SpreadsheetApp.flush();

    return responder({ ok: true, email: email, telefone: telefone });
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

// ?config=1 -> devolve o link do grupo (lido da aba "Config") para a página de obrigado.
// Sem parâmetros, mostra uma mensagem: serve para conferir se está no ar.
function doGet(e) {
  if (e && e.parameter && e.parameter.config) {
    return responder({ ok: true, grupo_whatsapp: linkDoGrupo() });
  }
  return ContentService.createTextOutput('Captura de leads funcionando ✅');
}

// Aba "Config": A1 = "Link do grupo do WhatsApp", B1 = o link. É só trocar a B1.
var ABA_CONFIG = 'Config';

function linkDoGrupo() {
  // Guarda por 60s para não ler a planilha a cada visita (troca do link vale em até 1 minuto)
  var cache = CacheService.getScriptCache();
  var salvo = cache.get('grupo');
  if (salvo) return salvo;
  var link = lerLinkDoGrupo();
  if (/^https?:\/\//.test(link)) cache.put('grupo', link, 60);
  return link;
}

function lerLinkDoGrupo() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA_CONFIG);
  if (!aba) {
    aba = planilha.insertSheet(ABA_CONFIG);
    aba.getRange('A1:B1').setValues([['Link do grupo do WhatsApp', 'COLE O LINK AQUI']]);
    aba.setColumnWidth(1, 220);
    aba.setColumnWidth(2, 420);
  }
  return String(aba.getRange('B1').getValue()).trim();
}

// ---------- auxiliares ----------

function pegarAba(nome) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(nome);
  if (aba) return aba;
  // Aceita diferença de maiúsculas/minúsculas e espaços ("Base Leads", "base leads ")
  var alvo = nome.toLowerCase().replace(/\s+/g, '');
  var abas = planilha.getSheets();
  for (var i = 0; i < abas.length; i++) {
    if (abas[i].getName().toLowerCase().replace(/\s+/g, '') === alvo) return abas[i];
  }
  throw new Error('Aba não encontrada: ' + nome);
}

// Grava como texto: o "+55..." não vira número e ninguém consegue injetar fórmula pela URL
function comoTexto(v) {
  if (v instanceof Date) return v;
  v = String(v == null ? '' : v).slice(0, 300);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function emailValido(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function telefoneValido(v) {
  if (v.indexOf('+55') === 0) {
    // Brasil: DDD + 9 dígitos começando com 9
    return /^\+55[1-9][1-9]9\d{8}$/.test(v);
  }
  return /^\+\d{8,15}$/.test(v); // outros países (já validados na página pela regra de cada país)
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
