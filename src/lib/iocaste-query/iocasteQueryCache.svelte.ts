import type { IocasteQueryConfig, IocasteQueryInternalRunResolver } from './iocasteQuery.svelte.js';

interface IocasteQueryCache<TOutput, TError> {
	isLoading: boolean;
	data: TOutput | undefined;
	error: TError | undefined;
}

export class IocasteQueryCacheClass<TOutput, TError> implements IocasteQueryCache<TOutput, TError> {
	isLoading = $state(false);
	data = $state<TOutput | undefined>();
	error = $state<TError | undefined>();

	private internalRunResolver: IocasteQueryInternalRunResolver<TOutput, TError>;

	private config: IocasteQueryConfig;

	private async internalRun() {
		this.isLoading = true;

		const result = await this.internalRunResolver();

		this.data = result.data;
		this.error = result.error;
		this.isLoading = false;
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
			if (this.config.refetchOnMount) {
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
