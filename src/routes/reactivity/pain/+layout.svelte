<script>
	import { internalSetCacheContext } from './SubClasses.svelte.js';

	const { children } = $props();

	internalSetCacheContext();
</script>

<div>
	<h1>Pain</h1>
	{@render children()}
</div>
