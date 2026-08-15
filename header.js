/*
  WK Header — header compartilhado (hambúrguer + toggle Chat/Site) injetado via DOM,
  fora do runtime "dc" (o mesmo padrão de keeper-orb.js: script vendorizado que
  manipula o DOM diretamente). O CSS do header vive em styles.css (seção "Header
  unificado (header.js)").
  Usado em: WebKeeper.html, WebKeeper-site.html, politica-de-privacidade.html,
  termos-de-uso.html — cada página chama WKHeader.mount(rootEl, { page }) dentro
  de componentDidMount(), passando uma ref pra uma <div id="wk-header-root"></div>
  vazia no template x-dc (precisa ficar sempre vazia: sem sc-if/sc-for/filhos
  declarados, senão o React reconcilia e apaga o que o header.js injetou aqui).
*/
(function (window) {
  'use strict';

  var NAV_LINKS = [
    { label: 'Início',       hash: '#' },
    { label: 'Clientes',     hash: '#clientes' },
    { label: 'Serviços',     hash: '#servicos' },
    { label: 'Processo',     hash: '#processo' },
    { label: 'Sobre',        hash: '#sobre' },
    { label: 'Projetos',     hash: '#projetos' },
    { label: 'Diagnóstico',  hash: '#diagnostico' },
    { label: 'Investimento', hash: '#investimento' },
    { label: 'FAQ',          hash: '#faq' },
    { label: 'Contato',      hash: '#investimento-form' }
  ];

  // page: 'chat' (WebKeeper.html) | 'site' (WebKeeper-site.html) | 'legal' (páginas legais)
  function crossHref(hash, page) {
    if (page === 'site') return hash; // âncora nativa na própria página
    return hash === '#' ? './WebKeeper-site.html' : './WebKeeper-site.html' + hash;
  }

  function buildHTML(page) {
    var navLinksHtml = NAV_LINKS.map(function (l) {
      return '<a href="' + crossHref(l.hash, page) + '" class="link-word wk-nav-link">' + l.label + '</a>';
    }).join('');

    var chatIsActive = page === 'chat';
    var chatOpt = chatIsActive
      ? '<span class="wk-toggle-opt is-active" aria-current="page">Chat</span>'
      : '<a href="./WebKeeper.html" class="wk-toggle-opt">Chat</a>';
    var siteOpt = !chatIsActive
      ? '<span class="wk-toggle-opt is-active" aria-current="page">Site</span>'
      : '<a href="./WebKeeper-site.html" class="wk-toggle-opt">Site</a>';

    return ''
      + '<div class="wk-header-left">'
      +   '<div class="wk-menu-wrap">'
      +     '<button type="button" class="wk-menu-btn" aria-label="Abrir menu de navegação" aria-expanded="false"><span></span><span></span><span></span></button>'
      +     '<nav class="wk-nav-dropdown" style="display:none;">' + navLinksHtml + '</nav>'
      +   '</div>'
      +   '<div class="wk-brand"><img src="./images/wk-shield.png" alt="WebKeeper"><span class="wk-brand-text">Web<span class="wk-brand-accent">Keeper</span></span></div>'
      + '</div>'
      + '<div class="wk-header-center">'
      +   '<nav class="wk-toggle" data-active="' + (chatIsActive ? 'chat' : 'site') + '" aria-label="Alternar entre Chat e Site">'
      +     '<span class="wk-toggle-indicator" aria-hidden="true"></span>' + chatOpt + siteOpt
      +   '</nav>'
      + '</div>'
      + '<div class="wk-header-right">'
      +   '<a href="' + crossHref('#investimento-form', page) + '" class="btn btn--small">'
      +     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"></path><path d="M14 3v4h4"></path><path d="M9.5 12.5h5M9.5 16h3"></path></svg>'
      +     'Entre em contato</a>'
      + '</div>';
  }

  function mount(rootEl, opts) {
    if (!rootEl) return { destroy: function () {} };
    var page = (opts && opts.page) || 'site';

    var headerEl = document.createElement('header');
    headerEl.className = 'site-header';
    headerEl.innerHTML = buildHTML(page);
    rootEl.appendChild(headerEl);

    var menuBtn = headerEl.querySelector('.wk-menu-btn');
    var dropdown = headerEl.querySelector('.wk-nav-dropdown');
    var menuWrap = headerEl.querySelector('.wk-menu-wrap');
    var backdrop = document.createElement('div');
    backdrop.setAttribute('data-r', 'nav-backdrop');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.style.display = 'none';
    menuWrap.appendChild(backdrop);

    var menuOpen = false;
    function setMenuOpen(open) {
      menuOpen = open;
      dropdown.style.display = open ? 'flex' : 'none';
      backdrop.style.display = open ? 'block' : 'none';
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('wk-menu-open', open);
    }
    function closeMenu() { if (menuOpen) setMenuOpen(false); }
    function toggleMenu() { setMenuOpen(!menuOpen); }

    menuBtn.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);
    dropdown.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });

    function onDocClick(e) { if (menuOpen && !menuWrap.contains(e.target)) closeMenu(); }
    function onKeydown(e) { if (e.key === 'Escape') closeMenu(); }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeydown);

    // Fundo/blur/sombra do header ao rolar — mesmo comportamento do antigo
    // initHeader() de WebKeeper-site.html.
    function onScroll() {
      var scrolled = window.scrollY > 24;
      headerEl.style.background = scrolled ? 'rgba(10,15,26,.28)' : 'rgba(10,15,26,0)';
      headerEl.style.backdropFilter = scrolled ? 'blur(14px) saturate(140%)' : 'blur(2px)';
      headerEl.style.webkitBackdropFilter = headerEl.style.backdropFilter;
      headerEl.style.borderBottom = scrolled ? '1px solid rgba(95,166,37,.12)' : '1px solid rgba(95,166,37,0)';
      headerEl.style.boxShadow = scrolled ? '0 8px 30px -22px rgba(0,0,0,.7)' : 'none';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return {
      destroy: function () {
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onKeydown);
        document.body.classList.remove('wk-menu-open');
        if (headerEl.parentNode) headerEl.parentNode.removeChild(headerEl);
      }
    };
  }

  window.WKHeader = { mount: mount };
})(window);
