<script lang="ts">
	import { getIocasteClient } from '$lib/iocaste-query/iocasteClient.svelte.js';
	import { iocasteMutationOptions } from '$lib/iocaste-query/iocasteMutation.svelte.js';

	const client = getIocasteClient();

	const mutationOptions = iocasteMutationOptions({
		mutationFn: async (data: { name: string }) => {
			const randomNumber = Math.floor(Math.random() * 1000);
			await new Promise((resolve) => setTimeout(resolve, 500));

			if (randomNumber % 2 === 0) {
				throw new Error('random number is even');
			}

			return {
				message: `hello ${data.name}, your random number is ${randomNumber}`
			};
		},
		onSuccess: async (data) => {
			console.log('your mutation worked!', data.message);
			await client.invalidateQueries({
				queryKey: ['hello']
			});
		},
		onError: async (error) => {
			console.error('your mutation failed!', error.message);
		}
	});

	const mutation = client.createMutation(mutationOptions);
</script>

<div
	class={`flex flex-col gap-4 rounded-md p-4 ${mutation.isLoading ? 'bg-neutral-600' : 'bg-neutral-800'}
    ${mutation.error && 'ring-2 ring-red-500'}
    ${mutation.data && 'ring-2 ring-green-500'}
    `}
>
	<h2 class="text-xl font-bold">we testing the mutation in here</h2>

	<div class="flex flex-col gap-2">
		<ul class="flex flex-col gap-2">
			<li>
				<p class="text-sm">data: {mutation.data?.message}</p>
			</li>
			<li>
				<p class="text-sm">error: {mutation.error?.message}</p>
			</li>
			<li>
				<p class="text-sm">isLoading: {mutation.isLoading}</p>
			</li>
			<li>
				<button
					onclick={() => mutation.mutate({ name: 'bean' })}
					class="rounded-md bg-blue-500 px-2 py-1 text-sm font-light text-white hover:cursor-pointer hover:bg-blue-600"
				>
					mutate
				</button>
			</li>
		</ul>
	</div>
</div>
