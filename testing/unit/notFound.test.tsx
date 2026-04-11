import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen, act, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { NotFoundPage } from '@/pages/NotFoundPage';

describe('NotFoundPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 404 messaging and actions', () => {
    renderWithProviders(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });

  it('invokes browser back on Go Back', async () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    renderWithProviders(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('renders Go Home link with correct href', () => {
    renderWithProviders(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders Go Back button element', () => {
    renderWithProviders(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('page displays content without crashing', () => {
    renderWithProviders(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(document.body).toBeInTheDocument();
  });

  it('contains heading element', () => {
    renderWithProviders(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const heading = screen.queryByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('Go Back button can be interacted with', async () => {
    const user = userEvent.setup({ delay: null });
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    renderWithProviders(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /go back/i });
    await act(async () => {
      await user.click(backButton);
    });

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});


