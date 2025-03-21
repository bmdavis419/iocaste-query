import { getContext, setContext } from 'svelte';
import {
	defaultIocasteQueryConfig,
	internalCreateIocasteQuery,
	type AnyIocasteQuery,
	type IocasteQueryKey,
	type IocasteQueryOptions
} from './iocasteQuery.svelte.js';
import { IocasteQueryCacheClass } from './iocasteQueryCache.svelte.js';
import {
	internalCreateIocasteMutation,
	type IocasteMutationOptions
} from './iocasteMutation.svelte.js';

class IocasteClient {
	private queries: AnyIocasteQuery[] = [];
	private queryCache: Map<string, IocasteQueryCacheClass<unknown, unknown>> = new Map();

	constructor() {}

	async invalidateQueries(data: { queryKey: IocasteQueryKey }) {
		const queryKeyStr = data.queryKey.toString();
		const curCacheItem = this.queryCache.get(queryKeyStr);

		if (curCacheItem) {
			await curCacheItem.refetch();
		}
	}

	createMutation<$Input = unknown, $Output = unknown, $Error = Error>(
		options: IocasteMutationOptions<$Input, $Output, $Error>
	) {
		return internalCreateIocasteMutation(options);
	}

	createQuery<$Output = unknown, $Error = Error, $Key extends IocasteQueryKey = IocasteQueryKey>(
		options: IocasteQueryOptions<$Output, $Key>
	) {
		const queryKeyStr = options.queryKey.toString();
		const curCacheItem = this.queryCache.get(queryKeyStr);

		if (curCacheItem) {
			const query = internalCreateIocasteQuery({
				options,
				cache: curCacheItem as IocasteQueryCacheClass<$Output, $Error>
			});

			this.queries.push(query);
			return query;
		} else {
			const internalRunResolver = async () => {
				try {
					const result = await options.queryFn();
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
			};

			const cache = new IocasteQueryCacheClass({
				internalRunResolver,
				config: {
					...defaultIocasteQueryConfig,
					...options.config
				}
			});

			this.queryCache.set(queryKeyStr, cache);

			const query = internalCreateIocasteQuery({
				options,
				cache
			});

			this.queries.push(query);
			return query;
		}
	}
}

const DEFAULT_KEY = '$_iocaste_client';

export const createIocasteClient = (key: string = DEFAULT_KEY) => {
	const client = new IocasteClient();
	return setContext(key, client);
};

export const getIocasteClient = (key: string = DEFAULT_KEY) => {
	return getContext<IocasteClient>(key);
};
