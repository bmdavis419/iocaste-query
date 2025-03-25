<script>
	import { CounterLad } from './SubClasses.svelte.js';

	let count = $state(0);

	const counterLad = new CounterLad({
		key: ['count', () => count]
	});
</script>

<div>
	<button onclick={() => count++}>{count}</button>

	<ul>
		<li>counterLad count: {counterLad.count}</li>
		<li>counterLad randomNumber: {counterLad.randomNumber}</li>
	</ul>
</div>
