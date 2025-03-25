<script>
	let count = $state(0);

	const options = {
		imposter: () => {
			return Math.random();
		},
		queryKey: ['count', () => count]
	};

	$effect(() => {
		options.queryKey.forEach((key) => {
			if (typeof key === 'function') {
				key();
			}
		});

		console.log('firing le effect');
	});
</script>

<div>I disagree with svelte 5 now :/</div>

<button onclick={() => count++}>{count}</button>
