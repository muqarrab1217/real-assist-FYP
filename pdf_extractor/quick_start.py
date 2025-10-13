#!/usr/bin/env python3
"""
Quick Start Script - One-command extraction
Runs all extraction and analysis tools in sequence
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print("\n" + "="*60)
    print(f"→ {description}")
    print("="*60)
    
    try:
        result = subprocess.run(
            [sys.executable, command],
            capture_output=False,
            text=True,
            check=True
        )
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error in {description}")
        print(f"  {str(e)}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error in {description}")
        print(f"  {str(e)}")
        return False

def main():
    print("="*60)
    print("🚀 Quick Start - PDF Data Extraction")
    print("="*60)
    print("\nThis will run all extraction tools automatically:")
    print("  1. Basic extraction (extract_pdf_data.py)")
    print("  2. Advanced analysis (advanced_analyzer.py)")
    print("  3. Mockup data generation (generate_mockdata.py)")
    
    # Check if PDF directory exists
    pdf_dir = "../public/projectFiles"
    if not os.path.exists(pdf_dir):
        print(f"\n⚠️  Warning: PDF directory not found at {pdf_dir}")
        print("   Please ensure the PDFs are in the correct location.")
        return
    
    pdf_count = len([f for f in os.listdir(pdf_dir) if f.endswith('.pdf')])
    print(f"\n📁 Found {pdf_count} PDF files to process")
    
    input("\nPress Enter to continue...")
    
    # Run all tools
    success = True
    
    success = run_command("extract_pdf_data.py", "Basic Data Extraction") and success
    success = run_command("advanced_analyzer.py", "Advanced Analysis") and success
    success = run_command("generate_mockdata.py", "Mockup Data Generation") and success
    
    print("\n" + "="*60)
    if success:
        print("✓ All extraction tasks completed successfully!")
    else:
        print("⚠️  Some tasks encountered errors")
    print("="*60)
    
    print("\n📂 Output files created:")
    print("  - src/data/extracted/projects_data.json")
    print("  - src/data/extracted/extracted_projects.ts")
    print("  - src/data/extractedMockData.ts")
    print("  - src/data/extracted/analysis/")
    
    print("\n📖 Next steps:")
    print("  1. Review the extracted data in src/data/extracted/")
    print("  2. Import the data in your React components:")
    print("     import { extractedProperties } from '@/data/extractedMockData';")
    print("  3. Check the README.md for usage examples")

if __name__ == "__main__":
    main()

