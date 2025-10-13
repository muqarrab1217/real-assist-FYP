import pdfplumber
import json
import os
import re
from collections import defaultdict
from typing import Dict, List, Any, Tuple

class AdvancedPDFAnalyzer:
    """Advanced PDF analyzer with table detection and structured data extraction"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.filename = os.path.basename(pdf_path)
        self.text_content = ""
        self.tables = []
        self.metadata = {}
        
    def analyze(self) -> Dict[str, Any]:
        """Perform comprehensive analysis of the PDF"""
        print(f"\n{'='*60}")
        print(f"Analyzing: {self.filename}")
        print(f"{'='*60}")
        
        analysis = {
            'filename': self.filename,
            'pages': 0,
            'text_length': 0,
            'tables_found': 0,
            'payment_plans': [],
            'unit_details': [],
            'pricing_info': {},
            'project_info': {},
            'contact_info': {},
            'key_features': [],
            'raw_tables': []
        }
        
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                analysis['pages'] = len(pdf.pages)
                
                # Process each page
                for page_num, page in enumerate(pdf.pages, 1):
                    print(f"Processing page {page_num}/{len(pdf.pages)}...")
                    
                    # Extract text
                    page_text = page.extract_text() or ""
                    self.text_content += page_text
                    
                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        for table_num, table in enumerate(tables, 1):
                            print(f"  Found table {table_num} with {len(table)} rows")
                            self.tables.append({
                                'page': page_num,
                                'data': table,
                                'rows': len(table),
                                'cols': len(table[0]) if table else 0
                            })
                
                analysis['text_length'] = len(self.text_content)
                analysis['tables_found'] = len(self.tables)
                
                # Analyze content
                analysis['payment_plans'] = self._extract_payment_plans()
                analysis['unit_details'] = self._extract_unit_details()
                analysis['pricing_info'] = self._extract_pricing_info()
                analysis['project_info'] = self._extract_project_info()
                analysis['contact_info'] = self._extract_contact_info()
                analysis['key_features'] = self._extract_key_features()
                analysis['raw_tables'] = self._format_tables_for_display()
                
        except Exception as e:
            print(f"Error analyzing PDF: {str(e)}")
            analysis['error'] = str(e)
        
        return analysis
    
    def _extract_payment_plans(self) -> List[Dict[str, Any]]:
        """Extract payment plan details from tables and text"""
        payment_plans = []
        
        # Look for payment plan tables
        for table_info in self.tables:
            table = table_info['data']
            if not table or len(table) < 2:
                continue
            
            # Check if this is a payment plan table
            headers = [str(cell).lower() if cell else '' for cell in table[0]]
            is_payment_table = any(
                keyword in ' '.join(headers) 
                for keyword in ['payment', 'installment', 'schedule', 'due', 'amount']
            )
            
            if is_payment_table:
                plan = {
                    'page': table_info['page'],
                    'schedule': []
                }
                
                for row in table[1:]:
                    if row and any(row):
                        installment = {}
                        for i, cell in enumerate(row):
                            if cell:
                                # Try to identify what each cell contains
                                if re.search(r'\d+', str(cell)):
                                    if '%' in str(cell):
                                        installment['percentage'] = str(cell)
                                    elif ',' in str(cell) or len(str(cell)) > 4:
                                        installment['amount'] = str(cell)
                                    else:
                                        installment['number'] = str(cell)
                                else:
                                    installment['description'] = str(cell)
                        
                        if installment:
                            plan['schedule'].append(installment)
                
                if plan['schedule']:
                    payment_plans.append(plan)
        
        # Extract text-based payment plan info
        text_plan = {}
        
        # Down payment
        down_match = re.search(r'(\d+)%?\s*(?:down|advance|booking)', self.text_content, re.IGNORECASE)
        if down_match:
            text_plan['down_payment'] = down_match.group(1) + '%'
        
        # Monthly installments
        monthly_match = re.search(r'(\d+)\s*monthly\s*installments?', self.text_content, re.IGNORECASE)
        if monthly_match:
            text_plan['monthly_installments'] = monthly_match.group(1)
        
        # Quarterly installments
        quarterly_match = re.search(r'(\d+)\s*quarterly\s*installments?', self.text_content, re.IGNORECASE)
        if quarterly_match:
            text_plan['quarterly_installments'] = quarterly_match.group(1)
        
        if text_plan:
            payment_plans.append({'type': 'text_extracted', **text_plan})
        
        return payment_plans
    
    def _extract_unit_details(self) -> List[Dict[str, Any]]:
        """Extract unit/apartment details from tables"""
        unit_details = []
        
        for table_info in self.tables:
            table = table_info['data']
            if not table or len(table) < 2:
                continue
            
            headers = [str(cell).lower() if cell else '' for cell in table[0]]
            
            # Check if this is a unit details table
            is_unit_table = any(
                keyword in ' '.join(headers)
                for keyword in ['unit', 'apartment', 'type', 'area', 'size', 'bed', 'floor']
            )
            
            if is_unit_table:
                for row in table[1:]:
                    if row and any(row):
                        unit = {
                            'page': table_info['page'],
                            'raw_data': {}
                        }
                        
                        for i, cell in enumerate(row):
                            if cell and i < len(headers):
                                header = headers[i].strip()
                                unit['raw_data'][header] = str(cell)
                        
                        if unit['raw_data']:
                            unit_details.append(unit)
        
        return unit_details
    
    def _extract_pricing_info(self) -> Dict[str, Any]:
        """Extract all pricing information"""
        pricing = {
            'prices_found': [],
            'price_ranges': {},
            'special_offers': []
        }
        
        # Extract all prices from text
        price_patterns = [
            r'Rs\.?\s*([\d,]+)',
            r'PKR\s*([\d,]+)',
            r'(?:Price|Total|Amount)[:\s]*([\d,]+)',
        ]
        
        for pattern in price_patterns:
            matches = re.findall(pattern, self.text_content, re.IGNORECASE)
            for match in matches:
                try:
                    price = int(match.replace(',', ''))
                    if 100000 <= price <= 1000000000:  # Reasonable price range
                        pricing['prices_found'].append(price)
                except ValueError:
                    continue
        
        # Calculate price range
        if pricing['prices_found']:
            pricing['price_ranges'] = {
                'min': min(pricing['prices_found']),
                'max': max(pricing['prices_found']),
                'average': sum(pricing['prices_found']) // len(pricing['prices_found'])
            }
        
        # Look for special offers
        offer_keywords = ['discount', 'offer', 'deal', 'special', 'limited time']
        for keyword in offer_keywords:
            matches = re.finditer(rf'.{{0,50}}{keyword}.{{0,50}}', self.text_content, re.IGNORECASE)
            for match in matches:
                pricing['special_offers'].append(match.group().strip())
        
        return pricing
    
    def _extract_project_info(self) -> Dict[str, Any]:
        """Extract project information"""
        info = {
            'name': '',
            'location': '',
            'developer': 'ABS Developers',
            'type': ''
        }
        
        # Extract project name
        name_patterns = [
            'PEARL ONE CAPITAL',
            'PEARL ONE COURTYARD',
            'PEARL ONE PREMIUM',
            'ABS MALL',
            'BURJ QUAID'
        ]
        
        for pattern in name_patterns:
            if pattern in self.text_content.upper():
                info['name'] = pattern.title()
                break
        
        if not info['name']:
            info['name'] = self.filename.replace('.pdf', '').replace('_', ' ')
        
        # Determine type
        if 'COMMERCIAL' in self.text_content.upper():
            info['type'] = 'Commercial'
        elif 'RESIDENTIAL' in self.text_content.upper():
            info['type'] = 'Residential'
        else:
            info['type'] = 'Mixed-Use'
        
        # Extract location
        location_match = re.search(r'(?:located in|at|near)\s+([A-Za-z\s,]+?)(?:\.|,|\n)', self.text_content, re.IGNORECASE)
        if location_match:
            info['location'] = location_match.group(1).strip()
        else:
            info['location'] = 'Lahore, Pakistan'
        
        return info
    
    def _extract_contact_info(self) -> Dict[str, Any]:
        """Extract contact information"""
        contact = {
            'phones': [],
            'emails': [],
            'website': '',
            'address': ''
        }
        
        # Phone numbers
        phone_patterns = [
            r'\+92[- ]?\d{3}[- ]?\d{7}',
            r'\d{4}[- ]?\d{7}',
            r'\d{3}[- ]?\d{3}[- ]?\d{4}'
        ]
        
        for pattern in phone_patterns:
            matches = re.findall(pattern, self.text_content)
            contact['phones'].extend(matches)
        
        # Emails
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        contact['emails'] = re.findall(email_pattern, self.text_content)
        
        # Website
        website_pattern = r'(?:www\.|https?://)[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
        websites = re.findall(website_pattern, self.text_content)
        if websites:
            contact['website'] = websites[0]
        
        return contact
    
    def _extract_key_features(self) -> List[str]:
        """Extract key features and amenities"""
        features = []
        
        # Common feature keywords
        feature_keywords = [
            'swimming pool', 'gym', 'fitness', 'parking', 'security',
            'elevator', 'cctv', 'backup', 'generator', 'water',
            'mosque', 'playground', 'garden', 'park', 'community',
            'shopping', 'restaurant', 'cafe', 'cinema', 'sports'
        ]
        
        text_lower = self.text_content.lower()
        for keyword in feature_keywords:
            if keyword in text_lower:
                # Get context around the keyword
                pattern = rf'.{{0,30}}{keyword}.{{0,30}}'
                matches = re.findall(pattern, text_lower)
                if matches:
                    features.append(matches[0].strip())
        
        return list(set(features))
    
    def _format_tables_for_display(self) -> List[Dict[str, Any]]:
        """Format tables for easy viewing"""
        formatted = []
        
        for i, table_info in enumerate(self.tables[:5], 1):  # Limit to first 5 tables
            table = table_info['data']
            formatted_table = {
                'table_number': i,
                'page': table_info['page'],
                'rows': table_info['rows'],
                'cols': table_info['cols'],
                'data': []
            }
            
            # Format each row
            for row in table[:10]:  # Limit to first 10 rows
                if row:
                    formatted_row = [str(cell) if cell else '' for cell in row]
                    formatted_table['data'].append(formatted_row)
            
            formatted.append(formatted_table)
        
        return formatted
    
    def save_analysis(self, output_dir: str):
        """Save analysis results to JSON"""
        os.makedirs(output_dir, exist_ok=True)
        
        analysis = self.analyze()
        
        output_file = os.path.join(
            output_dir,
            f"analysis_{self.filename.replace('.pdf', '')}.json"
        )
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Analysis saved to: {output_file}")
        return output_file


def analyze_all_pdfs(pdf_directory: str, output_directory: str):
    """Analyze all PDFs in a directory"""
    pdf_files = [f for f in os.listdir(pdf_directory) if f.endswith('.pdf')]
    
    print(f"\n{'='*60}")
    print(f"Advanced PDF Analysis")
    print(f"Found {len(pdf_files)} PDF files")
    print(f"{'='*60}")
    
    all_analyses = []
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_directory, pdf_file)
        analyzer = AdvancedPDFAnalyzer(pdf_path)
        analysis = analyzer.analyze()
        all_analyses.append(analysis)
        
        # Save individual analysis
        analyzer.save_analysis(output_directory)
    
    # Save combined summary
    summary_file = os.path.join(output_directory, 'all_analyses_summary.json')
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(all_analyses, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ All analyses saved to: {output_directory}")
    print(f"✓ Combined summary: {summary_file}")


if __name__ == "__main__":
    PDF_DIRECTORY = "../public/projectFiles"
    OUTPUT_DIRECTORY = "../src/data/extracted/analysis"
    
    if os.path.exists(PDF_DIRECTORY):
        analyze_all_pdfs(PDF_DIRECTORY, OUTPUT_DIRECTORY)
    else:
        print(f"Error: PDF directory not found at {PDF_DIRECTORY}")

