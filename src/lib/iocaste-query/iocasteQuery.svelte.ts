/* eslint-disable @typescript-eslint/no-explicit-any */
export type IocasteQueryKey = ReadonlyArray<unknown>;

export type DecoratedIocasteQueryKey<TKey extends IocasteQueryKey> = {
	[K in keyof TKey]: TKey[K] extends TKey[number] ? TKey[K] : never;
};

declare const dataTagSymbol: unique symbol;
type dataTagSymbol = typeof dataTagSymbol;
declare const dataTagErrorSymbol: unique symbol;
type dataTagErrorSymbol = typeof dataTagErrorSymbol;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const unsetMarker: unique symbol;
type UnsetMarker = typeof unsetMarker;
type AnyDataTag = {
	[dataTagSymbol]: any;
	[dataTagErrorSymbol]: any;
};
type DataTag<TType, TValue, TError = UnsetMarker> = TType extends AnyDataTag
	? TType
	: TType & {
			[dataTagSymbol]: TValue;
			[dataTagErrorSymbol]: TError;
		};

// TODO: add in input, this will be useful data about the query
export type IocasteQueryResolver<TOutput> = () => Promise<TOutput>;

export type IocasteQueryInternalRunResolver<TOutput, TError> = () => Promise<{
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
	internalRunResolver: IocasteQueryInternalRunResolver<TOutput, TError>;
	config: IocasteQueryConfig;
};

export type IocasteQueryMethods<TOutput, TError> = {
	data: TOutput | undefined;
	isLoading: boolean;
	refetch: () => Promise<void>;
	error: TError | undefined;
};

export type IocasteQuery<TOutput, TError, TKey extends IocasteQueryKey> = {
	_def: IocasteQueryDef<TOutput, TError, TKey>;
} & IocasteQueryMethods<TOutput, TError>;

export type AnyIocasteQuery = IocasteQuery<any, any, any>;

export type IocasteQueryConfig = {
	refetchOnWindowFocus: boolean;
	refetchOnMount: boolean;
	refetchOnNavigate: boolean;
};

export const defaultIocasteQueryConfig: IocasteQueryConfig = {
	refetchOnWindowFocus: true,
	refetchOnMount: true,
	refetchOnNavigate: true
};

export type IocasteQueryOptions<$Output, $Key extends IocasteQueryKey> = {
	queryFn: IocasteQueryResolver<$Output>;
	queryKey: $Key;
	config?: Partial<IocasteQueryConfig>;
};

export declare function iocasteQueryOptions<
	$Output = unknown,
	$Error = Error,
	$Key extends IocasteQueryKey = IocasteQueryKey
>(
	options: IocasteQueryOptions<$Output, $Key>
): IocasteQueryOptions<$Output, $Key> & {
	queryKey: DataTag<$Key, $Output, $Error>;
};

// todo: create the internalIocasteQuery function
