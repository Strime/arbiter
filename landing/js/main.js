/*
 * Amélioration progressive — la page reste entièrement lisible sans JS
 * (les animations `.reveal` ne s'activent que si la classe `js` est posée).
 */
(() => {
  document.documentElement.classList.add('js');

  /* Élévation du header au défilement */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-elevated', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Révélation au défilement */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    targets.forEach((t) => io.observe(t));
  }

  /* Badges de la démo : bascule au clic/tap (le survol est géré en CSS).
     Seules les pastilles contenant une infobulle sont interactives. */
  const badges = [...document.querySelectorAll('button.ab-badge')];
  const close = (badge) => {
    badge.classList.remove('is-open');
    badge.setAttribute('aria-expanded', 'false');
  };
  badges.forEach((badge) => {
    badge.addEventListener('click', () => {
      const open = badge.classList.toggle('is-open');
      badge.setAttribute('aria-expanded', String(open));
      badges.filter((other) => other !== badge).forEach(close);
    });
  });
  window.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('.ab-badge')) return;
    badges.forEach(close);
  });

  /* WCAG 1.4.13 « dismissible » : Échap masque aussi les tooltips affichés
     par hover/focus pur CSS ; blur/mouseleave réarment le badge. */
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    badges.forEach((badge) => {
      close(badge);
      badge.classList.add('is-dismissed');
    });
  });
  badges.forEach((badge) => {
    ['blur', 'mouseleave'].forEach((type) =>
      badge.addEventListener(type, () => badge.classList.remove('is-dismissed'))
    );
  });

  /* Carrousel des captures : le défilement est natif (scroll-snap) ;
     flèches et puces ne font que piloter scrollTo. */
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const track = carousel.querySelector('.carousel__track');
    const slides = [...track.children];
    const dots = [...carousel.querySelectorAll('.carousel__dot')];
    const prev = carousel.querySelector('.carousel__nav--prev');
    const next = carousel.querySelector('.carousel__nav--next');
    const behavior = reduced ? 'auto' : 'smooth';
    const index = () => Math.round(track.scrollLeft / track.clientWidth);
    const goTo = (i) => {
      const target = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: target * track.clientWidth, behavior });
    };
    prev.addEventListener('click', () => goTo(index() - 1));
    next.addEventListener('click', () => goTo(index() + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    const sync = () => {
      const i = index();
      dots.forEach((dot, j) => dot.setAttribute('aria-current', String(i === j)));
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
    };
    sync();
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  }
})();
