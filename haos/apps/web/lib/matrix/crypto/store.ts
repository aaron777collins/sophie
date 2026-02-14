'use client'

// Use console instead of matrix logger for client-side compatibility
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * IndexedDB-backed crypto store for Matrix SDK
 * Note: In Matrix SDK 32.x+, crypto storage is handled internally when using useIndexedDB: true
 * This store provides additional utilities for crypto state management
 */
export class IndexedDBCryptoStore {
  private dbName: string
  private db: IDBDatabase | null = null
  private isReady: boolean = false

  constructor(userId: string) {
    // Create unique DB name per user to avoid conflicts
    this.dbName = `haos-crypto-state-${userId.replace(/[^a-zA-Z0-9]/g, '_')}`
  }

  /**
   * Initialize the IndexedDB database
   */
  async startup(): Promise<void> {
    if (this.isReady) {
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => {
        logger.error('Failed to open IndexedDB for crypto store:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isReady = true
        logger.info('IndexedDB crypto store initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores for crypto data
        if (!db.objectStoreNames.contains('account')) {
          db.createObjectStore('account', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains('inbound_group_sessions')) {
          db.createObjectStore('inbound_group_sessions', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains('outbound_group_sessions')) {
          db.createObjectStore('outbound_group_sessions', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains('device_data')) {
          db.createObjectStore('device_data', { keyPath: 'key' })
        }

        if (!db.objectStoreNames.contains('cross_signing_keys')) {
          db.createObjectStore('cross_signing_keys', { keyPath: 'key' })
        }

        logger.info('IndexedDB crypto store schema created')
      }
    })
  }

  /**
   * Clean up and close the database
   */
  async shutdown(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.isReady = false
    logger.info('IndexedDB crypto store shut down')
  }

  /**
   * Store data in the specified object store
   */
  async setItem(storeName: string, key: string, value: any): Promise<void> {
    if (!this.isReady || !this.db) {
      throw new Error('Crypto store not ready')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      const request = store.put({ key, value })

      request.onerror = () => {
        logger.error(`Failed to store item in ${storeName}:`, request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  /**
   * Retrieve data from the specified object store
   */
  async getItem(storeName: string, key: string): Promise<any> {
    if (!this.isReady || !this.db) {
      throw new Error('Crypto store not ready')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      
      const request = store.get(key)

      request.onerror = () => {
        logger.error(`Failed to get item from ${storeName}:`, request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : undefined)
      }
    })
  }

  /**
   * Remove data from the specified object store
   */
  async removeItem(storeName: string, key: string): Promise<void> {
    if (!this.isReady || !this.db) {
      throw new Error('Crypto store not ready')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      const request = store.delete(key)

      request.onerror = () => {
        logger.error(`Failed to remove item from ${storeName}:`, request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve()
      }
    })
  }

  /**
   * Get all keys from the specified object store
   */
  async getAllKeys(storeName: string): Promise<string[]> {
    if (!this.isReady || !this.db) {
      throw new Error('Crypto store not ready')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      
      const request = store.getAllKeys()

      request.onerror = () => {
        logger.error(`Failed to get all keys from ${storeName}:`, request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result as string[])
      }
    })
  }

  /**
   * Clear all data from the crypto store
   */
  async clear(): Promise<void> {
    if (!this.isReady || !this.db) {
      throw new Error('Crypto store not ready')
    }

    const storeNames = [
      'account',
      'sessions', 
      'inbound_group_sessions',
      'outbound_group_sessions',
      'device_data',
      'cross_signing_keys'
    ]

    for (const storeName of storeNames) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        
        const request = store.clear()

        request.onerror = () => {
          logger.error(`Failed to clear ${storeName}:`, request.error)
          reject(request.error)
        }

        request.onsuccess = () => {
          resolve()
        }
      })
    }

    logger.info('Crypto store cleared')
  }

  /**
   * Check if the store is ready for operations
   */
  isStarted(): boolean {
    return this.isReady
  }
}