import { useState, useEffect, useCallback } from 'react';
import { healthService, type HealthStatus } from '../services/health';

export function useHealth() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const checkHealth = useCallback(async () => {
    console.log('🔍 Health check starting...'); // <-- Add this
    setIsLoading(true);
    setError(null);
    try {
      console.log('📡 Calling healthService.checkHealth()...'); // <-- Add this
      const result = await healthService.checkHealth();
      console.log('✅ Health check result:', result); // <-- Add this
      setStatus(result);
      setIsConnected(result.status === 'ok');
    } catch (err) {
      console.error('❌ Health check failed:', err); // <-- Add this
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to API';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Health check failed:', err);
    } finally {
      setIsLoading(false);
      console.log('🏁 Health check completed'); // <-- Add this
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useHealth mounted, calling checkHealth...'); // <-- Add this
    checkHealth();
  }, [checkHealth]);

  return {
    status,
    isLoading,
    error,
    isConnected,
    checkHealth,
  };
}