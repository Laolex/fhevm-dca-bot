/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DCA_INTENT_REGISTRY: string
  readonly VITE_BATCH_EXECUTOR: string
  readonly VITE_TOKEN_VAULT: string
  readonly VITE_REWARD_VAULT: string
  readonly VITE_DEX_ADAPTER: string
  readonly VITE_TIME_BASED_TRIGGER: string
  readonly VITE_USDC_TOKEN: string
  readonly VITE_WETH_TOKEN: string
  readonly VITE_UNISWAP_V3_ROUTER: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_RPC_URL: string
  readonly VITE_EXPLORER_URL: string
  readonly VITE_FHE_NETWORK_URL: string
  readonly VITE_FHE_CHAIN_ID: string
  readonly VITE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ENABLE_REAL_TIME_UPDATES: string
  readonly VITE_ENABLE_OFFLINE_SUPPORT: string
  readonly VITE_ENABLE_ERROR_MONITORING: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
