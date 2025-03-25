import type { Unsubscriber } from 'svelte/store';
import {
	createQueryKeyHash,
	internalGetCacheContext,
	NewIocasteQueryCache
} from './iocasteQueryCache.svelte.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type IocasteQueryKey = ReadonlyArray<unknown | (() => unknown)>;

export type DecoratedIocasteQueryKey<TKey extends IocasteQueryKey> = {
	[K in keyof TKey]: TKey[K] extends TKey[number] ? TKey[K] : never;
};

declare const errorTagSymbol: unique symbol;
type errorTagSymbol = typeof errorTagSymbol;
type AnyErrorTag = {
	[errorTagSymbol]: any;
};
type ErrorTag<TError = unknown> = TError extends AnyErrorTag
	? TError
	: {
			[errorTagSymbol]: TError;
		};

export type IocasteQueryInput = {
	signal: AbortSignal;
};

// TODO: add in input, this will be useful data about the query
export type IocasteQueryResolver<TOutput> = (input: IocasteQueryInput) => Promise<TOutput>;

export type IocasteQueryInternalRunResolver<TOutput, TError> = (
	input: IocasteQueryInput
) => Promise<{
	data: TOutput | undefined;
	error: TError | undefined;
}>;

export type AnyIocasteQueryInternalRunResolver = IocasteQueryInternalRunResolver<any, any>;

export type IocasteQueryDef<TOutput, TError, TKey extends IocasteQueryKey> = {
	resolver: IocasteQueryResolver<TOutput>;
	$types: {
		output: TOutput;
		key: DecoratedIocasteQueryKey<TKey>;
		error: TError;
	};
	key: DecoratedIocasteQueryKey<TKey>;
	config: IocasteQueryConfig;
};

export type IocasteQueryMethods<TOutput, TError> = {
	data: TOutput | undefined;
	isLoading: boolean;
	refetch: () => Promise<void>;
	error: TError | undefined;
};

export type AnyIocasteQuery = IocasteQuery<any, any, any>;

export type IocasteQueryConfig = {
	refetchOnWindowFocus: boolean;
	enabled: boolean;
};

export const defaultIocasteQueryConfig: IocasteQueryConfig = {
	refetchOnWindowFocus: true,
	enabled: true
};

export type IocasteQueryOptions<$Output, $Key extends IocasteQueryKey> = {
	queryFn: IocasteQueryResolver<$Output>;
	queryKey: $Key;
	config?: Partial<IocasteQueryConfig>;
};

export function iocasteQueryOptions<
	$Output = unknown,
	$Error = Error,
	$Key extends IocasteQueryKey = IocasteQueryKey
>(
	options: IocasteQueryOptions<$Output, $Key>
): IocasteQueryOptions<$Output, $Key> & {
	errorTag: ErrorTag<$Error>;
} {
	return {
		...options,
		errorTag: {} as ErrorTag<$Error>
	};
}

export type IocasteQuery<TOutput, TError, TKey extends IocasteQueryKey> = {
	_def: IocasteQueryDef<TOutput, TError, TKey>;
} & IocasteQueryMethods<TOutput, TError>;

export const internalCreateIocasteQuery = <TOutput, TError, TKey extends IocasteQueryKey>(data: {
	options: IocasteQueryOptions<TOutput, TKey>;
}) => {
	const optionsWithErrorTag = iocasteQueryOptions<TOutput, TError, TKey>(data.options);

	return new IocasteQueryClass({
		options: optionsWithErrorTag
	});
};

export class IocasteQueryClass<TOutput, TError, TKey extends IocasteQueryKey>
	implements IocasteQuery<TOutput, TError, TKey>
{
	_def: IocasteQueryDef<TOutput, TError, TKey>;

	data = $state<TOutput | undefined>();
	isLoading = $state(false);
	error = $state<TError | undefined>();

	private cache: NewIocasteQueryCache<TOutput, TError>;

	private hasMounted = false;

	private unsubscribers: Unsubscriber[] = [];

	private subscribeToCache(cache: NewIocasteQueryCache<TOutput, TError>) {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}

		this.unsubscribers = [];

		this.unsubscribers.push(
			cache.data.subscribe((value) => {
				this.data = value;
			}),
			cache.isLoading.subscribe((value) => {
				this.isLoading = value;
			}),
			cache.error.subscribe((value) => {
				this.error = value;
			})
		);
	}

	private getCache(key: IocasteQueryKey) {
		const cacheMap = internalGetCacheContext();

		const keyHash = createQueryKeyHash(key);

		const curCacheItem = cacheMap.get(keyHash) as NewIocasteQueryCache<TOutput, TError> | undefined;

		if (curCacheItem) {
			return {
				cache: curCacheItem,
				hit: true
			};
		} else {
			const internalRunResolver = async (data: IocasteQueryInput) => {
				try {
					const result = await this._def.resolver(data);
					return {
						data: result,
						error: undefined
					};
				} catch (error) {
					return {
						data: undefined,
						error: error as TError
					};
				}
			};
			const newCache = new NewIocasteQueryCache({ internalRunResolver });
			cacheMap.set(keyHash, newCache);

			return {
				cache: newCache,
				hit: false
			};
		}
	}

	constructor(data: {
		options: IocasteQueryOptions<TOutput, TKey> & {
			errorTag: ErrorTag<TError>;
		};
	}) {
		this._def = {
			resolver: data.options.queryFn,
			$types: {
				output: null as unknown as TOutput,
				key: null as unknown as DecoratedIocasteQueryKey<TKey>,
				error: null as unknown as TError
			},
			key: data.options.queryKey as DecoratedIocasteQueryKey<TKey>,
			config: {
				...defaultIocasteQueryConfig,
				...data.options.config
			}
		};

		const cacheResult = this.getCache(data.options.queryKey);

		this.cache = cacheResult.cache;

		this.subscribeToCache(cacheResult.cache);

		$effect(() => {
			console.log('key effect');
			for (const key of this._def.key) {
				if (typeof key === 'function') {
					key();
				}
			}

			if (this.hasMounted) {
				const cacheResult = this.getCache(data.options.queryKey);

				this.cache = cacheResult.cache;

				this.subscribeToCache(cacheResult.cache);

				this.cache.refetch();
			} else {
				this.hasMounted = true;
			}
		});

		$effect(() => {
			if (this._def.config.enabled) {
				this.cache.refetchMount();
			}
		});
	}

	async refetch() {
		await this.cache.refetch();
	}
}
