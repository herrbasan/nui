'use strict';
import ut from './nui_ut.js';

/* Local Storage */
/* ############################################################################################ */
/* ############################################################################################ */

function setStore(key, val, days){
    try {
        const valueToStore = typeof val === 'string' ? val : JSON.stringify(val);
        if (days) {
            // Convert days to milliseconds (allowing fractional days)
            const expiresAt = new Date().getTime() + (days * 24 * 60 * 60 * 1000);
            localStorage.setItem(key, JSON.stringify({value: valueToStore, expiresAt}));
        } else {
            localStorage.setItem(key, valueToStore);
        }
        return true;
    } catch (e) {
        console.warn('Storage error:', e);
        return false;
    }
}

function getStore(key, def = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return def;
        
        try {
            const parsed = JSON.parse(item);
            if (parsed && typeof parsed === 'object' && parsed.expiresAt) {
                if (new Date().getTime() > parsed.expiresAt) {
                    localStorage.removeItem(key);
                    return def;
                }
                try { return JSON.parse(parsed.value); } 
                catch { return parsed.value; }
            }
            return parsed;
        } catch {
            return item;
        }
    } catch (e) {
        console.warn('Storage error:', e);
        return def;
    }
}

function removeStore(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.warn('Storage error:', e);
        return false;
    }
}

function hasStore(key){
    try {
        const item = localStorage.getItem(key);
        if (item === null) return false;
        try {
            const parsed = JSON.parse(item);
            if (parsed && typeof parsed === 'object' && parsed.expiresAt) {
                return new Date().getTime() <= parsed.expiresAt;
            }
        } catch {}
        return true;
    } catch (e) {
        console.warn('Storage error:', e);
        return false;
    }
}

function clearStore() {
    try {
        localStorage.clear();
        return true;
    } catch (e) {
        console.warn('Storage error:', e);
        return false;
    }
}

// Fix references in the storageObject class
class storageObject {
    // Static cache to store instances
    static _instances = {};
    
    constructor(key, defaultData = {}, options = {}) {
        // Check if an instance with this key already exists
        if (storageObject._instances[key]) {
            this._debug(key, 'Returning existing instance');
            return storageObject._instances[key];
        }
        
        this.storageKey = key;
        this.options = {
            expireDays: null,  // No expiration by default
            deepProxy: true,   // Create proxies for nested objects
            autoSaveOnExit: true, // Auto-save on page exit
            idleSync: true,    // Use idle callback for background sync
            throttleMs: 2000,  // Min time between syncs
            verbose: false,    // Debug logging option
            ...options
        };
        
        // Add debug helper method early for use during initialization
        this._debug = (action, message, data) => {
            if (!this.options.verbose) return;
            const prefix = `[StoreObj:${this.storageKey}]`;
            if (data !== undefined) {
                console.log(`${prefix} ${action}: ${message}`, data);
            } else {
                console.log(`${prefix} ${action}: ${message}`);
            }
        };
        
        this._debug('Init', 'Creating with options', this.options);
        
        // State tracking
        this.isDirty = false;
        this.lastSyncTime = Date.now();
        this.pendingSyncTimeout = null;
        
        // Initialize data from storage or use default
        const storedData = getStore(key);
        this._debug('Load', storedData !== null ? 'Found data in storage' : 'Using default data');
        this.data = storedData !== null ? storedData : defaultData;
        
        // Save initial data if nothing was stored
        if (storedData === null) {
            this._debug('Init', 'Saving initial data');
            this._saveToStorage(true);
        }
        
        // Set up beforeunload event if autoSaveOnExit is enabled
        if (this.options.autoSaveOnExit) {
            this._debug('Init', 'Setting up exit handlers');
            this._setupExitHandler();
        }
        
        // Create proxy and store in static cache
        const proxy = this._createProxy(this.data);
        storageObject._instances[key] = proxy;
        return proxy;
    }
    
    _setupExitHandler() {
        // Create a bound version of the save method
        this._boundSaveHandler = () => {
            if (this.isDirty) {
                this._debug('Exit', 'Page unloading, saving changes');
                this._saveToStorage(true);
            }
        };
        
        // Add event listener for page unload
        window.addEventListener('beforeunload', this._boundSaveHandler);
        
        // Also save on visibility change (when tab is hidden)
        this._boundVisibilityHandler = () => {
            if (document.visibilityState === 'hidden' && this.isDirty) {
                this._debug('Visibility', 'Tab hidden, saving changes');
                this._saveToStorage(true);
            }
        };
        document.addEventListener('visibilitychange', this._boundVisibilityHandler);
    }
    
    _scheduleSync() {
        // Mark as needing sync
        this.isDirty = true;
        
        //this._debug('Change', 'Data modified, scheduling sync');
        
        // Clear any existing timeout
        if (this.pendingSyncTimeout) {
            clearTimeout(this.pendingSyncTimeout);
        }
        
        // Set a maximum time before sync happens regardless
        this.pendingSyncTimeout = setTimeout(() => {
            //this._debug('Sync', 'Timeout reached, saving changes');
            this._saveToStorage();
        }, this.options.idleTimeout || 5000);
        
        // Don't schedule too many idle callbacks
        if (Date.now() - this.lastSyncTime < this.options.throttleMs) {
            //this._debug('Throttle', 'Skipping idle callback (throttled)');
            return;
        }
        
        // Schedule sync during idle time if supported
        if (this.options.idleSync && window.requestIdleCallback) {
            this._debug('Idle', 'Scheduling idle callback for sync');
            requestIdleCallback(deadline => {
                if (deadline.timeRemaining() > 10 || deadline.didTimeout) {
                    this._debug('Idle', `Sync during idle time (${Math.round(deadline.timeRemaining())}ms remaining)`);
                    this._saveToStorage();
                }
            }, { timeout: this.options.idleTimeout || 5000 });
        }
    }
    
    _saveToStorage(immediate = false) {
        // Don't save if nothing changed and not forced
        if (!this.isDirty && !immediate) {
            this._debug('Save', 'Skipping save (no changes)');
            return;
        }
        
        this._debug('Save', immediate ? 'Forced save' : 'Saving changes');
        
        // Save to localStorage
        setStore(this.storageKey, this.data, this.options.expireDays);
        
        // Reset state tracking
        this.isDirty = false;
        this.lastSyncTime = Date.now();
        
        if (this.pendingSyncTimeout) {
            clearTimeout(this.pendingSyncTimeout);
            this.pendingSyncTimeout = null;
        }
    }
    
    _createProxy(obj, path = '') {
        if (!this.options.deepProxy || typeof obj !== 'object' || obj === null) {
            return obj;
        }
        
        const self = this;
        
        return new Proxy(obj, {
            get(target, prop) {
                if (typeof prop === 'symbol') return target[prop];
                
                // Handle special properties
                if (prop === '_saveNow') {
                    return () => self._saveToStorage(true);
                }
                if (prop === '_destroy') {
                    return () => self.destroy();
                }
                if (prop === '_raw') {
                    return self.data;
                }
                
                const value = target[prop];
                
                // Create proxies for nested objects/arrays on access
                if (self.options.deepProxy && typeof value === 'object' && value !== null) {
                    const newPath = path ? `${path}.${prop}` : prop;
                    return self._createProxy(value, newPath);
                }
                
                return value;
            },
            
            set(target, prop, value) {
                if (typeof prop === 'symbol') {
                    target[prop] = value;
                    return true;
                }
                
                // Skip if the value hasn't actually changed
                if (target[prop] === value) return true;
                
                // Only log at data structure level changes, not every property
                if (path === '' && self.options.verbose) {
                    //self._debug('Change', 'Data modified');
                }
                
                // Handle nested objects
                if (self.options.deepProxy && typeof value === 'object' && value !== null) {
                    target[prop] = value;
                    self._scheduleSync();
                    return true;
                }
                
                target[prop] = value;
                self._scheduleSync();
                return true;
            },
            
            deleteProperty(target, prop) {
                if (path === '' && self.options.verbose) {
                    self._debug('Delete', 'Removing property');
                }
                
                if (prop in target) {
                    delete target[prop];
                    self._scheduleSync();
                    return true;
                }
                return false;
            }
        });
    }
    
    // Public methods
    save() {
        this._debug('API', 'Manual save called');
        this._saveToStorage(true);
    }
    
    merge(newData) {
        this._debug('API', 'Merge called', newData);
        Object.assign(this.data, newData);
        this._scheduleSync();
        return this.data;
    }
    
    reset(defaultData = {}) {
        this._debug('API', 'Reset called', defaultData);
        this.data = defaultData;
        this._saveToStorage(true);
    }
    
    destroy() {
        this._debug('API', 'Destroy called');
        
        if (this.options.autoSaveOnExit) {
            // Remove event listeners
            window.removeEventListener('beforeunload', this._boundSaveHandler);
            document.removeEventListener('visibilitychange', this._boundVisibilityHandler);
            
            if (this._storageListener) {
                window.removeEventListener('storage', this._storageListener);
            }
            
            // Final save
            this._saveToStorage(true);
        }
        
        // Remove from instances
        delete storageObject._instances[this.storageKey];
    }
}

// Create the export object
const storage = {
    setStore,
    getStore, 
    removeStore,
    hasStore,
    clearStore,
    storageObject
};

// Export both as default and named exports
export default storage;
export { 
    setStore,
    getStore, 
    removeStore,
    hasStore,
    clearStore,
    storageObject
};