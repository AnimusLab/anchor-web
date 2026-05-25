/**
 * AvatarVault.js - Institutional Local Persistence (v6.0)
 * Persistent storage for identity avatars using IndexedDB.
 * Keyed by identity fingerprint (clearance ID).
 */

const DB_NAME = "AnchorSecurity";
const STORE_NAME = "AvatarVault";

export const AvatarVault = {
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Store avatar for a specific identity fingerprint.
   * @param {string} fingerprint - The Clearance ID (e.g. OWN-AN-MUM-042)
   * @param {string} blobUrl - The base64 or blob URL of the avatar.
   */
  async saveAvatar(fingerprint, blobUrl) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(blobUrl, fingerprint);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * Retrieve avatar for a specific identity fingerprint.
   * @param {string} fingerprint 
   */
  async getAvatar(fingerprint) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(fingerprint);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Delete avatar (regulatory sanitization)
   * @param {string} fingerprint 
   */
  async removeAvatar(fingerprint) {
    const db = await this.init();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(fingerprint);
  }
};
