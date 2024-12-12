import { BN, Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { Game, getProvider } from "contexts/ProtocolContextProvider"
import Countdown from "./Countdown";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { notify } from "utils/notifications";
import { BullBearProgram } from "assets/bull_bear_program";

import idl from "../assets/bull_bear_program.json";
import { getBetPDA, getRoundPDA } from "utils/pdas";
import { createApproveInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { claimPrizeInstruction, placeBetInstruction } from "utils/instructions";
import ClaimPrize from "./ClaimPrize";
import { PlayerContextProvider } from "contexts/PlayerContextProvider";


const idl_string = JSON.stringify(idl);;
const idl_object = JSON.parse(idl_string);

interface Props {
    id: number;
    game: Game;
}

const calcPrizePool = (game: Game): string => {
    const prizePool = (game.latestRound.totalUp.add(game.latestRound.totalDown).toNumber() / LAMPORTS_PER_SOL).toFixed(3);
    return prizePool;
}

const calcBullX = (game: Game): string => {

    if (game.latestRound.totalUp.toNumber() === 0) {
        return "1"
    }
    else {
        const total = game.latestRound.totalDown.add(game.latestRound.totalUp);
        console.log(total)
        return (total.div(game.latestRound.totalUp).toNumber()).toFixed(2);
    }

}

const calcBearX = (game: Game): string => {
    if (game.latestRound.totalDown.toNumber() === 0) {
        return "1"
    }
    else {
        const total = game.latestRound.totalDown.add(game.latestRound.totalUp);
        return (total.div(game.latestRound.totalDown).toNumber()).toFixed(3);
    }

}

function calcTime(duration: BN) {

    const durationDate = new Date(duration.mul(new BN(1000)).toNumber());

    // Time Difference in Milliseconds
    const milliDiff: number = durationDate.getTime()

    // Total number of seconds in the difference
    const totalSeconds = Math.floor(milliDiff / 1000);

    // Total number of minutes in the difference
    const totalMinutes = Math.floor(totalSeconds / 60);

    // Total number of hours in the difference
    const totalHours = Math.floor(totalMinutes / 60);

    // Getting the number of seconds left in one minute
    const remSeconds = totalSeconds % 60;

    // Getting the number of minutes left in one hour
    const remMinutes = totalMinutes % 60;

    return `${totalHours}h : ${remMinutes}min : ${remSeconds}s`;
}

export default function PredictionCard({ id, game }: Props) {

    const wallet = useWallet();
    const { connection } = useConnection();
    const anchorProvider = getProvider(connection, wallet);

    const placeBet = useCallback(async (gamePubKey, prediction) => {
        if (!wallet.publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        try {

            const program = new Program<BullBearProgram>(idl_object, anchorProvider);

            const gameData = await program.account.game.fetch(gamePubKey);
            const roundId = gameData.counter;

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
            }
        } catch (error) {
            notify({ type: 'error', message: `Placing Bet failed!`, description: error?.message });
            console.log('error', `Placing Bet failed! ${error?.message}`);
        }
    }, [wallet, notify, connection]);



    return (
        <div key={id} className="w-full h-fit mx-auto">

            {/* Header */}
            <div className="bg-purple-400 text-white p-3 rounded-t-xl flex justify-center items-center">
                <div className="flex items-center gap-2">
                    <span>{`Game ${game.address.slice(0, 4)}`}</span>

                </div>
            </div>

            <div className="bg-gray-800 p-2 rounded-b-lg flex flex-col">
                <div className="flex justify-center items-center gap-2">
                    <div className="text-white/50 my-2">{`Round ${game.counter + 1} | `}</div>
                    {game.latestRound != null && <Countdown endTime={game.latestRound.endTime.mul(new BN(1000)).toNumber()}></Countdown>}
                </div>

                <div className="relative text-center">
                    <svg height="65px" width="240px" viewBox="0 0 240 65" xmlns="http://www.w3.org/2000/svg" className="w-full h-5/6 text-emerald-400">
                        <path d="M10.0001 49.2757L10.0003 64H234L234 49.2753C234 42.5136 229.749 36.4819 223.381 34.2077L138.48 3.8859C127.823 0.0796983 116.177 0.0796931 105.519 3.8859L20.6188 34.2076C14.2508 36.4819 10.0001 42.5138 10.0001 49.2757Z" fill="currentColor" transform="translate(-2, 2)" />
                    </svg>
                    <div className="absolute top-4 text-center w-full h-full ">
                        <div className="text-center w-full font-bold text-lg">BULLS</div>
                        <div className="text-center w-full text-xs">{`Payout ${calcBullX(game)}x`}</div>
                    </div>

                </div>
                <div className="w-full h-fit bg-white/20 rounded-xl border-2 border-white p-4">
                    <div className="text-center mb-2">{`Prize Pool: ${calcPrizePool(game)}`}</div>
                    <div className="space-y-3">
                        <button className="w-full bg-emerald-400 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors"
                            onClick={() => placeBet(game.pubkey, { bull: {} })} disabled={!wallet.publicKey}>
                            <div className="hidden group-disabled:block">
                                Wallet not connected
                            </div>
                            <span className="block group-disabled:hidden" >
                                BULLISH
                            </span>
                        </button>
                        <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg transition-colors"
                            onClick={() => placeBet(game.pubkey, { bear: {} })} disabled={!wallet.publicKey}>
                            <div className="hidden group-disabled:block">
                                Wallet not connected
                            </div>
                            <span className="block group-disabled:hidden" >
                                BEARISH
                            </span>
                        </button>
                    </div>
                </div>
                <div className="relative text-center">
                    <svg height="65px" width="240px" viewBox="0 0 240 65" xmlns="http://www.w3.org/2000/svg" className="w-full h-5/6 text-pink-400">
                        <path d="M10.0001 15.7243L10.0003 1H234L234 15.7247C234 22.4864 229.749 28.5181 223.381 30.7923L138.48 61.1141C127.823 64.9203 116.177 64.9203 105.519 61.1141L20.6188 30.7924C14.2508 28.5181 10.0001 22.4862 10.0001 15.7243Z" fill="currentColor" transform="translate(0, -2)"></path>

                    </svg>
                    <div className="absolute top-2 text-center w-full h-full ">
                        <div className="text-center w-full text-xs">{`Payout ${calcBearX(game)}x`}</div>
                        <div className="text-center w-full font-bold text-lg">BEARS</div>
                    </div>

                </div>
                <div className="mx-auto w-fit h-fit rounded-xl border-2 border-white/50 p-4 my-2">
                    <PlayerContextProvider gamePubKey={game.pubkey}>
                        <ClaimPrize game={game}></ClaimPrize>
                    </PlayerContextProvider>
                </div>
            </div>

        </div>
    )
}

