import React, { createContext, useContext, useEffect, useState } from 'react';
import { FHEVMDcaBotService, FHEVMError, ContractError, WalletError } from '../services/fhevmService';
import { useToast } from './ToastContext';

interface ServiceContextType {
  service: FHEVMDcaBotService | null;
  isInitialized: boolean;
  error: Error | null;
  reinitialize: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType>({
  service: null,
  isInitialized: false,
  error: null,
  reinitialize: async () => {}
});

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

interface ServiceProviderProps {
  children: React.ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const [service, setService] = useState<FHEVMDcaBotService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const initializeService = async () => {
    try {
      setError(null);
      const newService = new FHEVMDcaBotService();
      setService(newService);
      setIsInitialized(true);
      
      console.log('FHEVM DCA Bot service initialized successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize service');
      setError(error);
      setIsInitialized(false);
      
      console.error('Failed to initialize service:', error);
      showToast('Failed to initialize FHEVM service', 'error');
    }
  };

  const reinitialize = async () => {
    setIsInitialized(false);
    setError(null);
    await initializeService();
  };

  useEffect(() => {
    initializeService();
  }, []);

  // Handle service errors
  useEffect(() => {
    if (error) {
      let message = 'An error occurred';
      let type: 'error' | 'warning' | 'info' = 'error';

      if (error instanceof FHEVMError) {
        message = error.message;
        type = 'error';
      } else if (error instanceof ContractError) {
        message = error.message;
        type = 'warning';
      } else if (error instanceof WalletError) {
        message = error.message;
        type = 'info';
      }

      showToast(message, type);
    }
  }, [error, showToast]);

  const value: ServiceContextType = {
    service,
    isInitialized,
    error,
    reinitialize
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};
