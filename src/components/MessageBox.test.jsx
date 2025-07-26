import { render, screen } from '@testing-library/react';
import MessageBox from './MessageBox';
import { describe, it, expect } from 'vitest';

describe('MessageBox', () => {
  it('renders an info message by default', () => {
    render(<MessageBox>This is an info message.</MessageBox>);
    const messageBox = screen.getByText('This is an info message.');
    expect(messageBox).toBeInTheDocument();
    expect(messageBox).toHaveClass('bg-blue-100 text-blue-700');
  });

  it('renders a success message', () => {
    render(<MessageBox variant="success">This is a success message.</MessageBox>);
    const messageBox = screen.getByText('This is a success message.');
    expect(messageBox).toBeInTheDocument();
    expect(messageBox).toHaveClass('bg-green-100 text-green-700');
  });

  it('renders an error message', () => {
    render(<MessageBox variant="error">This is an error message.</MessageBox>);
    const messageBox = screen.getByText('This is an error message.');
    expect(messageBox).toBeInTheDocument();
    expect(messageBox).toHaveClass('bg-red-100 text-red-700');
  });
});
