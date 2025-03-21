/* eslint-disable @typescript-eslint/no-explicit-any */
export type IocasteQueryKey = ReadonlyArray<unknown>;

export type DecoratedIocasteQueryKey<TKey extends IocasteQueryKey> = {
	[K in keyof TKey]: TKey[K] extends TKey[number] ? TKey[K] : never;
};

declare const errorTagSymbol: unique symbol;
type errorTagSymbol = typeof errorTagSymbol;
type AnyErrorTag = {
	[errorTagSymbol]: any;
};
// declare const unsetMarker: unique symbol;
// type UnsetMarker = typeof unsetMarker;
type ErrorTag<TError = unknown> = TError extends AnyErrorTag
	? TError
	: {
			[errorTagSymbol]: TError;
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

export const createIocasteQuery = <
	TOutput = unknown,
	TError = Error,
	TKey extends IocasteQueryKey = IocasteQueryKey
>(
	options: IocasteQueryOptions<TOutput, TKey>
) => {
	const optionsWithErrorTag = iocasteQueryOptions<TOutput, TError, TKey>(options);

	return new IocasteQueryClass(optionsWithErrorTag);
};

export class IocasteQueryClass<TOutput, TError, TKey extends IocasteQueryKey>
	implements IocasteQuery<TOutput, TError, TKey>
{
	_def: IocasteQueryDef<TOutput, TError, TKey>;

	data = $state<TOutput | undefined>();
	isLoading = $state(false);
	error = $state<TError | undefined>();

	constructor(
		options: IocasteQueryOptions<TOutput, TKey> & {
			errorTag: ErrorTag<TError>;
		}
	) {
		this._def = {
			resolver: options.queryFn,
			$types: {
				output: null as unknown as TOutput,
				key: null as unknown as DecoratedIocasteQueryKey<TKey>,
				error: null as unknown as TError
			},
			key: options.queryKey as DecoratedIocasteQueryKey<TKey>,
			config: {
				...defaultIocasteQueryConfig,
				...options.config
			},
			internalRunResolver: async () => {
				try {
					const result = await this._def.resolver();

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
			}
		};

		$effect(() => {
			if (this._def.config.refetchOnMount) {
				this.internalRun();
			}
		});
	}

	async internalRun() {
		this.isLoading = true;

		const result = await this._def.internalRunResolver();

		this.data = result.data;
		this.error = result.error;
		this.isLoading = false;
	}

	async refetch() {
		await this.internalRun();
	}
}

// todo: create the internalIocasteQuery function
