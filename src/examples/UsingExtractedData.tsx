/**
 * Example: How to Use Extracted PDF Data
 * 
 * This file demonstrates various ways to use the extracted project data
 * from the PDF files in your React components.
 */

import { useState } from 'react';
import { 
  extractedProperties, 
  detailedProjects,
  projectOffers,
  extractedPaymentPlans 
} from '@/data/extractedMockData';

// ============================================================================
// EXAMPLE 1: Display All Projects
// ============================================================================

export const AllProjectsExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {extractedProperties.map((property) => (
        <div key={property.id} className="border rounded-lg p-4 shadow-md">
          {property.images[0] && (
            <img 
              src={property.images[0]} 
              alt={property.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <h3 className="text-xl font-bold mb-2">{property.name}</h3>
          <p className="text-gray-600 mb-2">{property.location}</p>
          <p className="text-lg font-semibold text-green-600">
            PKR {property.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Status: {property.status}
          </p>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: Filter Projects by Type
// ============================================================================

export const FilteredProjectsExample = () => {
  const [filter, setFilter] = useState<'all' | 'residential' | 'commercial' | 'mixed-use'>('all');
  
  const filteredProjects = detailedProjects.filter(project => 
    filter === 'all' || project.type === filter
  );
  
  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All Projects
        </button>
        <button
          onClick={() => setFilter('residential')}
          className={`px-4 py-2 rounded ${filter === 'residential' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Residential
        </button>
        <button
          onClick={() => setFilter('commercial')}
          className={`px-4 py-2 rounded ${filter === 'commercial' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Commercial
        </button>
        <button
          onClick={() => setFilter('mixed-use')}
          className={`px-4 py-2 rounded ${filter === 'mixed-use' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Mixed-Use
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map(project => (
          <div key={project.id} className="border rounded-lg p-4">
            <h3 className="text-xl font-bold">{project.name}</h3>
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
              {project.type}
            </span>
            <p className="mt-2 text-gray-600">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: Detailed Project View with Amenities
// ============================================================================

export const DetailedProjectExample = ({ projectId }: { projectId: string }) => {
  const project = detailedProjects.find(p => p.id === projectId);
  
  if (!project) {
    return <div>Project not found</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-gray-600">{project.location}</p>
        <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mt-2">
          {project.status}
        </span>
      </div>
      
      {/* Description */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-gray-700">{project.description}</p>
      </div>
      
      {/* Price Range */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Price Range</h2>
        <p className="text-2xl font-bold text-blue-600">
          {project.priceRange.min && project.priceRange.max ? (
            <>
              PKR {project.priceRange.min.toLocaleString()} - 
              PKR {project.priceRange.max.toLocaleString()}
            </>
          ) : (
            'Contact for pricing'
          )}
        </p>
      </div>
      
      {/* Amenities */}
      {project.amenities.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {project.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="text-green-500">✓</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Payment Plan */}
      {project.paymentPlan && project.paymentPlan.totalInstallments && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Payment Plan Available</h2>
          <p>Total Installments: <strong>{project.paymentPlan.totalInstallments}</strong></p>
          {project.paymentPlan.downPaymentPercentage && (
            <p>Down Payment: <strong>{project.paymentPlan.downPaymentPercentage}%</strong></p>
          )}
          {project.paymentPlan.durationMonths && (
            <p>Duration: <strong>{project.paymentPlan.durationMonths} months</strong></p>
          )}
        </div>
      )}
      
      {/* Brochure Download */}
      <div className="mb-6">
        <a
          href={project.brochure}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          📄 Download Brochure
        </a>
      </div>
      
      {/* Developer Info */}
      <div className="border-t pt-4 text-gray-600">
        <p>Developed by: <strong>{project.developer}</strong></p>
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 4: Special Offers Display
// ============================================================================

export const SpecialOffersExample = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Special Offers & Deals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectOffers.map((offer) => (
          <div key={offer.id} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{offer.projectName}</h3>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                {offer.offerType}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Valid until: {new Date(offer.validUntil).toLocaleDateString()}
            </p>
            <a
              href={offer.brochure}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View Offer Details →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 5: Payment Plans Comparison
// ============================================================================

export const PaymentPlansExample = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Available Payment Plans</h2>
      <div className="space-y-4">
        {extractedPaymentPlans.map((plan) => (
          <div key={plan.projectId} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-xl font-semibold mb-3">{plan.projectName}</h3>
            
            {'downPayment' in plan && plan.downPayment ? (
              <div className="mb-2">
                <span className="font-semibold">Down Payment:</span> {(plan as any).downPayment}%
              </div>
            ) : null}
            
            {'durationMonths' in plan && plan.durationMonths ? (
              <div className="mb-2">
                <span className="font-semibold">Duration:</span> {(plan as any).durationMonths} months
              </div>
            ) : null}
            
            {plan.installments && plan.installments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Installment Schedule:</h4>
                <div className="bg-white p-3 rounded max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">No.</th>
                        <th className="text-left pb-2">Amount</th>
                        <th className="text-left pb-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.installments.slice(0, 10).map((inst, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-1">{'number' in inst ? (inst as any).number : index + 1}</td>
                          <td className="py-1">
                            {'amount' in inst && (inst as any).amount ? `PKR ${(inst as any).amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-1">{'percentage' in inst && (inst as any).percentage ? `${(inst as any).percentage}%` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {plan.installments.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Showing 10 of {plan.installments.length} installments
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 6: Search Projects
// ============================================================================

export const SearchProjectsExample = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchResults = detailedProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      
      <p className="text-gray-600 mb-4">
        Found {searchResults.length} project(s)
      </p>
      
      <div className="space-y-4">
        {searchResults.map(project => (
          <div key={project.id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <h3 className="text-lg font-bold">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.location}</p>
            <p className="text-sm mt-2">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// EXAMPLE 7: Project Stats Dashboard
// ============================================================================

export const ProjectStatsDashboard = () => {
  const totalProjects = detailedProjects.length;
  const residentialCount = detailedProjects.filter(p => p.type === 'residential').length;
  const commercialCount = detailedProjects.filter(p => p.type === 'commercial').length;
  
  const avgAmenities = Math.round(
    detailedProjects.reduce((sum, p) => sum + p.amenities.length, 0) / totalProjects
  );
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-100 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-blue-600">{totalProjects}</div>
        <div className="text-sm text-gray-600 mt-1">Total Projects</div>
      </div>
      
      <div className="bg-green-100 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-green-600">{residentialCount}</div>
        <div className="text-sm text-gray-600 mt-1">Residential</div>
      </div>
      
      <div className="bg-yellow-100 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-yellow-600">{commercialCount}</div>
        <div className="text-sm text-gray-600 mt-1">Commercial</div>
      </div>
      
      <div className="bg-purple-100 p-4 rounded-lg text-center">
        <div className="text-3xl font-bold text-purple-600">{avgAmenities}</div>
        <div className="text-sm text-gray-600 mt-1">Avg. Amenities</div>
      </div>
    </div>
  );
};

// ============================================================================
// Export all examples
// ============================================================================

export default {
  AllProjectsExample,
  FilteredProjectsExample,
  DetailedProjectExample,
  SpecialOffersExample,
  PaymentPlansExample,
  SearchProjectsExample,
  ProjectStatsDashboard,
};

