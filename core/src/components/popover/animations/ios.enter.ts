import { Animation } from '../../../interface';
import { createAnimation } from '../../../utils/animation/animation';
import { PopoverStyles, ReferenceCoordinates, getPopoverDimensions, getPopoverPosition } from '../utils';

const POPOVER_IOS_BODY_PADDING = 5;

const calculateWindowAdjustment = (
  coordTop: number,
  coordLeft: number,
  bodyPadding: number,
  bodyWidth: number,
  bodyHeight: number,
  contentWidth: number,
  contentHeight: number,
  triggerCoordinates?: ReferenceCoordinates
): PopoverStyles => {
  let left = coordLeft;
  let top = coordTop;
  let bottom;
  let originX = 'left';
  let originY = 'top';
  let checkSafeAreaLeft = false;
  let checkSafeAreaRight = false;
  const triggerTop = triggerCoordinates ? triggerCoordinates.top + triggerCoordinates.height : bodyHeight / 2 - contentHeight / 2;
  const triggerHeight = triggerCoordinates ? triggerCoordinates.height : 0;

  /**
   * Adjust popover so it does not
   * go off the left of the screen.
   */
  if (left < bodyPadding + 25) {
    left = bodyPadding;
    checkSafeAreaLeft = true;
  /**
   * Adjust popover so it does not
   * go off the right of the screen.
   */
  } else if (
    contentWidth + bodyPadding + left + 25 > bodyWidth
  ) {
    checkSafeAreaRight = true;
    left = bodyWidth - contentWidth - bodyPadding;
    originX = 'right';
  }

  /**
   * Adjust popover so it does not
   * go off the top of the screen.
   */
  if (
    triggerTop + triggerHeight + contentHeight > bodyHeight
  ) {
    if (triggerTop - contentHeight > 0) {
      // TODO add arrow stuff
      top = triggerTop - contentHeight - triggerHeight;
      originY = 'bottom';

    /**
     * If not enough room for popover to appear
     * above trigger, then cut it off.
     */
    } else {
      bottom = bodyPadding;
    }
  }

  return { top, left, bottom, originX, originY, checkSafeAreaLeft, checkSafeAreaRight };
}

/**
 * iOS Popover Enter Animation
 */
export const iosEnterAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const { event: ev, size, trigger, reference, side, align } = opts;
  const doc = (baseEl.ownerDocument as any);
  const isRTL = doc.dir === 'rtl';
  const bodyWidth = doc.defaultView.innerWidth;
  const bodyHeight = doc.defaultView.innerHeight;

  const contentEl = baseEl.querySelector('.popover-content') as HTMLElement;
  const { contentWidth, contentHeight } = getPopoverDimensions(size, contentEl, trigger);

  const defaultPosition = {
    top: bodyHeight / 2 - contentHeight / 2,
    left: bodyWidth / 2 - contentWidth / 2
  }

  const results = getPopoverPosition(isRTL, contentEl, reference, side, align, defaultPosition, trigger, ev);

  const { originX, originY, top, left, bottom, checkSafeAreaLeft, checkSafeAreaRight } = calculateWindowAdjustment(results.top, results.left, POPOVER_IOS_BODY_PADDING, bodyWidth, bodyHeight, contentWidth, contentHeight, results.referenceCoordinates);

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

      if (bottom !== undefined) {
        contentEl.style.setProperty('bottom', `${bottom}px`);
      }

      const safeAreaLeft = ' + var(--ion-safe-area-left, 0)';
      const safeAreaRight = ' - var(--ion-safe-area-right, 0)';

      let leftValue = `${left}px`;

      if (checkSafeAreaLeft) {
        leftValue = `${left}px${safeAreaLeft}`;
      }
      if (checkSafeAreaRight) {
        leftValue = `${left}px${safeAreaRight}`;
      }

      contentEl.style.setProperty('top', `calc(${top}px + var(--offset-y, 0))`);
      contentEl.style.setProperty('left', `calc(${leftValue} + var(--offset-x, 0))`);
      contentEl.style.setProperty('transform-origin', `${originY} ${originX}`);
    })
    .addAnimation([backdropAnimation, wrapperAnimation]);
};
