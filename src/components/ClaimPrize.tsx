'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { notify } from 'utils/notifications'
import { Game, getProvider } from 'contexts/ProtocolContextProvider'
import { Program } from '@coral-xyz/anchor'
import { BullBearProgram } from 'assets/bull_bear_program'

import idl from "../assets/bull_bear_program.json";
import { getBetPDA, getRoundPDA } from "utils/pdas";
import { createApproveInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { claimPrizeInstruction, placeBetInstruction } from "utils/instructions";
import { Transaction } from '@solana/web3.js'
import { usePlayer } from 'contexts/PlayerContextProvider'


const idl_string = JSON.stringify(idl);;
const idl_object = JSON.parse(idl_string);

interface Props {
    game: Game;
}

export default function ClaimPrize({ game }: Props) {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [currentRound, setCurrentRound] = useState(1);

    const { playerState, updatePlayerState } = usePlayer();
    console.log(playerState)

    const handlePrevious = useCallback(() => {
        setCurrentRound((prev) => (prev > 1 ? prev - 1 : prev))
    }, []);

    const handleNext = useCallback(() => {
        setCurrentRound((prev) => (prev < game.counter ? prev + 1 : prev))
    }, [game.counter]);



    const claimPrize = useCallback(async (gamePubKey) => {
        if (!wallet.publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }
        try {
            if (playerState.canClaim) {
                const anchorProvider = getProvider(connection, wallet);
                const program = new Program<BullBearProgram>(idl_object, anchorProvider);
                const gameData = await program.account.game.fetch(gamePubKey);

                const transaction = new Transaction();
                let numInstructions = 0;
                for (let index = 0; index <= playerState.bets.length; index++) {
                    const round = playerState.bets[index].round;
                    const bet = await getBetPDA(program, round, anchorProvider.publicKey);

                    if (playerState.bets[index] != null) {
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

                        const instruction = claimPrizeInstruction(
                            anchorProvider.publicKey,
                            program,
                            gamePubKey,
                            round,
                            roundVault,
                            gameData.token,
                            signerVault,
                        )

                        transaction.add(await instruction);
                        numInstructions++;
                    }


                }

                if (numInstructions > 0) {
                    console.log(transaction)
                    const tx = await wallet.sendTransaction(transaction, connection);
                    updatePlayerState(gamePubKey);

                    if (tx !== undefined && tx.length > 0) {
                        notify({ type: 'success', message: 'Claiming Prize successful!', txid: tx });
                    }
                }
                else {
                    notify({ type: 'error', message: 'Nothing to claim!', description: "There are no rewards to claim." });
                }
            } else {
                notify({ type: 'error', message: 'Nothing to claim!', description: "There are no rewards to claim." });
            }

        } catch (error) {
            notify({ type: 'error', message: `Claiming failed!`, description: error?.message });
            console.log('error', `Claiming failed! ${error}`);
        }
    }, [wallet, notify, connection, updatePlayerState]);

    return (
        <div className="flex flex-col items-center space-y-2 w-40 mx-auto">
            <div className="flex items-center justify-between w-full">
                <button
                    className="p-1 rounded-full bg-white/50 text-gray-700 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePrevious}
                    disabled={currentRound === 1}
                    aria-label="Previous round"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">Round {currentRound}</span>
                <button
                    className="p-1 rounded-full bg-white/50 text-gray-700 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNext}
                    disabled={currentRound === game.counter}
                    aria-label="Next round"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => claimPrize(game.pubkey)} disabled={!wallet.publicKey || !playerState.canClaim}>
                <div className="hidden group-disabled:block">
                    Wallet not connected
                </div>
                <span className="block group-disabled:hidden" >
                    CLAIM
                </span>
            </button>

        </div>
    )
}

