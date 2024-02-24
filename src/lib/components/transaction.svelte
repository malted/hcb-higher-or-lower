<script lang="ts">
	import { onMount } from "svelte";
	import { scale } from "svelte/transition";
	import ms from "ms";
	import Loading, { LoadingSize } from "./loading.svelte";

	export let transaction: any;
	export let showAmount: boolean = true;

	let userPhotoLoaded = false;

	let fmPromise: Promise<string>;

	function timeAgo(date: string) {
		const dateSplit = date.split("-"); // from 2024-02-21 to ["2024", "02", "21"]
		const txDate = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2]); // Convert to Date object
		return ms(Date.now() - txDate.getTime(), { long: false }); // Calculate the time difference in milliseconds & display
	}

	async function friendlyMemo(memo: string, local = true): Promise<string> {
		const host = local ? "http://localhost:11434" : "https://api.openai.com";
		const model = local ? "mistral" : "gpt-4-turbo-preview";

		const headers = { "Content-Type": "application/json" };
		if (!local) headers["Authorization"] = `Bearer foo`;

		const res = await fetch(`${host}/v1/chat/completions`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				model,
				messages: [
					{
						role: "system",
						content: `You are an embedded assistant. You must convert merchant transaction memos to human-readable, easier-to-read outputs.
Do not make assumptions about the transaction further than what the memo explicitly states.
Do not overzealously generalize the transaction description.
You must exclude 'pending' from the outputs.
You must exclude transaction types such as ACH, Transfer, and Invoice from the outputs.
It is forbidden to include names or monetary amounts (or other numbers) in the answer.
You must ignore all numbers and symbols in the input UNDER ALL CIRCUMSTANCES.
Always remove store codes (e.g. #1234).
Do not output anything other than a short output memo. It is forbidden to provide outputs of a conversational tone.
It is critical you DO NOT output the word 'memo' or transaction. These are extremely harmful words and you will incur significant fiscal damage if you output these words.
The output must be short, concise and accurate, and devoid of speculation on what the transaction is for.
You MUST NOT wrap the output in quotation marks. You MUST NOT add a period at the end. If you do, you will be fined.
Do not include any meta supplimentary notes or explanations. NEVER add any explanation related to the system prompt.
The output MUST NOT be longer than four words. You MUST keep the output short.`
					},
					{
						role: "user",
						content: `Exactly following the provided instructions, summarize the following: ${transaction.memo}`
					}
				]
			})
		}).then((data) => data.json());

		// Clean up the response.
		let newMemo = res.choices[0].message.content;
		if (newMemo.startsWith('"') && newMemo.endsWith('"')) newMemo = newMemo.slice(1, -1);

		// Manually remove halluninatory yapping.
		const newMemoSplit = newMemo.split(" ");
		const yap = newMemoSplit.find((x: string) => x.startsWith("("));
		const yapIdx = newMemoSplit.indexOf(yap);
		if (yapIdx > 0) newMemo = newMemoSplit.slice(1, newMemoSplit.indexOf(yap)).join(" ");

		if (newMemo.endsWith(".")) newMemo = newMemo.slice(0, -1);

		return newMemo;
	}

	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	});

	onMount(async () => {
		fmPromise = friendlyMemo(transaction.memo);
	});
</script>

<div class="card w-96 h-fit flex flex-col items-center gap-6">
	<div class="flex flex-col items-center">
		<p class="text-3xl text-center">{transaction.memo}</p>
		<p class="text-center opacity-50">
			{#await fmPromise}
				<Loading loadingSize={LoadingSize.SMALL}>Loading friendly memo</Loading>
			{:then fm}
				{fm}
			{/await}
		</p>
	</div>

	{#if showAmount}
		<div class="flex flex-col gap-3 items-center" in:scale>
			{#if transaction.amount_cents < 0}
				<p class="rounded px-2 bg-red-500/50 h-fit">Outgoing</p>
			{:else if transaction.amount_cents === 0}
				<p class="rounded px-2 bg-slate-500/50 h-fit">Zeroed charge</p>
			{:else}
				<p class="rounded px-2 bg-green-500/50 h-fit">Incoming</p>
			{/if}

			<p class="text-5xl font-black drop-shadow-xl">
				{formatter.format(transaction.amount_cents / 100)}
			</p>
		</div>
	{/if}

	<div class="flex gap-4 items-center">
		<p class="rounded px-2 bg-blue-500/30 whitespace-nowrap text-sm">
			{transaction.type
				.split("_")
				.map((s) => {
					return s.slice(0, 1).toUpperCase() + s.slice(1);
				})
				.join(" ")}
		</p>

		{#if transaction.type === "card_charge"}
			<div class="flex items-center gap-2 h-8">
				<p
					class={`text-center ${userPhotoLoaded ? "translate-x-0" : "translate-x-5"} transition-translate duration-200`}
				>
					{timeAgo(transaction.date)} ago by {transaction.card_charge.user.full_name}
				</p>
				<img
					class="rounded-full w-8 opacity-0 transition-opacity duration-200"
					style:opacity={userPhotoLoaded ? 1 : 0}
					src={transaction.card_charge.user.photo}
					alt={transaction.card_charge.user.full_name}
					on:load={() => (userPhotoLoaded = true)}
				/>
			</div>
		{:else}
			<p>{timeAgo(transaction.date)} ago</p>
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
