// react / next
import { FC, useCallback, useEffect } from 'react';

// solana
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN, setProvider } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

// custom
import { notify } from "../utils/notifications";

import idl from "../assets/bull_bear_program.json";
import { BullBearProgram } from "../assets/bull_bear_program";

import { DEFAULT_ROUND_INTERVAL, priceFeedAddrSol, PROTOCOL_ADDRESS, SOL_feedId } from 'config/constants';
import { getRoundPDA } from 'utils/pdas';
import { initializeGameInstruction, initializeRoundInstruction, startRoundInstruction } from 'utils/instructions';
import Link from 'next/link';
import { getProvider, useProtocol } from 'contexts/ProtocolContextProvider';


const idl_string = JSON.stringify(idl);;
const idl_object = JSON.parse(idl_string);
const tokenAddress = new PublicKey("EL9dj31wW1sws4aXTrap8ZH3gvxAyM4LHiUm2qe8GpCM");
const protocolAddress = new PublicKey(PROTOCOL_ADDRESS);

function bnPriceToSol(bnValue: BN) {
    return (bnValue.toNumber() * 10) / (LAMPORTS_PER_SOL);
}

function calcBettingEndTime(startTime: BN, endTime: BN) {
    const durationBN = endTime.sub(startTime);
    const bettingEndBN = startTime.add(durationBN.div(new BN(2)));

    const bettingEndTime = bettingEndBN.mul(new BN(1000)).toNumber();
    return bettingEndTime
}

function calcRoundDuration(startTime: BN, endTime: BN) {

    const startDate = new Date(startTime.mul(new BN(1000)).toNumber());
    const endDate = new Date(endTime.mul(new BN(1000)).toNumber());

    // Time Difference in Milliseconds
    const milliDiff: number = endDate.getTime()
        - startDate.getTime();

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


export const Create: FC = () => {
    const wallet = useWallet();

    const { connection } = useConnection();
    const { protocolState, updateProtocolState } = useProtocol();

    const initializeGame = useCallback(async () => {

        if (!wallet.publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        try {
            const anchorProvider = getProvider(connection, wallet);
            const program = new Program<BullBearProgram>(idl_object, anchorProvider);
            console.log("Protocol PDA: ", protocolAddress.toBase58());
            console.log("Game authority: ", anchorProvider.publicKey.toBase58());

            const interval = DEFAULT_ROUND_INTERVAL + Math.floor(Math.random() * 100);
            console.log("Game interval: ", DEFAULT_ROUND_INTERVAL);

            const instruction = initializeGameInstruction(
                program,
                anchorProvider.publicKey,
                protocolAddress,
                tokenAddress,
                SOL_feedId,
                priceFeedAddrSol,
                interval,
            )

            const transaction = new Transaction();
            transaction.add(await instruction);

            console.log(transaction)
            const tx = await wallet.sendTransaction(transaction, connection);

            if (tx !== undefined && tx.length > 0) {
                notify({ type: 'success', message: 'Initializing Game successful!', txid: tx });
            }
        } catch (error: any) {
            notify({ type: 'error', message: `Initializing Game failed!`, description: error?.message });
            console.log('error', `Initializing Game failed! ${error?.message}`);
        }


    }, [wallet, connection]);

    const startGame = useCallback(async (gamePubKey) => {
        try {
            const anchorProvider = getProvider(connection, wallet);
            const program = new Program<BullBearProgram>(idl_object, anchorProvider);

            console.log("Game PDA: ", gamePubKey.toBase58())

            const round = await getRoundPDA(
                program,
                gamePubKey,
                0
            )

            const vault = getAssociatedTokenAddressSync(tokenAddress, round, true);


            const instruction1 = initializeRoundInstruction(
                wallet.publicKey,
                program,
                gamePubKey,
                round,
                vault,
                tokenAddress
            )

            const instruction2 = startRoundInstruction(
                wallet.publicKey,
                program,
                gamePubKey,
                round,
                priceFeedAddrSol
            )

            const transaction = new Transaction();
            transaction.add(await instruction1, await instruction2);

            console.log(transaction)
            const tx = await wallet.sendTransaction(transaction, connection);


            if (tx !== undefined && tx.length > 0) {
                notify({ type: 'success', message: 'Game started!', txid: tx });
            }

            updateProtocolState(anchorProvider);

        } catch (error) {
            notify({ type: 'error', message: `Starting Game failed!`, description: error?.message });
            console.log('error', `Starting Game failed! ${error?.message}`);
        }
    }, [wallet, connection, updateProtocolState]);

    useEffect(() => {
        updateProtocolState(getProvider(connection, wallet));
    }, [connection, wallet, updateProtocolState]);

    return (
        <div>
            <div className="flex flex-row justify-center">
                <div className="relative group items-center">
                    <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <button
                        className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                        onClick={initializeGame} disabled={!wallet.publicKey}
                    >
                        <div className="hidden group-disabled:block">
                            Wallet not connected
                        </div>
                        <span className="block group-disabled:hidden" >
                            Create New Game
                        </span>
                    </button>
                </div>
            </div>
            <h1 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-16 mb-2">
                Current Games
            </h1>
            <div className='flex justify-center items-center w-full p-4'>

                <table className='flex flex-row flex-no-wrap sm:table-auto sm:block border-separate border-spacing-y-4 sm:overflow-x-scroll overflow-hidden xl:overflow-auto'>

                    <thead >

                        <tr className="flex-nowrap sm:table-row hidden " >
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Game</th>
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Creator</th>
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Active Round</th>
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Round Duration</th>
                            {/* <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Round ends</th> */}
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Locked price</th>
                            {/* <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Number of bets</th> */}
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Price Pool</th>
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Token</th>
                            <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'></th>
                        </tr>


                    </thead>

                    <tbody className='flex-1 font-light pt-8'>
                        {protocolState.games.map((game, idx) => (
                            <tr className='flex flex-col flex-no border-primary border sm:h-20 wrap sm:table-row sm:bg-white/10 sm:backdrop-blur mb-8 sm:mb-0 rounded-lg sm:rounded-none' key={idx} >
                                <td className=' flex-row font-bold text-center sm:border-l-2 sm:border-primary sm:rounded-l-lg w-full sm:w-6'>
                                    <div className='flex gap-2 leading-4 m-auto sm:py-2 pt-8 pb-6 justify-center sm:w-full'>
                                        <div className='text-center w-fit sm:hidden '>GAME </div>
                                        <div className={`text-center w-fit sm:w-full`}><div>{idx + 1}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-6 py-2  text-center '>
                                    <div className='flex gap-5  leading-4'>
                                        <div className='sm:hidden'>Creator: </div>
                                        <div className="w-20 overflow-hidden text-ellipsis">{game.gameAuthority.toBase58()}</div>
                                    </div>
                                </td>
                                <td className='px-6 py-2  text-center '>
                                    <div className='flex gap-5  leading-4'>
                                        <div className='sm:hidden'>Active Round: </div>
                                        <div>{game.counter + 1}
                                        </div>
                                    </div>
                                </td>
                                <td className='px-6 py-2  text-center '>
                                    <div className='flex gap-5  leading-4'>
                                        <div className='sm:hidden'>Round Duration: </div>
                                        {game.latestRound != null && <div>{calcRoundDuration(game.latestRound.startTime, game.latestRound.endTime)}</div>}
                                    </div>
                                </td>
                                {/* <td className='px-6 py-2  text-center '>
                                    <div className='flex gap-5  leading-4'>
                                        <div className='sm:hidden'>Round Ends: </div>
                                        {game.latestRound != null && <Countdown endTime={game.latestRound.endTime.mul(new BN(1000)).toNumber()}></Countdown>}
                                    </div>
                                </td> */}
                                <td className='px-6 py-2  text-center '>
                                    <div className='flex gap-5  leading-4'>
                                        <div className='sm:hidden'>Locked Price: </div>
                                        {game.latestRound != null && <div>{`${bnPriceToSol(game.latestRound.startPrice).toFixed(3)} USD/SOL`}</div>}
                                    </div>
                                </td>

                                <td className='px-6 py-2  text-center '>
                                    <div className='flex gap-5  leading-4'>
                                        <div className='sm:hidden'>Price Pool: </div>
                                        {game.latestRound != null && <div>{`${(game.latestRound.totalDown.add(game.latestRound.totalDown).toNumber() / LAMPORTS_PER_SOL).toFixed(3)} `}</div>}
                                    </div>
                                </td>
                                <td className='px-6 py-2  text-center '>
                                    <div className='flex gap-5  leading-4'>
                                        <div className='sm:hidden'>Token </div>
                                        <Link className='text-fuchsia-500 hover:text-white' target='_blank' href={`https://explorer.solana.com/address/${game.token.toBase58()}?cluster=${connection.rpcEndpoint.includes("mainnet-beta") ? "mainnet-beta" : "devnet"}`}>
                                            <div className="w-20 overflow-hidden text-ellipsis">{game.tokenMetadata == null ? game.token.toBase58() : game.tokenMetadata.symbol}</div>
                                        </Link>
                                    </div>
                                </td>

                                <td className='px-6  py-8 sm:py-2 text-center flex-col justify-center align-middle sm:rounded-r-lg'>
                                    <div className='flex flex-row gap-4 my-auto'>
                                        <div className='mx-auto w-fit h-fit my-auto'>
                                            {game.latestRound == null && <button
                                                className="group w-32 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                                onClick={() => startGame(game.pubkey)} disabled={!wallet.publicKey}
                                            >
                                                <div className="hidden group-disabled:block">
                                                    Wallet not connected
                                                </div>
                                                <span className="block group-disabled:hidden" >
                                                    Start Game
                                                </span>
                                            </button>

                                            }
                                        </div>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
