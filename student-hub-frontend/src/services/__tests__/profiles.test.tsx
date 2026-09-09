import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profilesService } from '../profiles';

describe('profilesService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('getDiscoveryProfiles', () => {
    it('should return all profiles when no userId provided', async () => {
      const promise = profilesService.getDiscoveryProfiles();
      vi.runAllTimers();
      const profiles = await promise;

      expect(profiles).toHaveLength(4);
      expect(profiles[0].name).toBe('Daniel Chen');
      expect(profiles[1].name).toBe('Maya Patel');
    });

    it('should filter out user when userId provided', async () => {
      const promise = profilesService.getDiscoveryProfiles('1');
      vi.runAllTimers();
      const profiles = await promise;

      expect(profiles).toHaveLength(3);
      expect(profiles.every(p => p.id !== '1')).toBe(true);
    });

    it('should simulate API delay', async () => {
      const start = Date.now();
      const promise = profilesService.getDiscoveryProfiles();
      vi.runAllTimers();
      await promise;
      const end = Date.now();

      // Should be at least 500ms (the simulated delay)
      expect(end - start).toBeGreaterThanOrEqual(500);
    });
  });

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const promise = profilesService.getProfile('1');
      vi.runAllTimers();
      const profile = await promise;

      expect(profile).toBeDefined();
      expect(profile?.id).toBe('1');
      expect(profile?.name).toBe('Daniel Chen');
    });

    it('should return null when profile not found', async () => {
      const promise = profilesService.getProfile('999');
      vi.runAllTimers();
      const profile = await promise;

      expect(profile).toBeNull();
    });

    it('should simulate API delay', async () => {
      const start = Date.now();
      const promise = profilesService.getProfile('1');
      vi.runAllTimers();
      await promise;
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(300);
    });
  });

  describe('likeProfile', () => {
    it('should return success true', async () => {
      const promise = profilesService.likeProfile('1');
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(true);
    });

    it('should sometimes return matched true', async () => {
      // Mock Math.random to control the match rate
      const originalRandom = Math.random;
      
      // Force match
      Math.random = vi.fn(() => 0.1);
      
      const promise = profilesService.likeProfile('1');
      vi.runAllTimers();
      const result = await promise;

      expect(result.matched).toBe(true);
      
      Math.random = originalRandom;
    });

    it('should sometimes return matched false', async () => {
      // Force no match
      Math.random = vi.fn(() => 0.5);
      
      const promise = profilesService.likeProfile('1');
      vi.runAllTimers();
      const result = await promise;

      expect(result.matched).toBe(false);
      
      Math.random = vi.fn(() => 0.8);
    });
  });

  describe('superLikeProfile', () => {
    it('should return success true', async () => {
      const promise = profilesService.superLikeProfile('1');
      vi.runAllTimers();
      const result = await promise;

      expect(result.success).toBe(true);
    });

    it('should have higher match rate than regular like', async () => {
      // Test that super like has higher match rate (60%)
      const originalRandom = Math.random;
      
      // This would be false for regular like (30%) but true for super like (60%)
      Math.random = vi.fn(() => 0.4);
      
      const promise = profilesService.superLikeProfile('1');
      vi.runAllTimers();
      const result = await promise;

      expect(result.matched).toBe(true);
      
      Math.random = originalRandom;
    });
  });
});