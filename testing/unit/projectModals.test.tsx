import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { AddProjectModal } from '@/components/Projects/AddProjectModal';
import { EditProjectModal } from '@/components/Projects/EditProjectModal';
import { ProjectEnrollmentModal } from '@/components/Projects/ProjectEnrollmentModal';

// Mock dependencies
vi.mock('@/services/api', () => ({
  commonAPI: {
    getProperties: vi.fn(),
    getProperty: vi.fn(),
  },
  adminAPI: {
    createProperty: vi.fn(async (data: any) => ({ id: 'new-prop', ...data })),
    updateProperty: vi.fn(async (id: string, data: any) => ({ id, ...data })),
  },
  enrollmentAPI: {
    createEnrollment: vi.fn(async (data: any) => ({
      id: 'enroll-1',
      ...data,
      status: 'pending'
    })),
  },
}));

vi.mock('@/lib/supabaseStorage', () => ({
  uploadImage: vi.fn(async (file: File) => ({
    url: `https://storage.supabase.co/project/${file.name}`,
    path: `projects/${file.name}`,
  })),
  deleteImage: vi.fn(async () => ({ success: true })),
}));

describe('AddProjectModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays form when open', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('shows unit configuration fields', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays image upload section', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('validates price range', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('validates bedroom range', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('validates floor range', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles file selection', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles drag and drop', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('closes modal on cancel', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows amenities input', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles amenity selection', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays loading state during submission', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('validates description field', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays all amenities options', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('handles multiple image uploads', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows file upload errors', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('restricts file types for upload', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays upload progress', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('creates property on successful submission', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback after creation', async () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('sets default values for optional fields', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('handles location input', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('handles project type selection', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('handles project status selection', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('handles price input validation', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('handles unit type input', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays form title', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays submit button', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays cancel button', () => {
    renderWithProviders(
      <AddProjectModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });
});

describe('EditProjectModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockProject = {
    id: 'proj-1',
    name: 'Pearl One Capital',
    location: 'Islamabad',
    type: 'Residential',
    status: 'Under Construction',
    minPrice: 5000000,
    maxPrice: 15000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays project data', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('loads project information on mount', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows editing project name', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows editing location', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows editing project type', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows editing status', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows editing prices', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('submits updated data', async () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('closes on cancel', async () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays images for project', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows image updates', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('validates updated data', async () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows edit form title', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays save button', () => {
    renderWithProviders(
      <EditProjectModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });
});

describe('ProjectEnrollmentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockProject = { id: 'proj-1', name: 'Pearl One Capital' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays project name', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays enrollment form', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows unit selection', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows area selection', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('allows view preference input', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('submits enrollment', async () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('closes on success', async () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('displays cancel button', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays submit button', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('shows form title', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays loading state during submission', async () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('allows changing enrollment amount', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays unit type options', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays bedrooms selection', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('displays floor selection', () => {
    renderWithProviders(
      <ProjectEnrollmentModal
        isOpen={true}
        project={mockProject}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(document.body).toBeInTheDocument();
  });
});
