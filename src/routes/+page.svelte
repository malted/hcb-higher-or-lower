<script lang="ts">
	import { onMount } from "svelte";
	import { fly, scale } from "svelte/transition";
	import Transaction from "$lib/components/transaction.svelte";
	import Loading, { LoadingSize } from "$lib/components/loading.svelte";
	import { shuffle } from "$lib/utils";
	import JSConfetti from "js-confetti";

	let transactions: any[];

	async function fetchTransactions() {
		return Array(100).fill(null);
	}

	let gameOn = false;
	let txIndex = 0;
	let jsConfetti: JSConfetti;

	onMount(async () => {
		gameOn = true;
		jsConfetti = new JSConfetti();
		transactions = shuffle(await fetchTransactions());
	});

	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	});

	function guess(guessedMore: boolean) {
		// Check the guess, stop the game if wrong, increase the score if right!
	}
</script>

<header class="flex flex-col items-center gap-4 mt-12">
	<div class="flex items-center gap-3">
		<img src="/hcb-icon-dark.png" alt="hcb icon" class="w-10 h-10" />
		<p class="text-2xl">HCB Presents</p>
	</div>
	<h1 class="text-6xl font-extrabold">Higher or Lower?</h1>
</header>

{#if gameOn}
	<div class="flex items-center h-full" transition:scale>
		{#if transactions}
			<div class="board">
				<div class="flex gap-6 items-center">
					{#each transactions as tx, idx}
						{#if idx === txIndex}
							<div
								class="absolute -translate-x-1/2"
								style:translate="-55%"
								in:fly={{ x: "110%" }}
								out:scale
							>
								<Transaction transaction={tx} showAmount={true} />
							</div>
						{:else if idx === txIndex + 1}
							<div class="absolute -translate-x-1/2" style:translate="55%" in:scale>
								<Transaction transaction={tx} showAmount={false} />
							</div>
						{/if}
					{/each}

					<!-- <Transaction transaction={transactions[txIndex + 1]} showAmount={false} />
					<Transaction transaction={transactions[txIndex + 2]} showAmount={false} /> -->
				</div>

				<div class="flex flex-col gap-4 items-center">
					<p>Did the transaction on the right cost</p>
					<div class="flex gap-4 justify-center items-center">
						<button class="pos text-bold" on:click={() => guess(true)}>More</button>
						<p>or</p>
						<button class="neg" on:click={() => guess(false)}>Less</button>
					</div>
					<p>than the transaction on the left?</p>
				</div>

				<p class="text-2xl fixed bottom-8">Score: {txIndex}</p>
			</div>
		{:else}
			<Loading loadingSize={LoadingSize.LARGE}><p class="text-2xl">Loading HCB data</p></Loading>
		{/if}
	</div>
{:else if transactions}
	<div
		class="absolute inset-y-1/2 h-fit flex flex-col gap-4 items-center text-center text-xl"
		transition:scale
	>
		<p>Too bad!</p>
		<p>
			<span class="mx-1 px-2 py-1 rounded bg-slate-500/50 font-bold">MEMO</span>
			cost
			<span class="text-2xl font-bold">AMOUNT</span>, while
			<span class="mx-1 px-2 py-1 rounded bg-slate-500/50 font-bold">MEMO</span>
			cost
			<span class="text-2xl font-bold">AMOUNT</span>
		</p>
		<p>Your final score was <span class="text-2xl bold">{txIndex}</span></p>

		<button
			class="pos"
			on:click={() => {
				gameOn = true;
				txIndex = 0;
				transactions = shuffle(transactions);
			}}>Try again</button
		>
	</div>
{/if}

<style>
	button {
		border: 0;
		cursor: pointer;
		font-size: 1.25rem;
		border-radius: 0.75rem;
		line-height: 1.5;
		padding: 0.5rem 1.25rem;
		text-align: center;
		transform: scale(1);
		transition:
			0.125s ease-in-out,
			box-shadow 0.25s ease-in-out;

		&:hover {
			transform: scale(1.05);
		}
	}
	button.pos {
		background: radial-gradient(ellipse farthest-corner at top left, #66efc7, #21e8ae);
		color: #104f3d;
	}

	button.neg {
		background: radial-gradient(ellipse farthest-corner at top left, #db1530, #950e21);
		color: #e0e6ed;
	}

	.board {
		position: relative;
		display: grid;
		grid-template-rows: 25vh 25vh;
		justify-items: center;
		align-items: center;
	}
</style>
