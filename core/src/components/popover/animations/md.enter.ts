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
  const originX = isRTL ? 'right' : 'left';

  const contentEl = baseEl.querySelector('.popover-content') as HTMLElement;
  const { contentWidth } = getPopoverDimensions(size, contentEl, trigger);

  const { top, left } = positionPopover(isRTL, contentEl, reference, side, align, trigger, ev);

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
      'top': `calc(${top}px + var(--offset-y))`,
      'left': `calc(${left}px + var(--offset-x))`,
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
    .beforeStyles({
      '--width': (size === 'cover') ? `${contentWidth}px` : undefined
    })
    .addAnimation([backdropAnimation, wrapperAnimation, contentAnimation, viewportAnimation]);
};
