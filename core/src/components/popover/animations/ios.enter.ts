import { Animation } from '../../../interface';
import { createAnimation } from '../../../utils/animation/animation';
import { getPopoverDimensions, getPopoverPosition } from '../utils';

const POPOVER_IOS_BODY_PADDING = 5;

/**
 * iOS Popover Enter Animation
 */
export const iosEnterAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const { event: ev, size, trigger, reference, side, align } = opts;
  const doc = (baseEl.ownerDocument as any);
  const isRTL = doc.dir === 'rtl';
  const bodyWidth = doc.defaultView.innerWidth;
  const bodyHeight = doc.defaultView.innerHeight;

  const originX = 'left';
  const originY = 'top';

  const contentEl = baseEl.querySelector('.popover-content') as HTMLElement;
  const { contentWidth, contentHeight } = getPopoverDimensions(size, contentEl, trigger);

  const defaultPosition = {
    top: bodyHeight / 2 - contentHeight / 2,
    left: bodyWidth / 2 - contentWidth / 2
  }

  const { top, left } = getPopoverPosition(isRTL, contentEl, reference, side, align, defaultPosition, trigger, ev);

  contentEl.style.setProperty('transform-origin', `${originY} ${originX}`);
  contentEl.style.setProperty('top', `calc(${top}px + var(--offset-y, 0px))`);
  contentEl.style.setProperty('left', `calc(${left}px + var(--offset-x, 0px))`);

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
