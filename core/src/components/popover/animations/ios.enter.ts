import { Animation } from '../../../interface';
import { createAnimation } from '../../../utils/animation/animation';
import { getPopoverDimensions, positionPopover } from '../utils';
/**
 * iOS Popover Enter Animation
 */
export const iosEnterAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const { event: ev, size, trigger, reference, side, align } = opts;
  const originY = 'top';
  const originX = 'left';
  const doc = (baseEl.ownerDocument as any);
  const isRTL = doc.dir === 'rtl';
  const bodyWidth = doc.defaultView.innerWidth;
  const bodyHeight = doc.defaultView.innerHeight;

  const contentEl = baseEl.querySelector('.popover-content') as HTMLElement;
  const { contentWidth } = getPopoverDimensions(size, contentEl, trigger);

  const { top, left } = positionPopover(isRTL, contentEl, reference, side, align, trigger, ev);

  contentEl.style.setProperty('transform-origin', `${originY} ${originX}`);
  contentEl.style.setProperty('top', `calc(${top}px + var(--offset-y))`);
  contentEl.style.setProperty('left', `calc(${left}px + var(--offset-y))`);

  const baseAnimation = createAnimation();
  const backdropAnimation = createAnimation();
  const wrapperAnimation = createAnimation();

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

  return baseAnimation
    .addElement(baseEl)
    .easing('ease')
    .duration(100)
    .beforeAddWrite(() => {
      if (size === 'cover') {
        baseEl.style.setProperty('--width', `${contentWidth}px`);
      }
    })
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
