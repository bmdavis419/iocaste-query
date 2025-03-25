import { getContext, setContext } from 'svelte';
import {
	IocasteQueryClass,
	iocasteQueryOptions,
	type AnyIocasteQuery,
	type IocasteQueryKey,
	type IocasteQueryOptions
} from './iocasteQuery.svelte.js';
import { createQueryKeyHash, internalSetCacheContext } from './iocasteQueryCache.svelte.js';
import {
	internalCreateIocasteMutation,
	type IocasteMutationOptions
} from './iocasteMutation.svelte.js';

class IocasteClient {
	private queries: AnyIocasteQuery[] = [];

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

		const query = new IocasteQueryClass({
			options: optionsWithErrorTag
		});

		this.queries.push(query);

		return query;
	}
}

const DEFAULT_KEY = '$_iocaste_client';

export const createIocasteClient = (key: string = DEFAULT_KEY) => {
	const client = new IocasteClient();
	internalSetCacheContext();
	return setContext(key, client);
};

export const getIocasteClient = (key: string = DEFAULT_KEY) => {
	return getContext<IocasteClient>(key);
};
