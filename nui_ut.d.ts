/**
 * NUI Utility Library - Type Definitions
 * @fileoverview Comprehensive type definitions for all utility functions, enriched with TSDoc.
 */

/**
 * Describes the structure of an object containing formatted date and time components.
 */
export interface UtilityDateFormatted {
  keys: {
    year: number;
    month: string;
    day: string;
    hour: string;
    minutes: string;
    seconds: string;
    milliseconds: string;
  };
  time: string;
  date: string;
  date_input: string;
  full: string;
  file: string;
  log: string;
}

/**
 * Represents formatted media playback time, broken down into various components.
 */
export interface UtilityPlayTime {
  isNegative: boolean;
  hours: string;
  minutes: string;
  full_minutes: number;
  seconds: string;
  milliseconds: string;
  frames: string;
  minsec: string;
  short: string;
  full: string;
}

/**
 * Holds scaling information and the calculated rectangle for an element.
 */
export interface UtilityScale {
  scaleX: number;
  scaleY: number;
  rect: [number, number, number, number];
}

/**
 * Represents an element's offset (top and left) relative to the document.
 */
export interface UtilityOffset {
  top: number;
  left: number;
}

/**
 * Describes a CSS custom property, including its value, unit, and computed value.
 */
export interface UtilityCssVar {
  value: number | string;
  unit: string | false;
  absolute: boolean;
  computed: number | string | number[];
}

/**
 * Holds flags for browser and environment detection (e.g., isIE, isMac, isTouch).
 */
export interface UtilityEnvironment {
  isIE: boolean;
  isEdge: boolean;
  isSafari: boolean;
  isFF: boolean;
  isMac: boolean;
  isTouch: boolean;
  isIOS: boolean;
  isAudioVolume: boolean;
  IOSversion?: number;
}

/**
 * Defines the options for creating a new HTML element with `ut.createElement`.
 */
export interface CreateElementOptions {
  /** The parent element to which the new element will be appended. */
  target?: Element;
  /** The ID to assign to the new element. */
  id?: string;
  /** A single class name to add to the element. */
  class?: string;
  /** A string of space-separated class names to add. */
  classes?: string;
  /** An object of CSS properties or a style string to apply. */
  style?: Record<string, string> | string;
  /** The inner HTML or an Element to append as a child. */
  inner?: string | Element;
  /** A record of attributes to set on the element. */
  attributes?: Record<string, string>;
  /** A record of dataset properties to set. */
  dataset?: Record<string, string>;
  /** A record of event listeners to attach to the element. */
  events?: Record<string, EventListener>;
}

/**
 * Defines the options for filtering an array using `ut.filter`.
 */
export interface FilterOptions {
  /** The array of data to filter. */
  data: any[];
  /** The search string to match against. */
  search: string;
  /** An array of property names to include in the search. */
  prop: string[];
  /** Whether the search should be case-insensitive. Defaults to false. */
  ignore_case?: boolean;
  /** If true, returns an array of indices instead of the filtered items. */
  return_index_only?: boolean;
}

/**
 * Defines the options for dynamically importing a script or stylesheet into the document's head.
 */
export interface HeadImportOptions {
  /** The type of resource to import. */
  type: 'js' | 'esm' | 'css';
  /** The URL of the resource. */
  url: string;
}

/**
 * Defines the options for the `ut.ease` animation function.
 */
export interface AnimateOptions {
  /** The target object or element to animate. */
  target?: any;
  /** The property of the target to animate. */
  target_prop?: string;
  /** The starting value of the animation. */
  start: number;
  /** The ending value of the animation. */
  end: number;
  /** The duration of the animation in milliseconds. Defaults to 500. */
  duration?: number;
  /** The easing function to use. Defaults to 'easeInOutQuad'. */
  ease?: string;
  /** A callback function that receives the animation progress. */
  progress?: (value: number) => void;
  /** A callback function executed upon animation completion. */
  cb?: () => void;
}

/**
 * Defines the options for the enhanced `ut.fetch` utility.
 */
export interface FetchOptions {
  /** The request timeout in milliseconds. */
  timeout?: number;
  /** The credentials policy to use for the request. */
  credentials?: RequestCredentials;
  /** The HTTP request method. */
  method?: string;
  /** An AbortController to allow aborting the request. */
  controller?: AbortController;
  /** An AbortSignal to associate with the request. */
  signal?: AbortSignal;
  /** The internal timeout ID. */
  timeout_id?: number;
  /** The body of the request, typically FormData. */
  body?: FormData;
}

declare const ut: {
  /** Library version as an array of [major, minor, patch]. */
  version: [number, number, number];
  /** Library release date as an array of [year, month, day]. */
  version_date: [number, number, number];

  // Array & Object Utilities
  /**
   * Sorts an array of objects by a nested property path.
   * @param array The array to sort.
   * @param path A string representing the nested property path (e.g., 'user.name').
   * @param numeric If true, performs a numeric sort. Defaults to false.
   * @returns The sorted array.
   */
  sortByKey<T>(array: T[], path: string, numeric?: boolean): T[];
  
  /**
   * Finds the index of the first item in an array that has a matching property value.
   * @param ar The input array.
   * @param prop The name of the property to check.
   * @param value The value to match against.
   * @returns The index of the found item, or -1 if not found.
   */
  indexByProp<T>(ar: T[], prop: string, value: any): number;
  
  /**
   * Finds the first item in an array that has a matching property value.
   * @param ar The input array.
   * @param prop The name of the property to check.
   * @param value The value to match against.
   * @returns The found item, or undefined if not found.
   */
  itemByProp<T>(ar: T[], prop: string, value: any): T | undefined;
  
  /**
   * Finds all indices of items in an array that have a matching property value.
   * @param ar The input array.
   * @param prop The name of the property to check.
   * @param value The value to match against.
   * @returns An array of matching indices.
   */
  allIdxByProp<T>(ar: T[], prop: string, value: any): number[];
  
  /**
   * Gets a nested property value from an object using a dot-notation path.
   * @param obj The object to query.
   * @param path The dot-notation path to the property (e.g., 'a.b.c').
   * @returns The value of the property, or undefined if not found.
   */
  deep_get(obj: any, path: string): any;
  
  /**
   * Sets a nested property value on an object using a dot-notation path.
   * @param obj The object to modify.
   * @param path The dot-notation path to the property (e.g., 'a.b.c').
   * @param value The value to set.
   */
  deep_set(obj: any, path: string, value: any): void;
  
  /**
   * Checks if an array contains an item with a matching nested property value.
   * @param ar The array to check.
   * @param path The dot-notation path to the property.
   * @param compare The value to compare against.
   * @returns True if a matching item is found, otherwise false.
   */
  deep_includes<T>(ar: T[], path: string, compare: any): boolean;
  
  /**
   * Finds the key in an object that corresponds to a given value.
   * @param obj The object to search.
   * @param val The value to find.
   * @returns The corresponding key, or undefined if not found.
   */
  keyByValue(obj: Record<string, any>, val: any): string | undefined;
  
  /**
   * Finds the key in an object that corresponds to a matching nested property value.
   * @param obj The object to search.
   * @param path The dot-notation path within the nested objects.
   * @param val The value to find.
   * @returns The key of the parent object.
   */
  keyByDeepValue(obj: Record<string, any>, path: string, val: any): string;
  
  /**
   * Clones an object using JSON serialization. Fast but has limitations (e.g., loses functions, undefined).
   * @param obj The object to clone.
   * @returns A deep copy of the object.
   */
  jclone<T>(obj: T): T;
  
  /**
   * Clones an object using the modern `structuredClone` API, with a fallback to `jclone`.
   * @param obj The object to clone.
   * @returns A high-fidelity deep copy of the object.
   */
  clone<T>(obj: T): T;
  
  /**
   * Compares two objects for equality using JSON serialization.
   * @param obj_1 The first object.
   * @param obj_2 The second object.
   * @returns True if the JSON string representations are identical.
   */
  jcompare(obj_1: any, obj_2: any): boolean;

  // Network & Data Utilities
  /**
   * An enhanced `fetch` implementation that includes a timeout feature.
   * @param resource The URL or Request object.
   * @param options The fetch options, including an optional `timeout`.
   * @returns A promise that resolves with the Response object.
   */
  fetch(resource: RequestInfo, options?: FetchOptions): Promise<Response>;
  
  /**
   * Performs a POST request with FormData and expects a JSON response.
   * @param url The request URL.
   * @param data An object to be converted to FormData.
   * @param options Additional fetch options.
   * @returns A promise that resolves with the parsed JSON response.
   */
  jfetch(url: string, data: Record<string, any>, options?: FetchOptions): Promise<any>;
  
  /**
   * Performs a GET request with query parameters and expects a JSON response.
   * @param url The request URL.
   * @param data An object to be converted into URL query parameters.
   * @param options Additional fetch options.
   * @returns A promise that resolves with the parsed JSON response.
   */
  jget(url: string, data: Record<string, any>, options?: FetchOptions): Promise<any>;
  
  /**
   * Initiates a file download by making a POST request.
   * @param url The URL to download from.
   * @param data An object to be sent as FormData.
   * @param options Additional fetch options.
   */
  jDownload(url: string, data: Record<string, any>, options?: FetchOptions): Promise<void>;
  
  /**
   * Safely parses a JSON string, returning null on failure instead of throwing an error.
   * @param str The JSON string to parse.
   * @returns The parsed object, or null if parsing fails.
   */
  jString(str: string): any;
  
  /**
   * Reads and parses a JSON file from a URL.
   * @param url The URL of the JSON file.
   * @returns A promise that resolves with the parsed JSON data.
   */
  readJson(url: string): Promise<any>;
  
  /**
   * Reads HTML content from a URL.
   * @param url The URL of the HTML file.
   * @param element An optional selector to return a specific element from the document.
   * @returns A promise that resolves with the parsed Document or a specific Element.
   */
  readHtml(url: string, element?: string): Promise<Document | Element>;
  
  /**
   * Parses a NeDB-formatted data file from a URL.
   * @param url The URL of the NeDB file.
   * @returns A promise that resolves with an array of NeDB documents.
   */
  nedb(url: string): Promise<any[]>;

  // Date & Time Utilities
  /**
   * Formats a timestamp or Date object into a comprehensive set of date/time strings.
   * @param n A timestamp number or Date object.
   * @returns A `UtilityDateFormatted` object.
   */
  formatDate(n: number | Date): UtilityDateFormatted;
  
  /**
   * Formats a duration in seconds into a media playback time object.
   * @param n The duration in seconds.
   * @param fps The frames per second, used for calculating the frame component.
   * @returns A `UtilityPlayTime` object.
   */
  playTime(n?: number, fps?: number): UtilityPlayTime;
  
  /**
   * Formats a file size in bytes into a human-readable string (e.g., "1.23 MB").
   * @param n The file size in bytes.
   * @returns The formatted file size string.
   */
  formatFileSize(n: number): string;
  
  /**
   * Converts a temperature from Fahrenheit to Celsius.
   * @param t The temperature in Fahrenheit.
   * @returns The temperature in Celsius.
   */
  convertFahrenheitToCelsius(t: number): number;

  /**
   * Converts a temperature from Celsius to Fahrenheit.
   * @param t The temperature in Celsius.
   * @returns The temperature in Fahrenheit.
   */
  convertCelsiusToFahrenheit(t: number): number;

  // String & File Utilities
  /**
   * Generates a unique ID string.
   * @returns A unique string identifier.
   */
  id(): string;
  
  /**
   * Extracts the file extension from a filename.
   * @param filename The name of the file.
   * @returns The file extension (e.g., "jpg").
   */
  getExtension(filename: string): string;
  
  /**
   * Removes the file extension from a filename.
   * @param filename The name of the file.
   * @returns The filename without its extension.
   */
  removeExtension(filename: string): string;
  
  /**
   * Gets the last segment of a URL path.
   * @param url The URL string.
   * @param sep The separator character. Defaults to '/'.
   * @returns The last segment of the URL.
   */
  urlGetLast(url: string, sep?: string): string;
  
  /**
   * Checks if a filename matches one of the given file types (extensions).
   * @param filename The name of the file.
   * @param types An array of extensions to check against.
   * @returns True if the file extension is in the types array.
   */
  isFileType(filename: string, types: string[]): boolean;
  
  /**
   * Determines the media type ('img', 'video', 'audio', or 'unknown') from a file extension.
   * @param url The URL or filename.
   * @returns The determined media type.
   */
  getMediaType(url: string): 'img' | 'video' | 'audio' | 'unknown';
  
  /**
   * Pads a number with leading zeros to a specified size.
   * @param num The number to pad.
   * @param size The desired total length of the string. Defaults to 2.
   * @returns The zero-padded number as a string.
   */
  lz(num: number, size?: number): string;
  
  /**
   * Capitalizes the first letter of a string.
   * @param str The input string.
   * @returns The capitalized string.
   */
  capitalize(str: string): string;
  
  /**
   * Generates a random integer between 0 and a specified maximum.
   * @param max The exclusive maximum value.
   * @returns A random integer.
   */
  randomInt(max: number): number;
  
  /**
   * Converts a string into a URL-friendly slug.
   * @param str The string to convert.
   * @returns The slugified string, or false on failure.
   */
  slugify(str: string): string | false;

  // DOM Utilities
  /**
   * Removes all child nodes from a given element.
   * @param el The element or a selector string for the element.
   */
  killKids(el: Element | string): void;
  
  /**
   * Removes a given element from the DOM.
   * @param el The element or a selector string for the element.
   */
  killMe(el: Element | string): void;
  
  /**
   * A query selector helper that returns a single element.
   * @param s The element, or a selector string.
   * @param context The context in which to search. Defaults to `document`.
   * @returns The found element, or null.
   */
  el(s: Element | string, context?: Document | Element): Element | null;
  
  /**
   * A query selector helper that returns a NodeListOf elements.
   * @param s The selector string.
   * @param context The context in which to search. Defaults to `document`.
   * @returns A NodeList of found elements.
   */
  els(s: string, context?: Document | Element): NodeListOf<Element>;
  
  /**
   * Applies a set of CSS styles to an element.
   * @param q The element or a selector string.
   * @param cs A record of CSS properties and values.
   * @param remove If true, removes the specified styles.
   */
  css(q: Element | string, cs: Record<string, string>, remove?: boolean): void;
  
  /**
   * Adds one or more CSS classes to an element.
   * @param el The element or a selector string.
   * @param classNames A string of space-separated classes or an array of class names.
   */
  addClasses(el: Element | string, classNames: string | string[]): void;
  
  /**
   * Adds one or more CSS classes to an element. Alias for `addClasses`.
   * @param el The element or a selector string.
   * @param classNames A string of space-separated classes or an array of class names.
   */
  addClass(el: Element | string, classNames: string | string[]): void;
  
  /**
   * Removes one or more CSS classes from an element.
   * @param el The element or a selector string.
   * @param classNames A string of space-separated classes or an array of class names.
   */
  removeClass(el: Element | string, classNames: string | string[]): void;
  
  /**
   * Toggles a CSS class on an element.
   * @param el The element or a selector string.
   * @param className The class name to toggle.
   */
  toggleClass(el: Element | string, className: string): void;
  
  /**
   * Checks if an element has a specific CSS class.
   * @param el The element or a selector string.
   * @param className The class name to check for.
   * @returns True if the element has the class.
   */
  hasClass(el: Element | string, className: string): boolean;
  
  /**
   * Shows an element by removing a 'hide' or 'hidden' class or setting its display style.
   * @param el The element or a selector string.
   */
  show(el: Element | string): void;
  
  /**
   * Hides an element by adding a 'hide' class.
   * @param el The element or a selector string.
   */
  hide(el: Element | string): void;
  
  /**
   * Adds multiple event listeners to an element.
   * @param el The element or a selector string.
   * @param events A record where keys are event names and values are the listener functions.
   */
  addEvents(el: Element | string, events: Record<string, EventListener>): void;
  
  /**
   * Removes all event listeners previously attached via `addEvents`.
   * @param el The element or a selector string.
   */
  clearEvents(el: Element | string): void;
  
  /**
   * Creates a new HTML element with a set of options.
   * @param type The HTML tag name for the new element (e.g., 'div').
   * @param options The options for configuring the element.
   * @returns The newly created element.
   */
  createElement(type: string, options?: CreateElementOptions): Element;
  
  /**
   * Sets multiple attributes on an element.
   * @param el The element or a selector string.
   * @param attributes A record of attribute names and values.
   */
  attributes(el: Element | string, attributes: Record<string, string>): void;
  
  /**
   * Creates an HTML element from an HTML string.
   * @param s The HTML string.
   * @returns The first element created from the string.
   */
  htmlObject(s: string): Element;
  
  /**
   * Gets the offset (top, left) of an element relative to the document.
   * @param el The element or a selector string.
   * @returns A `UtilityOffset` object.
   */
  offset(el: Element | string): UtilityOffset;

  // Layout & Graphics Utilities
  /**
   * Calculates the scaling properties needed to fit an object within a target area.
   * @param originalWidth The original width of the object.
   * @param originalHeight The original height of the object.
   * @param targetWidth The width of the target container.
   * @param targetHeight The height of the target container.
   * @param scaleMode The scaling mode to use ('fit', 'cover', etc.).
   * @param isCenter Whether to center the object.
   * @returns A `UtilityScale` object with scaling information.
   */
  calcScale(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    scaleMode: 'fit' | 'contain' | 'full' | 'cover' | 'fill',
    isCenter?: boolean
  ): UtilityScale;
  
  /**
   * Performs hit testing on a DOM element.
   * @param obj The DOM element to test against.
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @returns True if the coordinates are within the element's bounds.
   */
  hitObject(obj: Element, x: number, y: number): boolean;
  
  /**
   * Performs hit testing on a rectangular area.
   * @param ar An array representing the rectangle [x, y, width, height].
   * @param x The x-coordinate.
   * @param y The y-coordinate.
   * @returns True if the coordinates are within the rectangle.
   */
  hitRect(ar: [number, number, number, number], x: number, y: number): boolean;
  
  /**
   * Loads an image from a given path.
   * @param fp The file path of the image.
   * @param cb An optional callback function that receives the loaded image element.
   * @returns A promise that resolves with the HTMLImageElement, if no callback is provided.
   */
  getImage(fp: string): Promise<HTMLImageElement>;
  getImage(fp: string, cb: (img: HTMLImageElement) => void): void;

  // Browser & Environment Utilities
  /**
   * Sets up a listener for page visibility changes.
   * @param cb A callback function that receives a boolean `isHidden`.
   */
  visibility(cb: (isHidden: boolean) => void): void;
  
  /**
   * Toggles fullscreen mode for a given element.
   * @param el The element to toggle.
   */
  toggleFullscreen(el: Element): void;
  /**
   * Enters fullscreen mode for a given element.
   * @param el The element to make fullscreen.
   * @returns True if successful, otherwise false.
   */
  enterFullscreen(el: Element): boolean;
  /**
   * Exits fullscreen mode.
   */
  exitFullscreen(): void;
  
  /**
   * Detects the current browser and environment.
   * @returns A `UtilityEnvironment` object with detection flags.
   */
  detectEnv(): UtilityEnvironment;
  
  /**
   * Checks if the browser supports the WebP image format.
   * @returns A promise that resolves with a boolean.
   */
  webpSupport(): Promise<boolean>;
  
  /**
   * Checks if the browser supports the AVIF image format.
   * @returns A promise that resolves with a boolean.
   */
  avifSupport(): Promise<boolean>;

  // DOM Inspection Utilities
  /**
   * Checks if an object is a DOM node.
   * @param o The object to check.
   * @returns True if the object is a Node.
   */
  isNode(o: any): o is Node;
  
  /**
   * Checks if an object is an HTML element.
   * @param o The object to check.
   * @returns True if the object is an HTMLElement.
   */
  isElement(o: any): o is HTMLElement;
  
  /**
   * Gets the computed X and Y translation values from an element's transform style.
   * @param obj The element to inspect.
   * @returns An array containing the [x, y] translation values.
   */
  getComputedTranslateXY(obj: Element): number[];
  
  /**
   * Parses parameters from the URL hash string.
   * @param hash_string The hash string to parse. Defaults to `location.hash`.
   * @returns A record of key-value pairs from the hash.
   */
  locationHash(hash_string?: string): Record<string, string>;
  
  /**
   * Parses parameters from the URL search/query string.
   * @param search_string The search string to parse. Defaults to `location.search`.
   * @returns A record of key-value pairs from the search string.
   */
  locationSearch(search_string?: string): Record<string, string>;

  // Math & Animation Utilities
  /**
   * Calculates the average of numbers in an array.
   * @param ar The array of numbers.
   * @returns The average value.
   */
  average(ar: number[]): number;
  
  /**
   * Calculates the median average of an array (discards min/max values).
   * @param ring The array of numbers.
   * @returns The median average.
   */
  medianAverage(ring: number[]): number;
  
  /**
   * A promise-based delay function.
   * @param ms The delay in milliseconds.
   * @returns A promise that resolves after the specified duration.
   */
  awaitMs(ms: number): Promise<void>;
  
  /**
   * Waits for a DOM event to fire, with an optional timeout.
   * @param el The target element.
   * @param event The name of the event to wait for.
   * @param time The timeout in milliseconds.
   * @returns A promise that resolves with the Event object or 'timeout'.
   */
  awaitEvent(el: Element, event: string, time?: number): Promise<Event | 'timeout'>;
  
  /**
   * Shuffles an array in place or returns a shuffled clone.
   * @param ar The array to shuffle.
   * @param clone If true, returns a new shuffled array without modifying the original.
   * @returns The shuffled array.
   */
  shuffleArray<T>(ar: T[], clone?: boolean): T[];
  
  /**
   * Performs an advanced filter on an array of objects based on a search string and properties.
   * @param param The filter options.
   * @returns An array of filtered items or their indices.
   */
  filter(param: FilterOptions): any[];
  
  /**
   * Converts an array of objects into an object, using a specified property as the key.
   * @param ar The array to convert.
   * @param key The property name to use as the key for the new object.
   * @returns An object where keys are the values of the specified property.
   */
  arrayToObject<T>(ar: T[], key: string): Record<string, T>;
  
  /**
   * A helper to apply a CSS animation to an element.
   * @param t The target element.
   * @param animation The name of the CSS animation (class name).
   * @param cb A callback to execute after the animation ends.
   * @param bypass If true, the callback is executed immediately.
   */
  animate(t: Element, animation: string, cb?: (t: Element) => void, bypass?: boolean): void;
  
  /**
   * Applies an animation and removes the element from the DOM when it completes.
   * @param t The target element.
   * @param ani The animation class name. Defaults to 'nui_fade_out'.
   */
  animate_away(t: Element, ani?: string): void;
  
  /**
   * A custom animation function using easing equations.
   * @param options The animation options.
   */
  ease(options: AnimateOptions): void;

  // CSS Utilities
  /**
   * Dynamically imports one or more JavaScript or CSS files into the document's head.
   * @param options A single options object or an array of them.
   * @returns A promise that resolves when all resources are loaded.
   */
  headImport(options: HeadImportOptions | HeadImportOptions[]): Promise<any>;
  
  /**
   * Gets all CSS custom properties (variables) scoped to a given element.
   * @param el The element to inspect. Defaults to `document.documentElement`.
   * @returns A record of custom property names and their `UtilityCssVar` details.
   */
  getCssVars(el?: any): Record<string, UtilityCssVar>;
  
  /**
   * Gets the details of a single CSS custom property.
   * @param prop The name of the custom property (e.g., '--my-color').
   * @param el The element to inspect. Defaults to `document.documentElement`.
   * @returns A `UtilityCssVar` object.
   */
  getCssVar(prop: string, el?: Element): UtilityCssVar;
  
  /**
   * Sets a CSS custom property on the root element.
   * @param s The name of the custom property.
   * @param val The value to set.
   */
  setCssVar(s: string, val: string): void;
  
  /**
   * Converts an array of color components (e.g., RGBA) into a CSS color string.
   * @param ar An array of numbers representing color components.
   * @returns A CSS color string (e.g., 'rgb(r,g,b)' or 'rgba(r,g,b,a)').
   */
  cssColorString(ar: number[]): string;
  
  /**
   * Sets a 'dark' or 'light' theme class on an element based on system preference.
   * @param el The element to apply the theme class to. Defaults to `document.body`.
   * @param listen_for_change If true, automatically updates the theme on system changes.
   */
  setTheme(el?: Element | string, listen_for_change?: boolean): void;
  
  /**
   * Checks if a NUI CSS module has been loaded by looking for a specific custom property.
   * @param prop The custom property to check for.
   * @param url The URL of the CSS file to import if the property is not found.
   * @returns A promise that resolves with the map of CSS variables.
   */
  checkNuiCss(prop: string, url: string): Promise<Record<string, UtilityCssVar>>;

  // Cookie Utilities
  /**
   * Gets all cookies as a key-value object.
   * @returns A record of all cookies.
   */
  getCookies(): Record<string, string>;
  
  /**
   * Sets a cookie with a specified name, value, and expiration.
   * @param name The name of the cookie.
   * @param value The value of the cookie.
   * @param hours The number of hours until the cookie expires.
   * @param path The path for the cookie. Defaults to '/'.
   */
  setCookie(name: string, value: string, hours: number, path?: string): void;
  
  /**
   * Gets the value of a single cookie by its name.
   * @param cname The name of the cookie.
   * @returns The cookie's value, or an empty string if not found.
   */
  getCookie(cname: string): string;
  
  /**
   * Deletes a cookie by its name.
   * @param cname The name of the cookie to delete.
   * @param path The path of the cookie. Defaults to '/'.
   */
  deleteCookie(cname: string, path?: string): void;
  
  /**
   * Checks if a cookie exists, with an optional value comparison.
   * @param cname The name of the cookie.
   * @param value An optional value to compare against.
   * @returns True if the cookie exists (and matches the value, if provided).
   */
  checkCookie(cname: string, value?: string): boolean;

  // Icon Utilities
  /** A record of SVG path data for various icons. */
  icon_shapes: Record<string, string>;
  
  /**
   * Generates an SVG icon from the predefined icon shapes.
   * @param id The ID of the icon shape.
   * @param wrap_in_container If true, wraps the SVG in a 'nui_icon' div.
   * @param return_as_element If true, returns an SVGElement instead of a string.
   * @returns The SVG icon as a string or an element.
   */
  icon(id: string, wrap_in_container?: boolean, return_as_element?: boolean): string | Element;
  
  /**
   * A helper for creating a Material Design icon element.
   * @param id The name of the Material Icon.
   * @param wrap_in_container If true, wraps the icon in a 'nui_icon' div.
   * @param return_as_element If true, returns an HTMLElement instead of a string.
   * @returns The icon as a string or an element.
   */
  materialIcon(id: string, wrap_in_container?: boolean, return_as_element?: boolean): string | Element;

  // Advanced Utilities
  /**
   * Replaces `<img>` tags with the `nui_svg` class with their inline SVG content.
   * @param classes A selector for the images to replace. Defaults to 'img.nui_svg'.
   */
  inlineSVG(classes?: string): void;
  
  /**
   * Uses an IntersectionObserver to trigger a callback when an element becomes visible.
   * @param el The target element or a selector string.
   * @param cb The callback to execute when visibility changes.
   * @param options The options for the IntersectionObserver.
   */
  isVisibleObserver(el: Element | string, cb?: EventListener, options?: IntersectionObserverInit): void;
  
  /**
   * A helper to attach a standard set of event listeners to a video element.
   * @param target The HTMLVideoElement.
   * @param cb A general callback for all events.
   * @param verbose If true, logs all events to the console.
   */
  videoEvents(target: HTMLVideoElement, cb?: EventListener, verbose?: boolean): void;
  
  /**
   * Creates a placeholder image as an HTMLImageElement.
   * @param text The text to display on the placeholder.
   * @param width The width of the image.
   * @param height The height of the image.
   * @returns An HTMLImageElement with the placeholder image data.
   */
  drawImageDummy(text?: string, width?: number, height?: number): HTMLImageElement;
  
  /**
   * A console logging utility that includes context information.
   * @param args The arguments to log.
   */
  fb(...args: any[]): void;

  /** A collection of easing functions for animations. */
  eases: {
    /**
     * A quadratic easing function that accelerates and then decelerates.
     * @param t Current time.
     * @param b Start value.
     * @param c Change in value.
     * @param d Duration.
     */
    easeInOutQuad: (t: number, b: number, c: number, d: number) => number;
  };
};

export default ut;
