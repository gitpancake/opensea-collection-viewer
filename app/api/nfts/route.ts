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

    // Fetch all NFTs from each wallet with pagination
    const fetchPromises = WALLET_ADDRESSES.map(async (walletAddress) => {
      let allNFTsForWallet: OpenSeaNFT[] = [];
      let nextCursor: string | null = null;
      let pageCount = 0;

      do {
        pageCount++;
        const url = nextCursor
          ? `https://api.opensea.io/api/v2/chain/${CHAIN}/account/${walletAddress}/nfts?limit=50&next=${nextCursor}`
          : `https://api.opensea.io/api/v2/chain/${CHAIN}/account/${walletAddress}/nfts?limit=50`;

        const response = await fetch(url, {
          headers: {
            'X-API-KEY': apiKey,
            'Accept': 'application/json',
          },
          cache: 'no-store', // Disable caching to ensure we get fresh data
        });

        if (!response.ok) {
          throw new Error(`OpenSea API error: ${response.status} ${response.statusText}`);
        }

        const data: OpenSeaResponse = await response.json();

        // Filter by contract address to ensure we only get NFTs from the Abraham First Works collection
        const filteredNFTs = data.nfts.filter(
          nft => nft.contract.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
        );

        allNFTsForWallet = [...allNFTsForWallet, ...filteredNFTs];
        nextCursor = data.next;

        console.log(`Wallet ${walletAddress} - Page ${pageCount}: Got ${data.nfts.length} NFTs (${filteredNFTs.length} from collection), Total so far: ${allNFTsForWallet.length}, Has more: ${!!nextCursor}`);
      } while (nextCursor);

      console.log(`Wallet ${walletAddress} - Final total: ${allNFTsForWallet.length} NFTs from collection`);
      return allNFTsForWallet;
    });

    const results = await Promise.all(fetchPromises);

    // Combine all NFTs from both wallets
    let allNFTs = results.flat();

    // If no NFTs found in wallets, fallback to fetching from contract
    if (allNFTs.length === 0) {
      console.log('No NFTs in wallets, fetching from contract...');
      let nextCursor: string | null = null;
      let pageCount = 0;

      do {
        pageCount++;
        const contractUrl = nextCursor
          ? `https://api.opensea.io/api/v2/chain/${CHAIN}/contract/${CONTRACT_ADDRESS}/nfts?limit=50&next=${nextCursor}`
          : `https://api.opensea.io/api/v2/chain/${CHAIN}/contract/${CONTRACT_ADDRESS}/nfts?limit=50`;

        const contractResponse = await fetch(contractUrl, {
          headers: {
            'X-API-KEY': apiKey,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (contractResponse.ok) {
          const contractData: OpenSeaResponse = await contractResponse.json();
          allNFTs = [...allNFTs, ...contractData.nfts];
          nextCursor = contractData.next;
          console.log(`Contract - Page ${pageCount}: Got ${contractData.nfts.length} NFTs, Total so far: ${allNFTs.length}, Has more: ${!!nextCursor}`);
        } else {
          break;
        }
      } while (nextCursor);

      console.log(`Contract - Final total: ${allNFTs.length} NFTs`);
    }

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

    console.log(`Final response: ${filteredNFTs.length} NFTs total`);

    return NextResponse.json({ nfts: filteredNFTs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
}
