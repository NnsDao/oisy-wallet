<script lang="ts">
	import type { BigNumber } from '@ethersproject/bignumber';
	import { EIGHT_DECIMALS } from '$lib/constants/app.constants';
	import { tokenWithFallback } from '$lib/derived/token.derived';
	import { formatToken } from '$lib/utils/format.utils';

	export let amount: BigNumber;

	let detailedValue: string;
	$: detailedValue = formatToken({
		value: amount,
		unitName: $tokenWithFallback.decimals,
		displayDecimals: $tokenWithFallback.decimals
	});

	let displayValue: string;
	$: displayValue = formatToken({
		value: amount,
		unitName: $tokenWithFallback.decimals,
		displayDecimals: EIGHT_DECIMALS,
		trailingZeros: false
	});
</script>

<data value={detailedValue}>{displayValue}</data>
