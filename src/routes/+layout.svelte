<script lang="ts">
	import '../app.css';
	import { createIocasteClient } from '$lib/iocaste-query/iocasteClient.svelte';
	let { children } = $props();

	createIocasteClient();
</script>

<div class="min-h-screen w-full bg-neutral-900 px-8 py-4 text-white">
	{@render children()}
</div>
