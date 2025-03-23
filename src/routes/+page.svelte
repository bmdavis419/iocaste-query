<script lang="ts">
	import TestMutation from './TestMutation.svelte';
	import TestQuery from './TestQuery.svelte';
</script>

<div class="flex flex-col gap-12">
	<h2 class="text-2xl font-bold">Iocaste Query</h2>

	<div class="flex items-center gap-4">
		<TestQuery />
		<TestQuery />
		<TestQuery />
	</div>

	<div class="flex items-center gap-4">
		<TestMutation />
	</div>
</div>
