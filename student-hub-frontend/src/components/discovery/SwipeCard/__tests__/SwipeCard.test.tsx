import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SwipeCard } from '../SwipeCard';

describe('SwipeCard', () => {
  const mockChildren = <div data-testid="card-content">Card Content</div>;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock setPointerCapture for JSDOM
    HTMLDivElement.prototype.setPointerCapture = vi.fn();
    HTMLDivElement.prototype.releasePointerCapture = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render children correctly', () => {
    render(<SwipeCard>{mockChildren}</SwipeCard>);
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
  });

  it('should handle pointer events for drag', () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();

    render(
      <SwipeCard onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft}>
        {mockChildren}
      </SwipeCard>
    );

    const card = screen.getByTestId('card-content').parentElement!;
    
    // Use act to ensure all state updates are processed
    act(() => {
      // Start drag
      fireEvent.pointerDown(card, { clientX: 100, pointerId: 1 });
      
      // Move drag - enough to exceed threshold
      fireEvent.pointerMove(card, { clientX: 250, pointerId: 1 });
      
      // End drag
      fireEvent.pointerUp(card, { clientX: 250, pointerId: 1 });
    });

    // Fast-forward timers
    act(() => {
      vi.runAllTimers();
    });

    // Check that swipe was triggered
    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should handle left swipe', () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();

    render(
      <SwipeCard onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft}>
        {mockChildren}
      </SwipeCard>
    );

    const card = screen.getByTestId('card-content').parentElement!;

    act(() => {
      fireEvent.pointerDown(card, { clientX: 200, pointerId: 1 });
      fireEvent.pointerMove(card, { clientX: 50, pointerId: 1 });
      fireEvent.pointerUp(card, { clientX: 50, pointerId: 1 });
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should return to center on small drag', () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();

    render(
      <SwipeCard onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft}>
        {mockChildren}
      </SwipeCard>
    );

    const card = screen.getByTestId('card-content').parentElement!;

    act(() => {
      fireEvent.pointerDown(card, { clientX: 200, pointerId: 1 });
      fireEvent.pointerMove(card, { clientX: 150, pointerId: 1 });
      fireEvent.pointerUp(card, { clientX: 150, pointerId: 1 });
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<SwipeCard className="custom-class">{mockChildren}</SwipeCard>);
    
    const card = screen.getByTestId('card-content').parentElement;
    expect(card).toHaveClass('custom-class');
  });

  it('should have touch-none and select-none classes', () => {
    render(<SwipeCard>{mockChildren}</SwipeCard>);
    
    const card = screen.getByTestId('card-content').parentElement;
    expect(card).toHaveClass('touch-none');
    expect(card).toHaveClass('select-none');
  });
});