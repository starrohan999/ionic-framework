import { PopoverSize } from '../../interface';

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
