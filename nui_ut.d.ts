/**
 * NUI Utility Library - Type Definitions
 * @fileoverview Comprehensive type definitions for all utility functions
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

export interface UtilityScale {
  scaleX: number;
  scaleY: number;
  rect: [number, number, number, number];
}

export interface UtilityOffset {
  top: number;
  left: number;
}

export interface UtilityCssVar {
  value: number | string;
  unit: string | false;
  absolute: boolean;
  computed: number | string | number[];
}

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

export interface CreateElementOptions {
  target?: Element;
  id?: string;
  class?: string;
  classes?: string;
  style?: Record<string, string> | string;
  inner?: string | Element;
  attributes?: Record<string, string>;
  dataset?: Record<string, string>;
  events?: Record<string, EventListener>;
}

export interface FilterOptions {
  data: any[];
  search: string;
  prop: string[];
  ignore_case?: boolean;
  return_index_only?: boolean;
}

export interface HeadImportOptions {
  type: 'js' | 'esm' | 'css';
  url: string;
}

export interface AnimateOptions {
  target?: any;
  target_prop?: string;
  start: number;
  end: number;
  duration?: number;
  ease?: string;
  progress?: (value: number) => void;
  cb?: () => void;
}

export interface FetchOptions {
  timeout?: number;
  credentials?: RequestCredentials;
  method?: string;
  controller?: AbortController;
  signal?: AbortSignal;
  timeout_id?: number;
  body?: FormData;
}

declare const ut: {
  /** Library version information */
  version: [number, number, number];
  version_date: [number, number, number];

  // Array & Object Utilities
  /** Sorts array by nested property path with optional numeric sorting */
  sortByKey<T>(array: T[], path: string, numeric?: boolean): T[];
  
  /** Returns index of item with matching property value */
  indexByProp<T>(ar: T[], prop: string, value: any): number;
  
  /** Returns first item with matching property value */
  itemByProp<T>(ar: T[], prop: string, value: any): T | undefined;
  
  /** Returns all indices where property matches value */
  allIdxByProp<T>(ar: T[], prop: string, value: any): number[];
  
  /** Gets nested object property value using dot notation */
  deep_get(obj: any, path: string): any;
  
  /** Sets nested object property value using dot notation */
  deep_set(obj: any, path: string, value: any): void;
  
  /** Checks if any array item has matching nested property value */
  deep_includes<T>(ar: T[], path: string, compare: any): boolean;
  
  /** Returns object key by matching value */
  keyByValue(obj: Record<string, any>, val: any): string | undefined;
  
  /** Returns object key by matching nested property value */
  keyByDeepValue(obj: Record<string, any>, path: string, val: any): string;
  
  /** JSON-based object cloning */
  jclone<T>(obj: T): T;
  
  /** Modern object cloning with structuredClone fallback */
  clone<T>(obj: T): T;
  
  /** JSON-based object comparison */
  jcompare(obj_1: any, obj_2: any): boolean;

  // Network & Data Utilities
  /** Enhanced fetch with timeout support */
  fetch(resource: RequestInfo, options?: FetchOptions): Promise<Response>;
  
  /** POST request with FormData and JSON response */
  jfetch(url: string, data: Record<string, any>, options?: FetchOptions): Promise<any>;
  
  /** GET request with query parameters and JSON response */
  jget(url: string, data: Record<string, any>, options?: FetchOptions): Promise<any>;
  
  /** POST request for file downloads */
  jDownload(url: string, data: Record<string, any>, options?: FetchOptions): Promise<void>;
  
  /** Safe JSON parsing with fallback */
  jString(str: string): any;
  
  /** Reads JSON from URL with error handling */
  readJson(url: string): Promise<any>;
  
  /** Reads HTML content from URL */
  readHtml(url: string, element?: string): Promise<Document | Element>;
  
  /** Parses NeDB format files */
  nedb(url: string): Promise<any[]>;

  // Date & Time Utilities
  /** Comprehensive date formatting */
  formatDate(n: number | Date): UtilityDateFormatted;
  
  /** Media playback time formatting */
  playTime(n?: number, fps?: number): UtilityPlayTime;
  
  /** Human-readable file size formatting */
  formatFileSize(n: number): string;
  
  /** Temperature conversion utilities */
  convertFahrenheitToCelsius(t: number): number;
  convertCelsiusToFahrenheit(t: number): number;

  // String & File Utilities
  /** Generates unique ID */
  id(): string;
  
  /** Extracts file extension */
  getExtension(filename: string): string;
  
  /** Removes file extension */
  removeExtension(filename: string): string;
  
  /** Gets last segment of URL path */
  urlGetLast(url: string, sep?: string): string;
  
  /** Checks if file matches given types */
  isFileType(filename: string, types: string[]): boolean;
  
  /** Determines media type from file extension */
  getMediaType(url: string): 'img' | 'video' | 'audio' | 'unknown';
  
  /** Pads number with leading zeros */
  lz(num: number, size?: number): string;
  
  /** Capitalizes first letter */
  capitalize(str: string): string;
  
  /** Generates random integer */
  randomInt(max: number): number;
  
  /** Creates URL-friendly slug */
  slugify(str: string): string | false;

  // DOM Utilities
  /** Removes all child elements */
  killKids(el: Element | string): void;
  
  /** Removes element from DOM */
  killMe(el: Element | string): void;
  
  /** Element selector helper */
  el(s: Element | string, context?: Document | Element): Element | null;
  
  /** Multiple element selector */
  els(s: string, context?: Document | Element): NodeListOf<Element>;
  
  /** Applies CSS styles to element */
  css(q: Element | string, cs: Record<string, string>, remove?: boolean): void;
  
  /** Adds multiple CSS classes */
  addClasses(el: Element | string, classNames: string | string[]): void;
  
  /** Adds CSS class */
  addClass(el: Element | string, classNames: string | string[]): void;
  
  /** Removes CSS class */
  removeClass(el: Element | string, classNames: string | string[]): void;
  
  /** Toggles CSS class */
  toggleClass(el: Element | string, className: string): void;
  
  /** Checks if element has CSS class */
  hasClass(el: Element | string, className: string): boolean;
  
  /** Shows element */
  show(el: Element | string): void;
  
  /** Hides element */
  hide(el: Element | string): void;
  
  /** Adds multiple event listeners */
  addEvents(el: Element | string, events: Record<string, EventListener>): void;
  
  /** Removes all registered event listeners */
  clearEvents(el: Element | string): void;
  
  /** Creates HTML element with options */
  createElement(type: string, options?: CreateElementOptions): Element;
  
  /** Sets multiple attributes */
  attributes(el: Element | string, attributes: Record<string, string>): void;
  
  /** Creates element from HTML string */
  htmlObject(s: string): Element;
  
  /** Gets element offset position */
  offset(el: Element | string): UtilityOffset;

  // Layout & Graphics Utilities
  /** Calculates scaling for fit/cover/fill modes */
  calcScale(
    originalWidth: number,
    originalHeight: number,
    targetWidth: number,
    targetHeight: number,
    scaleMode: 'fit' | 'contain' | 'full' | 'cover' | 'fill',
    isCenter?: boolean
  ): UtilityScale;
  
  /** Hit testing for DOM elements */
  hitObject(obj: Element, x: number, y: number): boolean;
  
  /** Hit testing for rectangular area */
  hitRect(ar: [number, number, number, number], x: number, y: number): boolean;
  
  /** Loads image with promise support */
  getImage(fp: string): Promise<HTMLImageElement>;
  getImage(fp: string, cb: (img: HTMLImageElement) => void): void;

  // Browser & Environment Utilities
  /** Page visibility change detection */
  visibility(cb: (isHidden: boolean) => void): void;
  
  /** Fullscreen API utilities */
  toggleFullscreen(el: Element): void;
  enterFullscreen(el: Element): boolean;
  exitFullscreen(): void;
  
  /** Environment and browser detection */
  detectEnv(): UtilityEnvironment;
  
  /** WebP format support detection */
  webpSupport(): Promise<boolean>;
  
  /** AVIF format support detection */
  avifSupport(): Promise<boolean>;

  // DOM Inspection Utilities
  /** Checks if object is DOM node */
  isNode(o: any): o is Node;
  
  /** Checks if object is HTML element */
  isElement(o: any): o is HTMLElement;
  
  /** Gets computed transform translation values */
  getComputedTranslateXY(obj: Element): number[];
  
  /** Parses URL hash parameters */
  locationHash(hash_string?: string): Record<string, string>;
  
  /** Parses URL search parameters */
  locationSearch(search_string?: string): Record<string, string>;

  // Math & Animation Utilities
  /** Calculates array average */
  average(ar: number[]): number;
  
  /** Calculates median average (excludes min/max) */
  medianAverage(ring: number[]): number;
  
  /** Promise-based delay */
  awaitMs(ms: number): Promise<void>;
  
  /** Waits for DOM event with timeout */
  awaitEvent(el: Element, event: string, time?: number): Promise<Event | 'timeout'>;
  
  /** Array shuffling utility */
  shuffleArray<T>(ar: T[], clone?: boolean): T[];
  
  /** Advanced array filtering with search */
  filter(param: FilterOptions): any[];
  
  /** Converts array to object using key property */
  arrayToObject<T>(ar: T[], key: string): Record<string, T>;
  
  /** CSS animation helper */
  animate(t: Element, animation: string, cb?: (t: Element) => void, bypass?: boolean): void;
  
  /** Animation with auto-removal */
  animate_away(t: Element, ani?: string): void;
  
  /** Custom easing animation */
  ease(options: AnimateOptions): void;

  // CSS Utilities
  /** Dynamic CSS/JS imports */
  headImport(options: HeadImportOptions | HeadImportOptions[]): Promise<any>;
  
  /** Gets all CSS custom properties */
  getCssVars(el?: any): Record<string, UtilityCssVar>;
  
  /** Gets single CSS custom property */
  getCssVar(prop: string, el?: Element): UtilityCssVar;
  
  /** Sets CSS custom property */
  setCssVar(s: string, val: string): void;
  
  /** Converts color array to CSS string */
  cssColorString(ar: number[]): string;
  
  /** Sets theme based on system preference */
  setTheme(el?: Element | string, listen_for_change?: boolean): void;
  
  /** Checks and imports NUI CSS modules */
  checkNuiCss(prop: string, url: string): Promise<Record<string, UtilityCssVar>>;

  // Cookie Utilities
  /** Gets all cookies as object */
  getCookies(): Record<string, string>;
  
  /** Sets cookie with expiration */
  setCookie(name: string, value: string, hours: number, path?: string): void;
  
  /** Gets single cookie value */
  getCookie(cname: string): string;
  
  /** Deletes cookie */
  deleteCookie(cname: string, path?: string): void;
  
  /** Checks if cookie exists with optional value check */
  checkCookie(cname: string, value?: string): boolean;

  // Icon Utilities
  /** Icon shape definitions */
  icon_shapes: Record<string, string>;
  
  /** Generates SVG icon */
  icon(id: string, wrap_in_container?: boolean, return_as_element?: boolean): string | Element;
  
  /** Material Design icon helper */
  materialIcon(id: string, wrap_in_container?: boolean, return_as_element?: boolean): string | Element;

  // Advanced Utilities
  /** Inline SVG replacement */
  inlineSVG(classes?: string): void;
  
  /** Intersection observer for visibility */
  isVisibleObserver(el: Element | string, cb?: EventListener, options?: IntersectionObserverInit): void;
  
  /** Video event listener helper */
  videoEvents(target: HTMLVideoElement, cb?: EventListener, verbose?: boolean): void;
  
  /** Creates placeholder image */
  drawImageDummy(text?: string, width?: number, height?: number): HTMLImageElement;
  
  /** Console logging with context */
  fb(...args: any[]): void;

  // Easing functions
  eases: {
    easeInOutQuad: (t: number, b: number, c: number, d: number) => number;
  };
};

export default ut;
