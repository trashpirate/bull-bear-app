
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
