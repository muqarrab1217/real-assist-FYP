#!/bin/bash

echo "============================================================"
echo "PDF Data Extractor for ABS Developers Projects"
echo "============================================================"
echo ""

echo "Installing dependencies..."
pip install -r requirements.txt
echo ""

echo "Running extraction..."
python extract_pdf_data.py
echo ""

echo "Running advanced analysis..."
python advanced_analyzer.py
echo ""

echo "Generating mockup data..."
python generate_mockdata.py
echo ""

echo "============================================================"
echo "Extraction Complete!"
echo "============================================================"
echo ""
echo "Output files:"
echo "  - src/data/extracted/projects_data.json"
echo "  - src/data/extracted/extracted_projects.ts"
echo "  - src/data/extractedMockData.ts"
echo "  - src/data/extracted/analysis/"
echo ""

