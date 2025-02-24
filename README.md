# Headless FIAT/Crypto Payment Integration with Crossmint

This project demonstrates a headless integration with Crossmint's payment system, allowing users to pay with both FIAT and USDC (crypto) for NFT minting.

## Features

- FIAT payment support
- USDC payment on Base Sepolia network
- Seamless wallet connection with RainbowKit
- Real-time transaction processing
- Automatic order status updates
- Error handling and user feedback
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js 16.x or later
- npm or yarn
- A Crossmint account and API credentials
- Base Sepolia network configuration
- WalletConnect Project ID

## Setup

1. Clone the repository:
```bash
git clone https://github.com/xm-cse/headlessTest.git
cd headlessTest
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy the environment variables file:
```bash
cp .env.local.example .env.local
```

4. Fill in your environment variables in `.env.local`:
   - Get your WalletConnect Project ID from [WalletConnect Dashboard](https://cloud.walletconnect.com)
   - Get your Crossmint credentials from [Crossmint Dashboard](https://dashboard.crossmint.com)
   - Set your Base Sepolia payer address

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID
- `CROSSMINT_CLIENT_ID`: Your Crossmint client ID
- `CROSSMINT_CLIENT_SECRET`: Your Crossmint client secret
- `CROSSMINT_COLLECTION_ID`: Your NFT collection ID
- `CROSSMINT_PAYER_ADDRESS`: The Base Sepolia address that will receive the payments
- `NEXT_PUBLIC_ENABLE_TESTNETS`: Set to 'true' for testing on Base Sepolia

## Usage

1. User initiates payment
2. For USDC payments:
   - Connect wallet using WalletConnect
   - Confirm transaction
   - Wait for processing
   - Receive NFT confirmation
3. For FIAT payments:
   - Enter payment details
   - Complete checkout
   - Receive NFT confirmation

## Network Support

Currently supports:
- Base Sepolia (testnet)
- More networks can be added by modifying the configuration

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
