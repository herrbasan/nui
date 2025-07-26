/**
 * Configuration options for the superList component.
 */
export interface SuperListOptions {
  /** The DOM element where the list will be rendered. */
  target: HTMLElement;
  /** The initial array of data items to display in the list. */
  data: any[];
  /** 
   * A callback function responsible for rendering a single item.
   * It receives the data for one item and must return an HTMLElement.
   * @param data The data object for the item to render.
   * @returns The rendered HTMLElement for the item.
   */
  render: (data: any) => HTMLElement;
  /** An optional ID to assign to the list's main container element. If not provided, a unique ID will be generated. */
  id?: string;
  /** 
   * An optional callback function that fires on various list events.
   * @param event An object containing details about the event.
   */
  events?: (event: ListEvent) => void;
  /** An array of property configurations for enabling search. Each object specifies a property to include in the search. */
  search?: Array<{prop: string}>;
  /** An array of column configurations for enabling sorting. Each object defines a clickable sort option. */
  sort?: Array<{label: string, prop: string, numeric?: boolean}>;
  /** The 0-based index of the default sort option from the `sort` array. */
  sort_default?: number;
  /** The default sort direction. Defaults to 'up' (ascending). */
  sort_direction_default?: 'up' | 'down';
  /** 
   * Configuration for the list's footer. If provided, a footer will be displayed.
   * The footer contains a central area for item counts and optional button containers.
   */
  footer?: {
    /** @deprecated This property is not currently used. */
    label?: string;
    /** @deprecated This property is not currently used. */
    prop?: string;
    /** An array of buttons to display on the left side of the footer. */
    buttons_left?: Array<{label: string, type: string, fnc: (e: MouseEvent) => void}>;
    /** An array of buttons to display on the right side of the footer. */
    buttons_right?: Array<{label: string, type: string, fnc: (e: MouseEvent) => void}>;
  };
  /** 
   * If true, the list operates in "log mode", automatically scrolling to the bottom when new items are appended.
   * Useful for logs or chat-like interfaces.
   */
  logmode?: boolean;
  /** If true, enables detailed console logging from the list component for debugging purposes. */
  verbose?: boolean;
  /** If true, restricts item selection to a single item at a time (disables multi-select with Ctrl/Shift). */
  single?: boolean;
}

/**
 * Describes the object passed to the `events` callback in the list options.
 */
export interface ListEvent {
  /** The type of event that occurred. */
  type: 'selection' | 'visibility' | 'height_change' | 'sort' | 'search_input' | 'list_cleanup' | 'list';
  /** The value associated with the event (e.g., search query, selected item count). */
  value: any;
  /** The main list instance element. */
  target?: Element;
  /** The specific element that triggered the event (e.g., a clicked list item). */
  currentTarget?: Element;
  /** An array of the currently selected items. Only present for 'selection' events. */
  items?: any[];
}

/**
 * The instance object returned by `superList`, containing methods to control and interact with the list.
 */
export interface SuperListInstance {
  /** 
   * Refreshes the list's view, re-rendering the visible items.
   * @param force If true, forces a complete re-render of all visible items, even if no scroll change has occurred.
   */
  update(force?: boolean): void;
  /** 
   * Retrieves the currently selected items from the list.
   * @param full If true, returns the full data objects. If false or omitted, returns only the original indices (`oidx`).
   * @returns An array of the selected items or their original indices.
   */
  getSelection(full?: boolean): any[];
  /** 
   * Replaces the entire dataset for the list.
   * @param data The new array of data to display.
   * @param skip_filter If true, the list will not automatically apply the current sort and filter settings.
   */
  updateData(data: any[], skip_filter?: boolean): void;
  /** 
   * Appends new data to the list.
   * @remarks This method assumes that the original `data` array passed in the options has been mutated (e.g., by pushing new items to it). It then updates the list to show these new items.
   */
  appendData(): void;
  /** Removes the list component from the DOM and cleans up all associated event listeners and observers. */
  cleanUp(): void;
  /** Resets the list to its initial state: clears selections, resets scroll position, and updates item counts. */
  reset(): void;
  /** 
   * Updates a single item in the list by its original index.
   * @param idx The original index (`oidx`) of the item to update.
   * @param data The new data object for the item. If omitted, only the item's visual state is refreshed.
   * @param force If true, forces an immediate `update()` call to refresh the list view.
   */
  updateItem(idx: number, data?: any, force?: boolean): void;
  /** 
   * Updates multiple items in the list in a single batch.
   * @param items An array where each element is either an object `{idx: number, data: any}` or just an index `number`. `idx` refers to the item's original index (`oidx`).
   * @param force If true, forces an immediate `update()` call after all items have been processed.
   */
  updateItems(items: (number | {idx: number, data: any})[], force?: boolean): void;
  /**
   * Scrolls the list to bring a specific item into view.
   * @param index The index of the item in the currently filtered and sorted list.
   */
  scrollToIndex(index: number): void;
}

/**
 * Creates a powerful, virtualized list component with advanced sorting, searching, and interaction capabilities.
 * The list uses DOM recycling to efficiently handle thousands of items.
 * 
 * @param options The configuration options for the list.
 * @returns A `SuperListInstance` object with methods to control the list.
 * @example
 * ```javascript
 * const myList = superList({
 *   target: document.getElementById('list-container'),
 *   data: [{id: 1, name: 'Item 1'}, {id: 2, name: 'Item 2'}],
 *   render: (item) => {
 *     const div = document.createElement('div');
 *     div.textContent = item.name;
 *     return div;
 *   },
 *   search: [{prop: 'name'}],
 *   sort: [{label: 'Name', prop: 'name'}],
 *   footer: {
 *     buttons_left: [{
 *       label: 'Delete Selected',
 *       type: 'button',
 *       fnc: () => {
 *         const selection = myList.getSelection();
 *         console.log('Deleting indices:', selection);
 *       }
 *     }]
 *   }
 * });
 * ```
 */
export default function superList(options: SuperListOptions): SuperListInstance;
