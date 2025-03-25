import type { IocasteQueryKey } from '$lib/index.js';
import { createQueryKeyHash } from '$lib/iocaste-query/iocasteQueryCache.svelte.js';
import { getContext, setContext } from 'svelte';
import { writable, type Unsubscriber } from 'svelte/store';

class CounterLadCache {
	randomNumber = writable<number | undefined>();

	constructor() {
		const newRandomNumber = Math.random();
		this.randomNumber.set(newRandomNumber);
		console.log('cache constructor', newRandomNumber);
	}

	refetch() {
		const newRandomNumber = Math.random();
		this.randomNumber.set(newRandomNumber);
		console.log('cache refetch', newRandomNumber);
	}
}

export class CounterLad {
	private cache: CounterLadCache;

	private getCache(key: IocasteQueryKey) {
		const keyHash = createQueryKeyHash(key);
		const cacheMap = internalGetCacheContext();

		const curCacheItem = cacheMap.get(keyHash);

		if (curCacheItem) {
			curCacheItem.refetch();
			return curCacheItem;
		} else {
			const newCache = new CounterLadCache();
			cacheMap.set(keyHash, newCache);

			return newCache;
		}
	}

	private hasMounted = false;

	private unsubscribe: Unsubscriber | undefined;

	randomNumber = $state<number | undefined>();

	constructor(data: { key: IocasteQueryKey }) {
		this.cache = this.getCache(data.key);

		this.unsubscribe = this.cache.randomNumber.subscribe((value) => {
			this.randomNumber = value;
		});

		$effect(() => {
			for (const key of data.key) {
				if (typeof key === 'function') {
					key();
				}
			}

			if (!this.hasMounted) {
				this.hasMounted = true;
			} else {
				console.log('new key hash', createQueryKeyHash(data.key));
				this.cache = this.getCache(data.key);
				if (this.unsubscribe) {
					this.unsubscribe();
				}

				this.unsubscribe = this.cache.randomNumber.subscribe((value) => {
					this.randomNumber = value;
				});
			}
		});
	}

	get count() {
		return 0;
	}
}

const CACHE_KEY = 'the-imposter-kill-me';

export const internalSetCacheContext = () => {
	const cacheMap = new Map<string, CounterLadCache>();

	return setContext(CACHE_KEY, cacheMap);
};

export const internalGetCacheContext = () => {
	return getContext<Map<string, CounterLadCache>>(CACHE_KEY);
};
