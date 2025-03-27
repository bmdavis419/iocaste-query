import { getContext, setContext } from 'svelte';
import {
	defaultIocasteQueryConfig,
	IocasteQueryClass,
	iocasteQueryOptions,
	type AnyIocasteQuery,
	type IocasteQueryInput,
	type IocasteQueryKey,
	type IocasteQueryOptions
} from './iocasteQuery.svelte.js';
import { createQueryKeyHash, IocasteQueryCache } from './iocasteQueryCache.svelte.js';
import {
	internalCreateIocasteMutation,
	type IocasteMutationOptions
} from './iocasteMutation.svelte.js';

class IocasteClient {
	private queries: AnyIocasteQuery[] = [];
	private caches: Map<string, IocasteQueryCache<unknown, unknown>> = new Map();

	constructor() {}

	async invalidateQueries(data: { queryKey: IocasteQueryKey }) {
		const queryKeyStr = createQueryKeyHash(data.queryKey);
		const curCacheItem = this.queries.find(
			(query) => createQueryKeyHash(query._def.key) === queryKeyStr
		);

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
		const optionsWithErrorTag = iocasteQueryOptions<$Output, $Error, $Key>(options);

		const internalRunResolver = async (options: IocasteQueryInput) => {
			try {
				const result = await optionsWithErrorTag.queryFn(options);
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

		const curCache = this.caches.get(createQueryKeyHash(optionsWithErrorTag.queryKey));

		if (!curCache) {
			const newCache = new IocasteQueryCache({
				internalRunResolver,
				config: {
					...defaultIocasteQueryConfig,
					...optionsWithErrorTag.config
				}
			});

			this.caches.set(createQueryKeyHash(optionsWithErrorTag.queryKey), newCache);

			const query = new IocasteQueryClass({
				options: optionsWithErrorTag,
				cache: newCache
			});

			this.queries.push(query);

			return query;
		} else {
			const query = new IocasteQueryClass({
				options: optionsWithErrorTag,
				cache: curCache
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
