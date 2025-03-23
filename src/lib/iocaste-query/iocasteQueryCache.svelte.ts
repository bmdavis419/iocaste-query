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
