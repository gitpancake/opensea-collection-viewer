import { NextResponse } from 'next/server';
import type { OpenSeaResponse } from '@/lib/types';

const CONTRACT_ADDRESS = '0x9734c959a5fec7bad8b0b560ad94f9740b90efd8';
const CHAIN = 'ethereum';

export async function GET() {
  try {
    const apiKey = process.env.OPENSEA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenSea API key not configured' },
        { status: 500 }
      );
    }

    const url = `https://api.opensea.io/api/v2/chain/${CHAIN}/contract/${CONTRACT_ADDRESS}/nfts?limit=50`;

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

    // Filter out any disabled or NSFW content and return sorted by name
    const filteredNFTs = data.nfts
      .filter(nft => !nft.is_disabled && !nft.is_nsfw)
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ nfts: filteredNFTs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
}
