// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  AnchorProvider,
  Program,
  setProvider,
  Wallet,
} from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BullBearProgram } from "assets/bull_bear_program";
import type { NextApiRequest, NextApiResponse } from "next";

import idl from "../../assets/bull_bear_program.json";
import { getRoundPDA } from "utils/pdas";
import {
  endRoundInstruction,
  initializeRoundInstruction,
  startRoundInstruction,
} from "utils/instructions";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || "http://localhost:3000";
const connection = new Connection(rpcUrl);
const secretKey = process.env.PRIVATE_KEY
  ? JSON.parse(process.env.PRIVATE_KEY)
  : null;

if (!secretKey) {
  throw new Error("No secret key found.");
}

const payer = Keypair.fromSecretKey(Uint8Array.from(secretKey));
const wallet = new Wallet(payer);
const provider = new AnchorProvider(
  connection,
  wallet,
  AnchorProvider.defaultOptions()
);
setProvider(provider);
const program = new Program<BullBearProgram>(idl_object, provider);

type Data = {
  data: string;
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ data: null, error: "Method not allowed" });
    }

    const { gameAddress } = req.body;
    console.log("Game PDA: ", gameAddress);
    const gamePubKey = new PublicKey(gameAddress);

    const game = await program.account.game.fetch(gamePubKey);
    const roundPubKey = await getRoundPDA(program, gamePubKey, game.counter);

    const instruction1 = await endRoundInstruction(
      wallet.publicKey,
      program,
      gamePubKey,
      roundPubKey,
      game.token,
      game.feedAccount
    );

    const nextRoundPubKey = await getRoundPDA(
      program,
      gamePubKey,
      game.counter + 1
    );

    const instruction2 = initializeRoundInstruction(
      wallet.publicKey,
      program,
      gamePubKey,
      nextRoundPubKey,
      game.token
    );

    const instruction3 = startRoundInstruction(
      wallet.publicKey,
      program,
      gamePubKey,
      nextRoundPubKey,
      game.feedAccount
    );

    const transaction = new Transaction();
    transaction.add(await instruction1, await instruction2, await instruction3);

    const response = await provider.sendAndConfirm(transaction);

    res.status(200).json({ data: response, error: undefined });
  } catch (error) {
    console.error("Error signing transaction:", error);
    res.status(500).json({ data: null, error: "Internal Server Error" });
  }
}
