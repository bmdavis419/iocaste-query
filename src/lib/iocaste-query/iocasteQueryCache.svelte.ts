import { getContext, setContext } from 'svelte';
import type {
	IocasteQueryConfig,
	IocasteQueryInternalRunResolver,
	IocasteQueryKey
} from './iocasteQuery.svelte.js';
import { SvelteMap } from 'svelte/reactivity';
import { writable, type Writable } from 'svelte/store';

interface IocasteQueryCache<TOutput, TError> {
	isLoading: Writable<boolean>;
	data: Writable<TOutput | undefined>;
	error: Writable<TError | undefined>;
}

export const createQueryKeyHash = (queryKey: IocasteQueryKey) => {
	return queryKey
		.map((key) => {
			if (typeof key === 'function') {
				return key();
			}
			return key;
		})
		.join(':');
};

export class NewIocasteQueryCache<TOutput, TError> implements IocasteQueryCache<TOutput, TError> {
	isLoading = writable(false);
	data = writable<TOutput | undefined>();
	error = writable<TError | undefined>();

	private runAbortController: AbortController | undefined;

	private internalRunResolver: IocasteQueryInternalRunResolver<TOutput, TError>;

	private async internalRun() {
		this.isLoading.set(true);

		if (this.runAbortController) {
			this.runAbortController.abort();
			this.runAbortController = undefined;
		}

		this.runAbortController = new AbortController();
		const signal = this.runAbortController.signal;

		const promise = this.internalRunResolver({ signal })
			.then((result) => {
				if (!signal.aborted) {
					this.data.set(result.data);
					this.error.set(result.error);
					this.isLoading.set(false);
				}
			})
			.catch((error) => {
				if (!signal.aborted) {
					console.error('Unexpected error:', error);
					this.isLoading.set(false);
				}
			})
			.finally(() => {
				if (!signal.aborted) {
					this.isLoading.set(false);
				}
			});

		return promise;
	}

	constructor(data: { internalRunResolver: IocasteQueryInternalRunResolver<TOutput, TError> }) {
		this.internalRunResolver = data.internalRunResolver;
	}

	private hasMounted = false;

	async refetchMount() {
		if (!this.hasMounted) {
			this.hasMounted = true;
			await this.internalRun();
		}
	}

	async refetch() {
		await this.internalRun();
	}
}

const CACHE_KEY = '$_iocaste_query_cache';

export const internalSetCacheContext = () => {
	const cacheMap = new SvelteMap<string, NewIocasteQueryCache<unknown, unknown>>();

	return setContext(CACHE_KEY, cacheMap);
};

export const internalGetCacheContext = () => {
	return getContext<SvelteMap<string, NewIocasteQueryCache<unknown, unknown>>>(CACHE_KEY);
};

// change this to instead of holding all the implementation details, just hold the state
export class IocasteQueryCacheClass<TOutput, TError> {
	isLoading = $state(false);
	data = $state<TOutput | undefined>();
	error = $state<TError | undefined>();

	private runAbortController: AbortController | undefined;

	private internalRunResolver: IocasteQueryInternalRunResolver<TOutput, TError>;

	private config: IocasteQueryConfig;

	private async internalRun() {
		this.isLoading = true;

		if (this.runAbortController) {
			this.runAbortController.abort();
			this.runAbortController = undefined;
		}

		this.runAbortController = new AbortController();
		const signal = this.runAbortController.signal;

		const promise = this.internalRunResolver({ signal })
			.then((result) => {
				if (!signal.aborted) {
					this.data = result.data;
					this.error = result.error;
					this.isLoading = false;
				}
			})
			.catch((error) => {
				if (!signal.aborted) {
					console.error('Unexpected error:', error);
					this.isLoading = false;
				}
			})
			.finally(() => {
				if (!signal.aborted) {
					this.isLoading = false;
				}
			});

		return promise;
	}

	private async handleWindowFocus() {
		const isVisible = !document.hidden;

		if (isVisible && this.config.refetchOnWindowFocus) {
			await this.internalRun();
		}
	}

	constructor(data: {
		internalRunResolver: IocasteQueryInternalRunResolver<TOutput, TError>;
		config: IocasteQueryConfig;
	}) {
		this.internalRunResolver = data.internalRunResolver;
		this.config = data.config;

		$effect(() => {
			if (this.config.enabled) {
				this.internalRun();
			}
		});

		$effect(() => {
			const boundHandler = () => this.handleWindowFocus();
			document.addEventListener('visibilitychange', boundHandler);
			return () => {
				document.removeEventListener('visibilitychange', boundHandler);
			};
		});
	}

	async refetch() {
		await this.internalRun();
	}
}
