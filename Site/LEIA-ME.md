# Página de captura · As 4 conquistas

## O que você precisa fazer (uma vez só, ~3 minutos)

1. Abra a planilha **Base Leads** no Google Sheets.
2. Menu **Extensões → Apps Script**.
3. Apague tudo o que estiver escrito e cole o conteúdo do arquivo **COLAR-NA-PLANILHA.gs** (está nesta pasta). Clique no ícone de **disquete** para salvar.
4. Botão azul **Implantar → Nova implantação**.
   - Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" → **App da Web**.
   - **Executar como:** Eu
   - **Quem pode acessar:** **Qualquer pessoa** ← importante, sem isso não funciona
   - Clique em **Implantar**.
5. O Google vai pedir autorização: **Autorizar acesso** → escolha sua conta → **Avançado** → **Acessar projeto (não seguro)** → **Permitir**.
   (O aviso de "não seguro" aparece em todo script próprio. É o seu código, rodando na sua planilha.)
6. Copie o **URL do App da Web** (termina em `/exec`) e me envie.

Para conferir: abra esse link no navegador. Deve aparecer **"Captura de leads funcionando ✅"**.

> Se um dia alterar o código do script: **Implantar → Gerenciar implantações → ✏️ → Versão: Nova versão → Implantar**.
> Só salvar não basta. Esse é o erro mais comum com Apps Script.

---

## Como funciona

1. A pessoa chega com as UTMs na URL.
2. Preenche e-mail + WhatsApp. O botão só cadastra quando os dois estão válidos.
   - Brasil: DDD válido + 9 dígitos começando com 9, ex.: (11) 98765-4321
   - Outros países: escolhe o código do país, e o número é validado pela regra daquele país.
3. A planilha confere tudo de novo e adiciona **uma linha no fim da aba "Base leads"**.
   Se duas pessoas se cadastram no mesmo segundo, uma espera a outra: nunca sobrescreve.
4. Só depois que a planilha confirma, a pessoa vai para a pesquisa, levando e-mail, telefone e UTMs.

Colunas da **Base leads**: Data/Hora | E-mail | Telefone | utm_source | utm_medium | utm_campaign | utm_content | utm_term

O e-mail fica em minúsculas, e o telefone fica como `+5511987654321`, igual ao que a pesquisa vai gravar na **Base pesquisa** (para o PROCV bater).

## Arquivos

```
index.html             página de captura (tudo num arquivo só: visual, validação e link da planilha)
pesquisa.html          página provisória da pesquisa
COLAR-NA-PLANILHA.gs   código para colar na planilha (passo a passo acima)
assets/                logo
```

## Se o Apps Script der "Erro 401: invalid_client"
Na conta gustavo.vaz.eng o Google não cria sozinho o projeto que autoriza scripts. Solução já aplicada:
o script está ligado ao projeto **captura-cetop** do Google Cloud (Configurações do projeto → Projeto do Google Cloud),
com o seu e-mail cadastrado como usuário de teste. Para novos scripts, ligue-os a esse mesmo projeto.
