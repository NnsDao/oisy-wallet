<script lang="ts">
	export let disabled = false;
	export let button: HTMLButtonElement | undefined = undefined;
	export let ariaLabel: string;
</script>

<button
	class="text-primary w-full text-left font-bold no-underline"
	bind:this={button}
	on:click
	aria-label={ariaLabel}
	{disabled}
	class:opacity-50={disabled}
>
	<slot />
</button>
