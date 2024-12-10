import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export type TokenMetadata = {
  name: string;
  symbol: string;
  logo: string;
};

export async function getTokenMetadata(
  connection: Connection,
  tokenAddress: string
): Promise<TokenMetadata | null> {
  const metaplex = Metaplex.make(connection);

  const mintAddress = new PublicKey(tokenAddress);

  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });

  let tokenMetadata: TokenMetadata = {
    name: "",
    symbol: "",
    logo: "",
  };
  try {
    const metadataAccountInfo = await connection.getAccountInfo(
      metadataAccount
    );

    if (metadataAccountInfo) {
      const token = await metaplex
        .nfts()
        .findByMint({ mintAddress: mintAddress });
      tokenMetadata.name = token.name;
      tokenMetadata.symbol = token.symbol;
      tokenMetadata.logo = token.json.image;
    } else {
      tokenMetadata = null;
    }
  } catch (error: any) {
    console.log(error);
    tokenMetadata = null;
  }

  return tokenMetadata;
}
