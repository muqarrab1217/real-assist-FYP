import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

class MockDataGenerator:
    """Generate mockup data compatible with the TypeScript application"""
    
    def __init__(self, extracted_data_dir: str, output_file: str):
        self.extracted_data_dir = extracted_data_dir
        self.output_file = output_file
        self.projects_data = []
        
    def load_extracted_data(self):
        """Load extracted data from JSON files"""
        projects_file = os.path.join(self.extracted_data_dir, 'projects_data.json')
        
        if os.path.exists(projects_file):
            with open(projects_file, 'r', encoding='utf-8') as f:
                self.projects_data = json.load(f)
            print(f"✓ Loaded {len(self.projects_data)} projects")
        else:
            print(f"Warning: No projects data found at {projects_file}")
    
    def generate_properties_data(self) -> str:
        """Generate Property[] mockup data"""
        ts_code = "// Auto-generated mockup properties from PDF extraction\n"
        ts_code += f"// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        ts_code += "import { Property } from '@/types';\n\n"
        ts_code += "export const extractedProperties: Property[] = [\n"
        
        for i, project in enumerate(self.projects_data):
            # Map to Property interface
            prop_id = str(i + 10)  # Start from 10 to avoid conflicts
            
            # Determine status
            status = 'construction'
            if 'completed' in project.get('description', '').lower():
                status = 'completed'
            elif 'planning' in project.get('description', '').lower():
                status = 'planning'
            
            # Calculate completion date (1-2 years from now)
            completion_date = datetime.now() + timedelta(days=365 + (i * 90))
            
            # Get price
            price = project.get('price_range', {}).get('min', 5000000)
            
            ts_code += "  {\n"
            ts_code += f"    id: '{prop_id}',\n"
            ts_code += f"    name: '{project['name']}',\n"
            ts_code += f"    location: '{project['location']}',\n"
            ts_code += f"    developer: '{project['developer']}',\n"
            ts_code += f"    price: {price},\n"
            ts_code += f"    completionDate: new Date('{completion_date.strftime('%Y-%m-%d')}'),\n"
            ts_code += f"    images: [],\n"
            ts_code += f"    status: '{status}',\n"
            ts_code += "  },\n"
        
        ts_code += "];\n"
        return ts_code
    
    def generate_detailed_projects_data(self) -> str:
        """Generate detailed project data with all extracted information"""
        ts_code = "\n// Detailed project information from PDFs\n"
        ts_code += "export const detailedProjects = [\n"
        
        for project in self.projects_data:
            ts_code += "  {\n"
            ts_code += f"    id: '{project['id']}',\n"
            ts_code += f"    name: '{project['name']}',\n"
            ts_code += f"    type: '{project['type']}',\n"
            ts_code += f"    location: '{project['location']}',\n"
            ts_code += f"    developer: '{project['developer']}',\n"
            ts_code += f"    description: '{project['description']}',\n"
            ts_code += f"    status: '{project['status']}',\n"
            ts_code += f"    brochure: '{project['brochure']}',\n"
            
            # Price range
            ts_code += "    priceRange: {\n"
            if project['price_range']['min']:
                ts_code += f"      min: {project['price_range']['min']},\n"
            else:
                ts_code += "      min: null,\n"
            if project['price_range']['max']:
                ts_code += f"      max: {project['price_range']['max']},\n"
            else:
                ts_code += "      max: null,\n"
            ts_code += "    },\n"
            
            # Amenities
            if project['amenities']:
                ts_code += "    amenities: [\n"
                for amenity in project['amenities']:
                    ts_code += f"      '{amenity}',\n"
                ts_code += "    ],\n"
            else:
                ts_code += "    amenities: [],\n"
            
            # Unit types
            if project['unit_types']:
                ts_code += "    unitTypes: [\n"
                for unit in project['unit_types'][:10]:  # Limit to 10
                    ts_code += "      {\n"
                    if unit.get('type'):
                        ts_code += f"        type: '{unit['type']}',\n"
                    if unit.get('bedrooms'):
                        ts_code += f"        bedrooms: {unit['bedrooms']},\n"
                    if unit.get('area'):
                        ts_code += f"        area: '{unit['area']}',\n"
                    if unit.get('price'):
                        ts_code += f"        price: {unit['price']},\n"
                    ts_code += "      },\n"
                ts_code += "    ],\n"
            else:
                ts_code += "    unitTypes: [],\n"
            
            # Payment plan
            payment_plan = project['payment_plan']
            ts_code += "    paymentPlan: {\n"
            if payment_plan.get('down_payment'):
                ts_code += f"      downPaymentPercentage: {payment_plan['down_payment']},\n"
            if payment_plan.get('duration_months'):
                ts_code += f"      durationMonths: {payment_plan['duration_months']},\n"
            if payment_plan.get('installments'):
                ts_code += f"      totalInstallments: {len(payment_plan['installments'])},\n"
            ts_code += "    },\n"
            
            ts_code += "  },\n"
        
        ts_code += "];\n"
        return ts_code
    
    def generate_payment_plans_data(self) -> str:
        """Generate payment plan mockup data"""
        ts_code = "\n// Payment plans extracted from PDFs\n"
        ts_code += "export const extractedPaymentPlans = [\n"
        
        for project in self.projects_data:
            payment_plan = project['payment_plan']
            
            if payment_plan.get('down_payment') or payment_plan.get('installments'):
                ts_code += "  {\n"
                ts_code += f"    projectId: '{project['id']}',\n"
                ts_code += f"    projectName: '{project['name']}',\n"
                
                if payment_plan.get('down_payment'):
                    ts_code += f"    downPayment: {payment_plan['down_payment']},\n"
                
                if payment_plan.get('duration_months'):
                    ts_code += f"    durationMonths: {payment_plan['duration_months']},\n"
                
                if payment_plan.get('installments'):
                    ts_code += "    installments: [\n"
                    for inst in payment_plan['installments'][:10]:  # Limit to 10
                        ts_code += "      {\n"
                        if inst.get('number'):
                            ts_code += f"        number: {inst['number']},\n"
                        if inst.get('amount'):
                            ts_code += f"        amount: {inst['amount']},\n"
                        if inst.get('percentage'):
                            ts_code += f"        percentage: {inst['percentage']},\n"
                        ts_code += "      },\n"
                    ts_code += "    ],\n"
                
                ts_code += "  },\n"
        
        ts_code += "];\n"
        return ts_code
    
    def generate_project_offers_data(self) -> str:
        """Generate special offers data"""
        ts_code = "\n// Special offers and deals from PDFs\n"
        ts_code += "export const projectOffers = [\n"
        
        for project in self.projects_data:
            # Extract offer type from name
            offer_type = 'Standard'
            if 'ASAAN GHAR' in project['name'].upper():
                offer_type = 'Asaan Ghar Offer 2025'
            elif 'DEVELOPMENT DEAL' in project['name'].upper():
                offer_type = 'Development Deal'
            elif 'ASAAN KAROBAR' in project['name'].upper():
                offer_type = 'Asaan Karobar Deal 2025'
            
            ts_code += "  {\n"
            ts_code += f"    id: '{project['id']}_offer',\n"
            ts_code += f"    projectId: '{project['id']}',\n"
            ts_code += f"    projectName: '{project['name']}',\n"
            ts_code += f"    offerType: '{offer_type}',\n"
            ts_code += f"    brochure: '{project['brochure']}',\n"
            ts_code += "    validUntil: new Date('2025-12-31'),\n"
            ts_code += "  },\n"
        
        ts_code += "];\n"
        return ts_code
    
    def generate_all_mockdata(self):
        """Generate complete mockup data file"""
        print("\nGenerating mockup data...")
        
        # Load extracted data
        self.load_extracted_data()
        
        if not self.projects_data:
            print("No project data available to generate mockup")
            return
        
        # Generate all sections
        ts_content = self.generate_properties_data()
        ts_content += self.generate_detailed_projects_data()
        ts_content += self.generate_payment_plans_data()
        ts_content += self.generate_project_offers_data()
        
        # Save to file
        output_dir = os.path.dirname(self.output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write(ts_content)
        
        print(f"✓ Generated mockup data: {self.output_file}")
        print(f"  - {len(self.projects_data)} properties")
        print(f"  - Payment plans")
        print(f"  - Project offers")
        print(f"  - Detailed project information")


def main():
    EXTRACTED_DATA_DIR = "../src/data/extracted"
    OUTPUT_FILE = "../src/data/extractedMockData.ts"
    
    print("=" * 60)
    print("Mockup Data Generator")
    print("=" * 60)
    
    generator = MockDataGenerator(EXTRACTED_DATA_DIR, OUTPUT_FILE)
    generator.generate_all_mockdata()
    
    print("\n" + "=" * 60)
    print("Mockup Generation Complete!")
    print("=" * 60)
    print("\nTo use in your application:")
    print(f"  import {{ extractedProperties, detailedProjects }} from '@/data/extractedMockData';")


if __name__ == "__main__":
    main()

