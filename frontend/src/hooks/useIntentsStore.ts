import { useState, useEffect } from 'react';
import { DCAIntent } from '../types/dca';

// In-memory store with localStorage persistence
export function useIntentsStore() {
    const [intents, setIntents] = useState<DCAIntent[]>([]);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem("fhevm_dca_intents");
            if (raw) {
                const parsed = JSON.parse(raw);
                setIntents(parsed);
            }
        } catch (error) {
            console.error('Failed to load intents from localStorage:', error);
        }
    }, []);

    // Save to localStorage whenever intents change
    useEffect(() => {
        try {
            localStorage.setItem("fhevm_dca_intents", JSON.stringify(intents));
        } catch (error) {
            console.error('Failed to save intents to localStorage:', error);
        }
    }, [intents]);

    return { intents, setIntents } as const;
}
