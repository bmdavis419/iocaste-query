<script lang="ts">
	import { getIocasteClient } from '$lib/iocaste-query/iocasteClient.svelte.js';
	import { iocasteQueryOptions } from '$lib/iocaste-query/iocasteQuery.svelte.js';

	const client = getIocasteClient();

	const options = iocasteQueryOptions({
		queryFn: async () => {
			const randomNumber = Math.floor(Math.random() * 1000);

			await new Promise((resolve) => setTimeout(resolve, 1000));

			if (randomNumber % 2 === 0) {
				throw new Error('random number is even');
			}

			return randomNumber;
		},
		queryKey: ['hello'],
		config: {
			refetchOnMount: true,
			refetchOnWindowFocus: true
		}
	});

	const query = client.createQuery(options);
</script>

<div class="flex flex-col gap-4 rounded-md bg-neutral-800 p-4">
	<h2 class="text-xl font-bold">we testing the query in here</h2>

	<div class="flex flex-col gap-2">
		<ul class="flex flex-col gap-2">
			<li>
				<p class="text-sm">data: {query.data}</p>
			</li>
			<li>
				<p class="text-sm">error: {query.error}</p>
			</li>
			<li>
				<p class="text-sm">isLoading: {query.isLoading}</p>
			</li>
			<li>
				<button onclick={() => query.refetch()} class="rounded-md bg-blue-500 px-2 py-1 text-white">
					refetch
				</button>
			</li>
		</ul>
	</div>
</div>
