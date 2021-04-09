import { PopoverSize, TriggerAction } from '../../interface';
import { raf } from '../../utils/helpers';

/**
 * Returns the recommended dimensions of the popover
 * that takes into account whether or not the width
 * should match the trigger width.
 */
export const getPopoverDimensions = (size: PopoverSize, contentEl: HTMLElement, triggerEl?: HTMLElement) => {
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

interface TriggerCallback { eventName: string;
                            callback: (ev: any) => void;
}

/**
 * Configures the triggerEl to respond
 * to user interaction based upon the triggerAction
 * prop that devs have defined.
 */
export const configureTriggerInteraction = (triggerEl: HTMLElement, triggerAction: TriggerAction, popoverEl: HTMLIonPopoverElement) => {
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
