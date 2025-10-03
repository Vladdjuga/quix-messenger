/**
 * Pagination and scrolling constants used across the application
 */

// Number of items to fetch per page (can be overridden by NEXT_PUBLIC_PAGE_SIZE env var)
export const DEFAULT_PAGE_SIZE = 20;

// Scroll thresholds
export const SCROLL_THRESHOLD_PX = 100; // Distance from edge to trigger actions
export const SCROLL_TO_TOP_THRESHOLD_PX = 300; // Distance from top to show "scroll to top" button

// Scroll behavior
export const SCROLL_OFFSET_AFTER_LOAD = 1; // Small offset to avoid retriggering load on scroll
export const DEBOUNCE_DELAY_MS = 300; // Debounce for search input

// Layout timing
export const SCROLL_SETTLE_DELAY_MS = 0; // Delay before initial scroll to let layout settle
