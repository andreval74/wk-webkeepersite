/*
  WK Footer — rodapé compartilhado injetado via DOM, no mesmo padrão do
  header.js (script vendorizado que manipula o DOM diretamente, fora do
  runtime "dc"). O CSS do rodapé vive em styles.css (seletores [data-r="footer"],
  [data-r="footer-brand-row"] etc.) e em regras próprias de .wk-* (compartilhadas
  com o header em "Header unificado").
  Usado em: WebKeeper.html, WebKeeper-site.html, politica-de-privacidade.html,
  termos-de-uso.html — cada página chama WKFooter.mount(rootEl, { page }) dentro
  de componentDidMount(), passando uma ref pra uma <div id="wk-footer-root"></div>
  vazia no template x-dc (mesma regra do wk-header-root: precisa ficar sempre
  vazia, sem sc-if/sc-for/filhos declarados).
  Depende de keeper-config.js já carregado antes (usa KeeperConfig.buildWaLink
  pro link de WhatsApp).

  Selo da marca (ícone + "WebKeeper" + tagline): reaproveita
  WKHeader.buildBrandHTML() (definido em header.js, que precisa carregar antes
  deste arquivo) — mesmo ícone/texto do header. Pra trocar a logo, ver o
  comentário no topo de header.js.
*/
(function (window) {
  'use strict';

  var FOOTER_COLS = [
    { title: 'Serviços', links: [
      { label: 'IA e Automação', hash: '#servicos' },
      { label: 'Desenvolvimento Web', hash: '#servicos' },
      { label: 'SEO & Marketing', hash: '#servicos' },
      { label: 'Integrações', hash: '#servicos' },
      { label: 'Soluções Personalizadas', hash: '#servicos' }
    ] },
    { title: 'Empresa', links: [
      { label: 'Sobre Nós', hash: '#sobre' },
      { label: 'Projetos', hash: '#projetos' },
      { label: 'Diagnóstico Gratuito', hash: '#diagnostico' },
      { label: 'FAQ', hash: '#faq' },
      { label: 'Contato', hash: '#investimento-form' }
    ] }
  ];

  var SOCIAL_ICONS = {
    Facebook: 'M13.5 21v-8h2.5l.4-3h-2.9V8.1c0-.9.3-1.5 1.6-1.5H16.5V4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3H9.8v8h3.7z',
    Instagram: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.4-.9.8-1.3.4-.4.8-.6 1.3-.8.4-.2 1-.3 2.1-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 10 2.6 10.3 2.6 12s0 2-.1 3.2c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4C15.5 4 15.1 4 12 4zm0 3.1a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z',
    LinkedIn: 'M6.9 8.8H3.6V21h3.3V8.8zM5.2 3.4a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM21 21h-3.3v-6c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.3-.1.3-.1.6-.1.9V21H10.6s.1-11 0-12.2h3.3v1.7c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V21z',
    WhatsApp: 'M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .9.9-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.7-.1-.2 0-.4.1-.5l.4-.4c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.6.6-.9 1.3-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.9 4.5 3.9.6.3 1.1.4 1.5.6.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3z'
  };

  // Mesma lógica de header.js: fora de WebKeeper-site.html, âncoras viram link cruzado.
  function crossHref(hash, page) {
    if (page === 'site') return hash;
    return hash === '#' ? './WebKeeper-site.html' : './WebKeeper-site.html' + hash;
  }

  function buildHTML(page) {
    var socials = [
      { label: 'Facebook', url: 'https://www.facebook.com/webkeeperia/' },
      { label: 'Instagram', url: 'https://www.instagram.com/webkeeperia' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/company/webkeeper' },
      { label: 'WhatsApp', url: window.KeeperConfig.buildWaLink('site') }
    ];
    var socialsHtml = socials.map(function (s) {
      return '<a href="' + s.url + '" target="_blank" rel="noopener" aria-label="' + s.label + '" style="width:36px;height:36px;border-radius:9px;background:#0b111f;border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;">'
        + '<svg width="17" height="17" viewBox="0 0 24 24" fill="#c4cae0"><path d="' + SOCIAL_ICONS[s.label] + '"></path></svg>'
        + '</a>';
    }).join('');

    var colsHtml = FOOTER_COLS.map(function (col) {
      var linksHtml = col.links.map(function (l) {
        return '<div style="margin-bottom:10px;"><a href="' + crossHref(l.hash, page) + '" class="link-word" style="font-size:12.5px;">' + l.label + '</a></div>';
      }).join('');
      return '<div><div style="font-size:13px;font-weight:700;color:#f2f4fa;margin-bottom:16px;">' + col.title + '</div>' + linksHtml + '</div>';
    }).join('');

    var waLink = window.KeeperConfig.buildWaLink('site');

    return ''
      + '<div data-r="footer" style="max-width:1560px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1fr 1fr 1.3fr;gap:40px;margin-bottom:40px;">'
      +   '<div>'
      +     '<div data-r="footer-brand-row" style="margin-bottom:16px;">' + window.WKHeader.buildBrandHTML() + '</div>'
      +     '<p data-r="footer-tagline" style="font-size:13px;color:#7d859f;line-height:1.6;max-width:280px;margin:0 0 18px;">Transformamos ideias em sistemas inteligentes. Tecnologia e inovação aplicadas ao seu negócio.</p>'
      +     '<div data-r="footer-socials" style="display:flex;gap:10px;">' + socialsHtml + '</div>'
      +   '</div>'
      +   colsHtml
      +   '<div>'
      +     '<div style="font-size:13px;font-weight:700;color:#f2f4fa;margin-bottom:16px;">Atendimento</div>'
      +     '<p style="font-size:12.5px;color:#7d859f;margin:0 0 14px;line-height:1.6;">Atendimento 100% pelo WhatsApp, disponível 24 horas por dia, 7 dias por semana. Fale com a gente e comece agora.</p>'
      +     '<p style="font-size:12.5px;color:#7d859f;margin:0 0 14px;line-height:1.7;"><a href="mailto:contato@webkeeper.com.br" class="link-word">contato@webkeeper.com.br</a><br>Londrina · PR · Atendimento 24h</p>'
      +     '<a href="' + waLink + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:9px;padding:12px 18px;border-radius:9px;background:#25D366;color:#052e16;font-weight:700;font-size:13px;font-family:\'Sora\',sans-serif;">'
      +       '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff"><path d="' + SOCIAL_ICONS.WhatsApp + '"></path></svg>'
      +       'Falar no WhatsApp</a>'
      +   '</div>'
      + '</div>'
      + '<div data-r="footer-bottom" style="max-width:1560px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;padding-top:22px;border-top:1px solid rgba(255,255,255,.06);flex-wrap:wrap;gap:12px;">'
      +   '<span style="font-size:12px;color:#5b6280;">© 2026 WebKeeper. Todos os direitos reservados.</span>'
      +   '<div style="display:flex;gap:16px;">'
      +     '<a href="./politica-de-privacidade.html" class="link-word" style="font-size:12px;">Política de Privacidade</a>'
      +     '<a href="./termos-de-uso.html" class="link-word" style="font-size:12px;">Termos de Uso</a>'
      +   '</div>'
      + '</div>';
  }

  function mount(rootEl, opts) {
    if (!rootEl) return { destroy: function () {} };
    var page = (opts && opts.page) || 'site';

    var footerEl = document.createElement('footer');
    footerEl.setAttribute('data-screen-label', 'Footer');
    footerEl.style.padding = '0 56px 28px';
    footerEl.innerHTML = buildHTML(page);
    rootEl.appendChild(footerEl);

    return {
      destroy: function () {
        if (footerEl.parentNode) footerEl.parentNode.removeChild(footerEl);
      }
    };
  }

  window.WKFooter = { mount: mount };
})(window);
