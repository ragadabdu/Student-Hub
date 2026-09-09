import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwipeActions } from '../SwipeActions';

describe('SwipeActions', () => {
  const defaultProps = {
    onUndo: vi.fn(),
    onPass: vi.fn(),
    onLike: vi.fn(),
    onSuperLike: vi.fn(),
    canUndo: false,
    hasMore: true,
  };

  it('should render all action buttons', () => {
    render(<SwipeActions {...defaultProps} />);

    expect(screen.getByLabelText('Undo last action')).toBeInTheDocument();
    expect(screen.getByLabelText('Pass')).toBeInTheDocument();
    expect(screen.getByLabelText('Connect')).toBeInTheDocument();
    expect(screen.getByLabelText('Super Connect')).toBeInTheDocument();
  });

  it('should call onPass when Pass button is clicked', () => {
    const onPass = vi.fn();
    render(<SwipeActions {...defaultProps} onPass={onPass} />);

    fireEvent.click(screen.getByLabelText('Pass'));
    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it('should call onLike when Connect button is clicked', () => {
    const onLike = vi.fn();
    render(<SwipeActions {...defaultProps} onLike={onLike} />);

    fireEvent.click(screen.getByLabelText('Connect'));
    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it('should call onSuperLike when Super Connect button is clicked', () => {
    const onSuperLike = vi.fn();
    render(<SwipeActions {...defaultProps} onSuperLike={onSuperLike} />);

    fireEvent.click(screen.getByLabelText('Super Connect'));
    expect(onSuperLike).toHaveBeenCalledTimes(1);
  });

  it('should call onUndo when Undo button is clicked and enabled', () => {
    const onUndo = vi.fn();
    render(<SwipeActions {...defaultProps} onUndo={onUndo} canUndo={true} />);

    fireEvent.click(screen.getByLabelText('Undo last action'));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('should disable Undo button when canUndo is false', () => {
    render(<SwipeActions {...defaultProps} canUndo={false} />);
    
    expect(screen.getByLabelText('Undo last action')).toBeDisabled();
  });

  it('should disable action buttons when hasMore is false', () => {
    render(<SwipeActions {...defaultProps} hasMore={false} />);

    expect(screen.getByLabelText('Pass')).toBeDisabled();
    expect(screen.getByLabelText('Connect')).toBeDisabled();
    expect(screen.getByLabelText('Super Connect')).toBeDisabled();
  });

  it('should enable action buttons when hasMore is true', () => {
    render(<SwipeActions {...defaultProps} hasMore={true} />);

    expect(screen.getByLabelText('Pass')).not.toBeDisabled();
    expect(screen.getByLabelText('Connect')).not.toBeDisabled();
    expect(screen.getByLabelText('Super Connect')).not.toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<SwipeActions {...defaultProps} className="custom-class" />);
    
    const container = screen.getByLabelText('Undo last action').parentElement;
    expect(container).toHaveClass('custom-class');
  });
});