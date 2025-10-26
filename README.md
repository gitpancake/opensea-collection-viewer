# NFT Collection Viewer

A premium, minimalist NFT collection viewer built with Next.js 16 and the Alchemy API. This application showcases a curated collection of digital artworks with a focus on elegant presentation and user experience.

## Features

- **Clean, Art-First Design**: Minimal interface that puts the artwork front and center
- **Responsive Grid Layout**: Adapts beautifully across all device sizes
- **Fullscreen Modal View**: Click any piece to view it in an immersive fullscreen experience
- **Alchemy API Integration**: Fetches NFT data reliably from Alchemy's NFT API
- **Server-Side Caching**: Optimized performance with Next.js cache revalidation
- **TypeScript**: Fully typed for better developer experience and code safety

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **API**: Alchemy NFT API v3
- **Image Optimization**: Next.js Image component

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- An Alchemy API key ([get one here](https://www.alchemy.com/))

### Installation

1. Clone the repository:
```bash
git clone git@github.com:gitpancake/opensea-collection-viewer.git
cd opensea-collection-viewer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Add your Alchemy API key to `.env.local`:
```
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the collection viewer.

## Configuration

To customize this viewer for your own collection, update the following constants in `/app/api/nfts/route.ts`:

```typescript
const CONTRACT_ADDRESS = '0x9734c959a5fec7bad8b0b560ad94f9740b90efd8';
const CHAIN = 'ethereum';
```

- **CONTRACT_ADDRESS**: The smart contract address of the NFT collection
- **CHAIN**: The blockchain network (ethereum, polygon, etc.)

You can find the contract address from the OpenSea collection page or by using the OpenSea API's collections endpoint.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── nfts/
│   │       └── route.ts       # OpenSea API integration
│   ├── layout.tsx              # Root layout and metadata
│   └── page.tsx                # Home page
├── components/
│   └── ArtGallery.tsx          # Main gallery component
├── lib/
│   └── types.ts                # TypeScript type definitions
└── .env.example                # Environment variable template
```

## API Route

The application includes a Next.js API route at `/api/nfts` that:
- Fetches NFTs from Alchemy API for specific wallet addresses
- Filters by the Abraham First Works collection contract
- Sorts NFTs by token ID
- Handles pagination automatically to fetch all NFTs

## Styling

The design philosophy emphasizes:
- Black background to make artwork stand out
- Minimal text (only token ID and piece name)
- Smooth hover animations
- Responsive typography
- Fullscreen modal for detailed viewing

## Performance

- **Image Optimization**: Next.js Image component with automatic lazy loading from Alchemy CDN
- **API Efficiency**: Fetches from specific wallets rather than entire collection
- **Responsive Images**: Properly sized images based on viewport

## Deployment

This Next.js application can be deployed to:

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gitpancake/opensea-collection-viewer)

1. Click the "Deploy" button above
2. Add your `ALCHEMY_API_KEY` environment variable in Vercel project settings

### Other Platforms

Works with any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Docker

Remember to set the `ALCHEMY_API_KEY` environment variable in your deployment platform.

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Support

For issues with the Alchemy API, consult the [official documentation](https://docs.alchemy.com/reference/nft-api-quickstart) or reach out to [Alchemy support](https://www.alchemy.com/support).

For issues with this viewer, please open a GitHub issue.
