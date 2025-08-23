# FHEVM DCA Bot - Privacy-Preserving Dollar-Cost Averaging

A production-ready frontend for a Fully Homomorphic Encryption (FHE) powered Dollar-Cost Averaging (DCA) bot that enables private, automated cryptocurrency trading.

## 🚀 Features

- **🔐 Privacy-First**: All trading amounts and strategies are encrypted using FHE
- **🤖 Automated Batching**: Intelligent batching mechanism for cost-effective DEX swaps
- **⚡ Dual Triggers**: Batch execution based on participant count or time intervals
- **📊 Dynamic Conditions**: "Buy the dip" strategies with encrypted thresholds
- **🎨 Modern UI**: Beautiful, responsive interface with dark/light themes
- **🔗 Wallet Integration**: Seamless MetaMask integration with network detection
- **📱 Mobile Responsive**: Optimized for all device sizes

## 🛠 Tech Stack

- **Frontend**: React 18+, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Radix UI components
- **Blockchain**: Ethers.js v6, MetaMask integration
- **FHE**: FHEVM SDK (ready for integration)
- **Smart Contracts**: Solidity with FHE support

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Laolex/fhevm-dca-bot.git
cd fhevm-dca-bot
```

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5175/`

## 🧪 Testing Guide

### Demo Mode Testing

The application currently runs in **Demo Mode** since smart contracts aren't deployed yet. Here's how to test all features:

#### 1. **Wallet Connection**
- Click "Connect Wallet" in the header
- Approve MetaMask connection
- Verify wallet address is displayed
- Test network switching (should show Sepolia)

#### 2. **Submit DCA Intent**
- Navigate to "Submit Intent" page
- Fill out the form:
  - **Total Budget**: $1000
  - **Amount Per Interval**: $100
  - **Interval**: 1 hour
  - **Total Periods**: 10
- Enable "Dynamic Conditions" (optional)
- Click "Submit Intent"
- Verify success message with transaction hash

#### 3. **View Vault Dashboard**
- Navigate to "Vault" page
- View your submitted intent
- Check simulated balances
- Monitor batch status
- Test "Execute Batch" button

#### 4. **Dashboard Overview**
- View main dashboard statistics
- Check countdown timers
- Verify all UI components render correctly

### Expected Demo Behavior

- ✅ **Intent Submission**: Simulated with 2-second delay
- ✅ **Transaction Hashes**: Generated mock hashes
- ✅ **Local Storage**: Intents persist across sessions
- ✅ **Batch Simulation**: Realistic batch data
- ✅ **Balance Display**: Random but realistic amounts
- ✅ **Error Handling**: Graceful fallbacks

## 🏗 Smart Contract Integration

### Current Status
- ✅ Frontend fully implemented
- ✅ Contract ABIs defined
- ✅ Service layer ready
- ⏳ Contracts need deployment
- ⏳ FHEVM SDK integration pending

### Contract Deployment Steps

1. **Deploy to Sepolia**
```bash
cd contracts
forge script Deploy --rpc-url $SEPOLIA_RPC --broadcast --verify
```

2. **Update Contract Addresses**
Edit `frontend/src/services/fhevmService.ts`:
```typescript
const CONTRACT_ADDRESSES = {
  DCA_INTENT_REGISTRY: "0x...", // Deployed address
  BATCH_EXECUTOR: "0x...",      // Deployed address
  // ... other contracts
};
```

3. **Configure Environment**
Create `.env.local`:
```env
VITE_CONTRACT_ADDRESSES={"DCA_INTENT_REGISTRY":"0x...","BATCH_EXECUTOR":"0x..."}
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### FHEVM SDK Integration

Replace mock FHE functions in `fhevmService.ts`:
```typescript
// Replace mock functions with real FHEVM SDK calls
import { FHE } from '@fhenix/contracts';

// Instead of mockFHEEncrypt
const encryptedAmount = FHE.encrypt(amount);

// Instead of mockFHEDecrypt  
const decryptedAmount = FHE.decrypt(encryptedAmount);
```

## 🎨 UI/UX Features

### Components
- **AnimatedCard**: Smooth hover animations
- **AnimatedStats**: Real-time statistics display
- **Countdown**: Batch execution timers
- **SimpleChart**: Price movement visualization
- **ConnectModal**: Wallet connection interface
- **Toast**: User feedback notifications

### Themes
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components

## 📁 Project Structure

```
fhevm-dca-bot/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── services/            # Blockchain interaction
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript definitions
│   │   ├── utils/               # Utility functions
│   │   └── contexts/            # React contexts
│   ├── public/                  # Static assets
│   └── package.json
├── contracts/                   # Smart contracts
│   ├── DCAIntentRegistry.sol
│   ├── BatchExecutor.sol
│   ├── TimeBasedBatchTrigger.sol
│   └── interfaces/
└── README.md
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic formatting
- **Husky**: Pre-commit hooks

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables
Set these in your deployment platform:
- `VITE_CONTRACT_ADDRESSES`: JSON string of contract addresses
- `VITE_RPC_URL`: Ethereum RPC endpoint
- `VITE_CHAIN_ID`: Target network chain ID

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check the `/docs` folder for detailed guides

## 🔮 Roadmap

- [ ] Smart contract deployment
- [ ] FHEVM SDK integration
- [ ] Multi-chain support
- [ ] Advanced DCA strategies
- [ ] Mobile app
- [ ] API documentation
- [ ] Performance optimizations

---

**Built with ❤️ for the FHE community**
