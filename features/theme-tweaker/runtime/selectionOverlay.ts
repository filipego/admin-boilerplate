import { useThemeTweakerStore, SelectedElement } from '../store/useThemeTweakerStore';

let isInitialized = false;
let overlayElement: HTMLDivElement | null = null;
let hoverOverlayElement: HTMLDivElement | null = null;

/**
 * Initializes the selection overlay system for click-to-edit functionality
 */
export const initializeSelectionOverlay = (): void => {
  if (isInitialized) return;
  
  createOverlayElements();
  attachEventListeners();
  isInitialized = true;
};

/**
 * Creates the overlay elements for selection and hover feedback
 */
const createOverlayElements = (): void => {
  // Selection overlay
  overlayElement = document.createElement('div');
  overlayElement.id = 'tt-selection-overlay';
  overlayElement.style.cssText = `
    position: fixed;
    pointer-events: none;
    border: 2px solid #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    z-index: 9999;
    display: none;
    border-radius: 4px;
    transition: all 0.15s ease;
  `;
  document.body.appendChild(overlayElement);
  
  // Hover overlay
  hoverOverlayElement = document.createElement('div');
  hoverOverlayElement.id = 'tt-hover-overlay';
  hoverOverlayElement.style.cssText = `
    position: fixed;
    pointer-events: none;
    border: 1px dashed #6b7280;
    background: rgba(107, 114, 128, 0.05);
    z-index: 9998;
    display: none;
    border-radius: 4px;
    transition: all 0.1s ease;
  `;
  document.body.appendChild(hoverOverlayElement);
};

/**
 * Attaches event listeners for element selection
 */
const attachEventListeners = (): void => {
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeyDown);
};

/**
 * Handles mouse over events for hover feedback
 */
const handleMouseOver = (event: MouseEvent): void => {
  const { isInspectorMode } = useThemeTweakerStore.getState();
  if (!isInspectorMode) return;
  
  const target = event.target as HTMLElement;
  const selectableElement = findSelectableElement(target);
  
  if (selectableElement && hoverOverlayElement) {
    const rect = selectableElement.getBoundingClientRect();
    updateOverlayPosition(hoverOverlayElement, rect);
    hoverOverlayElement.style.display = 'block';
    
    useThemeTweakerStore.getState().setHoveredElement(selectableElement);
  }
};

/**
 * Handles mouse out events
 */
const handleMouseOut = (event: MouseEvent): void => {
  const { isInspectorMode } = useThemeTweakerStore.getState();
  if (!isInspectorMode) return;
  
  if (hoverOverlayElement) {
    hoverOverlayElement.style.display = 'none';
  }
  
  useThemeTweakerStore.getState().setHoveredElement(null);
};

/**
 * Handles click events for element selection
 */
const handleClick = (event: MouseEvent): void => {
  const { isInspectorMode } = useThemeTweakerStore.getState();
  if (!isInspectorMode) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  const target = event.target as HTMLElement;
  const selectableElement = findSelectableElement(target);
  
  if (selectableElement) {
    const selectedElementData = createSelectedElementData(selectableElement);
    useThemeTweakerStore.getState().setSelectedElement(selectedElementData);
    
    if (overlayElement) {
      const rect = selectableElement.getBoundingClientRect();
      updateOverlayPosition(overlayElement, rect);
      overlayElement.style.display = 'block';
    }
    
    // Hide hover overlay
    if (hoverOverlayElement) {
      hoverOverlayElement.style.display = 'none';
    }
  }
};

/**
 * Handles keyboard events (ESC to deselect)
 */
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    clearSelection();
  }
};

/**
 * Finds the nearest selectable element with data-ui attribute
 * Only selects top-level components, not inner elements
 */
const findSelectableElement = (element: HTMLElement): HTMLElement | null => {
  let current = element;
  
  // Traverse up to find data-ui attribute
  while (current && current !== document.body) {
    const dataUi = current.getAttribute('data-ui');
    if (dataUi) {
      return current;
    }
    current = current.parentElement as HTMLElement;
  }
  
  return null;
};

/**
 * Creates selected element data from DOM element
 */
const createSelectedElementData = (element: HTMLElement): SelectedElement => {
  const dataUi = element.getAttribute('data-ui') || '';
  const variant = element.getAttribute('data-variant') || undefined;
  const size = element.getAttribute('data-size') || undefined;
  
  // Extract component name from data-ui
  const componentName = dataUi.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  return {
    element,
    componentName,
    variant,
    size,
    dataUi,
  };
};

/**
 * Updates overlay position to match target element
 */
const updateOverlayPosition = (overlay: HTMLElement, rect: DOMRect): void => {
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
};

/**
 * Clears current selection
 */
export const clearSelection = (): void => {
  useThemeTweakerStore.getState().setSelectedElement(null);
  
  if (overlayElement) {
    overlayElement.style.display = 'none';
  }
  
  if (hoverOverlayElement) {
    hoverOverlayElement.style.display = 'none';
  }
};

/**
 * Updates selection overlay when element changes
 */
export const updateSelectionOverlay = (element: HTMLElement | null): void => {
  if (!element || !overlayElement) {
    if (overlayElement) {
      overlayElement.style.display = 'none';
    }
    return;
  }
  
  const rect = element.getBoundingClientRect();
  updateOverlayPosition(overlayElement, rect);
  overlayElement.style.display = 'block';
};

/**
 * Toggles inspector mode
 */
export const toggleInspectorMode = (enabled: boolean): void => {
  if (!enabled) {
    clearSelection();
  }
  
  // Update cursor style
  document.body.style.cursor = enabled ? 'crosshair' : '';
};

/**
 * Cleanup function to remove overlays and event listeners
 */
export const cleanupSelectionOverlay = (): void => {
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }
  
  if (hoverOverlayElement) {
    hoverOverlayElement.remove();
    hoverOverlayElement = null;
  }
  
  document.removeEventListener('mouseover', handleMouseOver);
  document.removeEventListener('mouseout', handleMouseOut);
  document.removeEventListener('click', handleClick);
  document.removeEventListener('keydown', handleKeyDown);
  
  document.body.style.cursor = '';
  isInitialized = false;
};