import { mockProperties, mockPayments, mockClient } from '@/data/mockData';
import { extractedProjects } from '@/data/extracted/extracted_projects';
import { detailedProjects } from '@/data/extractedMockData';

describe('Data files', () => {
  it('mockData exports non-empty arrays', () => {
    expect(Array.isArray(mockProperties)).toBe(true);
    expect(mockProperties.length).toBeGreaterThan(0);
    expect(Array.isArray(mockPayments)).toBe(true);
    expect(mockPayments.length).toBeGreaterThan(0);
    expect(mockClient).toBeTruthy();
  });

  it('extracted projects data present', () => {
    expect(Array.isArray(extractedProjects)).toBe(true);
    expect(extractedProjects.length).toBeGreaterThan(0);
  });

  it('detailedProjects data present', () => {
    expect(Array.isArray(detailedProjects)).toBe(true);
    expect(detailedProjects.length).toBeGreaterThan(0);
  });
});

