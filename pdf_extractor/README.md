# PDF Data Extractor for ABS Developers Projects

This toolkit extracts structured data from PDF files containing project information, payment plans, offers, and development deals.

## Features

- 📄 Extract text and tables from PDF files
- 🔍 Intelligent parsing of project information
- 💰 Payment plan extraction
- 🏢 Unit details and pricing information
- 📊 Amenities and features detection
- 📝 Generate TypeScript-compatible mockup data
- 🎯 Advanced analysis with detailed reports

## Installation

1. Install Python 3.8 or higher
2. Install required packages:

```bash
cd pdf_extractor
pip install -r requirements.txt
```

## Usage

### 1. Basic Extraction

Extract data from all PDF files and generate JSON + TypeScript files:

```bash
python extract_pdf_data.py
```

**Output:**
- `../src/data/extracted/projects_data.json` - All projects in JSON format
- `../src/data/extracted/extracted_projects.ts` - TypeScript data file
- `../src/data/extracted/*.json` - Individual project files
- `../src/data/extracted/extraction_summary.json` - Summary report

### 2. Advanced Analysis

Perform deep analysis with detailed table extraction:

```bash
python advanced_analyzer.py
```

**Output:**
- `../src/data/extracted/analysis/analysis_*.json` - Individual analyses
- `../src/data/extracted/analysis/all_analyses_summary.json` - Combined report

### 3. Generate Mockup Data

Convert extracted data to application-ready TypeScript mockup:

```bash
python generate_mockdata.py
```

**Output:**
- `../src/data/extractedMockData.ts` - Ready-to-use TypeScript data

## Extracted Data Structure

### Project Data
```typescript
{
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed-use';
  location: string;
  developer: string;
  description: string;
  status: 'construction' | 'planning' | 'completed';
  priceRange: {
    min: number;
    max: number;
  };
  unitTypes: Array<{
    type: string;
    bedrooms: number;
    area: string;
    price: number;
  }>;
  amenities: string[];
  paymentPlan: {
    downPayment: number;
    durationMonths: number;
    installments: Array<{
      number: number;
      amount: number;
      percentage: number;
    }>;
  };
  brochure: string;
}
```

## PDF Files Being Processed

1. **ABS MALL & RESIDENCY 2 - ASAAN GHAR OFFER 2025.pdf**
   - Mixed-use development
   - Residential + Commercial units
   - Special financing offer

2. **ABS Mall Payment Plan.pdf**
   - Detailed payment schedules
   - Installment plans

3. **PEARL ONE CAPITAL - COMMERCIAL - ASAAN GHAR OFFER 2025.pdf**
   - Commercial office spaces
   - Special financing terms

4. **PEARL ONE CAPITAL - RESIDENTIAL - ASAAN GHAR OFFER.pdf**
   - Residential apartments
   - Multiple unit types

5. **PEARL ONE COURTYARD - DEVELOPMENT DEAL.pdf**
   - Luxury residential project
   - Early bird offers

6. **PEARL ONE PREMIUM - (DEVELOPMENT DEAL).pdf**
   - Premium apartments
   - High-end amenities

7. **POC3-ASAAN KAROBAR DEAL 2025.pdf**
   - Commercial investment opportunity
   - Business-friendly payment plans

## Integration with Your Application

### Step 1: Import Extracted Data

```typescript
// In your component or page
import { extractedProperties, detailedProjects } from '@/data/extractedMockData';
```

### Step 2: Use in Your Application

```typescript
// Display projects
const ProjectsList = () => {
  return (
    <div>
      {extractedProperties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

// Get detailed project info
const ProjectDetails = ({ projectId }) => {
  const project = detailedProjects.find(p => p.id === projectId);
  
  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <ul>
        {project.amenities.map(amenity => (
          <li key={amenity}>{amenity}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Step 3: Update TypeScript Types (Optional)

Add new interfaces to `src/types/index.ts`:

```typescript
export interface DetailedProject extends Property {
  type: 'residential' | 'commercial' | 'mixed-use';
  priceRange: {
    min: number | null;
    max: number | null;
  };
  unitTypes: UnitType[];
  amenities: string[];
  paymentPlan: PaymentPlan;
  brochure: string;
}

export interface UnitType {
  type?: string;
  bedrooms?: number;
  area?: string;
  price?: number;
}

export interface PaymentPlan {
  downPaymentPercentage?: number;
  durationMonths?: number;
  totalInstallments?: number;
  installments?: Installment[];
}

export interface Installment {
  number?: number;
  amount?: number;
  percentage?: number;
}
```

## What Gets Extracted

### ✅ Successfully Extracted
- Project names and identifiers
- Project types (Residential/Commercial/Mixed)
- Location information
- Price ranges
- Payment plan structures
- Unit types and specifications
- Amenities and features
- Contact information
- Table data (payment schedules, unit details)

### ⚠️ Limitations
- Image extraction (not implemented - PDFs are image-heavy)
- Complex nested tables might need manual review
- OCR for scanned PDFs (requires additional setup)
- Exact floor plans and detailed drawings

## Troubleshooting

### Issue: "pdfplumber not found"
```bash
pip install --upgrade pdfplumber
```

### Issue: "Permission denied"
Make sure the PDF files are not open in another application.

### Issue: "No tables extracted"
Some PDFs may have tables as images. Consider using OCR:
```bash
pip install pdf2image pytesseract
```

### Issue: "Empty output files"
Check that the PDF paths are correct in the scripts:
- `PDF_DIRECTORY = "../public/projectFiles"`
- `OUTPUT_DIRECTORY = "../src/data/extracted"`

## Customization

### Modify Extraction Patterns

Edit `extract_pdf_data.py` to adjust regex patterns:

```python
# In extract_price_info()
price_patterns = [
    r'Rs\.?\s*([\d,]+)',
    r'PKR\s*([\d,]+)',
    # Add your custom patterns here
]
```

### Add New Features

Extend the `PDFDataExtractor` class:

```python
def extract_custom_field(self, text: str) -> Any:
    # Your custom extraction logic
    pass
```

## Output Examples

### JSON Output
```json
{
  "id": "pearl_one_capital_commercial",
  "name": "Pearl One Capital - Commercial",
  "type": "commercial",
  "location": "Lahore, Pakistan",
  "developer": "ABS Developers",
  "price_range": {
    "min": 5000000,
    "max": 50000000
  },
  "amenities": [
    "24/7 Security",
    "Parking",
    "Power Backup"
  ]
}
```

### TypeScript Output
```typescript
export const extractedProperties = [
  {
    id: '10',
    name: 'Pearl One Capital - Commercial',
    location: 'Lahore, Pakistan',
    developer: 'ABS Developers',
    price: 5000000,
    completionDate: new Date('2025-12-31'),
    images: [],
    status: 'construction',
  },
];
```

## Next Steps

1. ✅ Run extraction scripts
2. ✅ Review generated JSON files
3. ✅ Import TypeScript data into your application
4. 📝 Update UI components to display new data
5. 🎨 Add images and media from `public/Commercial Projects/`
6. 🔄 Set up automated extraction for future PDFs

## Support

For issues or questions:
1. Check the generated `extraction_summary.json` for errors
2. Review the `analysis/` folder for detailed extraction reports
3. Verify PDF file paths and permissions
4. Ensure all dependencies are installed

## License

This toolkit is part of the ABS Developers project management system.

