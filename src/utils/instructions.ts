import { getBetPDA, getGamePDA } from "./pdas";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
  setProvider,
  Wallet,
} from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  approve,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createApproveInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BullBearProgram } from "assets/bull_bear_program";

export async function endRoundInstruction(
  signer: PublicKey,
  program: Program<BullBearProgram>,
  gamePDA: PublicKey,
  roundPDA: PublicKey,
  tokenAddress: PublicKey,
  priceFeedAddr: PublicKey
) {
  const gameVaultPDA = getAssociatedTokenAddressSync(
    tokenAddress,
    gamePDA,
    true
  );

  const roundVaultPDA = getAssociatedTokenAddressSync(
    tokenAddress,
    roundPDA,
    true
  );

  const instruction = await program.methods
    .endCurrentRound()
    .accountsStrict({
      gameAuthority: signer,
      game: gamePDA,
      round: roundPDA,
      mint: tokenAddress,
      roundVault: roundVaultPDA,
      gameVault: gameVaultPDA,
      priceUpdate: priceFeedAddr,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction();
  return instruction;
}

export async function closeBettingInstruction(
  signer: PublicKey,
  program: Program<BullBearProgram>,
  gamePDA: PublicKey,
  roundPDA: PublicKey
) {
  const instruction = await program.methods
    .closeBettingPhase()
    .accountsStrict({
      gameAuthority: signer,
      game: gamePDA,
      round: roundPDA,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction();
  return instruction;
}

export async function placeBetInstruction(
  signer: PublicKey,
  program: Program<BullBearProgram>,
  gamePDA: PublicKey,
  roundPDA: PublicKey,
  roundVaultPDA: PublicKey,
  tokenAddress: PublicKey,
  signerTokenAccount: PublicKey,
  prediction: any,
  amount: number
) {
  // generate bet PDA
  const betPDA = await getBetPDA(program, roundPDA, signer);

  const instruction = await program.methods
    .placeNewBet(prediction, new BN(amount))
    .accountsStrict({
      player: signer,
      game: gamePDA,
      round: roundPDA,
      bet: betPDA,
      mint: tokenAddress,
      vault: roundVaultPDA,
      signerVault: signerTokenAccount,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();
  return instruction;
}

export async function initializeRoundInstruction(
  signer: any,
  program: any,
  gamePDA: any,
  roundPDA: any,
  tokenAddress: any
) {
  const vault = getAssociatedTokenAddressSync(tokenAddress, roundPDA, true);
  const instruction = await program.methods
    .initializeNewRound()
    .accounts({
      gameAuthority: signer,
      game: gamePDA,
      round: roundPDA,
      mint: tokenAddress,
      vault: vault,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();
  return instruction;
}

export async function startRoundInstruction(
  signer: any,
  program: any,
  gamePDA: any,
  roundPDA: any,
  priceFeedAccount: any
) {
  const instruction = await program.methods
    .startCurrentRound()
    .accountsStrict({
      gameAuthority: signer,
      game: gamePDA,
      round: roundPDA,
      priceUpdate: priceFeedAccount,
      systemProgram: web3.SystemProgram.programId,
    })
    .instruction();
  return instruction;
}

export async function startGame() {}

export async function initializeGameInstruction(
  program: Program<BullBearProgram>,
  signer: PublicKey,
  protocolAddress: PublicKey,
  tokenAddress: PublicKey,
  priceFeedId: string,
  priceFeedAddr: PublicKey,
  roundInterval: number
) {
  const gameAccount = await getGamePDA(
    program,
    signer,
    protocolAddress,
    tokenAddress,
    priceFeedAddr
  );

  const gameVault = getAssociatedTokenAddressSync(
    tokenAddress,
    gameAccount,
    true
  );

  const instruction = program.methods
    .initializeNewGame(new BN(roundInterval), priceFeedId, priceFeedAddr)
    .accountsStrict({
      gameAuthority: signer,
      protocol: protocolAddress,
      game: gameAccount,
      mint: tokenAddress,
      vault: gameVault,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();
  return instruction;
}
