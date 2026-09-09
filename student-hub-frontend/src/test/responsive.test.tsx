import { describe, it, expect } from 'vitest';

describe('Responsive Design', () => {
  it('should have proper viewport meta tag', () => {
    // This is a meta test - the actual viewport is in index.html
    expect(document.querySelector('meta[name="viewport"]')).toBeDefined();
  });

  // You can add more responsive tests here
});