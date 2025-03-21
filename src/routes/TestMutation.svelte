<script lang="ts">
	import { getIocasteClient } from '$lib/iocaste-query/iocasteClient.svelte.js';
	import { iocasteMutationOptions } from '$lib/iocaste-query/iocasteMutation.svelte.js';

	const client = getIocasteClient();

	const mutationOptions = iocasteMutationOptions({
		mutationFn: async (data: { name: string }) => {
			const randomNumber = Math.floor(Math.random() * 1000);
			await new Promise((resolve) => setTimeout(resolve, 1000));

			return {
				message: `hello ${data.name}, your random number is ${randomNumber}`
			};
		}
	});

	const mutation = client.createMutation(mutationOptions);
</script>

<div class="flex flex-col gap-4 rounded-md bg-neutral-800 p-4">
	<h2 class="text-xl font-bold">we testing the mutation in here</h2>

	<div class="flex flex-col gap-2">
		<ul class="flex flex-col gap-2">
			<li>
				<p class="text-sm">data: {mutation.data?.message}</p>
			</li>
			<li>
				<p class="text-sm">error: {mutation.error}</p>
			</li>
			<li>
				<p class="text-sm">isLoading: {mutation.isLoading}</p>
			</li>
			<li>
				<button
					onclick={() => mutation.mutate({ name: 'bean' })}
					class="rounded-md bg-blue-500 px-2 py-1 text-white"
				>
					mutate
				</button>
			</li>
		</ul>
	</div>
</div>
