
// next / react
import { FC, useCallback, useEffect, useState } from 'react';

// solana
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN, setProvider } from "@coral-xyz/anchor";
import { Transaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// custom
import { notify } from "../utils/notifications";
import idl from "../assets/bull_bear_program.json";
import { BullBearProgram } from "../assets/bull_bear_program";
import { getBetPDA, getRoundPDA } from 'utils/pdas';
import { placeBetInstruction } from 'utils/instructions';
import { getProvider, useProtocol } from 'contexts/ProtocolContextProvider';
import PredictionCard from './PredictionCard';

const idl_string = JSON.stringify(idl);;
const idl_object = JSON.parse(idl_string);

export const Play: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const { protocolState, updateProtocolState } = useProtocol();

    const placeBet = useCallback(async (gamePubKey, roundId, prediction) => {
        if (!wallet.publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        try {
            const anchorProvider = getProvider(connection, wallet);
            const program = new Program<BullBearProgram>(idl_object, anchorProvider);

            const gameData = await program.account.game.fetch(gamePubKey);


            const round = await getRoundPDA(
                program,
                gamePubKey,
                roundId
            )
            const roundVault = getAssociatedTokenAddressSync(
                gameData.token,
                round,
                true
            );

            const signerVault = getAssociatedTokenAddressSync(
                gameData.token,
                anchorProvider.publicKey,
                true
            );

            const bet = await getBetPDA(program, round, anchorProvider.publicKey);
            const amount = 100 * 10 ** 9;


            const instruction1 = createApproveInstruction(
                signerVault,
                roundVault,
                wallet.publicKey,
                new BN(amount),
                [],
                TOKEN_PROGRAM_ID
            );

            const instruction2 = placeBetInstruction(
                anchorProvider.publicKey,
                program,
                gamePubKey,
                round,
                roundVault,
                gameData.token,
                signerVault,
                prediction,
                amount,
            )

            const transaction = new Transaction();
            transaction.add(await instruction1, await instruction2);

            console.log(transaction)
            const tx = await wallet.sendTransaction(transaction, connection);

            if (tx !== undefined && tx.length > 0) {
                notify({ type: 'success', message: 'Placing Bet successful!', txid: tx });
                updateProtocolState(anchorProvider);
            }
        } catch (error) {
            notify({ type: 'error', message: `Placing Bet failed!`, description: error?.message });
            console.log('error', `Placing Bet failed! ${error?.message}`);
        }
    }, [wallet, updateProtocolState, connection]);

    useEffect(() => {
        updateProtocolState(getProvider(connection, wallet))
    }, [connection, wallet, updateProtocolState]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10" >
            {
                protocolState.games.map((game, idx) => {
                    return (
                        game.latestRound != null && <PredictionCard key={idx} id={idx} game={game}></PredictionCard>

                    )
                })
            }

        </div>
    );
};
