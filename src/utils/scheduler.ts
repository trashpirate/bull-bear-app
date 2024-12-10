import { scheduleJob } from "node-schedule";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { web3 } from "@coral-xyz/anchor";

import idl from "../assets/prediction_game.json";

const idl_string = JSON.stringify(idl);
const idl_object = JSON.parse(idl_string);
const programId = new web3.PublicKey(idl.address);

// Load Signer Key
const loadSigner = (): Keypair => {
  const keyData = JSON.parse(process.env.PRIVATE_KEY);
  return Keypair.fromSecretKey(new Uint8Array(keyData));
};

// Send Instruction
async function sendInstruction() {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const signer = loadSigner();
  const programId = new PublicKey("YourProgramId");

  // Create instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
      // Add other required accounts
    ],
    programId,
    data: Buffer.from([0]), // Replace with program-specific data
  });

  // Create and send transaction
  const transaction = new Transaction().add(instruction);

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      signer,
    ]);
    console.log(`Transaction sent successfully: ${signature}`);
  } catch (err) {
    console.error(`Transaction failed: ${err.message}`);
  }
}

// Scheduler Setup
export function setupScheduler() {
  scheduleJob("*/10 * * * * *", async () => {
    console.log("Running scheduled task...");
    await sendInstruction();
  });
}
