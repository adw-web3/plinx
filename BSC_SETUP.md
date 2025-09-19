# BSC Transaction Tracker - Setup Instructions

## Getting Real Transaction Data

The app currently shows demo data. To get real BSC transaction data, you need a free BSCScan API key.

### Step 1: Get a Free BSCScan API Key

1. Go to [BSCScan API](https://bscscan.com/apis)
2. Create a free account if you don't have one
3. Navigate to "API-KEYs" in your account dashboard
4. Create a new API key (free tier allows 5 calls/second, 100,000 calls/day)

### Step 2: Configure Your Environment

1. Create or update your `.env` file in the project root:
```bash
NEXT_PUBLIC_BSCSCAN_API_KEY=your_actual_api_key_here
```

2. Restart your development server:
```bash
npm run dev
```

### Step 3: Test with Real Data

Now when you enter a BSC wallet address, you'll get real transaction data instead of demo data.

## Example Wallet Addresses with Transactions

You can test with these real BSC wallet addresses that have transaction history:

- `0x8894E0a0c962CB723c1976a4421c95949bE2D4E3` (Binance Hot Wallet)
- `0x0D0707963952f2fBA59dD06f2b425ace40b492Fe` (Gate.io Hot Wallet)
- `0x28C6c06298d514Db089934071355E5743bf21d60` (Binance Hot Wallet 2)

## Features

- ✅ BSC wallet address validation
- ✅ Real-time transaction fetching from BSCScan
- ✅ Filters to show only outgoing transactions
- ✅ Transaction details (amount, recipient, gas, timestamp)
- ✅ Direct links to BSCScan for transaction details
- ✅ Copy addresses functionality
- ✅ Responsive design with loading states

## API Limits

BSCScan Free Tier:
- 5 calls per second
- 100,000 calls per day
- No cost

This is more than sufficient for personal use and development.