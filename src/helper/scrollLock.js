// helper/scrollLock.js

/**
 * Lock body scroll while a modal/drawer is open. Compensates for the
 * disappearing scrollbar by adding equivalent right-padding to the body, so
 * the page doesn't visibly shift when scrolling is disabled.
 *
 * Pair with `enableScroll` in a cleanup/effect-return to restore.
 */
export const disableScroll = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const bodyPaddingRight = parseInt(window.getComputedStyle(document.body).paddingRight, 10) || 0;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`;
  };

  /**
   * Restore body scroll and clear the padding adjustment from `disableScroll`.
   */
  export const enableScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };