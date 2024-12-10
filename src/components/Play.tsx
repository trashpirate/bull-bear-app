
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

const idl_string = JSON.stringify(idl);;
const idl_object = JSON.parse(idl_string);

const getProvider = (userConnection, userWallet) => {
    const provider = new AnchorProvider(userConnection, userWallet, AnchorProvider.defaultOptions());
    setProvider(provider);
    return provider;
}

export const Play: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [games, setGames] = useState([]);

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
            }
        } catch (error) {
            notify({ type: 'error', message: `Placing Bet failed!`, description: error?.message });
            console.log('error', `Placing Bet failed! ${error?.message}`);
        }
    }, [wallet, notify, connection]);

    const getGames = async () => {

        try {
            const anchorProvider = getProvider(connection, wallet);
            const program = new Program<BullBearProgram>(idl_object, anchorProvider);

            Promise.all((await program.account.game.all()).map(async game => ({
                ...(await program.account.game.fetch(game.publicKey)),
                pubkey: game.publicKey,
                address: game.publicKey.toBase58(),
                latestRound: await (async () => {
                    try {
                        return {
                            ...(await program.account.round.fetch(await getRoundPDA(
                                program,
                                game.publicKey,
                                game.account.counter
                            )))
                        };
                    } catch (error) {
                        return null;
                    }
                })()
            }))).then(games => {
                setGames(games);
                console.log(games);
            });

        } catch (error) {
            console.error("Error while getting games: " + error);
        }
    }

    useEffect(() => {
        getGames();
    }, []);

    useEffect(() => {

    }, [])

    return (
        <div>
            {
                games.map((game, idx) => {

                    return (
                        <div key={idx} className='md:hero-content flex flec-col'>
                            {game.latestRound !== null && <div className='md:hero-content flex flec-col'>
                                <h1>{`Game: ${idx + 1}`}</h1>
                                <span>{`Round: ${game.counter + 1}`}</span>
                                <span>{`Started: ${new Date(game.latestRound.startTime.mul(new BN(1000)).toNumber()).toLocaleString()}`}</span>
                                <span>{`Number of bets: ${game.latestRound.numBets}`}</span>

                                <span>{`Ratio DOWN-UP: ${(game.latestRound.totalDown.toNumber() / web3.LAMPORTS_PER_SOL).toFixed(0)}-${(game.latestRound.totalUp.toNumber() / web3.LAMPORTS_PER_SOL).toFixed(0)}`}</span>
                                <button
                                    className="group w-24 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                    onClick={() => placeBet(game.pubkey, game.counter, { down: {} })} disabled={!wallet.publicKey}
                                >
                                    <div className="hidden group-disabled:block">
                                        Wallet not connected
                                    </div>
                                    <span className="block group-disabled:hidden" >
                                        Down
                                    </span>
                                </button>
                                <button
                                    className="group w-24 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                    onClick={() => placeBet(game.pubkey, game.counter, { up: {} })} disabled={!wallet.publicKey}
                                >
                                    <div className="hidden group-disabled:block">
                                        Wallet not connected
                                    </div>
                                    <span className="block group-disabled:hidden" >
                                        Up
                                    </span>
                                </button>
                            </div>}
                        </div>
                    )
                })
            }

            {/* <div className="flex flex-row justify-center">
                <div className="relative group items-center">
                    <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <button
                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={null} disabled={!wallet.publicKey}
                    >
                        <div className="hidden group-disabled:block">
                            Wallet not connected
                        </div>
                        <span className="block group-disabled:hidden" >
                            Claim Prize
                        </span>
                    </button>
                </div>
            </div> */}
        </div>
    );
};
