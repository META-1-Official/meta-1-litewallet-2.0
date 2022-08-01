class Cache {
    constructor() {
        this.accounts = new Map();
    }

    put(cacheKey, entryKey, entryValue) {
        this[cacheKey].set(entryKey, entryValue);
    }

    get(cacheKey, value) {
        return this[cacheKey].get(value);
    }
}
export default new Cache();
  