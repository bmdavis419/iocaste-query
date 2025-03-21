export type IocasteMutationResolver<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

export type IocasteMutationOptions<TInput, TOutput, TError> = {
	mutationFn: IocasteMutationResolver<TInput, TOutput>;
	onSuccess?: (data: TOutput) => Promise<void>;
	onError?: (error: TError) => Promise<void>;
};

export type IocasteMutationDef<TInput, TOutput, TError> = {
	$types: {
		input: TInput;
		output: TOutput;
		error: TError;
	};
	options: IocasteMutationOptions<TInput, TOutput, TError>;
	internalRunResolver: (input: TInput) => Promise<{
		data: TOutput | undefined;
		error: TError | undefined;
	}>;
};

export type IocasteMutationMethods<TInput, TOutput, TError> = {
	mutate: (input: TInput) => Promise<void>;
	data: TOutput | undefined;
	error: TError | undefined;
	isLoading: boolean;
};

export type IocasteMutation<TInput, TOutput, TError> = {
	_def: IocasteMutationDef<TInput, TOutput, TError>;
} & IocasteMutationMethods<TInput, TOutput, TError>;

export const iocasteMutationOptions = <$Input = unknown, $Output = unknown, $Error = Error>(
	options: IocasteMutationOptions<$Input, $Output, $Error>
) => {
	return options;
};

export const internalCreateIocasteMutation = <$Input, $Output, $Error>(
	options: IocasteMutationOptions<$Input, $Output, $Error>
) => {
	return new IocasteMutationClass(options) as IocasteMutation<$Input, $Output, $Error>;
};

export class IocasteMutationClass<$Input, $Output, $Error>
	implements IocasteMutation<$Input, $Output, $Error>
{
	_def: IocasteMutationDef<$Input, $Output, $Error>;

	data = $state<$Output | undefined>();
	error = $state<$Error | undefined>();
	isLoading = $state<boolean>(false);

	constructor(options: IocasteMutationOptions<$Input, $Output, $Error>) {
		this._def = {
			$types: {
				input: null as unknown as $Input,
				output: null as unknown as $Output,
				error: null as unknown as $Error
			},
			options: options,
			internalRunResolver: async (input: $Input) => {
				try {
					const result = await options.mutationFn(input);

					return {
						data: result,
						error: undefined
					};
				} catch (error) {
					return {
						data: undefined,
						error: error as $Error
					};
				}
			}
		};
	}

	async mutate(input: $Input) {
		this.isLoading = true;
		const { data, error } = await this._def.internalRunResolver(input);

		if (data) {
			this._def.options.onSuccess?.(data);
			this.data = data;
		}

		if (error) {
			this._def.options.onError?.(error);
			this.error = error;
		}

		this.isLoading = false;
	}
}
