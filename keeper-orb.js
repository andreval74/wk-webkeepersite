/*
  Keeper Orb — script compartilhado (gaze dos olhos + troca de humor/estado).
  O CSS do orbe vive em styles.css (seção "Keeper Orb").
  Usado em: WebKeeper.html, WebKeeper-site.html e keeper-orb.html.
*/
(function (window) {
  'use strict';

  /**
   * Faz os olhos seguirem o cursor do mouse.
   * @param {HTMLElement} eyesEl elemento .keeper-eyes a ser movido
   * @param {Object} [opts]
   * @param {HTMLElement} [opts.anchorEl] elemento usado como centro de referência (padrão: eyesEl)
   * @param {'fixed'|'proportional'} [opts.mode] 'fixed' = vetor de magnitude constante apontando pro cursor;
   *                                              'proportional' = magnitude cresce com a distância até um teto
   * @param {number} [opts.max] magnitude máxima do deslocamento (px)
   * @param {number} [opts.divisor] usado só no modo 'proportional' (magnitude = min(max, dist/divisor))
   * @param {number} [opts.ease] fator de suavização por frame (0-1, maior = mais rápido)
   * @returns {{ destroy: Function }}
   */
  function attachGaze(eyesEl, opts) {
    opts = opts || {};
    if (!eyesEl) return { destroy: function () {} };
    var anchorEl = opts.anchorEl || eyesEl;
    var mode = opts.mode || 'fixed';
    var max = opts.max != null ? opts.max : 8;
    var divisor = opts.divisor != null ? opts.divisor : 12;
    var ease = opts.ease != null ? opts.ease : 0.5;

    var target = { x: 0, y: 0 };
    var current = { x: 0, y: 0 };
    var raf = null;

    function onMove(e) {
      var r = anchorEl.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var dist = Math.hypot(dx, dy) || 1;
      var mag = mode === 'proportional' ? Math.min(max, dist / divisor) : max;
      target.x = (dx / dist) * mag;
      target.y = (dy / dist) * mag;
      if (!raf) tick();
    }

    function tick() {
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      eyesEl.style.transform = 'translate(calc(-50% + ' + current.x.toFixed(2) + 'px), calc(-50% + ' + current.y.toFixed(2) + 'px))';
      if (Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    window.addEventListener('mousemove', onMove);

    return {
      destroy: function () {
        window.removeEventListener('mousemove', onMove);
        if (raf) cancelAnimationFrame(raf);
      }
    };
  }

  /**
   * Aplica um estado/humor ao orbe trocando a classe modificadora.
   * @param {HTMLElement} orbEl elemento .keeper-orb
   * @param {'idle'|'speaking'|'thinking'|'surprised'} mood
   */
  function setMood(orbEl, mood) {
    if (!orbEl) return;
    orbEl.classList.remove('is-speaking', 'is-thinking', 'is-surprised');
    if (mood && mood !== 'idle') orbEl.classList.add('is-' + mood);
  }

  window.KeeperOrb = { attachGaze: attachGaze, setMood: setMood };
})(window);
