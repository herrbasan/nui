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
    static _dataRefs = new WeakMap();
    
    constructor(key, defaultData = {}, options = {}) {
        // Return existing instance if available
        if (storageObject._instances[key]) {
            return storageObject._instances[key];
        }
        
        // Store configuration
        const config = {
            key: key,
            options: {
                expireDays: null,
                checkInterval: 10000, // Check every 10 seconds
                autoSaveOnExit: true,
                verbose: false,
                ...options
            },
            lastSavedJSON: '',
            isDirty: false,
            checkTimeout: null
        };
        
        // Debug helper
        const debug = (action, message, data) => {
            if (!config.options.verbose) return;
            const prefix = `[StoreObj:${key}]`;
            if (data !== undefined) {
                console.log(`${prefix} ${action}: ${message}`, data);
            } else {
                console.log(`${prefix} ${action}: ${message}`);
            }
        };
        
        debug('Init', 'Creating storage object');
        
        // Get initial data
        const data = getStore(key) || defaultData;
        config.lastSavedJSON = JSON.stringify(data);
        
        // Store the config with a WeakMap to avoid property pollution
        storageObject._dataRefs.set(data, config);
        
        // Setup save handlers
        if (config.options.autoSaveOnExit) {
            // Page unload handler
            const saveHandler = () => {
                debug('Exit', 'Saving on page unload');
                saveToStorage(data, true);
            };
            window.addEventListener('beforeunload', saveHandler);
            
            // Tab visibility handler
            const visibilityHandler = () => {
                if (document.visibilityState === 'hidden') {
                    debug('Visibility', 'Tab hidden, checking for changes');
                    checkAndSave(data);
                }
            };
            document.addEventListener('visibilitychange', visibilityHandler);
            
            // Store handlers for cleanup
            config.handlers = { saveHandler, visibilityHandler };
        }
        
        // Schedule periodic checks
        function scheduleCheck() {
            if (config.checkTimeout) {
                clearTimeout(config.checkTimeout);
            }
            
            config.checkTimeout = setTimeout(() => {
                if (window.requestIdleCallback) {
                    requestIdleCallback(() => {
                        checkAndSave(data);
                        scheduleCheck();
                    }, { timeout: 1000 });
                } else {
                    checkAndSave(data);
                    scheduleCheck();
                }
            }, config.options.checkInterval);
        }
        
        scheduleCheck();
        
        // Check for changes and save if needed
        function checkAndSave(dataObj) {
            const currentJSON = JSON.stringify(dataObj);
            if (currentJSON !== config.lastSavedJSON) {
                debug('Check', 'Changes detected, saving');
                saveToStorage(dataObj, false);
                return true;
            }
            return false;
        }
        
        // Save to storage
        function saveToStorage(dataObj, immediate) {
            if (!immediate && !config.isDirty) {
                return;
            }
            
            debug('Save', immediate ? 'Forced save' : 'Saving changes');
            setStore(key, dataObj, config.options.expireDays);
            config.lastSavedJSON = JSON.stringify(dataObj);
            config.isDirty = false;
        }
        
        // Add convenience methods directly to the data object
        data._save = function() {
            debug('API', 'Manual save called');
            saveToStorage(this, true);
            return this;
        };
        
        data._merge = function(newData) {
            debug('API', 'Merge called', newData);
            Object.assign(this, newData);
            config.isDirty = true;
            return this;
        };
        
        data._reset = function(newData = {}) {
            debug('API', 'Reset called');
            // Clear existing properties
            for (const prop in this) {
                if (!prop.startsWith('_')) {
                    delete this[prop];
                }
            }
            // Add new properties
            Object.assign(this, newData);
            config.isDirty = true;
            saveToStorage(this, true);
            return this;
        };
        
        data._destroy = function() {
            debug('API', 'Destroy called');
            if (config.handlers) {
                window.removeEventListener('beforeunload', config.handlers.saveHandler);
                document.removeEventListener('visibilitychange', config.handlers.visibilityHandler);
            }
            if (config.checkTimeout) {
                clearTimeout(config.checkTimeout);
            }
            saveToStorage(this, true);
            delete storageObject._instances[key];
            return null;
        };
        
        // Save initial data if needed
        if (getStore(key) === null) {
            debug('Init', 'Saving initial data');
            saveToStorage(data, true);
        }
        
        // Store in static cache
        storageObject._instances[key] = data;
        return data;
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