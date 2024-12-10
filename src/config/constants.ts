import { PublicKey } from "@solana/web3.js";

export const PROTOCOL_ADDRESS = "CVF4Gm38MrgN1rDZribjLLZvxaKxrkgHHZiZzAtfE81H";

export const priceFeedAddrSol = new PublicKey(
  "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"
);

export const SOL_feedId =
  "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

// this duration is necessary for the devnet because the price is not updated  more frequently
export const DEFAULT_ROUND_INTERVAL = 60 * 60 * 5; // 10 minutes

export const DEFAULT_TOKEN_ADDRESS =
  "28Taa1aB5AmoqmA7P1b3MrK3oCogLDPPyuLBFA4D2HR2";
