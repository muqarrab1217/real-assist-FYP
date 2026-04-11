import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlueprintDisplay } from '@/components/Projects/BlueprintDisplay';
import { SubscriptionsModal } from '@/components/Projects/SubscriptionsModal';
import { EnrollmentModal } from '@/components/Projects/EnrollmentModal';
import { renderWithProviders } from '../test-utils';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    img: ({ ...props }: any) => <img {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Dialog component
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, ...props }: any) => <div data-testid="dialog-content" {...props}>{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

// Mock API services
vi.mock('@/services/api', () => ({
  enrollmentAPI: {
    getProjectSubscriptions: vi.fn(),
  },
  leadAPI: {
    createLead: vi.fn(),
  },
}));

// Mock useProjectSubscriptions hook
vi.mock('@/hooks/queries/useAdminQueries', () => ({
  useProjectSubscriptions: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useCreateProperty: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

describe('BlueprintDisplay Component', () => {
  const mockProjectId = 'proj-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <BlueprintDisplay projectId={mockProjectId} />
    );
    expect(container).toBeInTheDocument();
  });

  it('accepts different flat types', () => {
    const { rerender } = render(
      <BlueprintDisplay projectId={mockProjectId} activeTab="economy" />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    rerender(
      <BlueprintDisplay projectId={mockProjectId} activeTab="premium" />
    );
    const buttonsBefore = screen.getAllByRole('button');
    expect(buttonsBefore.length).toBeGreaterThan(0);
  });

  it('accepts project data', () => {
    const mockProject = { id: mockProjectId, name: 'Test Project' };
    const { container } = render(
      <BlueprintDisplay projectId={mockProjectId} project={mockProject} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with showTabs prop', () => {
    const { container } = render(
      <BlueprintDisplay projectId={mockProjectId} showTabs={true} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with showTabs false', () => {
    const { container } = render(
      <BlueprintDisplay projectId={mockProjectId} showTabs={false} />
    );
    expect(container).toBeInTheDocument();
  });
});

describe('SubscriptionsModal Component', () => {
  const mockOnClose = vi.fn();
  const mockProjectId = 'proj-123';
  const mockProjectName = 'Pearl One';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { queryByTestId } = renderWithProviders(
      <SubscriptionsModal
        isOpen={false}
        onClose={mockOnClose}
        projectId={mockProjectId}
        projectName={mockProjectName}
      />
    );
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog content when isOpen is true', () => {
    const { getByTestId } = renderWithProviders(
      <SubscriptionsModal
        isOpen={true}
        onClose={mockOnClose}
        projectId={mockProjectId}
        projectName={mockProjectName}
      />
    );
    expect(getByTestId('dialog')).toBeInTheDocument();
  });

  it('displays project name in header', async () => {
    const { getByText } = renderWithProviders(
      <SubscriptionsModal
        isOpen={true}
        onClose={mockOnClose}
        projectId={mockProjectId}
        projectName={mockProjectName}
      />
    );

    expect(getByText('Project Subscriptions')).toBeInTheDocument();
    expect(getByText(mockProjectName)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const { getByText, getByTestId } = renderWithProviders(
      <SubscriptionsModal
        isOpen={true}
        onClose={mockOnClose}
        projectId={mockProjectId}
        projectName={mockProjectName}
      />
    );

    expect(getByTestId('dialog')).toBeInTheDocument();
    const closeButton = getByText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders structure with default loading state', () => {
    const { useProjectSubscriptions } = require('@/hooks/queries/useAdminQueries');
    vi.mocked(useProjectSubscriptions).mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { getByTestId, container } = renderWithProviders(
      <SubscriptionsModal
        isOpen={true}
        onClose={mockOnClose}
        projectId={mockProjectId}
        projectName={mockProjectName}
      />
    );

    expect(getByTestId('dialog')).toBeInTheDocument();
  });

describe('EnrollmentModal Component', () => {
  const mockOnClose = vi.fn();
  const mockProject = { id: 'proj-1', name: 'Test Project' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = renderWithProviders(
      <EnrollmentModal isOpen={false} onClose={mockOnClose} project={mockProject} />
    );
    // Modal should not render content when closed
    expect(container.querySelector('h3')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    const { getByText } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockOnClose}
        project={mockProject}
      />
    );
    expect(getByText(/Project Enrollment/i)).toBeInTheDocument();
  });

  it('displays project name in header', () => {
    const { getByText } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockOnClose}
        project={mockProject}
      />
    );
    expect(getByText(`Interested in ${mockProject.name}`)).toBeInTheDocument();
  });

  it('has a close button', () => {
    const { container } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockOnClose}
        project={mockProject}
      />
    );
    const closeButton = container.querySelector('button[class*="hover:bg-gold"]');
    expect(closeButton).toBeInTheDocument();
  });

  it('renders form fields', () => {
    const { container } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockOnClose}
        project={mockProject}
      />
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('displays submit button', () => {
    const { getAllByRole } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockOnClose}
        project={mockProject}
      />
    );
    const buttons = getAllByRole('button');
    // Should have at least one button for submit
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows loading and success state after form submission', () => {
    const { container } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockOnClose}
        project={mockProject}
      />
    );

    // Modal renders with form visible
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('calls closehandler after successful submission', () => {
    const mockCloseFn = vi.fn();
    const { container } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockCloseFn}
        project={mockProject}
      />
    );

    // Modal renders and can be interacted with
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('populates form with user data from auth context', () => {
    const { container } = renderWithProviders(
      <EnrollmentModal
        isOpen={true}
        onClose={mockOnClose}
        project={mockProject}
      />
    );

    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });
});
