import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Game } from "contexts/ProtocolContextProvider"
import Countdown from "./Countdown";

interface Props {
    id: number;
    game: Game;
}



const calcPrizePool = (game: Game): string => {
    return (game.latestRound.totalDown.add(game.latestRound.totalDown).toNumber() / LAMPORTS_PER_SOL).toFixed(3);
    // return ""
}

const calcBullX = (game: Game): string => {

    if (game.latestRound.totalUp.toNumber() === 0) {
        return "1"
    }
    else {
        return (game.latestRound.totalDown.div(game.latestRound.totalUp).toNumber() / LAMPORTS_PER_SOL).toFixed(3);
    }

}

const calcBearX = (game: Game): string => {
    if (game.latestRound.totalDown.toNumber() === 0) {
        return "1"
    }
    else {
        return (game.latestRound.totalUp.div(game.latestRound.totalDown).toNumber() / LAMPORTS_PER_SOL).toFixed(3);
    }

}

export default function PredictionCard({ id, game }: Props) {
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
                        <div className="text-center w-full font-bold text-lg">BEARS</div>
                        <div className="text-center w-full text-xs">{`Payout ${calcBullX(game)}x`}</div>
                    </div>

                </div>
                <div className="w-full h-fit bg-white/20 rounded-xl border-2 border-white p-4">
                    <div className="text-center mb-2">{`Prize Pool: ${calcPrizePool(game)}`}</div>
                    <div className="space-y-3">
                        <button className="w-full bg-emerald-400 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors">
                            BULLISH
                        </button>
                        <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg transition-colors">
                            BEARISH
                        </button>
                    </div>
                </div>
                <div className="relative text-center">
                    <svg height="65px" width="240px" viewBox="0 0 240 65" xmlns="http://www.w3.org/2000/svg" className="w-full h-5/6 text-pink-400">
                        <path d="M10.0001 15.7243L10.0003 1H234L234 15.7247C234 22.4864 229.749 28.5181 223.381 30.7923L138.48 61.1141C127.823 64.9203 116.177 64.9203 105.519 61.1141L20.6188 30.7924C14.2508 28.5181 10.0001 22.4862 10.0001 15.7243Z" fill="currentColor" transform="translate(0, -2)"></path>

                    </svg>
                    <div className="absolute top-2 text-center w-full h-full ">
                        <div className="text-center w-full text-xs">{`Payout ${calcBearX(game)}x`}</div>
                        <div className="text-center w-full font-bold text-lg">BULLS</div>
                    </div>

                </div>
            </div>

        </div>
    )
}

