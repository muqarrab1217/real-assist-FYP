import pdfplumber
import json
import os
import re
from datetime import datetime
from typing import Dict, List, Any

class PDFDataExtractor:
    def __init__(self, pdf_directory: str, output_directory: str):
        self.pdf_directory = pdf_directory
        self.output_directory = output_directory
        self.extracted_data = {
            'properties': [],
            'payment_plans': [],
            'offers': [],
            'projects': []
        }
        
        # Create output directory if it doesn't exist
        os.makedirs(output_directory, exist_ok=True)
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract all text from a PDF file"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {str(e)}")
        return text
    
    def extract_tables_from_pdf(self, pdf_path: str) -> List[List[List[str]]]:
        """Extract all tables from a PDF file"""
        all_tables = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    tables = page.extract_tables()
                    if tables:
                        all_tables.extend(tables)
        except Exception as e:
            print(f"Error extracting tables from {pdf_path}: {str(e)}")
        return all_tables
    
    def parse_project_name(self, filename: str, text: str) -> str:
        """Extract project name from filename or text"""
        # Remove file extension and clean up
        name = filename.replace('.pdf', '').replace('_', ' ').strip()
        
        # Try to extract project name from common patterns
        if 'PEARL ONE CAPITAL' in name.upper() or 'PEARL ONE CAPITAL' in text.upper():
            if 'COMMERCIAL' in name.upper():
                return 'Pearl One Capital - Commercial'
            elif 'RESIDENTIAL' in name.upper():
                return 'Pearl One Capital - Residential'
            return 'Pearl One Capital'
        elif 'PEARL ONE COURTYARD' in name.upper() or 'POC' in name.upper():
            return 'Pearl One Courtyard'
        elif 'PEARL ONE PREMIUM' in name.upper():
            return 'Pearl One Premium'
        elif 'ABS MALL' in name.upper():
            if 'RESIDENCY' in name.upper():
                return 'ABS Mall & Residency'
            return 'ABS Mall'
        elif 'BURJ QUAID' in name.upper():
            return 'Burj Quaid'
        
        return name
    
    def extract_price_info(self, text: str, tables: List[List[List[str]]]) -> Dict[str, Any]:
        """Extract pricing information from text and tables"""
        prices = {
            'min_price': None,
            'max_price': None,
            'unit_prices': [],
            'payment_terms': []
        }
        
        # Extract prices from text using regex
        # Look for patterns like "Rs. 1,234,567" or "PKR 1,234,567"
        price_patterns = [
            r'Rs\.?\s*([\d,]+)',
            r'PKR\s*([\d,]+)',
            r'(?:Price|Total|Amount)[:\s]+([\d,]+)',
        ]
        
        found_prices = []
        for pattern in price_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    price = int(match.replace(',', ''))
                    if price > 100000:  # Filter out small numbers
                        found_prices.append(price)
                except ValueError:
                    continue
        
        if found_prices:
            prices['min_price'] = min(found_prices)
            prices['max_price'] = max(found_prices)
        
        # Extract unit prices from tables
        for table in tables:
            if table:
                for row in table:
                    if row and len(row) > 1:
                        for cell in row:
                            if cell and isinstance(cell, str):
                                # Look for price-like values
                                matches = re.findall(r'([\d,]+)', cell)
                                for match in matches:
                                    try:
                                        price = int(match.replace(',', ''))
                                        if 1000000 <= price <= 100000000:
                                            prices['unit_prices'].append(price)
                                    except ValueError:
                                        continue
        
        return prices
    
    def extract_payment_plan(self, text: str, tables: List[List[List[str]]]) -> Dict[str, Any]:
        """Extract payment plan details"""
        payment_plan = {
            'down_payment': None,
            'installments': [],
            'duration_months': None,
            'monthly_amount': None,
            'quarterly_amount': None
        }
        
        # Look for down payment percentage
        down_payment_match = re.search(r'(\d+)%\s*(?:down|advance|booking)', text, re.IGNORECASE)
        if down_payment_match:
            payment_plan['down_payment'] = int(down_payment_match.group(1))
        
        # Look for installment information
        installment_matches = re.findall(r'(\d+)\s*(?:monthly|quarterly|installments?)', text, re.IGNORECASE)
        for match in installment_matches:
            try:
                payment_plan['duration_months'] = int(match)
            except ValueError:
                continue
        
        # Extract payment schedule from tables
        for table in tables:
            if table and len(table) > 0:
                # Check if this looks like a payment schedule table
                headers = [str(cell).lower() if cell else '' for cell in table[0]]
                if any(keyword in ' '.join(headers) for keyword in ['installment', 'payment', 'amount', 'date']):
                    for row in table[1:]:
                        if row and len(row) >= 2:
                            installment = {
                                'number': None,
                                'amount': None,
                                'percentage': None
                            }
                            
                            for cell in row:
                                if cell:
                                    # Try to extract amount
                                    amount_match = re.search(r'([\d,]+)', str(cell))
                                    if amount_match:
                                        try:
                                            amount = int(amount_match.group(1).replace(',', ''))
                                            if amount > 10000:
                                                installment['amount'] = amount
                                        except ValueError:
                                            pass
                                    
                                    # Try to extract percentage
                                    percent_match = re.search(r'(\d+)%', str(cell))
                                    if percent_match:
                                        installment['percentage'] = int(percent_match.group(1))
                            
                            if installment['amount'] or installment['percentage']:
                                payment_plan['installments'].append(installment)
        
        return payment_plan
    
    def extract_unit_types(self, text: str, tables: List[List[List[str]]]) -> List[Dict[str, Any]]:
        """Extract different unit types and their details"""
        unit_types = []
        
        # Common unit type patterns
        unit_patterns = [
            r'(\d+)\s*(?:BED|BEDROOM|BR)',
            r'STUDIO',
            r'APARTMENT',
            r'SHOP',
            r'OFFICE',
            r'COMMERCIAL',
            r'PENTHOUSE'
        ]
        
        found_units = set()
        for pattern in unit_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            found_units.update(matches)
        
        # Extract unit details from tables
        for table in tables:
            if table and len(table) > 1:
                headers = [str(cell).lower() if cell else '' for cell in table[0]]
                
                # Check if this is a unit specification table
                if any(keyword in ' '.join(headers) for keyword in ['unit', 'type', 'area', 'size', 'bedroom']):
                    for row in table[1:]:
                        if row and len(row) >= 2:
                            unit = {
                                'type': None,
                                'area': None,
                                'bedrooms': None,
                                'price': None
                            }
                            
                            for i, cell in enumerate(row):
                                if cell and isinstance(cell, str):
                                    # Check for bedroom count
                                    bed_match = re.search(r'(\d+)\s*(?:BED|BR)', cell, re.IGNORECASE)
                                    if bed_match:
                                        unit['bedrooms'] = int(bed_match.group(1))
                                        unit['type'] = cell.strip()
                                    
                                    # Check for area
                                    area_match = re.search(r'(\d+(?:,\d+)?)\s*(?:sq\.?\s*ft|sqft|marla)', cell, re.IGNORECASE)
                                    if area_match:
                                        unit['area'] = area_match.group(1).replace(',', '')
                                    
                                    # Check for price
                                    price_match = re.search(r'([\d,]+)', cell)
                                    if price_match:
                                        try:
                                            price = int(price_match.group(1).replace(',', ''))
                                            if price > 1000000:
                                                unit['price'] = price
                                        except ValueError:
                                            pass
                            
                            if any(unit.values()):
                                unit_types.append(unit)
        
        return unit_types
    
    def extract_amenities(self, text: str) -> List[str]:
        """Extract amenities from text"""
        amenities = []
        
        # Common amenities keywords
        amenity_keywords = [
            'swimming pool', 'gym', 'fitness center', 'parking', 'security',
            'playground', 'garden', 'elevator', 'lift', 'cctv', 'community center',
            'mosque', 'shopping', 'restaurant', 'cafe', 'school', 'hospital',
            'park', 'jogging track', 'sports', 'cinema', 'lobby', 'reception',
            'backup generator', 'water supply', 'internet', 'cable tv'
        ]
        
        text_lower = text.lower()
        for keyword in amenity_keywords:
            if keyword in text_lower:
                amenities.append(keyword.title())
        
        return list(set(amenities))
    
    def extract_location(self, text: str) -> str:
        """Extract location information"""
        # Common location patterns for Lahore
        location_patterns = [
            r'(?:located in|situated in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'Lahore',
            r'Main Boulevard',
            r'DHA',
            r'Gulberg',
            r'Johar Town',
            r'Bahria Town'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return 'Lahore, Pakistan'
    
    def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Process a single PDF file and extract all relevant information"""
        filename = os.path.basename(pdf_path)
        print(f"\nProcessing: {filename}")
        
        # Extract text and tables
        text = self.extract_text_from_pdf(pdf_path)
        tables = self.extract_tables_from_pdf(pdf_path)
        
        # Parse all information
        project_name = self.parse_project_name(filename, text)
        price_info = self.extract_price_info(text, tables)
        payment_plan = self.extract_payment_plan(text, tables)
        unit_types = self.extract_unit_types(text, tables)
        amenities = self.extract_amenities(text)
        location = self.extract_location(text)
        
        # Determine project type
        project_type = 'residential'
        if 'COMMERCIAL' in filename.upper() or 'MALL' in filename.upper() or 'SHOP' in text.upper():
            project_type = 'commercial'
        elif 'MIXED' in text.upper():
            project_type = 'mixed-use'
        
        # Create structured data
        project_data = {
            'id': filename.replace('.pdf', '').replace(' ', '_').lower(),
            'name': project_name,
            'type': project_type,
            'location': location,
            'developer': 'ABS Developers',
            'description': f"Premium {project_type} project in {location}",
            'status': 'construction',
            'price_range': {
                'min': price_info['min_price'],
                'max': price_info['max_price']
            },
            'unit_types': unit_types,
            'amenities': amenities,
            'payment_plan': payment_plan,
            'images': [],
            'brochure': f'/projectFiles/{filename}',
            'raw_text_sample': text[:500] if text else '',
            'total_tables_extracted': len(tables)
        }
        
        return project_data
    
    def process_all_pdfs(self):
        """Process all PDF files in the directory"""
        pdf_files = [f for f in os.listdir(self.pdf_directory) if f.endswith('.pdf')]
        
        print(f"Found {len(pdf_files)} PDF files to process")
        
        for pdf_file in pdf_files:
            pdf_path = os.path.join(self.pdf_directory, pdf_file)
            project_data = self.process_pdf(pdf_path)
            self.extracted_data['projects'].append(project_data)
        
        print(f"\n✓ Processed {len(pdf_files)} PDF files successfully")
    
    def save_to_json(self):
        """Save extracted data to JSON files"""
        # Save all projects data
        projects_file = os.path.join(self.output_directory, 'projects_data.json')
        with open(projects_file, 'w', encoding='utf-8') as f:
            json.dump(self.extracted_data['projects'], f, indent=2, ensure_ascii=False)
        print(f"\n✓ Saved projects data to: {projects_file}")
        
        # Save individual project files
        for project in self.extracted_data['projects']:
            project_file = os.path.join(self.output_directory, f"{project['id']}.json")
            with open(project_file, 'w', encoding='utf-8') as f:
                json.dump(project, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved {len(self.extracted_data['projects'])} individual project files")
        
        # Create a summary file
        summary = {
            'total_projects': len(self.extracted_data['projects']),
            'extraction_date': datetime.now().isoformat(),
            'projects': [
                {
                    'id': p['id'],
                    'name': p['name'],
                    'type': p['type'],
                    'location': p['location']
                }
                for p in self.extracted_data['projects']
            ]
        }
        
        summary_file = os.path.join(self.output_directory, 'extraction_summary.json')
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"✓ Saved extraction summary to: {summary_file}")
    
    def generate_typescript_data(self):
        """Generate TypeScript data file compatible with the app"""
        ts_content = "// Auto-generated from PDF extraction\n"
        ts_content += "// Generated on: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n\n"
        
        # Generate Property interface data
        ts_content += "export const extractedProjects = [\n"
        
        for i, project in enumerate(self.extracted_data['projects']):
            ts_content += "  {\n"
            ts_content += f"    id: '{project['id']}',\n"
            ts_content += f"    name: '{project['name']}',\n"
            ts_content += f"    location: '{project['location']}',\n"
            ts_content += f"    developer: '{project['developer']}',\n"
            ts_content += f"    type: '{project['type']}',\n"
            
            if project['price_range']['min']:
                ts_content += f"    minPrice: {project['price_range']['min']},\n"
            if project['price_range']['max']:
                ts_content += f"    maxPrice: {project['price_range']['max']},\n"
            
            ts_content += f"    status: '{project['status']}' as const,\n"
            ts_content += f"    description: '{project['description']}',\n"
            ts_content += f"    brochure: '{project['brochure']}',\n"
            
            # Amenities
            if project['amenities']:
                ts_content += "    amenities: [\n"
                for amenity in project['amenities']:
                    ts_content += f"      '{amenity}',\n"
                ts_content += "    ],\n"
            
            # Unit types
            if project['unit_types']:
                ts_content += "    unitTypes: [\n"
                for unit in project['unit_types'][:5]:  # Limit to first 5
                    ts_content += "      {\n"
                    if unit['type']:
                        ts_content += f"        type: '{unit['type']}',\n"
                    if unit['bedrooms']:
                        ts_content += f"        bedrooms: {unit['bedrooms']},\n"
                    if unit['area']:
                        ts_content += f"        area: '{unit['area']}',\n"
                    if unit['price']:
                        ts_content += f"        price: {unit['price']},\n"
                    ts_content += "      },\n"
                ts_content += "    ],\n"
            
            # Payment plan
            if project['payment_plan']['down_payment']:
                ts_content += "    paymentPlan: {\n"
                ts_content += f"      downPayment: {project['payment_plan']['down_payment']},\n"
                if project['payment_plan']['duration_months']:
                    ts_content += f"      durationMonths: {project['payment_plan']['duration_months']},\n"
                ts_content += "    },\n"
            
            ts_content += "    images: [],\n"
            
            ts_content += "  }"
            if i < len(self.extracted_data['projects']) - 1:
                ts_content += ","
            ts_content += "\n"
        
        ts_content += "];\n"
        
        # Save TypeScript file
        ts_file = os.path.join(self.output_directory, 'extracted_projects.ts')
        with open(ts_file, 'w', encoding='utf-8') as f:
            f.write(ts_content)
        print(f"✓ Generated TypeScript file: {ts_file}")


def main():
    # Configuration
    PDF_DIRECTORY = "../public/projectFiles"
    OUTPUT_DIRECTORY = "../src/data/extracted"
    
    print("=" * 60)
    print("PDF Data Extractor for ABS Developers Projects")
    print("=" * 60)
    
    # Check if PDF directory exists
    if not os.path.exists(PDF_DIRECTORY):
        print(f"Error: PDF directory not found at {PDF_DIRECTORY}")
        return
    
    # Create extractor instance
    extractor = PDFDataExtractor(PDF_DIRECTORY, OUTPUT_DIRECTORY)
    
    # Process all PDFs
    extractor.process_all_pdfs()
    
    # Save results
    extractor.save_to_json()
    extractor.generate_typescript_data()
    
    print("\n" + "=" * 60)
    print("Extraction Complete!")
    print("=" * 60)
    print(f"\nOutput directory: {OUTPUT_DIRECTORY}")
    print(f"Total projects extracted: {len(extractor.extracted_data['projects'])}")
    print("\nNext steps:")
    print("1. Review the extracted data in the output directory")
    print("2. Import the TypeScript file in your application")
    print("3. Map the extracted data to your existing interfaces")


if __name__ == "__main__":
    main()

