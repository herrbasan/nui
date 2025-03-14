'use strict';
import ut from './nui_ut.js';

// Default configuration
const DEFAULT_DB_NAME = 'nuiStorage';
const DEFAULT_STORE_NAME = 'keyValueStore';
const DB_VERSION = 1;

// Current configuration (can be changed)
let currentConfig = {
    dbName: DEFAULT_DB_NAME,
    storeName: DEFAULT_STORE_NAME,
    preferredStorage: 'indexeddb' // 'indexeddb' or 'localstorage'
};

// Tracking IndexedDB connections
let dbPromises = new Map();

if(window) { window.addEventListener('keydown', clearAll)};

function clearAll(e) {
    if (e && (!e.ctrlKey || !e.altKey || e.key !== 'F1')) return;
    if (e) e.preventDefault();
    console.log("Clearing all storage...");
    const instances = Object.values(storageObject._instances);
    if (instances.length > 0) {
        console.log(`Destroying ${instances.length} storage objects`);
        instances.forEach(instance => {
            if (instance && typeof instance._destroy === 'function') {
                instance._destroy();
            }
        });
    }
    clearStore().then(() => {
        console.log("Storage cleared, reloading page...");
        window.location.reload();
    });
}

// Initialize IndexedDB with configurable names
function initDB(dbName = currentConfig.dbName, storeName = currentConfig.storeName) {
    const dbKey = `${dbName}:${storeName}`;
    
    if (dbPromises.has(dbKey)) {
        return dbPromises.get(dbKey);
    }
    
    const dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            console.warn('IndexedDB not supported, falling back to localStorage');
            currentConfig.preferredStorage = 'localstorage';
            resolve(null);
            return;
        }
        
        const request = indexedDB.open(dbName, DB_VERSION);
        
        request.onerror = (event) => {
            console.warn('IndexedDB error:', event);
            currentConfig.preferredStorage = 'localstorage';
            resolve(null);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
            }
        };
        
        request.onsuccess = (event) => {
            resolve({
                db: event.target.result,
                storeName: storeName
            });
        };
    });
    
    dbPromises.set(dbKey, dbPromise);
    return dbPromise;
}

// Request persistent storage permission
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        return isPersisted;
    }
    return false;
}

// Create a clean copy of data for storage (no methods, no _properties)
function createCleanDataCopy(obj) {
    // Simple clone for primitives
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => createCleanDataCopy(item));
    }
    
    // Handle objects
    const cleanObj = {};
    for (const key in obj) {
        // Skip functions and properties starting with _
        if (typeof obj[key] !== 'function' && !key.startsWith('_')) {
            cleanObj[key] = createCleanDataCopy(obj[key]);
        }
    }
    
    return cleanObj;
}

// IndexedDB implementation with configurable store
async function setStoreIDB(key, val, days, dbName = currentConfig.dbName, storeName = currentConfig.storeName) {
    try {
        const connection = await initDB(dbName, storeName);
        if (!connection) throw new Error('IndexedDB not available');
        
        // Create a clean copy without methods
        const cleanValue = createCleanDataCopy(val);
        
        return new Promise((resolve, reject) => {
            const tx = connection.db.transaction(connection.storeName, 'readwrite');
            const store = tx.objectStore(connection.storeName);
            
            // For expiration support
            let valueToStore = cleanValue;
            if (days) {
                const expiresAt = new Date().getTime() + (days * 24 * 60 * 60 * 1000);
                valueToStore = { value: cleanValue, expiresAt };
            }
            
            const request = store.put(valueToStore, key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => {
                console.error('IndexedDB put error:', e);
                reject(e);
            };
            
            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => reject(e);
        });
    } catch (e) {
        console.warn('IndexedDB storage error:', e);
        return false;
    }
}

async function getStoreIDB(key, def = null, dbName = currentConfig.dbName, storeName = currentConfig.storeName) {
    try {
        const connection = await initDB(dbName, storeName);
        if (!connection) throw new Error('IndexedDB not available');
        
        return new Promise((resolve, reject) => {
            const tx = connection.db.transaction(connection.storeName, 'readonly');
            const store = tx.objectStore(connection.storeName);
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                
                if (result === undefined) {
                    resolve(def);
                    return;
                }
                
                // Check for expiration
                if (result && typeof result === 'object' && result.expiresAt) {
                    if (new Date().getTime() > result.expiresAt) {
                        // Expired, remove it and return default
                        removeStoreIDB(key, dbName, storeName);
                        resolve(def);
                        return;
                    }
                    resolve(result.value);
                } else {
                    resolve(result);
                }
            };
            
            request.onerror = () => resolve(def);
        });
    } catch (e) {
        console.warn('IndexedDB storage error:', e);
        return def;
    }
}

async function removeStoreIDB(key, dbName = currentConfig.dbName, storeName = currentConfig.storeName) {
    try {
        const connection = await initDB(dbName, storeName);
        if (!connection) throw new Error('IndexedDB not available');
        
        return new Promise((resolve, reject) => {
            const tx = connection.db.transaction(connection.storeName, 'readwrite');
            const store = tx.objectStore(connection.storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    } catch (e) {
        console.warn('IndexedDB storage error:', e);
        return false;
    }
}

async function hasStoreIDB(key, dbName = currentConfig.dbName, storeName = currentConfig.storeName) {
    try {
        const value = await getStoreIDB(key, undefined, dbName, storeName);
        return value !== undefined;
    } catch (e) {
        console.warn('IndexedDB storage error:', e);
        return false;
    }
}

async function clearStoreIDB(dbName = currentConfig.dbName, storeName = currentConfig.storeName) {
    try {
        const connection = await initDB(dbName, storeName);
        if (!connection) throw new Error('IndexedDB not available');
        
        return new Promise((resolve, reject) => {
            const tx = connection.db.transaction(connection.storeName, 'readwrite');
            const store = tx.objectStore(connection.storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    } catch (e) {
        console.warn('IndexedDB storage error:', e);
        return false;
    }
}

// localStorage implementation (existing code)
function setStoreLS(key, val, days) {
    try {
        // Create a clean copy without functions
        const cleanValue = createCleanDataCopy(val);
        const valueToStore = typeof cleanValue === 'string' ? cleanValue : JSON.stringify(cleanValue);
        if (days) {
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

function getStoreLS(key, def = null) {
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
                try { return JSON.parse(parsed.value); } catch { return parsed.value; }
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

function removeStoreLS(key) {
    try { localStorage.removeItem(key); return true; } 
    catch (e) { console.warn('Storage error:', e); return false; }
}

function hasStoreLS(key) {
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

function clearStoreLS() {
    try { localStorage.clear(); return true; } 
    catch (e) { console.warn('Storage error:', e); return false; }
}

// Unified storage interface
async function setStore(key, val, days) {
    if (currentConfig.preferredStorage === 'indexeddb') {
        return await setStoreIDB(key, val, days);
    } else {
        return setStoreLS(key, val, days);
    }
}

async function getStore(key, def = null) {
    if (currentConfig.preferredStorage === 'indexeddb') {
        return await getStoreIDB(key, def);
    } else {
        return getStoreLS(key, def);
    }
}

async function removeStore(key) {
    if (currentConfig.preferredStorage === 'indexeddb') {
        return await removeStoreIDB(key);
    } else {
        return removeStoreLS(key);
    }
}

async function hasStore(key) {
    if (currentConfig.preferredStorage === 'indexeddb') {
        return await hasStoreIDB(key);
    } else {
        return hasStoreLS(key);
    }
}

async function clearStore() {
    if (currentConfig.preferredStorage === 'indexeddb') {
        return await clearStoreIDB();
    } else {
        return clearStoreLS();
    }
}

class storageObject {
    static _instances = {};
    static _dataRefs = new WeakMap();
    static _readyPromises = new Map();
    
    constructor(key, defaultData = {}, options = {}) {
        // Return existing instance if available
        if (storageObject._instances[key]) {
            return storageObject._instances[key];
        }
        
        // Set storage engine and database config from options
        const config = {
            key: key,
            options: {
                expireDays: null,
                checkInterval: 10000,
                autoSaveOnExit: true,
                verbose: false,
                storageEngine: currentConfig.preferredStorage,
                dbName: currentConfig.dbName,
                storeName: currentConfig.storeName,
                ...options
            },
            lastSavedJSON: '',
            isDirty: false,
            checkTimeout: null
        };
        
        // Update current storage engine if specified
        if (options.storageEngine) {
            if (options.storageEngine === 'indexeddb' || options.storageEngine === 'localstorage') {
                config.options.storageEngine = options.storageEngine;
            } else {
                console.warn(`Invalid storage engine: ${options.storageEngine}, defaulting to ${config.options.storageEngine}`);
            }
        }
        
        const debug = (action, message, data) => {
            if (!config.options.verbose) return;
            const prefix = `[StoreObj:${key}]`;
            if (data !== undefined) console.log(`${prefix} ${action}: ${message}`, data);
            else console.log(`${prefix} ${action}: ${message}`);
        };
        
        debug('Init', `Creating storage object using ${config.options.storageEngine} (DB: ${config.options.dbName}, Store: ${config.options.storeName})`);
        
        // Create a proxy data object that we'll populate with the stored data
        const data = {};
        storageObject._dataRefs.set(data, config);
        
        // Create ready promise
        const readyPromise = new Promise(resolve => {
            // Load data (asynchronously for IndexedDB)
            const initializeData = async () => {
                // Request persistent storage if using IndexedDB
                if (config.options.storageEngine === 'indexeddb') {
                    requestPersistentStorage().then(isPersisted => {
                        if (config.options.verbose) {
                            console.log(`[StoreObj:${key}] Storage persistence: ${isPersisted ? 'granted' : 'denied'}`);
                        }
                    });
                }
                
                // Get data using specified database and store names
                const storedData = config.options.storageEngine === 'indexeddb' ?
                    await getStoreIDB(key, null, config.options.dbName, config.options.storeName) :
                    getStoreLS(key);
                
                // Apply stored or default data to our object
                Object.assign(data, storedData || defaultData);
                
                // Remember the initial state
                config.lastSavedJSON = JSON.stringify(createCleanDataCopy(data));
                
                // Save default data if nothing was stored
                if (storedData === null) {
                    debug('Init', 'Saving initial data');
                    await saveToStorage(data, true);
                }
                
                debug('Init', 'Data loaded', data);
                resolve(data); // Resolve the promise with loaded data
            };
            
            // Start initialization
            initializeData();
        });
        
        // Store the promise for external access
        storageObject._readyPromises.set(data, readyPromise);
        
        // Set up the ready method on the data object
        data.ready = function() {
            return storageObject._readyPromises.get(this);
        };
        
        // Set up save operations and handlers as before
        if (config.options.autoSaveOnExit) {
            const saveHandler = () => {
                debug('Exit', 'Saving on page unload');
                saveToStorage(data, true);
            };
            window.addEventListener('beforeunload', saveHandler);
            
            const visibilityHandler = () => {
                if (document.visibilityState === 'hidden') {
                    debug('Visibility', 'Tab hidden, checking for changes');
                    checkAndSave(data);
                }
            };
            document.addEventListener('visibilitychange', visibilityHandler);
            
            config.handlers = { saveHandler, visibilityHandler };
        }
        
        function scheduleCheck() {
            if (config.checkTimeout) clearTimeout(config.checkTimeout);
            
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
        
        function checkAndSave(dataObj) {
            const currentJSON = JSON.stringify(createCleanDataCopy(dataObj));
            if (currentJSON !== config.lastSavedJSON) {
                debug('Check', 'Changes detected, saving');
                saveToStorage(dataObj, false);
                return true;
            }
            return false;
        }
        
        async function saveToStorage(dataObj, immediate) {
            if (!immediate && !config.isDirty) return;
            
            debug('Save', immediate ? 'Forced save' : 'Saving changes');
            
            if (config.options.storageEngine === 'indexeddb') {
                await setStoreIDB(key, dataObj, config.options.expireDays, 
                                config.options.dbName, config.options.storeName);
            } else {
                setStoreLS(key, dataObj, config.options.expireDays);
            }
            
            config.lastSavedJSON = JSON.stringify(createCleanDataCopy(dataObj));
            config.isDirty = false;
        }
        
        // Public methods
        data._save = async function() { 
            await saveToStorage(this, true); 
            return this; 
        };
        
        data._merge = function(newData) { 
            Object.assign(this, newData); 
            config.isDirty = true; 
            return this; 
        };
        
        data._reset = async function(newData = {}) {
            for (const prop in this) {
                if (!prop.startsWith('_') && prop !== 'ready') delete this[prop];
            }
            Object.assign(this, newData);
            config.isDirty = true;
            await saveToStorage(this, true);
            return this;
        };
        
        data._destroy = async function() {
            debug('API', 'Destroy called');
            if (config.handlers) {
                window.removeEventListener('beforeunload', config.handlers.saveHandler);
                document.removeEventListener('visibilitychange', config.handlers.visibilityHandler);
            }
            if (config.checkTimeout) clearTimeout(config.checkTimeout);
            await saveToStorage(this, true);
            delete storageObject._instances[key];
            storageObject._readyPromises.delete(this);
            return null;
        };
        
        storageObject._instances[key] = data;
        return data;
    }
}

// Configure storage engine and database settings
function configure(options = {}) {
    // Update storage engine if specified
    if (options.storageEngine) {
        if (options.storageEngine === 'indexeddb' || options.storageEngine === 'localstorage') {
            currentConfig.preferredStorage = options.storageEngine;
        }
    }
    
    // Update database name if specified
    if (options.dbName) {
        currentConfig.dbName = options.dbName;
    }
    
    // Update store name if specified
    if (options.storeName) {
        currentConfig.storeName = options.storeName;
    }
    
    return true;
}

const storage = {
    setStore, getStore, removeStore, hasStore, clearStore, storageObject, configure
};

// Initialize IndexedDB right away with default settings
initDB();

export default storage;
export { setStore, getStore, removeStore, hasStore, clearStore, storageObject, configure };