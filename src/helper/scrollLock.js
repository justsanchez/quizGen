// helper/scrollLock.js
export const disableScroll = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const bodyPaddingRight = parseInt(window.getComputedStyle(document.body).paddingRight, 10) || 0;
    
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${bodyPaddingRight + scrollBarWidth}px`;
  };
  
  export const enableScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };