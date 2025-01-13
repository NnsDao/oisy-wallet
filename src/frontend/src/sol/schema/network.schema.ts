import { UrlSchema } from '$lib/validation/url.validation';
import * as z from 'zod';

export const SolRpcConnectionConfigSchema = z.object({
	httpUrl: UrlSchema,
	websocketUrl: UrlSchema
});

export const SolanaNetworkSchema = z.enum(['mainnet', 'testnet', 'devnet', 'local']);
