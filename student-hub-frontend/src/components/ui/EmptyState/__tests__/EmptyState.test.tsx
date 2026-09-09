import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { Button } from '../../Button/Button';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(
      <EmptyState
        icon="🚀"
        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('should render action when provided', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        action={<Button>Click Me</Button>}
      />
    );

    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should not render action when not provided', () => {
    render(
      <EmptyState        title="Test Title"
        description="Test Description"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});