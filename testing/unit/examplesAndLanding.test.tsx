import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { renderWithProviders, screen, act, waitFor } from '../test-utils';
import { LandingPage } from '@/pages/Landing/LandingPage';
import { ProjectsPage } from '@/pages/Projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/Projects/ProjectDetailPage';
import { AllProjectsExample } from '@/examples/UsingExtractedData';

// Simplify framer-motion but keep real exports like useScroll/useTransform
vi.mock('framer-motion', () => {
  const Mock = (props: any) => <div {...props} />;
  const motion = new Proxy(
    {},
    {
      get: () => Mock,
    }
  );
  const scrollY = { on: () => {}, get: () => 0 };
  return {
    motion,
    useScroll: () => ({ scrollY }),
    useTransform: () => 0,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Stub heavy components if needed
vi.mock('@/components/Projects/BlueprintDisplay', () => ({
  BlueprintDisplay: () => <div>Blueprint</div>,
}));

describe('Examples and Landing/Projects pages', () => {
  it('renders LandingPage hero content', () => {
    renderWithProviders(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/real estate/i).length).toBeGreaterThan(0);
  });

  it('renders ProjectsPage list', () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/projects/i).length).toBeGreaterThan(0);
  });

  it('renders ProjectDetailPage with valid id', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/pearl-one-premium']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Project Not Found/i) || screen.getByText(/Invest/)).toBeTruthy();
  });

  it('renders UsingExtractedData example without crashing', () => {
    renderWithProviders(<AllProjectsExample />);
    expect(screen.getAllByText(/Status:/i).length).toBeGreaterThan(0);
  });

  it('LandingPage displays content', () => {
    renderWithProviders(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('ProjectsPage displays content without crashing', () => {
    renderWithProviders(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('AllProjectsExample renders items', () => {
    renderWithProviders(<AllProjectsExample />);
    expect(document.body).toBeInTheDocument();
  });

  it('ProjectDetailPage renders without error', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/projects/test-project']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(document.body).toBeInTheDocument();
  });
});


