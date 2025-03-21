<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen w-full bg-neutral-900 px-8 py-4 text-white">
	{@render children()}
</div>
