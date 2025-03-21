<script lang="ts">
	import { iocasteQueryOptions } from '$lib/iocaste-query/iocasteQuery.svelte.js';

	const options = iocasteQueryOptions<string, Error>({
		queryFn: async () => {
			return 'hello world';
		},
		queryKey: ['hello']
	});
</script>

<h2 class="text-2xl font-bold">Iocaste Query</h2>
