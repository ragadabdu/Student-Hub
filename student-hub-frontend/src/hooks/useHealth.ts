import { useState, useEffect, useCallback } from 'react';
import { healthService, type HealthStatus } from '../services/health';

export function useHealth() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const checkHealth = useCallback(async () => {
    //console.log('🔍 Health check starting...'); 
    setIsLoading(true);
    setError(null);
    try {
      //console.log('📡 Calling healthService.checkHealth()...'); 
      const result = await healthService.checkHealth();
      //console.log('✅ Health check result:', result); 
      setStatus(result);
      setIsConnected(result.status === 'ok');
    } catch (err) {
      //console.error('❌ Health check failed:', err); 
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to API';
      setError(errorMessage);
      setIsConnected(false);
      console.error('Health check failed:', err);
    } finally {
      setIsLoading(false);
      //console.log('🏁 Health check completed'); 
    }
  }, []);

  useEffect(() => {
    //console.log('🔄 useHealth mounted, calling checkHealth...'); 
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