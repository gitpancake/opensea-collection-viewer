import { NextResponse } from 'next/server';
import type { OpenSeaResponse, OpenSeaNFT } from '@/lib/types';

const CONTRACT_ADDRESS = '0x9734c959a5fec7bad8b0b560ad94f9740b90efd8';
const CHAIN = 'ethereum';
const WALLET_ADDRESSES = [
  '0xa54a16087701c518785d854774cad2521aafc47e',
  '0x61be94dC56bc13BEd6f4D41be76a69E74c5835f5'
];

export async function GET() {
  try {
    const apiKey = process.env.OPENSEA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenSea API key not configured' },
        { status: 500 }
      );
    }

    // Fetch NFTs from all wallet addresses
    const fetchPromises = WALLET_ADDRESSES.map(async (walletAddress) => {
      const url = `https://api.opensea.io/api/v2/chain/${CHAIN}/account/${walletAddress}/nfts?limit=50`;

      const response = await fetch(url, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json',
        },
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
      });

      if (!response.ok) {
        throw new Error(`OpenSea API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenSeaResponse = await response.json();

      // Filter by contract address to ensure we only get NFTs from the Abraham First Works collection
      return data.nfts.filter(nft => nft.contract.toLowerCase() === CONTRACT_ADDRESS.toLowerCase());
    });

    const results = await Promise.all(fetchPromises);

    // Combine all NFTs from both wallets
    const allNFTs = results.flat();

    // Remove duplicates by identifier (in case same NFT appears in multiple wallets somehow)
    const uniqueNFTs = Array.from(
      new Map(allNFTs.map(nft => [nft.identifier, nft])).values()
    );

    // Filter out any disabled or NSFW content and return sorted by identifier (token ID)
    const filteredNFTs = uniqueNFTs
      .filter(nft => !nft.is_disabled && !nft.is_nsfw)
      .sort((a, b) => {
        const aId = parseInt(a.identifier);
        const bId = parseInt(b.identifier);
        return aId - bId;
      });

    return NextResponse.json({ nfts: filteredNFTs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
}
