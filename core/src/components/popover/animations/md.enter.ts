import { Animation } from '../../../interface';
import { createAnimation } from '../../../utils/animation/animation';
import { getPopoverDimensions, positionPopover } from '../utils';

/**
 * Md Popover Enter Animation
 */
export const mdEnterAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const { event: ev, size, trigger, reference, side, align } = opts;
  const doc = (baseEl.ownerDocument as any);
  const isRTL = doc.dir === 'rtl';

  const originY = 'top';
  let originX = isRTL ? 'right' : 'left';
  const bodyWidth = doc.defaultView.innerWidth;
  // const bodyHeight = doc.defaultView.innerHeight;

  const contentEl = baseEl.querySelector('.popover-content') as HTMLElement;
  const { contentWidth } = getPopoverDimensions(size, contentEl, trigger);

  const popoverCSS = positionPopover(isRTL, contentEl, reference, side, align, trigger, ev);

  if (popoverCSS.left < POPOVER_MD_BODY_PADDING) {
    popoverCSS.left = POPOVER_MD_BODY_PADDING;
    originX = 'left';
  } else if (
    contentWidth + POPOVER_MD_BODY_PADDING + popoverCSS.left >
    bodyWidth
  ) {
    popoverCSS.left = bodyWidth - contentWidth - POPOVER_MD_BODY_PADDING;
    originX = 'right';
  }

  const baseAnimation = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();
  const contentAnimation = createAnimation();
  const viewportAnimation = createAnimation();

  backdropAnimation
    .addElement(baseEl.querySelector('ion-backdrop')!)
    .fromTo('opacity', 0.01, 'var(--backdrop-opacity)')
    .beforeStyles({
      'pointer-events': 'none'
    })
    .afterClearStyles(['pointer-events']);

  wrapperAnimation
    .addElement(baseEl.querySelector('.popover-wrapper')!)
    .fromTo('opacity', 0.01, 1);

  contentAnimation
    .addElement(contentEl)
    .beforeStyles({
      'top': `calc(${popoverCSS.top}px + var(--offset-y, 0px))`,
      'left': `calc(${popoverCSS.left}px + var(--offset-x, 0px))`,
      'transform-origin': `${originY} ${originX}`
    })
    .fromTo('transform', 'scale(0.001)', 'scale(1)');

  viewportAnimation
    .addElement(baseEl.querySelector('.popover-viewport')!)
    .fromTo('opacity', 0.01, 1);

  return baseAnimation
    .addElement(baseEl)
    .easing('cubic-bezier(0.36,0.66,0.04,1)')
    .duration(300)
    .beforeAddWrite(() => {
      if (size === 'cover') {
        baseEl.style.setProperty('--width', `${contentWidth}px`);
      }
    })
    .addAnimation([backdropAnimation, wrapperAnimation, contentAnimation, viewportAnimation]);
};

const POPOVER_MD_BODY_PADDING = 12;
