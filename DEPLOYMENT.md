# 🚀 FHEVM DCA Bot - Production Deployment Guide

This guide walks you through deploying the FHEVM DCA Bot to production.

## 📋 Prerequisites

- [ ] Smart contracts deployed to target network
- [ ] FHEVM SDK integrated and tested
- [ ] Environment variables configured
- [ ] Domain name and SSL certificate
- [ ] CI/CD pipeline setup (optional)

## 🏗 Smart Contract Deployment

### 1. Deploy to Sepolia Testnet

```bash
# Navigate to contracts directory
cd contracts

# Set environment variables
export PRIVATE_KEY="your_private_key"
export SEPOLIA_RPC="https://sepolia.infura.io/v3/YOUR_PROJECT_ID"

# Deploy contracts
forge script Deploy --rpc-url $SEPOLIA_RPC --broadcast --verify
```

### 2. Update Contract Addresses

After deployment, update `frontend/src/services/fhevmService.ts`:

```typescript
const CONTRACT_ADDRESSES = {
  DCA_INTENT_REGISTRY: "0x...", // Deployed address
  BATCH_EXECUTOR: "0x...",      // Deployed address
  TIME_BASED_TRIGGER: "0x...",  // Deployed address
  TOKEN_VAULT: "0x...",         // Deployed address
  REWARD_VAULT: "0x...",        // Deployed address
  DEX_ADAPTER: "0x...",         // Deployed address
  USDC: "0x...",                // USDC token address
  WETH: "0x..."                 // WETH token address
};
```

## 🔧 Environment Configuration

### 1. Create Environment File

Create `.env.production` in the frontend directory:

```env
# Network Configuration
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_EXPLORER_URL=https://sepolia.etherscan.io

# Contract Addresses (JSON string)
VITE_CONTRACT_ADDRESSES={"DCA_INTENT_REGISTRY":"0x...","BATCH_EXECUTOR":"0x...","TIME_BASED_TRIGGER":"0x...","TOKEN_VAULT":"0x...","REWARD_VAULT":"0x...","DEX_ADAPTER":"0x...","USDC":"0x...","WETH":"0x..."}

# FHE Configuration
VITE_FHE_NETWORK_URL=https://api.fhenix.io
VITE_FHE_CHAIN_ID=42069

# Analytics (optional)
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

### 2. Update Service Layer

Modify `fhevmService.ts` to use environment variables:

```typescript
const CONTRACT_ADDRESSES = JSON.parse(
  import.meta.env.VITE_CONTRACT_ADDRESSES || '{}'
);

const RPC_URL = import.meta.env.VITE_RPC_URL;
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Option 3: AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront for HTTPS
```

### Option 4: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔒 Security Configuration

### 1. Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ethereum-api.xyz;
               connect-src 'self' https://*.infura.io https://*.alchemyapi.io wss://*.infura.io;
               img-src 'self' data: https:;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;">
```

### 2. HTTPS Configuration

Ensure your hosting provider supports HTTPS with:
- TLS 1.2+ support
- HSTS headers
- Secure cookies

### 3. Environment Variable Security

- Never commit `.env` files to version control
- Use environment-specific files (`.env.production`)
- Rotate API keys regularly
- Use least-privilege access for RPC endpoints

## 📊 Monitoring & Analytics

### 1. Error Tracking

Add Sentry for error monitoring:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
});
```

### 2. Analytics

Add Google Analytics or similar:

```typescript
// Google Analytics 4
gtag('config', import.meta.env.VITE_ANALYTICS_ID);
```

### 3. Performance Monitoring

Monitor Core Web Vitals:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

## 🧪 Testing Checklist

Before going live, verify:

- [ ] Wallet connection works on all browsers
- [ ] Smart contract interactions succeed
- [ ] FHE operations work correctly
- [ ] Error handling displays user-friendly messages
- [ ] Mobile responsiveness is perfect
- [ ] Loading states work properly
- [ ] Network switching functions correctly
- [ ] All form validations pass
- [ ] Localization works (if applicable)

## 🚨 Post-Deployment

### 1. Health Checks

Set up monitoring for:
- Frontend availability
- Smart contract interactions
- RPC endpoint health
- User transaction success rates

### 2. Backup Strategy

- Regular database backups (if applicable)
- Smart contract upgrade mechanisms
- Frontend rollback procedures

### 3. Support Infrastructure

- Documentation for users
- Support channels (Discord, Telegram)
- FAQ and troubleshooting guides
- Community governance (if applicable)

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 Scaling Considerations

### 1. Performance Optimization

- Implement lazy loading for components
- Use React.memo for expensive components
- Optimize bundle size with code splitting
- Cache static assets with CDN

### 2. User Experience

- Add progressive web app (PWA) features
- Implement offline functionality
- Add loading skeletons
- Optimize for slow connections

### 3. Infrastructure

- Use CDN for global distribution
- Implement caching strategies
- Monitor resource usage
- Plan for traffic spikes

## 🆘 Troubleshooting

### Common Issues

1. **Contract Interaction Fails**
   - Check RPC endpoint health
   - Verify contract addresses
   - Ensure user has sufficient gas

2. **Wallet Connection Issues**
   - Check MetaMask installation
   - Verify network configuration
   - Clear browser cache

3. **FHE Operations Fail**
   - Check FHEVM SDK version
   - Verify network compatibility
   - Check encryption parameters

### Support Resources

- [FHEVM Documentation](https://docs.fhenix.io)
- [Ethers.js Documentation](https://docs.ethers.org)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Ready to deploy?** Follow this guide step-by-step and your FHEVM DCA Bot will be production-ready! 🚀
