<script lang="ts">
	import { IconExpandMore, Popover } from '@dfinity/gix-components';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import chainFusion from '$lib/assets/chain_fusion.svg';
	import IconMorePlain from '$lib/components/icons/IconMorePlain.svelte';
	import MainnetNetwork from '$lib/components/networks/MainnetNetwork.svelte';
	import Network from '$lib/components/networks/Network.svelte';
	import NetworkButton from '$lib/components/networks/NetworkButton.svelte';
	import NetworksTestnetsToggle from '$lib/components/networks/NetworksTestnetsToggle.svelte';
	import ButtonSwitcher from '$lib/components/ui/ButtonSwitcher.svelte';
	import { selectedNetwork } from '$lib/derived/network.derived';
	import { networksMainnets, networksTestnets } from '$lib/derived/networks.derived';
	import { testnetsEnabled } from '$lib/derived/settings.derived';
	import { enabledMainnetTokensUsdBalancesPerNetwork } from '$lib/derived/tokens.derived';
	import { i18n } from '$lib/stores/i18n.store';

	export let disabled = false;

	let visible = false;
	let button: HTMLButtonElement | undefined;

	const close = () => (visible = false);

	let mainnetTokensUsdBalance: number;
	$: mainnetTokensUsdBalance = $networksMainnets.reduce(
		(acc, { id }) => acc + ($enabledMainnetTokensUsdBalancesPerNetwork[id] ?? 0),
		0
	);
</script>

<ButtonSwitcher
	bind:button
	on:click={() => (visible = true)}
	ariaLabel={$i18n.networks.title}
	{disabled}
	>{$selectedNetwork?.name ?? $i18n.networks.chain_fusion}
	<IconExpandMore size="24" /></ButtonSwitcher
>

<Popover bind:visible anchor={button}>
	<ul class="flex list-none flex-col gap-4 font-normal">
		<li>
			<NetworkButton
				id={undefined}
				name={$i18n.networks.chain_fusion}
				icon={chainFusion}
				usdBalance={mainnetTokensUsdBalance}
				on:icSelected={close}
			/>
		</li>

		{#each $networksMainnets as network}
			<li>
				<MainnetNetwork {network} on:icSelected={close} />
			</li>
		{/each}
	</ul>

	<div class="mb-4 mt-8 flex items-center justify-between">
		<span class="px-4.5 font-bold">{$i18n.networks.show_testnets}</span>
		<NetworksTestnetsToggle />
	</div>

	{#if $testnetsEnabled}
		<ul
			class="mb-2 flex list-none flex-col gap-4 font-normal"
			transition:slide={{ easing: quintOut, axis: 'y' }}
		>
			{#each $networksTestnets as network}
				<li>
					<Network {network} on:icSelected={close} />
				</li>
			{/each}
		</ul>
	{/if}

	<hr class="my-4 w-10/12 bg-dark-blue opacity-10" style="border: 0.05rem solid" />

	<ul class="flex list-none flex-col gap-4 font-normal">
		<li class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<IconMorePlain />
				<span class="text-grey">{$i18n.networks.more}</span>
			</div>
		</li>
	</ul>
</Popover>
