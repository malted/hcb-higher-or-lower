<script lang="ts">
	import { onMount } from "svelte";
	import { scale } from "svelte/transition";
	import ms from "ms";
	import Loading, { LoadingSize } from "./loading.svelte";

	export let transaction: any;
	export let showAmount: boolean = true;

	let fmPromise: Promise<string>;

	function timeAgo(date: string) {
		const dateSplit = date.split("-"); // from 2024-02-21 to ["2024", "02", "21"]
		const txDate = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2]); // Convert to Date object
		return ms(Date.now() - txDate.getTime(), { long: false }); // Calculate the time difference in milliseconds & display
	}

	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	});
</script>

<div class="card w-96 h-fit flex flex-col items-center gap-6">
	<div class="flex flex-col items-center">
		<p class="text-3xl text-center">MEMO</p>
	</div>

	{#if showAmount}
		AMOUNT
	{/if}

	<div class="flex gap-4 items-center">
		<p class="rounded px-2 bg-blue-500/30 whitespace-nowrap text-sm">TRANSACTION TYPE</p>

		{#if "transaction.type" === "card_charge"}
			<div class="flex items-center gap-2 h-8">
				<p class="text-center">TIME AGO BY USER</p>
				<img class="rounded-full w-8" src="/hcb-icon-dark.png" alt="" />
			</div>
		{:else}
			<p>TIME AGO</p>
		{/if}
	</div>
</div>

<style>
	.card {
		@apply bg-hcb-dark2;
		box-shadow:
			0 6px 12px rgba(0, 0, 0, 0.125)-2px -4px 8px rgba(0, 0, 0, 0.125),
			4px 8px 16px rgba(0, 0, 0, 0.25);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: 0.125s ease-in-out;
		transition-property: transform, box-shadow;

		&:hover {
			box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
			transform: translateY(-0.25rem);
		}
	}
</style>
