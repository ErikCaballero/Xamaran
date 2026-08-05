function updateStickyHeaderLayout() {
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  if (!header || !nav) return;

  const isMobile = window.matchMedia('(max-width: 480px)').matches;
  const headerHeight = header.offsetHeight;
  const navHeight = nav.offsetHeight;

  if (isMobile) {
    document.documentElement.style.setProperty('--sticky-top-nav', `${headerHeight}px`);
    document.documentElement.style.setProperty('--sticky-body-top', `${headerHeight + navHeight}px`);
  } else {
    document.documentElement.style.removeProperty('--sticky-top-nav');
    document.documentElement.style.removeProperty('--sticky-body-top');
  }
}

window.addEventListener('DOMContentLoaded', updateStickyHeaderLayout);
window.addEventListener('resize', updateStickyHeaderLayout);
window.addEventListener('orientationchange', updateStickyHeaderLayout);
