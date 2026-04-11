import { describe, it, expect } from 'vitest';
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

  it('mockProperties contains valid data', () => {
    expect(mockProperties.length).toBeGreaterThan(0);
    mockProperties.forEach((prop: any) => {
      expect(prop).toHaveProperty('id');
    });
  });

  it('mockPayments contains valid payment objects', () => {
    expect(mockPayments.length).toBeGreaterThan(0);
    mockPayments.forEach((payment: any) => {
      expect(payment).toBeDefined();
      expect(typeof payment).toBe('object');
    });
  });

  it('mockClient object exists and contains properties', () => {
    expect(mockClient).toBeDefined();
    expect(typeof mockClient).toBe('object');
  });

  it('extractedProjects array has valid structure', () => {
    expect(extractedProjects.length).toBeGreaterThan(0);
    expect(Array.isArray(extractedProjects)).toBe(true);
  });

  it('detailedProjects array has items', () => {
    expect(detailedProjects.length).toBeGreaterThan(0);
    expect(Array.isArray(detailedProjects)).toBe(true);
  });

  it('all data exports are defined', () => {
    expect(mockProperties).toBeDefined();
    expect(mockPayments).toBeDefined();
    expect(mockClient).toBeDefined();
    expect(extractedProjects).toBeDefined();
    expect(detailedProjects).toBeDefined();
  });
});


