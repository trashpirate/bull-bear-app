// react
import { createContext, FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';

// solana
import { AnchorProvider, BN, Program, setProvider, Wallet } from '@coral-xyz/anchor';
import { useConnection, useLocalStorage, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

// custom
import idl from "../assets/bull_bear_program.json";
import { BullBearProgram } from 'assets/bull_bear_program';
import { PROTOCOL_ADDRESS } from 'config/constants';
import { getTokenMetadata, TokenMetadata } from 'utils/metadata';
import { getBetPDA, getRoundPDA } from 'utils/pdas';
import { getProvider } from './ProtocolContextProvider';

// constants
const idl_string = JSON.stringify(idl);;
const idl_object = JSON.parse(idl_string);
const protocolAddress = new PublicKey(PROTOCOL_ADDRESS);

export interface Bet {
    player: PublicKey,
    round: PublicKey,
    prediction: any,
    amount: BN,
    claimed: boolean,
    bump: number,
}

export type PlayerState = {
    bets: Bet[] | null;
    canClaim: boolean;
    wallet: PublicKey | null;
}


export interface PlayerContextState {
    playerState: PlayerState;
    updatePlayerState(provider: AnchorProvider): void;
}

export const PlayerContext = createContext({} as PlayerContextState);

export function usePlayer(): PlayerContextState {
    return useContext(PlayerContext);
}

export const PlayerContextProvider: FC<{ children: ReactNode; gamePubKey: PublicKey }> = ({ children, gamePubKey }) => {

    const [playerState, setPlayerState] = useState<PlayerState>({
        bets: [],
        canClaim: false,
        wallet: null,
    });

    const wallet = useWallet();
    const { connection } = useConnection();

    const lastFetchTime = useRef<number>(0); // Timestamp of last fetch
    const RATE_LIMIT_MS = 5000;

    let numClaimable = 0;
    const getBets = async () => {
        console.log("Player PDA: ", protocolAddress.toBase58());
        try {

            const anchorProvider = getProvider(connection, wallet);
            const program = new Program<BullBearProgram>(idl_object, anchorProvider);

            const gameData = await program.account.game.fetch(gamePubKey);
            const roundId = gameData.counter;

            let bets: Bet[] = [];
            for (let index = Math.max(0, roundId - 2); index <= roundId; index++) {
                const round = await getRoundPDA(
                    program,
                    gamePubKey,
                    index
                )

                const bet = await getBetPDA(program, round, anchorProvider.publicKey);
                const betInfo = await connection.getAccountInfo(bet);

                if (betInfo == null) {
                    bets.push(null);
                    continue
                }

                const roundData = await program.account.round.fetch(round);
                const betData = await program.account.bet.fetch(bet);


                const result = Object.keys(roundData.result).toString();
                const prediction = Object.keys(betData.prediction).toString();

                if (result == prediction && betData.claimed == false) {
                    bets.push(betData);
                    numClaimable++;
                }
                else {
                    bets.push(null);
                }
            }
            setPlayerState({ bets: bets, canClaim: numClaimable > 0, wallet: wallet.publicKey });

        } catch (error) {
            console.error("Error while getting games: " + error);
        }
    }

    const updatePlayerState = () => {

        const now = Date.now();
        if (now - lastFetchTime.current < RATE_LIMIT_MS) {
            console.log('Fetch skipped due to rate limit.');
            return;
        }

        getBets();
        lastFetchTime.current = now;
    };

    return (
        <PlayerContext.Provider value={{ playerState, updatePlayerState }}>
            {children}
        </PlayerContext.Provider>
    );
};
