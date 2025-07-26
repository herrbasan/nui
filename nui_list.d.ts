/**
 * Configuration options for superList
 */
export interface SuperListOptions {
  /** DOM element to render the list into */
  target: HTMLElement;
  /** Array of data items to display */
  data: any[];
  /** Callback function to render each item */
  render: (data: any) => HTMLElement;
  /** Optional ID for the list container */
  id?: string;
  /** Optional callback for list events */
  events?: (event: ListEvent) => void;
  /** Array of searchable properties */
  search?: Array<{prop: string}>;
  /** Array of sortable columns */
  sort?: Array<{label: string, prop: string}>;
  /** Index of default sort column (0-based) */
  sort_default?: number;
  /** Default sort direction */
  sort_direction_default?: 'up' | 'down';
  /** Footer configuration */
  footer?: {
    label: string;
    prop: string;
    buttons_left?: Array<{label: string, type: string, fnc: Function}>;
    buttons_right?: Array<{label: string, type: string, fnc: Function}>;
  };
  /** Enable log mode for auto-scrolling */
  logmode?: boolean;
  /** Enable verbose console logging */
  verbose?: boolean;
  /** Restrict to single selection mode */
  single?: boolean;
}

/**
 * List event object
 */
export interface ListEvent {
  /** Event type */
  type: 'selection' | 'visibility' | 'height_change' | 'sort_select' | 'search_input' | 'list_cleanup';
  /** Event value */
  value: any;
  /** Target element */
  target?: Element;
  /** Current target element */
  currentTarget?: Element;
  /** Selected items for selection events */
  items?: any[];
}

/**
 * SuperList instance with control methods
 */
export interface SuperListInstance {
  /** Refreshes the list view */
  update(force?: boolean): void;
  /** Gets currently selected items */
  getSelection(full?: boolean): any[];
  /** Updates entire list data */
  updateData(): void;
  /** Adds new items to existing data */
  appendData(): void;
  /** Removes the list and cleans up resources */
  cleanUp(): void;
  /** Resets list to initial state */
  reset(): void;
  /** Updates a single item */
  updateItem(idx: number, data?: any, force?: boolean): void;
  /** Updates multiple items */
  updateItems(items: any[], force?: boolean): void;
}

/**
 * Creates a virtualized list component with sorting and searching capabilities
 * @param options Configuration options
 * @returns List instance with control methods
 * @example
 * ```javascript
 * const myList = superList({
 *   target: document.getElementById('list-container'),
 *   data: [{name: 'Item 1'}, {name: 'Item 2'}],
 *   render: (data) => {
 *     const div = document.createElement('div');
 *     div.textContent = data.name;
 *     return div;
 *   },
 *   search: [{prop: 'name'}],
 *   sort: [{label: 'Name', prop: 'name'}]
 * });
 * ```
 */
export default function superList(options: SuperListOptions): SuperListInstance;
