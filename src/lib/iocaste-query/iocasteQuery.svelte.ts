import type { IocasteQueryCacheClass } from './iocasteQueryCache.svelte.js';

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
	cache: IocasteQueryCacheClass<TOutput, TError>;
}) => {
	const optionsWithErrorTag = iocasteQueryOptions<TOutput, TError, TKey>(data.options);

	return new IocasteQueryClass({
		options: optionsWithErrorTag,
		cache: data.cache
	});
};

export class IocasteQueryClass<TOutput, TError, TKey extends IocasteQueryKey>
	implements IocasteQuery<TOutput, TError, TKey>
{
	_def: IocasteQueryDef<TOutput, TError, TKey>;

	get data() {
		return this.cache.data;
	}

	get isLoading() {
		return this.cache.isLoading;
	}

	get error() {
		return this.cache.error;
	}

	private cache: IocasteQueryCacheClass<TOutput, TError>;

	constructor(data: {
		options: IocasteQueryOptions<TOutput, TKey> & {
			errorTag: ErrorTag<TError>;
		};
		cache: IocasteQueryCacheClass<TOutput, TError>;
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

		this.cache = data.cache;
	}

	async refetch() {
		await this.cache.refetch();
	}
}
