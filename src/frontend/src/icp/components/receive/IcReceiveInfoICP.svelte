<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import { icpAccountIdentifierText, icrcAccountIdentifierText } from '$icp/derived/ic.derived';
	import {
		RECEIVE_TOKEN_CONTEXT_KEY,
		type ReceiveTokenContext
	} from '$icp/stores/receive-token.store';
	import ReceiveAddress from '$lib/components/receive/ReceiveAddress.svelte';
	import ContentWithToolbar from '$lib/components/ui/ContentWithToolbar.svelte';
	import Hr from '$lib/components/ui/Hr.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	const { close } = getContext<ReceiveTokenContext>(RECEIVE_TOKEN_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	const displayQRCode = (details: { address: string; addressLabel: string }) =>
		dispatch('icQRCode', details);
</script>

<ContentWithToolbar>
	<ReceiveAddress
		labelRef="wallet-address"
		address={$icrcAccountIdentifierText ?? ''}
		qrCodeAriaLabel={$i18n.wallet.text.display_wallet_address_qr}
		copyAriaLabel={$i18n.wallet.text.wallet_address_copied}
		on:click={() =>
			displayQRCode({
				address: $icrcAccountIdentifierText ?? '',
				addressLabel: $i18n.wallet.text.wallet_address
			})}
	>
		<svelte:fragment slot="title">{$i18n.wallet.text.wallet_address}</svelte:fragment>
		<svelte:fragment slot="text">{$i18n.receive.icp.text.use_for_all_tokens}</svelte:fragment>
	</ReceiveAddress>

	<div class="mb-6">
		<Hr />
	</div>

	<ReceiveAddress
		labelRef="icp-account-id"
		address={$icpAccountIdentifierText ?? ''}
		qrCodeAriaLabel={$i18n.receive.icp.text.display_account_id_qr}
		copyAriaLabel={$i18n.receive.icp.text.account_id_copied}
		on:click={() =>
			displayQRCode({
				address: $icpAccountIdentifierText ?? '',
				addressLabel: $i18n.receive.icp.text.account_id
			})}
	>
		<svelte:fragment slot="title">{$i18n.receive.icp.text.account_id}</svelte:fragment>
		<svelte:fragment slot="text">{$i18n.receive.icp.text.use_for_icp_deposit}</svelte:fragment>
	</ReceiveAddress>

	<button class="primary full text-center" on:click={close} slot="toolbar">
		{$i18n.core.text.done}
	</button>
</ContentWithToolbar>
