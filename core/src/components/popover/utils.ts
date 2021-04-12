import { PopoverSize, PositionAlign, PositionReference, PositionSide, TriggerAction } from '../../interface';
import { raf } from '../../utils/helpers';

/**
 * Returns the recommended dimensions of the popover
 * that takes into account whether or not the width
 * should match the trigger width.
 */
export const getPopoverDimensions = (
  size: PopoverSize,
  contentEl: HTMLElement,
  triggerEl?: HTMLElement
) => {
  const contentDimentions = contentEl.getBoundingClientRect();
  const contentHeight = contentDimentions.height;
  let contentWidth = contentDimentions.width;

  if (size === 'cover' && triggerEl) {
    const triggerDimensions = triggerEl.getBoundingClientRect();
    contentWidth = triggerDimensions.width;
  }

  return {
    contentWidth,
    contentHeight
  }
}

interface TriggerCallback {
  eventName: string;
  callback: (ev: any) => void;
}

interface ReferenceCoordinates {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Configures the triggerEl to respond
 * to user interaction based upon the triggerAction
 * prop that devs have defined.
 */
export const configureTriggerInteraction = (
  triggerEl: HTMLElement,
  triggerAction: TriggerAction,
  popoverEl: HTMLIonPopoverElement
) => {
  let triggerCallbacks: TriggerCallback[] = [];
  switch (triggerAction) {
    case 'hover':
      let hoverTimeout: any;

      triggerCallbacks = [
        {
          eventName: 'mouseenter',
          callback: (ev: Event) => {
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }

            /**
             * Hovering over a trigger should not
             * immediately open the next popover.
             */
            hoverTimeout = setTimeout(() => {
              raf(() => {
                popoverEl.present(ev);
                hoverTimeout = undefined;
              })
            }, 100);
          }
        },
        {
          eventName: 'mouseleave',
          callback: (ev: MouseEvent) => {
            if (hoverTimeout) {
              clearTimeout(hoverTimeout);
            }

            /**
             * If mouse is over another popover
             * that is not this popover then we should
             * close this popover.
             */
            const target = ev.relatedTarget as HTMLElement | null;
            if (!target) { return; }

            if (target.closest('ion-popover') !== popoverEl) {
              popoverEl.dismiss(undefined, undefined, false);
            }
          }
        }
      ]
      break;
    case 'context-menu':
      triggerCallbacks = [
        {
          eventName: 'contextmenu',
          callback: (ev: Event) => {
            /**
             * Prevents the platform context
             * menu from appearing.
             */
            ev.preventDefault();
            popoverEl.present(ev);
          }
        }
      ]
      break;
    case 'click':
    default:
      triggerCallbacks = [
        {
          eventName: 'click',
          callback: (ev: Event) => popoverEl.present(ev)
        }
      ];
      break;
  }

  triggerCallbacks.forEach(({ eventName, callback }) => triggerEl.addEventListener(eventName, callback));

  return () => {
    triggerCallbacks.forEach(({ eventName, callback }) => triggerEl.removeEventListener(eventName, callback));
  }
}

export const positionPopover = (
  isRTL: boolean,
  contentEl: HTMLElement,
  reference: PositionReference,
  side: PositionSide,
  align: PositionAlign,
  triggerEl?: HTMLElement,
  event?: MouseEvent
) => {
  const contentBoundingBox = contentEl.getBoundingClientRect();
  let referenceCoordinates = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  };

  switch (reference) {
    case 'event':
      if (!event) {
        console.error('No event provided');
        return;
      }

      referenceCoordinates = {
        top: event.clientY,
        left: event.clientX,
        width: 1,
        height: 1
      }

      break;
    case 'trigger':
    default:
      const actualTriggerEl = (triggerEl || event?.target) as HTMLElement | null;
      if (!actualTriggerEl) {
        console.error('No trigger element found');
        return;
      }
      const triggerBoundingBox = actualTriggerEl.getBoundingClientRect();
      referenceCoordinates = {
        top: triggerBoundingBox.top,
        left: triggerBoundingBox.left,
        width: triggerBoundingBox.width,
        height: triggerBoundingBox.height
      }

      break;
  }

  const coordinates = calculatePopoverSide(side, referenceCoordinates, contentBoundingBox, isRTL);
  const alignedCoordinates = calculatePopoverAlign(align, side, referenceCoordinates, contentBoundingBox)

  const top = coordinates.top + alignedCoordinates.top;
  const left = coordinates.left + alignedCoordinates.left;

  console.log('coords', coordinates, 'align', alignedCoordinates)


  contentEl.style.setProperty('top', `calc(${top}px + var(--offset-y))`);
  contentEl.style.setProperty('left', `calc(${left}px + var(--offset-x))`);
}

const calculatePopoverSide = (
  side: PositionSide,
  triggerBoundingBox: ReferenceCoordinates,
  contentBoundingBox: DOMRect,
  isRTL: boolean
) => {
  switch (side) {
    case 'top':
      return {
        top: triggerBoundingBox.top - contentBoundingBox.height,
        left: triggerBoundingBox.left
      }
    case 'right':
      return {
        top: triggerBoundingBox.top,
        left: triggerBoundingBox.left + triggerBoundingBox.width
      }
    case 'bottom':
      return {
        top: triggerBoundingBox.top + triggerBoundingBox.height,
        left: triggerBoundingBox.left
      }
    case 'left':
      return {
        top: triggerBoundingBox.top,
        left: triggerBoundingBox.left - contentBoundingBox.width
      }
    case 'start':
      return {
        top: triggerBoundingBox.top,
        left: (isRTL) ? triggerBoundingBox.left + triggerBoundingBox.width : triggerBoundingBox.left - contentBoundingBox.width
      }
    case 'end':
      return {
        top: triggerBoundingBox.top,
        left: (isRTL) ? triggerBoundingBox.left - contentBoundingBox.width : triggerBoundingBox.left - triggerBoundingBox.width
      }
  }
}

const calculatePopoverAlign = (
  align: PositionAlign,
  side: PositionSide,
  triggerBoundingBox: ReferenceCoordinates,
  contentBoundingBox: DOMRect
) => {
  switch (align) {
    case 'center':
      return calculatePopoverCenterAlign(side, triggerBoundingBox, contentBoundingBox)
    case 'end':
      return calculatePopoverEndAlign(side, triggerBoundingBox, contentBoundingBox)
    case 'start':
    default:
      return { top: 0, left: 0 };
  }
}

const calculatePopoverEndAlign = (
  side: PositionSide,
  triggerBoundingBox: ReferenceCoordinates,
  contentBoundingBox: DOMRect
) => {
  switch (side) {
    case 'start':
    case 'end':
    case 'left':
    case 'right':
      return {
        top: -(contentBoundingBox.height - triggerBoundingBox.height),
        left: 0
      }
    case 'top':
    case 'bottom':
    default:
      return {
        top: 0,
        left: -(contentBoundingBox.width - triggerBoundingBox.width)
      }
  }
}

const calculatePopoverCenterAlign = (
  side: PositionSide,
  triggerBoundingBox: ReferenceCoordinates,
  contentBoundingBox: DOMRect
) => {
  switch (side) {
    case 'start':
    case 'end':
    case 'left':
    case 'right':
      return {
        top: -((contentBoundingBox.height / 2) - (triggerBoundingBox.height / 2)),
        left: 0
      }
    case 'top':
    case 'bottom':
    default:
      return {
        top: 0,
        left: -((contentBoundingBox.width / 2) - (triggerBoundingBox.width / 2))
      }
  }
}
