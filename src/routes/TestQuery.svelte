<script lang="ts">
	import { getIocasteClient } from '$lib/iocaste-query/iocasteClient.svelte.js';
	import { iocasteQueryOptions } from '$lib/iocaste-query/iocasteQuery.svelte.js';

	const client = getIocasteClient();

	const options = iocasteQueryOptions({
		queryFn: async () => {
			const randomNumber = Math.floor(Math.random() * 1000);

			await new Promise((resolve) => setTimeout(resolve, 500));

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

<div
	class={`flex flex-col gap-4 rounded-md p-4 ${query.isLoading ? 'bg-neutral-600' : 'bg-neutral-800'}
    ${query.error && 'ring-2 ring-red-500'}
    ${query.data && 'ring-2 ring-green-500'}
    `}
>
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
				<button
					onclick={() => query.refetch()}
					class="rounded-md bg-blue-500 px-2 py-1 text-sm font-light text-white hover:cursor-pointer hover:bg-blue-600"
				>
					refetch
				</button>
			</li>
		</ul>
	</div>
</div>
