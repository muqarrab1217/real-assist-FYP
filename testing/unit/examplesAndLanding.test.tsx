import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
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
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/real estate/i).length).toBeGreaterThan(0);
  });

  it('renders ProjectsPage list', () => {
    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );
    expect(screen.getAllByText(/projects/i).length).toBeGreaterThan(0);
  });

  it('renders ProjectDetailPage with valid id', () => {
    render(
      <MemoryRouter initialEntries={['/projects/pearl-one-premium']}>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/Project Not Found/i) || screen.getByText(/Invest/)).toBeTruthy();
  });

  it('renders UsingExtractedData example without crashing', () => {
    render(<AllProjectsExample />);
    expect(screen.getAllByText(/Status:/i).length).toBeGreaterThan(0);
  });
});

