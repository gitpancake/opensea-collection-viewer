'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { NFT } from '@/lib/types';

type ViewMode = 'small' | 'wide';

export default function ArtGallery() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('small');
  const [fullWidth, setFullWidth] = useState(true);

  useEffect(() => {
    async function fetchNFTs() {
      try {
        const response = await fetch('/api/nfts');
        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }
        const data = await response.json();
        setNfts(data.nfts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchNFTs();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNFT) {
        setSelectedNFT(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedNFT]);

  const getGridClass = () => {
    switch (viewMode) {
      case 'small':
        return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
      case 'wide':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-lg">Loading collection...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black px-4 py-16 md:px-8 lg:px-16">
        {/* Control Bar */}
        <div className={`mx-auto ${fullWidth ? 'max-w-none' : 'max-w-7xl'} mb-8`}>
          <div className="flex items-center justify-center gap-4">
            {/* View Mode Toggles */}
            <div className="flex items-center gap-2 rounded-full bg-zinc-900 p-2">
              <button
                onClick={() => setViewMode('small')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'small' ? 'bg-white text-black' : 'text-white hover:bg-zinc-800'
                }`}
                aria-label="Small view (6 per row)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('wide')}
                className={`p-2 rounded-full transition-colors ${
                  viewMode === 'wide' ? 'bg-white text-black' : 'text-white hover:bg-zinc-800'
                }`}
                aria-label="Wide view (4 per row)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="8" height="8" />
                  <rect x="13" y="3" width="8" height="8" />
                  <rect x="3" y="13" width="8" height="8" />
                  <rect x="13" y="13" width="8" height="8" />
                </svg>
              </button>
            </div>

            {/* Full Width Toggle */}
            <button
              onClick={() => setFullWidth(!fullWidth)}
              className={`p-2 rounded-full transition-colors ${
                fullWidth ? 'bg-white text-black' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              aria-label="Toggle full width"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`mx-auto ${fullWidth ? 'max-w-none' : 'max-w-7xl'}`}>
          <div className={`grid ${getGridClass()} gap-8`}>
            {nfts.map((nft) => (
              <div
                key={nft.identifier}
                className="group cursor-pointer"
                onClick={() => setSelectedNFT(nft)}
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <Image
                    src={nft.image_url}
                    alt={nft.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-light tracking-wide text-white">
                    #{nft.identifier} {nft.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedNFT && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setSelectedNFT(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vh] w-full">
            <div className="relative aspect-square w-full">
              <Image
                src={selectedNFT.image_url}
                alt={selectedNFT.name}
                fill
                className="object-contain"
                sizes="90vh"
                priority
              />
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-xl font-light tracking-wide text-white">
                #{selectedNFT.identifier} {selectedNFT.name}
              </h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
