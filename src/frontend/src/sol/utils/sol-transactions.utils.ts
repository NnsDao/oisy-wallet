import type { SolAddress } from '$lib/types/address';
import { SYSTEM_ACCOUNT_KEYS } from '$sol/constants/sol.constants';
import type { SolRpcTransaction, SolTransactionUi } from '$sol/types/sol-transaction';
import { address as solAddress } from '@solana/addresses';
import { getBase64Encoder } from '@solana/codecs';
import type { Rpc, SolanaRpcApi } from '@solana/rpc';
import {
	getCompiledTransactionMessageDecoder,
	type CompilableTransactionMessage
} from '@solana/transaction-messages';
import { getTransactionDecoder, type Transaction } from '@solana/transactions';
import { decompileTransactionMessageFetchingLookupTables } from '@solana/web3.js';

interface TransactionWithAddress {
	transaction: SolRpcTransaction;
	address: SolAddress;
}

export const getSolBalanceChange = ({ transaction, address }: TransactionWithAddress) => {
	const {
		transaction: {
			message: { accountKeys }
		},
		meta
	} = transaction;

	const accountIndex = accountKeys.indexOf(solAddress(address));
	const { preBalances, postBalances } = meta ?? {};

	return (postBalances?.[accountIndex] ?? 0n) - (preBalances?.[accountIndex] ?? 0n);
};

/**
 * It maps a transaction to a Solana transaction UI object
 */
export const mapSolTransactionUi = ({
	transaction,
	address
}: TransactionWithAddress): SolTransactionUi => {
	const {
		id,
		blockTime,
		confirmationStatus: status,
		transaction: {
			message: { accountKeys }
		},
		meta
	} = transaction;

	const nonSystemAccountKeys = accountKeys.filter((key) => !SYSTEM_ACCOUNT_KEYS.includes(key));

	const from = accountKeys[0];
	//edge-case: transaction from my wallet, to my wallet
	const to = nonSystemAccountKeys.length === 1 ? nonSystemAccountKeys[0] : accountKeys[1];

	const { fee } = meta ?? {};

	const relevantFee = from === address ? (fee ?? 0n) : 0n;

	const amount = getSolBalanceChange({ transaction, address }) + relevantFee;

	const type = amount > 0n ? 'receive' : 'send';

	return {
		id,
		timestamp: blockTime ?? 0n,
		from,
		to,
		type,
		status,
		value: amount,
		fee
	};
};

const decodeTransactionMessage = (transactionMessage: string): Transaction => {
	const transactionBytes = getBase64Encoder().encode(transactionMessage);
	return getTransactionDecoder().decode(transactionBytes);
};

/**
 * It parses a base64 encoded transaction message into a compilable transaction message with lookup tables and instruction
 */
export const parseSolBase64TransactionMessage = async ({
	transactionMessage,
	rpc
}: {
	transactionMessage: string;
	rpc: Rpc<SolanaRpcApi>;
}): Promise<CompilableTransactionMessage> => {
	const { messageBytes } = decodeTransactionMessage(transactionMessage);
	const compiledTransactionMessage = getCompiledTransactionMessageDecoder().decode(messageBytes);
	return await decompileTransactionMessageFetchingLookupTables(compiledTransactionMessage, rpc);
};
