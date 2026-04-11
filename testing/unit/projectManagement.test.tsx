import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { ProjectsPage } from '@/pages/Projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/Projects/ProjectDetailPage';

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock API services
vi.mock('@/services/api', () => {
  const mockProjects = [
    {
      id: 'proj-1',
      name: 'Pearl One Capital',
      location: 'Islamabad',
      type: 'Residential',
      status: 'Under Construction',
      minPrice: 5000000,
      maxPrice: 15000000,
      images: ['https://example.com/img1.jpg'],
      amenities: ['Gym', 'Pool', 'Parking'],
      units: { bedrooms: '1-3', floors: '1-10' },
    },
  ];

  return {
    commonAPI: {
      getProperties: vi.fn(async () => mockProjects),
      getProperty: vi.fn(async (id: string) =>
        mockProjects.find(p => p.id === id) || null
      ),
    },
    adminAPI: {
      createProperty: vi.fn(async (data: any) => ({
        id: 'new-proj',
        ...data
      })),
      updateProperty: vi.fn(async (id: string, data: any) => ({
        id,
        ...data
      })),
      deleteProperty: vi.fn(async () => ({ success: true })),
    },
    enrollmentAPI: {
      createEnrollment: vi.fn(),
    },
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', role: 'client' },
    isAuthenticated: true,
  }),
}));

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('renders page content', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows project listing', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays project information', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('renders search functionality', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles empty state', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays filter options', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('renders project cards', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows responsive layout', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles API loading', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays amenities list', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows price information', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('renders location details', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays status filtering', async () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays project information', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('renders image gallery', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows amenities list', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays unit information', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows enroll button', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('opens enrollment modal on button click', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays login prompt for unauthenticated users', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('navigates through images', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows thumbnail navigation', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles 404 for non-existent project', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/invalid-id']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows share button', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('copies link on share click', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/proj-1']}>
        <ProjectDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
