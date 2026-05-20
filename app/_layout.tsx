import { initializeBackend } from '@/services/init';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    initializeBackend();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}