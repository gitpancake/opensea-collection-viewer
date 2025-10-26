import { NextResponse } from 'next/server';

const CONTRACT_ADDRESS = '0x9734c959a5fec7bad8b0b560ad94f9740b90efd8';
const WALLET_ADDRESSES = [
  '0xa54a16087701c518785d854774cad2521aafc47e',
  '0x61be94dC56bc13BEd6f4D41be76a69E74c5835f5'
];

interface AlchemyNFT {
  tokenId: string;
  name: string;
  image: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
    originalUrl?: string;
  };
  contract: {
    address: string;
    name?: string;
  };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  pageKey?: string;
  totalCount: number;
}

export async function GET() {
  try {
    const apiKey = process.env.ALCHEMY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Alchemy API key not configured' },
        { status: 500 }
      );
    }

    // Fetch NFTs from each wallet with pagination
    const fetchPromises = WALLET_ADDRESSES.map(async (walletAddress) => {
      let allNFTsForWallet: AlchemyNFT[] = [];
      let pageKey: string | undefined = undefined;
      let pageCount = 0;

      do {
        pageCount++;
        const params = new URLSearchParams({
          owner: walletAddress,
          'contractAddresses[]': CONTRACT_ADDRESS,
          withMetadata: 'true',
          pageSize: '100',
        });

        if (pageKey) {
          params.append('pageKey', pageKey);
        }

        const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?${params}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
        }

        const data: AlchemyResponse = await response.json();

        allNFTsForWallet = [...allNFTsForWallet, ...data.ownedNfts];
        pageKey = data.pageKey;

        console.log(`Wallet ${walletAddress} - Page ${pageCount}: Got ${data.ownedNfts.length} NFTs, Total so far: ${allNFTsForWallet.length}, Has more: ${!!pageKey}`);
      } while (pageKey);

      console.log(`Wallet ${walletAddress} - Final total: ${allNFTsForWallet.length} NFTs`);
      return allNFTsForWallet;
    });

    const results = await Promise.all(fetchPromises);

    // Combine all NFTs from both wallets
    const allNFTs = results.flat();

    // Remove duplicates by tokenId
    const uniqueNFTs = Array.from(
      new Map(allNFTs.map(nft => [nft.tokenId, nft])).values()
    );

    // Convert to our format and sort by token ID
    const formattedNFTs = uniqueNFTs
      .map(nft => ({
        identifier: nft.tokenId,
        name: nft.name || `#${nft.tokenId}`,
        image_url: nft.image.cachedUrl || nft.image.pngUrl || nft.image.thumbnailUrl || nft.image.originalUrl || '',
        contract: nft.contract.address.toLowerCase(),
        collection: nft.contract.name || 'Abraham First Works',
        token_standard: 'ERC721',
        description: null,
        metadata_url: '',
        created_at: '',
        updated_at: '',
        is_disabled: false,
        is_nsfw: false,
      }))
      .sort((a, b) => {
        const aId = parseInt(a.identifier);
        const bId = parseInt(b.identifier);
        return aId - bId;
      });

    console.log(`Final response: ${formattedNFTs.length} NFTs total`);

    return NextResponse.json({ nfts: formattedNFTs });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
}
