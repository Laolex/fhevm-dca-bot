# FHEVM DCA Bot Frontend

A beautiful, modern React frontend for the FHEVM DCA Bot with privacy-preserving dollar-cost averaging functionality.

## 🚀 Features

### ✨ UI/UX Improvements
- **Modern Design**: Gradient backgrounds, glass morphism effects, and smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode**: Beautiful dark theme with customizable color schemes
- **Particle Background**: Animated particle system for visual appeal
- **Smooth Animations**: CSS animations and transitions throughout the app

### 🔐 Wallet Integration
- **MetaMask Support**: Full MetaMask integration with proper error handling
- **Network Switching**: Automatic Sepolia testnet detection and switching
- **Wallet Persistence**: Remembers wallet connection across page refreshes
- **Account Management**: Handle account changes and disconnections gracefully
- **Network Validation**: Ensures users are on the correct network

### 📊 Real-time Features
- **Live Statistics**: Real-time blockchain data display
- **Batch Monitoring**: Track batch execution status
- **Encrypted Balance**: View encrypted token balances
- **Transaction History**: Monitor DCA execution history

### 🎯 User Experience
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Proper loading indicators for all async operations
- **Error Handling**: Comprehensive error messages and recovery
- **Form Validation**: Input validation with helpful error messages

## 🛠️ Technical Improvements

### Architecture
- **Custom Hooks**: Reusable hooks for wallet management and state
- **Context API**: Global state management for toasts and user preferences
- **TypeScript**: Full type safety throughout the application
- **Component Library**: Reusable, well-documented components

### Performance
- **Code Splitting**: Lazy loading for better performance
- **Optimized Animations**: Hardware-accelerated CSS animations
- **Efficient Re-renders**: Proper React optimization techniques
- **Bundle Optimization**: Minimal bundle size with tree shaking

### Developer Experience
- **Hot Reload**: Fast development with Vite
- **Type Safety**: Full TypeScript support
- **ESLint/Prettier**: Code formatting and linting
- **Component Documentation**: Well-documented components

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnimatedCard.tsx
│   ├── AnimatedStats.tsx
│   ├── BalanceCard.tsx
│   ├── ConnectModal.tsx
│   ├── DCACard.tsx
│   ├── LoadingSpinner.tsx
│   ├── MonitoringCard.tsx
│   ├── ParticleBackground.tsx
│   ├── RealTimeStats.tsx
│   ├── StatusCard.tsx
│   └── Toast.tsx
├── contexts/           # React contexts
│   └── ToastContext.tsx
├── hooks/             # Custom React hooks
│   └── useWallet.ts
├── types/             # TypeScript type definitions
│   └── relayer-sdk.d.ts
├── ui/                # Page components
│   ├── App.tsx
│   ├── HomePage.tsx
│   ├── SubmitPage.tsx
│   └── VaultPage.tsx
├── index.css          # Global styles and animations
└── main.tsx          # Application entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#667eea → #764ba2)
- **Secondary**: Purple gradient (#f093fb → #f5576c)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: Dark gradient (#1e1b4b → #7c3aed → #ec4899)

### Typography
- **Headings**: Bold, gradient text with glow effects
- **Body**: Clean, readable fonts with proper contrast
- **Code**: Monospace fonts for addresses and technical data

### Animations
- **Entrance**: Slide-in and fade-in animations
- **Hover**: Scale and glow effects
- **Loading**: Smooth spinners and skeleton screens
- **Transitions**: 300ms ease-out for all interactions

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_RPC_URL=https://rpc.sepolia.org
VITE_CHAIN_ID=0xaa36a7
VITE_CONTRACT_ADDRESSES={"registry":"0x3F9D1D64CbbD69aBcB79faBD156817655b48050c","executor":"0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70","vault":"0x98Eec4C5bA3DF65be22106E0E5E872454e8834db"}
```

## 🚀 Usage

### Connecting Wallet
1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Switch to Sepolia testnet if prompted
4. Wallet status will be displayed in the header

### Submitting DCA Intent
1. Navigate to "Submit Intent" page
2. Fill in DCA parameters:
   - Total budget (USDC)
   - Amount per interval
   - Interval duration (seconds)
   - Number of periods
3. Approve USDC allowance if needed
4. Submit encrypted intent

### Monitoring
1. Navigate to "Vault Dashboard"
2. View real-time statistics
3. Monitor batch execution status
4. Check encrypted balances

## 🔮 Future Improvements

### Planned Features
- **Multi-wallet Support**: WalletConnect, Coinbase Wallet, etc.
- **Advanced Analytics**: Charts and performance metrics
- **Mobile App**: React Native version
- **Off-chain Data**: IPFS integration for metadata
- **Social Features**: User profiles and sharing

### Technical Enhancements
- **Web3 Integration**: Direct blockchain interaction
- **Real-time Updates**: WebSocket connections
- **Caching**: Redis for performance optimization
- **Testing**: Comprehensive test suite
- **CI/CD**: Automated deployment pipeline

### UI/UX Enhancements
- **Themes**: Multiple color schemes
- **Accessibility**: WCAG 2.1 compliance
- **Internationalization**: Multi-language support
- **Progressive Web App**: Offline functionality
- **Micro-interactions**: Enhanced user feedback

## 🐛 Known Issues & Solutions

### Wallet Connection Issues
- **Problem**: Modal doesn't work properly
- **Solution**: ✅ Fixed with improved error handling and state management

### Network Switching
- **Problem**: No automatic network switching
- **Solution**: ✅ Added automatic Sepolia detection and switching

### State Persistence
- **Problem**: Wallet state lost on refresh
- **Solution**: ✅ Added localStorage persistence

### Error Handling
- **Problem**: Poor error feedback
- **Solution**: ✅ Added comprehensive toast notification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- FHEVM team for the privacy-preserving technology
- MetaMask for wallet integration
- React and Vite communities
- All contributors and testers

---

**Built with ❤️ for the FHEVM ecosystem**
