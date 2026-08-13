# Prompt — Landing Page de Conversão WebKeeper

Use este prompt completo para gerar a landing page em uma IA de código/design (ou para briefar um redator/designer).

## 1. Contexto e objetivo

A WebKeeper é uma fábrica de ideias e parceira de tecnologia (IA, automação, desenvolvimento sob medida, Web3, sites e SEO), sediada em Londrina/PR, atendendo Apucarana, São Paulo, outras regiões do Brasil e EUA. Já existe um site institucional completo em `WebKeeper-site.html` — **este projeto não é para repetir aquele site**, é para criar uma landing page curta e focada em conversão, que existe para um único objetivo: **fazer o visitante entrar em contato (WhatsApp ou formulário) para pedir um diagnóstico/orçamento.**

Não é a página institucional. É a página que alguém abre vindo de um anúncio, de um link no WhatsApp ou de uma indicação, decide em 30 segundos se vale a pena continuar lendo, e converte.

## 2. Correção de rota em relação ao rascunho original

Meu ponto de discordância direto: seu rascunho pede para "mostrar que atendemos relatório, dashboard, landing page, sites, sistemas complexos, análise de dados, integração de sistemas" e reforçar que a WebKeeper é "multi-tarefas". Isso é o oposto do que converte. Uma LP de conversão vende **uma promessa central e usa o resto como prova**, não uma lista de tudo que a empresa sabe fazer — isso é o papel do site institucional, que já existe. Quanto mais a página tenta provar amplitude, mais ela parece genérica e menos ela converte.

Solução: a página abre com uma promessa única (ex.: "sua empresa mais eficiente e visível com tecnologia, sem contratar uma equipe técnica própria") e usa IA + automação + presença digital como as 3 frentes que sustentam essa promessa — não como 6 pilares de serviço a explicar. Profundidade de serviço fica para a conversa via WhatsApp, não para a LP.

## 3. Público e ângulo

Dono/gestor de PME que sente que está ficando para trás tecnologicamente, mas não tem estrutura técnica interna e não sabe por onde começar. Ele não quer aprender sobre IA — quer alguém confiável que resolva. Tom: consultivo, direto, sem jargão técnico gratuito, sem hype de IA.

## 4. Estrutura da página (limite: 6 blocos, sem rolagem infinita)

1. **Hero** — promessa única + subtítulo de prova + CTA duplo (WhatsApp + "Diagnóstico gratuito"). Sem carrossel, sem vídeo de fundo pesado.
2. **Dor/cenário** — 2 a 3 frases + 2 a 3 números de mercado (reaproveitar as estatísticas Sebrae/PwC/Serasa já usadas no site institucional) para gerar urgência sem parecer alarmista.
3. **Como resolvemos** — 3 blocos curtos (não 6): IA & Automação, Sistemas & Sites, SEO & Performance. Cada bloco: 1 título, 1 frase de benefício (não lista de features).
4. **Prova social** — logos de clientes + 1 a 2 números de resultado (ex. projetos entregues, tempo de resposta 24h) + 1 depoimento curto, se houver.
5. **Como funciona** — as 4 etapas já validadas (Diagnóstico → Planejamento → Desenvolvimento → Entrega & Suporte), em formato compacto, não em cards grandes.
6. **CTA final** — formulário curto (nome, WhatsApp, e-mail) + botão WhatsApp direto. Reforçar "resposta em até 24h" e "sem pacote fixo, proposta sob consulta".

Meta de tamanho: a página deve caber em no máximo 3 a 4 telas de rolagem em desktop. Se um bloco não empurra o visitante para o CTA, corta.

## 5. Copywriting — regras obrigatórias

- Frases curtas. Nunca mais de 2 linhas por parágrafo.
- Cada bloco tem um único ponto, não uma lista de sub-tópicos.
- Trocar recursos por benefícios: não "temos IA, automação, Web3 e SEO", e sim "sua empresa some menos tempo apagando incêndio e ganha mais visibilidade".
- Nada de clichê de "revolucionar", "disruptivo", "sinergia". Falar como quem já resolveu o problema, não como quem está vendendo o problema.
- CTA sempre específico: "Falar com especialista agora", "Quero meu diagnóstico gratuito" — nunca "Saiba mais".
- Reaproveitar frases fortes já validadas no site institucional, por exemplo:
  - "Você traz a ideia, nós entramos como parceiros."
  - "Quem não se moderniza, fica invisível."
  - "Sem pacotes fixos — cada solução é desenhada sob medida."

## 6. Prova e credibilidade (o que sustenta a conversão)

- Logos de clientes reais (mesma lista/seção já usada no site institucional).
- Atendimento 100% WhatsApp, 24h, resposta em até 24h.
- Presença: Londrina · PR, atendendo Apucarana, São Paulo, Brasil e EUA.
- Diagnóstico digital gratuito como isca de baixo atrito antes do orçamento.
- Sem contrato engessado / sem pacote fixo — reduz objeção de preço na primeira conversa.

## 7. Identidade visual (herdar do site atual, não reinventar)

- Fundo escuro (tema dark), tipografia títulos em **Sora**, corpo em fonte sans legível.
- Verde de marca: `#5FA625` (principal) e `#9fdc6e` (destaque/hover), sobre fundo escuro `#0a0e14`-like.
- Cards com bordas sutis, glow leve no hover — mesma linguagem do site institucional, mas com muito mais espaço em branco e menos elementos por tela.
- Botão de WhatsApp flutuante fixo (mesma UX do site atual).
- Mobile-first: mais de 60% do tráfego provavelmente é mobile — testar CTA visível sem rolar no celular.

## 8. Contato e dados reais a usar

- WhatsApp: (43) 99944-6606 — link `https://wa.me/5543999446606`
- E-mail: contato@webkeeper.com.br
- Localização: Londrina · PR · Atendimento 24h
- Nunca colocar preço fechado — sempre "proposta sob consulta em até 24h".

## 9. Requisitos técnicos

- Página única (single page), HTML/CSS/JS leve, sem frameworks pesados desnecessários.
- Performance: LCP < 2.5s, sem imagens não otimizadas, lazy-load abaixo da dobra.
- SEO básico: title, meta description, H1 único, alt em imagens, schema LocalBusiness.
- Formulário de contato funcional (mesmo endpoint/lógica do site institucional, se reaproveitável).
- Responsivo: breakpoints mobile/tablet/desktop testados.
- Acessibilidade mínima: contraste AA no texto sobre fundo escuro, foco visível nos CTAs.

## 10. Critério de aceite

Antes de aprovar a página, checar:

- Um visitante consegue entender a promessa em menos de 5 segundos de leitura do hero?
- Existe apenas UM caminho de ação óbvio (WhatsApp/formulário) repetido, não múltiplos CTAs concorrentes?
- A página caberia inteira sendo lida em voz alta em menos de 90 segundos?
- Nenhum bloco existe só para "mostrar tudo que fazemos" — todo bloco empurra para o contato?

---

**Dúvida em aberto para você decidir antes de eu (ou quem for construir) seguir**: qual é a promessa única do hero — "tecnologia acessível para PME sem time técnico" ou algo mais específico como "mais clientes e menos trabalho manual com IA"? Isso muda o resto do copy.
