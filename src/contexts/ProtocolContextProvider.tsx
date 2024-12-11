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
import { getRoundPDA } from 'utils/pdas';

// constants
const idl_string = JSON.stringify(idl);;
const idl_object = JSON.parse(idl_string);
const protocolAddress = new PublicKey(PROTOCOL_ADDRESS);

export interface Round {
    game: PublicKey;
    roundNr: number;
    startTime: BN;
    endTime: BN;
    startPrice: BN;
    endPrice: BN;
    totalUp: BN;
    totalDown: BN;
    betting: any;
    result: any;
    status: any;
    numBets: BN;
    bump: number;
}

export interface Game {
    protocol: PublicKey;
    gameAuthority: PublicKey;
    counter: BN;
    roundInterval: BN;
    feedId: BN[];
    feedAccount: PublicKey;
    vault: PublicKey;
    token: PublicKey;
    bump: number;
    pubkey: PublicKey;
    address: string;
    tokenMetadata: TokenMetadata;
    latestRound: Round;
}


export type ProtocolState = {
    games: Game[];
}

export const getProvider = (userConnection, userWallet) => {
    const provider = new AnchorProvider(userConnection, userWallet, AnchorProvider.defaultOptions());
    setProvider(provider);
    return provider;
}

export interface ProtocolContextState {
    protocolState: ProtocolState;
    updateProtocolState(provider: AnchorProvider): void;
}

export const ProtocolContext = createContext({} as ProtocolContextState);

export function useProtocol(): ProtocolContextState {
    return useContext(ProtocolContext);
}

export const ProtocolContextProvider: FC<{ children: ReactNode }> = ({ children }) => {

    const [protocolState, setProtocolState] = useState<ProtocolState>({
        games: [],
    });

    const lastFetchTime = useRef<number>(0); // Timestamp of last fetch
    const RATE_LIMIT_MS = 5000;

    const getGames = async (anchorProvider: AnchorProvider) => {
        console.log("Protocol PDA: ", protocolAddress.toBase58());
        try {

            const program = new Program<BullBearProgram>(idl_object, anchorProvider);

            Promise.all((await program.account.game.all()).map(async game => (
                {
                    ...(await program.account.game.fetch(game.publicKey)),
                    pubkey: game.publicKey,
                    address: game.publicKey.toBase58(),
                    tokenMetadata: await getTokenMetadata(anchorProvider.connection, game.account.token.toBase58()),
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
                    games.sort((a, b) => a.address.localeCompare(b.address));
                    setProtocolState({
                        games: games,
                    });

                    console.log(games);
                });

        } catch (error) {
            console.error("Error while getting games: " + error);
        }
    }

    // Calling fetchDataAndUpdateState whenever setProtocolState is invoked
    const updateProtocolState = (provider: AnchorProvider) => {

        const now = Date.now();

        if (now - lastFetchTime.current < RATE_LIMIT_MS) {
            console.log('Fetch skipped due to rate limit.');
            return;
        }

        getGames(provider);
        lastFetchTime.current = now;
    };

    return (
        <ProtocolContext.Provider value={{ protocolState, updateProtocolState }}>
            {children}
        </ProtocolContext.Provider>
    );
};
