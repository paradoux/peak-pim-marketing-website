// Use the top layer so customer-story previews escape the scrolling row's mask.
document.querySelectorAll<HTMLElement>('.section_logo2 .logo2_wrapper--case-study').forEach((wrapper) => {
  const card = wrapper.querySelector<HTMLElement>('.logo2_case-study-card');
  if (!card) return;
  card.setAttribute('popover', 'manual');
  let closeTimer: ReturnType<typeof setTimeout>;
  const close = () => {
    clearTimeout(closeTimer);
    if (card.matches(':popover-open')) card.hidePopover();
  };
  const open = () => {
    clearTimeout(closeTimer);
    if (!matchMedia('(min-width: 768px) and (hover: hover)').matches) return;
    card.showPopover();
    const anchor = wrapper.getBoundingClientRect();
    const preview = card.getBoundingClientRect();
    card.style.left = `${Math.max(16, Math.min(anchor.left + (anchor.width - preview.width) / 2, innerWidth - preview.width - 16))}px`;
    card.style.top = `${anchor.top > preview.height + 24 ? anchor.top - preview.height - 8 : Math.min(anchor.bottom + 8, innerHeight - preview.height - 16)}px`;
  };
  const scheduleClose = () => {
    closeTimer = setTimeout(() => {
      if (!wrapper.matches(':hover, :focus-within')) close();
    }, 120);
  };
  wrapper.addEventListener('pointerenter', open);
  wrapper.addEventListener('pointerleave', scheduleClose);
  wrapper.addEventListener('focusin', open);
  wrapper.addEventListener('focusout', scheduleClose);
  card.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  card.addEventListener('pointerleave', scheduleClose);
  wrapper.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  window.addEventListener('scroll', close, { passive: true });
  window.addEventListener('resize', close);
});
