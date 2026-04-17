import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import * as XLSX from 'xlsx';
import { Lead } from '@/types';

// Lazy-load pdfjs-dist to avoid bundling the heavy worker synchronously
let pdfjsLib: typeof import('pdfjs-dist') | null = null;
async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
}

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Partial<Lead>) => Promise<void>;
  onBulkAddLeads: (leads: Partial<Lead>[]) => Promise<void>;
}

type TabType = 'manual' | 'import';

// ─── Data cleaning helpers ───────────────────────────────────────────────────

function cleanName(name: string): string {
  // Remove superscript unicode characters (common in copied PDF text)
  return name.replace(/[\u00B2\u00B3\u00B9\u2070-\u2079\u2080-\u2089\u00AA\u00BA]/g, '').trim();
}

function cleanPhone(phone: string): string {
  // Strip leading "p:" prefix used in some CRM exports
  return phone.replace(/^p:/i, '').trim();
}

function cleanBudget(budget: string): string {
  // "1_crore" → "1 Crore", "1.5_crore" → "1.5 Crore"
  return budget
    .replace(/_/g, ' ')
    .replace(/\b(\w)/g, (c) => c.toUpperCase())
    .trim();
}

// ─── Row → Lead mapper ───────────────────────────────────────────────────────

function mapRowsToLeads(rows: Record<string, any>[]): Partial<Lead>[] {
  return rows
    .map((row) => {
      const getCol = (...names: string[]): string => {
        for (const name of names) {
          const key = Object.keys(row).find(
            (k) => k.trim().toUpperCase() === name.toUpperCase()
          );
          if (key !== undefined && String(row[key]).trim() !== '') {
            return String(row[key]).trim();
          }
        }
        return '';
      };

      const name   = cleanName(getCol('NAME'));
      const phone  = cleanPhone(getCol('PHONE'));
      const email  = getCol('EMAIL');
      const budget = cleanBudget(getCol('BUDGET'));
      const required = getCol('REQUIRED');
      const country  = getCol('COUNTRY');
      const whatsapp = getCol('WHATSAPP');

      if (!name && !phone && !email) return null;

      const extraNotes: string[] = [];
      if (budget)   extraNotes.push(`Budget: ${budget}`);
      if (required) extraNotes.push(`Interested In: ${required}`);
      if (country)  extraNotes.push(`Country: ${country}`);
      if (whatsapp && whatsapp.toLowerCase() !== 'yes') {
        extraNotes.push(`WhatsApp: ${whatsapp}`);
      }

      return {
        name: name || 'Unknown',
        phone: phone || undefined,
        email: email || undefined,
        notes: extraNotes.join('\n') || undefined,
        status: 'cold' as Lead['status'],
        source: 'pdf_import',
        classificationSource: 'manual',
      } satisfies Partial<Lead>;
    })
    .filter((l): l is Partial<Lead> => l !== null && !!l.name);
}

// ─── PDF text extractor ──────────────────────────────────────────────────────

const EXPECTED_HEADERS = ['REQUIRED', 'BUDGET', 'WHATSAPP', 'NAME', 'PHONE', 'EMAIL', 'COUNTRY'];

async function extractLeadsFromPDF(file: File): Promise<Partial<Lead>[]> {
  const pdfjs = await getPdfjsLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const allRows: string[][] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group text items by rounded y-coordinate (3-pixel buckets)
    const rowMap = new Map<number, { x: number; text: string }[]>();
    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        const y = Math.round((item as any).transform[5] / 3) * 3;
        if (!rowMap.has(y)) rowMap.set(y, []);
        rowMap.get(y)!.push({ x: (item as any).transform[4], text: item.str });
      }
    }

    // Sort rows top-to-bottom (higher y = higher on PDF page)
    const sortedY = Array.from(rowMap.keys()).sort((a, b) => b - a);
    for (const y of sortedY) {
      const cells = rowMap.get(y)!.sort((a, b) => a.x - b.x);
      const rowTexts = cells.map((c) => c.text).filter((t) => t.trim());
      if (rowTexts.length > 0) allRows.push(rowTexts);
    }
  }

  if (allRows.length === 0) {
    throw new Error('No text found in PDF. Make sure the PDF is not a scanned image.');
  }

  // Detect header row (must contain at least 4 of the expected column names)
  let headerRowIdx = -1;
  for (let i = 0; i < allRows.length; i++) {
    const joined = allRows[i].join(' ').toUpperCase();
    const matchCount = EXPECTED_HEADERS.filter((h) => joined.includes(h)).length;
    if (matchCount >= 4) {
      headerRowIdx = i;
      break;
    }
  }

  let headers: string[];
  let dataStartIdx: number;

  if (headerRowIdx !== -1) {
    headers = allRows[headerRowIdx].map((h) => h.toUpperCase().trim());
    dataStartIdx = headerRowIdx + 1;
  } else {
    // Fall back to assumed standard order
    headers = EXPECTED_HEADERS;
    dataStartIdx = 0;
  }

  const dataRows: Record<string, any>[] = [];
  for (let i = dataStartIdx; i < allRows.length; i++) {
    const cells = allRows[i];
    if (cells.length === 0) continue;
    const row: Record<string, any> = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx] ?? '';
    });
    dataRows.push(row);
  }

  const leads = mapRowsToLeads(dataRows);
  if (leads.length === 0) {
    throw new Error('Could not match any leads from the PDF. Check column names.');
  }
  return leads;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
  onBulkAddLeads,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('manual');

  // Manual form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'cold' as Lead['status'],
    source: 'manual',
    budget: '',
    interestedIn: '',
    country: '',
    notes: '',
    whatsapp: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Import state
  const [parsedLeads, setParsedLeads] = useState<Partial<Lead>[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFormData({
      name: '', phone: '', email: '', status: 'cold', source: 'manual',
      budget: '', interestedIn: '', country: '', notes: '', whatsapp: '',
    });
    setFormError('');
    setParsedLeads([]);
    setImportFileName('');
    setImportError('');
    setImportSuccess(false);
    setParsingFile(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // ── Manual submit ──────────────────────────────────────────────────────────

  const handleManualSubmit = async () => {
    if (!formData.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    setFormSubmitting(true);
    setFormError('');
    try {
      const extraNotes: string[] = [];
      if (formData.budget)     extraNotes.push(`Budget: ${cleanBudget(formData.budget)}`);
      if (formData.interestedIn) extraNotes.push(`Interested In: ${formData.interestedIn}`);
      if (formData.country)    extraNotes.push(`Country: ${formData.country}`);
      if (formData.whatsapp)   extraNotes.push(`WhatsApp: ${formData.whatsapp}`);
      if (formData.notes)      extraNotes.push(formData.notes);

      const lead: Partial<Lead> = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        status: formData.status,
        source: formData.source,
        notes: extraNotes.join('\n') || undefined,
        classificationSource: 'manual',
      };
      await onAddLead(lead);
      handleClose();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to add lead.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── File upload handler ────────────────────────────────────────────────────

  const parseExcelOrCSV = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        if (rows.length === 0) {
          setImportError('No data found in file.');
          setParsingFile(false);
          return;
        }

        const leads = mapRowsToLeads(rows);
        setParsedLeads(leads);
        setImportError(leads.length === 0 ? 'No valid leads found. Check column names.' : '');
      } catch {
        setImportError('Failed to parse file. Please check the format.');
      } finally {
        setParsingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setParsedLeads([]);
    setImportError('');
    setImportSuccess(false);
    setParsingFile(true);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      try {
        const leads = await extractLeadsFromPDF(file);
        setParsedLeads(leads);
        setImportError('');
      } catch (err: any) {
        setImportError(err?.message || 'Failed to parse PDF.');
      } finally {
        setParsingFile(false);
      }
    } else if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
      parseExcelOrCSV(file);
    } else {
      setImportError('Unsupported file type. Please use PDF, Excel (.xlsx), or CSV.');
      setParsingFile(false);
    }

    // Reset file input so the same file can be re-selected
    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleBulkImport = async () => {
    if (parsedLeads.length === 0) return;
    setImporting(true);
    try {
      await onBulkAddLeads(parsedLeads);
      setImportSuccess(true);
      setParsedLeads([]);
      setImportFileName('');
    } catch (err: any) {
      setImportError(err?.message || 'Failed to import leads.');
    } finally {
      setImporting(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const inputClass =
    'w-full bg-[#141414] border border-[rgba(212,175,55,0.25)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[rgba(212,175,55,0.5)] transition-colors placeholder-gray-600';
  const labelClass = 'text-xs uppercase tracking-widest font-bold mb-1 block' as const;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-3xl border border-[rgba(212,175,55,0.2)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[rgba(212,175,55,0.1)] bg-gradient-to-r from-[rgba(212,175,55,0.08)] to-transparent">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    Add <span style={{ color: '#d4af37' }}>Lead</span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Create a lead manually or import from a file
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-[rgba(212,175,55,0.1)] text-gray-400 hover:text-[#d4af37] transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-[#141414] rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'manual' ? 'text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                  style={
                    activeTab === 'manual'
                      ? { background: 'linear-gradient(135deg, #d4af37, #f4e68c)' }
                      : {}
                  }
                >
                  <UserIcon className="h-4 w-4" /> Manual Entry
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'import' ? 'text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                  style={
                    activeTab === 'import'
                      ? { background: 'linear-gradient(135deg, #d4af37, #f4e68c)' }
                      : {}
                  }
                >
                  <ArrowUpTrayIcon className="h-4 w-4" /> Import File
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* ── Manual Entry Tab ──────────────────────────────────────── */}
              {activeTab === 'manual' && (
                <div className="space-y-4 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        className={inputClass}
                        placeholder="e.g., Ahmed Khan"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        className={inputClass}
                        placeholder="+92 300 0000000"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className={inputClass}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>WhatsApp</label>
                      <input
                        type="text"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData((p) => ({ ...p, whatsapp: e.target.value }))}
                        className={inputClass}
                        placeholder="+92 300 0000000 (if different)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>Status</label>
                      <CustomDropdown
                        value={formData.status}
                        onChange={(v) => setFormData((p) => ({ ...p, status: v as Lead['status'] }))}
                        options={[
                          { label: 'Hot', value: 'hot' },
                          { label: 'Cold', value: 'cold' },
                          { label: 'Dead', value: 'dead' },
                        ]}
                        placeholder="Select status"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>Source</label>
                      <CustomDropdown
                        value={formData.source}
                        onChange={(v) => setFormData((p) => ({ ...p, source: v }))}
                        options={[
                          { label: 'Manual', value: 'manual' },
                          { label: 'WhatsApp', value: 'whatsapp' },
                          { label: 'Website', value: 'website' },
                          { label: 'Referral', value: 'referral' },
                          { label: 'Social Media', value: 'social_media' },
                          { label: 'Walk In', value: 'walk_in' },
                        ]}
                        placeholder="Select source"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>Interested In</label>
                      <CustomDropdown
                        value={formData.interestedIn}
                        onChange={(v) => setFormData((p) => ({ ...p, interestedIn: v }))}
                        options={[
                          { label: '— Not Specified —', value: '' },
                          { label: 'Apartment', value: 'apartment' },
                          { label: 'Commercial Shop', value: 'commercial_shop' },
                          { label: 'Commercial Outlet', value: 'commercial_outlet' },
                          { label: '1-Bed', value: '1-bed' },
                          { label: '2-Bed', value: '2-bed' },
                          { label: '3-Bed', value: '3-bed' },
                          { label: 'Penthouse', value: 'penthouse' },
                        ]}
                        placeholder="Property type interest"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: '#d4af37' }}>Budget</label>
                      <CustomDropdown
                        value={formData.budget}
                        onChange={(v) => setFormData((p) => ({ ...p, budget: v }))}
                        options={[
                          { label: '— Not Specified —', value: '' },
                          { label: '50 Lakh', value: '50_lakh' },
                          { label: '1 Crore', value: '1_crore' },
                          { label: '1.5 Crore', value: '1.5_crore' },
                          { label: '2 Crore', value: '2_crore' },
                          { label: '3 Crore', value: '3_crore' },
                          { label: '3+ Crore', value: '3plus_crore' },
                        ]}
                        placeholder="Budget range"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} style={{ color: '#d4af37' }}>Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                      className={inputClass}
                      placeholder="e.g., PK, US, UK"
                    />
                  </div>

                  <div>
                    <label className={labelClass} style={{ color: '#d4af37' }}>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                      className={`${inputClass} h-24 resize-none`}
                      placeholder="Any additional notes about this lead..."
                    />
                  </div>

                  {formError && <p className="text-red-400 text-sm">{formError}</p>}
                </div>
              )}

              {/* ── Import Tab ────────────────────────────────────────────── */}
              {activeTab === 'import' && (
                <div className="space-y-5 text-white">
                  {importSuccess ? (
                    <div className="flex flex-col items-center gap-3 py-10">
                      <CheckCircleIcon className="h-16 w-16 text-green-400" />
                      <p className="text-xl font-bold text-white">Import Successful!</p>
                      <p className="text-gray-400 text-sm text-center">
                        All leads have been added to the database.
                      </p>
                      <Button
                        onClick={() => {
                          setImportSuccess(false);
                          setImportFileName('');
                        }}
                        className="mt-2 font-bold"
                        style={{ background: 'linear-gradient(135deg, #d4af37, #f4e68c)', color: '#000' }}
                      >
                        Import More
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400">
                        Upload a{' '}
                        <span style={{ color: '#d4af37' }}>PDF, Excel (.xlsx)</span>, or{' '}
                        <span style={{ color: '#d4af37' }}>CSV</span> file containing leads.
                        <br />
                        <span className="text-xs">
                          Required columns:{' '}
                          <code className="bg-[#141414] px-1 rounded text-white">NAME, PHONE, EMAIL</code>
                          {'  '}— Optional:{' '}
                          <code className="bg-[#141414] px-1 rounded text-white">
                            REQUIRED, BUDGET, WHATSAPP, COUNTRY
                          </code>
                        </span>
                      </p>

                      <input
                        ref={importFileRef}
                        type="file"
                        accept=".pdf,.xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => importFileRef.current?.click()}
                        className="w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all"
                        style={{ borderColor: 'rgba(212,175,55,0.3)' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)')
                        }
                      >
                        {parsingFile ? (
                          <div className="h-10 w-10 border-2 border-[rgba(212,175,55,0.3)] border-t-[#d4af37] rounded-full animate-spin" />
                        ) : (
                          <ArrowUpTrayIcon className="h-10 w-10" style={{ color: '#d4af37' }} />
                        )}
                        <span style={{ color: '#d4af37' }} className="font-medium text-center">
                          {parsingFile
                            ? 'Parsing file…'
                            : importFileName || 'Click to upload file'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Supports: PDF, .xlsx, .xls, .csv
                        </span>
                      </button>

                      {importError && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <XMarkIcon className="h-4 w-4 shrink-0" />
                          {importError}
                        </p>
                      )}

                      {parsedLeads.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircleIcon className="h-5 w-5 shrink-0" />
                            <span className="text-sm font-medium">
                              {parsedLeads.length} lead{parsedLeads.length !== 1 ? 's' : ''} parsed
                              successfully — review before importing
                            </span>
                          </div>

                          <div
                            className="border rounded-xl overflow-hidden"
                            style={{ borderColor: 'rgba(212,175,55,0.12)' }}
                          >
                            <div className="overflow-x-auto max-h-60">
                              <table className="w-full text-xs">
                                <thead
                                  className="sticky top-0"
                                  style={{ background: 'rgba(212,175,55,0.08)' }}
                                >
                                  <tr>
                                    {['#', 'Name', 'Phone', 'Email', 'Notes'].map((h) => (
                                      <th
                                        key={h}
                                        className="px-3 py-2 text-left font-bold whitespace-nowrap"
                                        style={{ color: '#d4af37' }}
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {parsedLeads.slice(0, 15).map((lead, i) => (
                                    <tr
                                      key={i}
                                      className="border-t"
                                      style={{ borderColor: 'rgba(212,175,55,0.05)' }}
                                    >
                                      <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                                      <td className="px-3 py-2 whitespace-nowrap text-white">
                                        {lead.name}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                                        {lead.phone || '—'}
                                      </td>
                                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                                        {lead.email || '—'}
                                      </td>
                                      <td className="px-3 py-2 text-gray-500 max-w-[180px] truncate">
                                        {lead.notes || '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {parsedLeads.length > 15 && (
                              <div
                                className="px-3 py-2 text-xs text-gray-500 bg-[#141414] border-t"
                                style={{ borderColor: 'rgba(212,175,55,0.05)' }}
                              >
                                … and {parsedLeads.length - 15} more rows
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-6 border-t flex gap-4"
              style={{ borderColor: 'rgba(212,175,55,0.1)' }}
            >
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 h-12 rounded-xl text-gray-400 hover:text-[#d4af37] transition-all"
                style={{ borderColor: 'rgba(212,175,55,0.2)' }}
              >
                Cancel
              </Button>

              {/* Manual submit */}
              {activeTab === 'manual' && (
                <Button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={formSubmitting || !formData.name.trim()}
                  className="flex-[2] h-12 rounded-xl font-bold transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #f4e68c)', color: '#000' }}
                >
                  {formSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Adding Lead…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Add Lead
                    </span>
                  )}
                </Button>
              )}

              {/* Bulk import */}
              {activeTab === 'import' && !importSuccess && (
                <Button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={importing || parsedLeads.length === 0}
                  className="flex-[2] h-12 rounded-xl font-bold transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #f4e68c)', color: '#000' }}
                >
                  {importing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Importing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      {parsedLeads.length > 0
                        ? `Import ${parsedLeads.length} Lead${parsedLeads.length !== 1 ? 's' : ''}`
                        : 'Import Leads'}
                    </span>
                  )}
                </Button>
              )}

              {/* Done after success */}
              {activeTab === 'import' && importSuccess && (
                <Button
                  type="button"
                  onClick={handleClose}
                  className="flex-[2] h-12 rounded-xl font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #f4e68c)', color: '#000' }}
                >
                  Done
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
