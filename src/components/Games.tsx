import { BN } from "@coral-xyz/anchor";
import Countdown from "./Countdown";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

type Props = {
    games: any[];
}

function bnPriceToSol(bnValue: BN) {
    return (bnValue.toNumber() * 10) / (LAMPORTS_PER_SOL);
}

function calcBettingEndTime(startTime: BN, endTime: BN) {
    const durationBN = endTime.sub(startTime);
    const bettingEndBN = startTime.add(durationBN.div(new BN(2)));

    const bettingEndTime = bettingEndBN.mul(new BN(1000)).toNumber();
    return bettingEndTime
}


export const Games = ({ games }: Props) => {
    return (
        <div className='flex justify-center items-center w-full p-4'>
            <table className='flex flex-row flex-no-wrap sm:table-auto sm:block border-separate border-spacing-y-4 sm:overflow-x-scroll overflow-hidden xl:overflow-auto'>

                <thead >

                    <tr className="flex-nowrap sm:table-row hidden " >
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Creator:</th>
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Round Number</th>
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Betting ends</th>
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Round ends</th>
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Locked price</th>
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Number of bets</th>
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'>Price Pool</th>
                        <th className='px-4 border-b-2 border-opacity-50 pb-2 border-primary'></th>
                    </tr>


                </thead>

                <tbody className='flex-1 font-light pt-8'>
                    {games.map((game, idx) => (
                        <tr className='flex flex-col flex-no border-primary border sm:h-20 wrap sm:table-row sm:bg-white/5 sm:backdrop-blur mb-8 sm:mb-0 rounded-lg sm:rounded-none' key={idx} >
                            {/* <td className='text-primary flex-row font-bold text-center sm:border-l-2 sm:border-primary sm:rounded-l-lg w-full sm:w-6'>
                                <div className='flex gap-2 leading-4 m-auto sm:py-2 pt-8 pb-6 justify-center sm:w-full'>
                                    <div className='text-center w-fit sm:hidden '>GAME </div>
                                    <div className={`text-center w-fit sm:w-full`}><div>{game.gameAuthority.toBase58()}</div>
                                    </div>
                                </div>
                            </td> */}
                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Creator: </div>
                                    {game.latestRound != null && <div className="w-20 overflow-hidden text-ellipsis">{game.gameAuthority.toBase58()}</div>}
                                </div>
                            </td>
                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Round Number: </div>
                                    <div>{game.counter + 1}
                                    </div>
                                </div>
                            </td>
                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Betting Ends: </div>
                                    {game.latestRound != null && <Countdown endTime={calcBettingEndTime(game.latestRound.startTime, game.latestRound.endTime)}></Countdown>}
                                </div>
                            </td>
                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Round Ends: </div>
                                    {game.latestRound != null && <Countdown endTime={game.latestRound.endTime.mul(new BN(1000)).toNumber()}></Countdown>}
                                </div>
                            </td>
                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Locked Price: </div>
                                    {game.latestRound != null && <div>{`${bnPriceToSol(game.latestRound.startPrice).toFixed(3)} USD/SOL`}</div>}
                                </div>
                            </td>

                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Number of Bets: </div>
                                    {game.latestRound != null && <div>{game.latestRound.numBets}</div>}
                                </div>
                            </td>
                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Locked Price: </div>
                                    {game.latestRound != null && <div>{`${(game.latestRound.totalDown.add(game.latestRound.totalDown).toNumber() / LAMPORTS_PER_SOL).toFixed(3)} TOKEN`}</div>}
                                </div>
                            </td>
                            <td className='px-6 py-2  text-center '>
                                <div className='flex gap-5  leading-4'>
                                    <div className='sm:hidden'>Locked Price: </div>
                                    {game.latestRound != null && <div>{`${(game.latestRound.totalDown.add(game.latestRound.totalDown).toNumber() / LAMPORTS_PER_SOL).toFixed(3)} TOKEN`}</div>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}