/**
 * useOfflineState Hook
 * 
 * Offline state detection and management.
 * Calm, non-intrusive offline awareness.
 */

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface OfflineState {
  isOffline: boolean;
  isConnected: boolean;
  connectionType: string | null;
}

export const useOfflineState = (): OfflineState => {
  const [state, setState] = useState<OfflineState>({
    isOffline: false,
    isConnected: true,
    connectionType: null,
  });

  useEffect(() => {
    // Initial check
    const checkConnection = async () => {
      const netInfo = await NetInfo.fetch();
      setState({
        isOffline: !netInfo.isConnected,
        isConnected: netInfo.isConnected ?? false,
        connectionType: netInfo.type ?? null,
      });
    };

    checkConnection();

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((netInfo) => {
      setState({
        isOffline: !netInfo.isConnected,
        isConnected: netInfo.isConnected ?? false,
        connectionType: netInfo.type ?? null,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
};
