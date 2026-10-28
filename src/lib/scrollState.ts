// Marks <html> with `is-scrolled` once the page has moved off the very top, so sticky
// top bars can grow a soft shadow (and lose it again back at the top) the way app bars do.
// One passive listener for the whole app, throttled to the display's frame rate.
if (typeof window !== 'undefined') {
  let frame = 0;
  const update = () => {
    frame = 0;
    document.documentElement.classList.toggle('is-scrolled', window.scrollY > 6);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

export {};
