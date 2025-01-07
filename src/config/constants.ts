import { PublicKey } from "@solana/web3.js";

export const PROTOCOL_ADDRESS = process.env.NEXT_PUBLIC_PROTOCOL_ADDRESS;

export const priceFeedAddrSol = new PublicKey(
  process.env.NEXT_PUBLIC_DEFAULT_FEED_ADDRESS as string
);

export const SOL_feedId = process.env.NEXT_PUBLIC_DEFAULT_FEED_ID as string;

export const DEFAULT_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ADDRESS;

export const DEFAULT_ROUND_INTERVAL = 60 * 60 * 5; // 5 hours

export const priceFeeds = {
  SOL: {
    label: "SOL/USD",
    address: "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE",
    feedId: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  },
  BTC: {
    label: "BTC/USD",
    address: "4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo",
    feedId: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  },
  ETH: {
    label: "ETH/USD",
    address: "42amVS4KgzR9rA28tkVYqVXjq9Qa8dcZQMbH5EYFX6XC",
    feedId: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  },
  None: {
    label: "",
    address: "",
    feedId: "",
  },
};
