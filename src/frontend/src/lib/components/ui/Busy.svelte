<script lang="ts">
	import { Spinner } from '@dfinity/gix-components';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import { busy } from '$lib/stores/busy.store';

	const close = () => {
		if (isNullish($busy) || !$busy.close) {
			return;
		}

		busy.stop();
	};

	const keyboardClose = ({ key }: KeyboardEvent) => {
		if (key !== 'Escape') {
			return;
		}

		close();
	};
</script>

{#if nonNullish($busy)}
	<div
		in:fade
		out:fade={{ duration: 200 }}
		on:click={close}
		on:keydown={keyboardClose}
		class:close={$busy.close}
		class="busy"
		role="button"
		tabindex="-1"
	>
		<div class="content">
			{#if $busy.spinner}
				<div class="spinner text-off-white">
					<Spinner />
				</div>
			{/if}

			{#if nonNullish($busy.msg)}
				<p class="text-center text-sm text-off-white">{$busy.msg}</p>
			{/if}

			{#if $busy.close}
				<button on:click|stopPropagation={close} aria-label="Close" class="text-off-white"
					>Cancel</button
				>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.busy {
		z-index: calc(var(--z-index) + 1000);

		position: fixed;

		top: 0;
		right: 0;
		bottom: 0;
		left: 0;

		background: var(--backdrop);
		backdrop-filter: var(--backdrop-filter);

		&:not(.close) {
			cursor: inherit;
		}
	}

	.content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		width: fit-content;

		background: transparent;
	}

	.spinner {
		position: relative;
		height: 30px;
		margin: 1.45rem;
	}
</style>
