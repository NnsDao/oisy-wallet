<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { slide } from 'svelte/transition';
	import TokenModal from '$eth/components/tokens/TokenModal.svelte';
	import Transaction from '$eth/components/transactions/Transaction.svelte';
	import TransactionModal from '$eth/components/transactions/TransactionModal.svelte';
	import TransactionsSkeletons from '$eth/components/transactions/TransactionsSkeletons.svelte';
	import { tokenNotInitialized } from '$eth/derived/nav.derived';
	import { ethereumTokenId, ethereumToken } from '$eth/derived/token.derived';
	import { sortedTransactions } from '$eth/derived/transactions.derived';
	import { loadTransactions } from '$eth/services/transactions.services';
	import type { EthTransactionUi } from '$eth/types/eth-transaction';
	import { mapTransactionUi } from '$eth/utils/transactions.utils';
	import { ckEthMinterInfoStore } from '$icp-eth/stores/cketh.store';
	import { toCkMinterInfoAddresses } from '$icp-eth/utils/cketh.utils';
	import Header from '$lib/components/ui/Header.svelte';
	import { ethAddress } from '$lib/derived/address.derived';
	import { modalToken, modalTransaction } from '$lib/derived/modal.derived';
	import { tokenWithFallback } from '$lib/derived/token.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { modalStore } from '$lib/stores/modal.store';
	import type { OptionEthAddress } from '$lib/types/address';
	import type { TokenId } from '$lib/types/token';
	import type { Transaction as TransactionType } from '$lib/types/transaction';
	import { isNetworkIdEthereum } from '$lib/utils/network.utils';

	let ckMinterInfoAddresses: OptionEthAddress[] = [];
	$: ckMinterInfoAddresses = toCkMinterInfoAddresses({
		minterInfo: $ckEthMinterInfoStore?.[$ethereumTokenId],
		networkId: $ethereumToken.network.id
	});

	let sortedTransactionsUi: EthTransactionUi[];
	$: sortedTransactionsUi = $sortedTransactions.map((transaction) =>
		mapTransactionUi({
			transaction,
			ckMinterInfoAddresses,
			$ethAddress: $ethAddress
		})
	);

	let tokenIdLoaded: TokenId | undefined = undefined;

	const load = async () => {
		if ($tokenNotInitialized) {
			tokenIdLoaded = undefined;
			return;
		}

		const {
			network: { id: networkId },
			id: tokenId
		} = $tokenWithFallback;

		// If user browser ICP transactions but switch token to Eth, due to the derived stores, the token can briefly be set to ICP while the navigation is not over.
		// This prevents the glitch load of ETH transaction with a token ID for ICP.
		if (!isNetworkIdEthereum(networkId)) {
			tokenIdLoaded = undefined;
			return;
		}

		// We don't reload the same token in a row.
		if (tokenIdLoaded === tokenId) {
			return;
		}

		tokenIdLoaded = tokenId;

		const { success } = await loadTransactions({ tokenId, networkId });

		if (!success) {
			tokenIdLoaded = undefined;
		}
	};

	$: $tokenWithFallback, $tokenNotInitialized, (async () => await load())();

	let selectedTransaction: TransactionType | undefined;
	$: selectedTransaction = $modalTransaction
		? ($modalStore?.data as TransactionType | undefined)
		: undefined;
</script>

<Header>{$i18n.transactions.text.title}</Header>

<TransactionsSkeletons>
	{#each sortedTransactionsUi as transaction (transaction.hash)}
		<div transition:slide={{ duration: 250 }}>
			<Transaction {transaction} />
		</div>
	{/each}

	{#if $sortedTransactions.length === 0}
		<p class="text-secondary mt-4 opacity-50">{$i18n.transactions.text.no_transactions}</p>
	{/if}
</TransactionsSkeletons>

{#if $modalTransaction && nonNullish(selectedTransaction)}
	<TransactionModal transaction={selectedTransaction} />
{:else if $modalToken}
	<TokenModal />
{/if}
