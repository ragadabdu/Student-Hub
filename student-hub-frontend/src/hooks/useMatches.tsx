import { useState, useEffect, useCallback } from 'react';
import type { Match } from '../types/match';
import { matchesService } from '../services/matches';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchesService.getMatches();
      setMatches(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matches';
      setError(errorMessage);
      console.error('Failed to load matches:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const selectMatch = useCallback((matchId: string) => {
    setSelectedMatchId(matchId);
  }, []);

  const clearSelectedMatch = useCallback(() => {
    setSelectedMatchId(null);
  }, []);

  const getSelectedMatch = useCallback(() => {
    return matches.find(m => m.id === selectedMatchId) || null;
  }, [matches, selectedMatchId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!selectedMatchId || !content.trim()) return false;
    
    setIsSendingMessage(true);
    try {
      const result = await matchesService.sendMessage(selectedMatchId, content);
      
      // Update the match's last message preview
      setMatches(prev => prev.map(m => 
        m.id === selectedMatchId 
          ? { 
              ...m, 
              lastMessage: { 
                preview: content, 
                sentAt: new Date() 
              } 
            }
          : m
      ));
      
      return result.success;
    } catch (err) {
      console.error('Failed to send message:', err);
      return false;
    } finally {
      setIsSendingMessage(false);
    }
  }, [selectedMatchId]);

  const unmatch = useCallback(async (matchId: string) => {
    try {
      const result = await matchesService.unmatch(matchId);
      if (result.success) {
        setMatches(prev => prev.filter(m => m.id !== matchId));
        if (selectedMatchId === matchId) {
          setSelectedMatchId(null);
        }
      }
      return result.success;
    } catch (err) {
      console.error('Failed to unmatch:', err);
      return false;
    }
  }, [selectedMatchId]);

  return {
    matches,
    isLoading,
    error,
    selectedMatchId,
    isSendingMessage,
    loadMatches,
    selectMatch,
    clearSelectedMatch,
    getSelectedMatch,
    sendMessage,
    unmatch,
    hasMatches: matches.length > 0,
  };
}