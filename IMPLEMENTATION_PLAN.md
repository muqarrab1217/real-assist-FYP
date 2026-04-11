# Implementation Plan: Inventory-Driven Enrollment System

## Overview
Replace the manual unit-range-based enrollment with an Excel/CSV-driven inventory system where each project has its own inventory file with dynamic columns, a blueprint image, and clients select available units directly from the inventory before configuring payment plans.

---

## PHASE 1: Database Schema Changes

### 1A. New Table: `project_inventory`
Stores the parsed rows from each project's Excel/CSV file.

```sql
CREATE TABLE public.project_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  row_data JSONB NOT NULL,          -- full row as key-value pairs e.g. {"FLOOR":"1ST","UNIT NO. #":"101","APARTMENT TYPE":"2-BED","AREA (SQ. FT.)":"1000","CATEGORY":"FRONT & CORNER","STATUS":"AVAILABLE"}
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'booked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups per project
CREATE INDEX idx_project_inventory_project ON public.project_inventory(project_id);
CREATE INDEX idx_project_inventory_status ON public.project_inventory(project_id, status);
```

**Why JSONB `row_data`?** Each project's Excel file has completely different columns (e.g. "APARTMENT TYPE" vs "OUTLET NO. #" vs "TOTAL PRICE"). Storing as JSONB allows any column structure without schema changes.

### 1B. New Columns on `properties` Table

```sql
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS inventory_headers JSONB DEFAULT '[]',   -- ordered array of column header names from Excel: ["FLOOR","UNIT NO. #","APARTMENT TYPE",...]
  ADD COLUMN IF NOT EXISTS blueprint_url TEXT,                      -- URL to uploaded blueprint/floor plan image
  ADD COLUMN IF NOT EXISTS booking_deadline TIMESTAMPTZ,            -- deadline to book a slot
  ADD COLUMN IF NOT EXISTS price_column_key TEXT;                   -- which header key holds the price, e.g. "TOTAL PRICE" (null if price is in properties.price_min)
```

### 1C. New Columns on `project_enrollments` Table

```sql
ALTER TABLE public.project_enrollments
  ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES public.project_inventory(id),  -- which inventory row client selected
  ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS is_flexible_plan BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS down_payment_percentage NUMERIC;
```

### 1D. RLS Policies for `project_inventory`

```sql
-- Anyone authenticated can read inventory (to browse available units)
CREATE POLICY "Authenticated users can view inventory"
ON public.project_inventory FOR SELECT
TO authenticated
USING (true);

-- Only admins (via service role or admin check) can insert/update/delete
CREATE POLICY "Admins can manage inventory"
ON public.project_inventory FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### 1E. New Storage Bucket

```sql
-- For blueprint images and inventory CSV uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true);
```

### 1F. Update Inventory Status Trigger
When an enrollment is approved → mark inventory item as 'booked'. When rejected → revert to 'available'.

```sql
CREATE OR REPLACE FUNCTION update_inventory_on_enrollment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.project_inventory SET status = 'booked', updated_at = now() WHERE id = NEW.inventory_item_id;
  END IF;
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' AND NEW.inventory_item_id IS NOT NULL THEN
    UPDATE public.project_inventory SET status = 'available', updated_at = now() WHERE id = NEW.inventory_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enrollment_inventory_status
AFTER UPDATE OF status ON public.project_enrollments
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_enrollment_status();
```

---

## PHASE 2: Frontend Types Update

### File: `src/types/index.ts`

```typescript
// ADD these new types:

export interface InventoryItem {
  id: string;
  projectId: string;
  rowData: Record<string, string>;  // dynamic key-value from Excel headers
  status: 'available' | 'sold' | 'reserved' | 'booked';
  createdAt: Date;
}

// UPDATE Property interface — add new fields:
// + inventoryHeaders: string[]    — ordered column names from Excel
// + blueprintUrl: string          — uploaded floor plan image URL
// + bookingDeadline: Date         — slot booking deadline
// + priceColumnKey: string | null — which column holds unit price

// UPDATE Enrollment interface — add new fields:
// + inventoryItemId: string       — selected inventory row ID
// + paymentFrequency: 'monthly' | 'yearly'
// + isFlexiblePlan: boolean
// + downPaymentPercentage: number
```

---

## PHASE 3: Admin Side — Revamped Project Creation

### 3A. Revamp `AddProjectModal.tsx`

**Current state:** Multi-step form with manual unit range inputs (roomMin/Max, floorMin/Max, etc.)

**New flow — 3 steps:**

| Step | Title | Content |
|------|-------|---------|
| 1 | Basic Details | Project Name, Type, Location, Description, Booking Deadline, Status |
| 2 | Inventory Upload | Upload Excel/CSV file → preview parsed rows → confirm headers auto-detected, Upload Blueprint image |
| 3 | Review & Confirm | Summary of all inputs, header mapping preview, inventory count |

**Step 2 detail — Excel parsing (client-side):**
1. Admin uploads `.xlsx` or `.csv` file
2. Use `SheetJS (xlsx)` library to parse the file in-browser
3. Extract headers from row 1 → store as `inventoryHeaders: string[]`
4. Extract all data rows → each row becomes a `Record<string, string>` keyed by headers
5. Auto-detect the price column: look for headers containing "PRICE" or "RATE" → set `priceColumnKey`
6. Auto-detect the status column: look for headers containing "STATUS" → use it to set initial `status` per row
7. Show a preview table of first 10 rows
8. Admin confirms → data saved

**Step 2 detail — Blueprint upload:**
1. File input accepting image files (png/jpg/pdf)
2. Upload to `project-files/blueprints/{projectId}/` in Supabase storage
3. Store returned URL as `blueprintUrl`

**Remove from form:** `roomNumberMin/Max`, `floorNumberMin/Max`, `unitNumberMin/Max`, `areaMin/Max`, `unitTypeOptions` — all replaced by the Excel inventory system.

### 3B. API Changes for Project Creation

**File: `src/services/api.ts` — `adminAPI.createProperty()`**

After creating the property record:
1. Upload blueprint file to Supabase storage → get URL → update property with `blueprint_url`
2. Bulk insert parsed Excel rows into `project_inventory` table
3. Save `inventory_headers` and `price_column_key` on the property

```typescript
// New API function:
async uploadProjectInventory(projectId: string, rows: Record<string, string>[]): Promise<void> {
  const inventoryRows = rows.map(row => ({
    project_id: projectId,
    row_data: row,
    status: (row['STATUS'] || 'AVAILABLE').toLowerCase() === 'sold' ? 'sold' : 'available',
  }));
  
  // Bulk insert in batches of 100
  for (let i = 0; i < inventoryRows.length; i += 100) {
    const batch = inventoryRows.slice(i, i + 100);
    await supabase.from('project_inventory').insert(batch);
  }
}
```

### 3C. Admin Edit Project — Inventory Management

In `EditProjectModal.tsx`, add a tab to:
- View current inventory table (all rows with status)
- Re-upload a new Excel file (replaces all rows)
- Manually toggle individual row status (available ↔ sold)
- Upload/replace blueprint image

---

## PHASE 4: Client Side — New Enrollment Flow

### 4A. Flow Diagram

```
Client clicks "Experience & Enroll"
         │
         ▼
┌─────────────────────────────┐
│  InventoryBrowserModal      │   ← NEW top-level modal
│                             │
│  ┌───────────┬────────────┐ │
│  │ Blueprint │ Inventory  │ │   ← Two tabs
│  │  (image)  │  (table)   │ │
│  └───────────┴────────────┘ │
│                             │
│  Inventory tab:             │
│  • Filterable/sortable table│
│  • Dynamic columns from     │
│    project.inventoryHeaders │
│  • Only "available" rows    │
│    are selectable           │
│  • Click row → "Select"    │
│                             │
│  ┌──────────────────────┐   │
│  │ Selected: Unit 101   │   │
│  │ [Proceed to Payment] │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
         │
         ▼  (opens on top)
┌─────────────────────────────┐
│  PaymentPlanModal           │   ← NEW second modal
│                             │
│  Selected Unit Summary      │
│  (read-only, from inventory)│
│  • Unit Type: 2-BED         │
│  • Floor: 1ST               │
│  • Category: FRONT & CORNER │
│  • Area: 1000 sq ft         │
│  • Price: 50,349,300 PKR    │
│                             │
│  ── Payment Configuration ──│
│                             │
│  Plan Selection:            │
│  ○ 2-Year Plan              │
│  ○ 3-Year Plan              │
│  ○ Flexible Plan            │
│                             │
│  Down Payment: [___]%       │
│  (min 10%, max 100%)        │
│                             │
│  Frequency:                 │
│  ○ Monthly  ○ Annually      │
│                             │
│  ── Financial Summary ──    │
│  Total Price:    50,349,300 │
│  Down Payment:   5,034,930  │
│  Remaining:     45,314,370  │
│  Installments:        24    │
│  Per Installment: 1,888,099 │
│                             │
│  [Confirm Enrollment]       │
└─────────────────────────────┘
```

### 4B. New Components to Create

| Component | File Path | Purpose |
|-----------|-----------|---------|
| `InventoryBrowserModal` | `src/components/Projects/InventoryBrowserModal.tsx` | Top-level modal with Blueprint + Inventory tabs |
| `PaymentPlanModal` | `src/components/Projects/PaymentPlanModal.tsx` | Stacked modal for payment configuration |
| `InventoryTable` | `src/components/Projects/InventoryTable.tsx` | Dynamic table rendering inventory rows with filtering |
| `PaymentCalculator` | `src/components/Projects/PaymentCalculator.tsx` | Pure component that computes financials |

### 4C. `InventoryBrowserModal` Detail

**Props:** `{ isOpen, onClose, project: Property }`

**Tab 1 — Blueprint:**
- Display `project.blueprintUrl` as a zoomable image
- If no blueprint uploaded, show placeholder message

**Tab 2 — Inventory:**
- Fetch `project_inventory` rows where `project_id = project.id AND status = 'available'`
- Render a table with columns from `project.inventoryHeaders`
- Each available row has a "Select" button
- Show status badges (Available = green, Sold = gray/disabled)
- Add column filters (dropdown per column with unique values)

**On Select:**
- Store selected `InventoryItem` in state
- Show "Proceed to Payment Plan" button at bottom
- On click → open `PaymentPlanModal` on top (stacked z-index)

### 4D. `PaymentPlanModal` Detail

**Props:** `{ isOpen, onClose, project: Property, selectedUnit: InventoryItem, onSuccess }`

**Read-Only Unit Summary (top section):**
- Displays ALL fields from `selectedUnit.rowData` as label-value pairs
- Uses `project.inventoryHeaders` for ordering
- All fields are non-editable

**Payment Plan Options:**

| Option | Duration | Installment Count |
|--------|----------|-------------------|
| 2-Year Plan | 24 months | 24 (monthly) or 2 (yearly) |
| 3-Year Plan | 36 months | 36 (monthly) or 3 (yearly) |
| Flexible Plan | Custom | User-defined |

**Standard Plan (2/3-Year) Inputs:**
- Down Payment %: Slider, 30%-45% in 5% steps (same as current)
- Payment Frequency: Toggle — Monthly / Annually

**Flexible Plan Inputs:**
- Down Payment %: Slider, **10%-100%** in 1% steps
- Payment Frequency: Toggle — Monthly / Annually
- If down payment = 100%, no installments needed

**Financial Calculation:**
```
totalPrice = parseFloat(selectedUnit.rowData[project.priceColumnKey]) 
             OR project.priceMin (fallback)
downPayment = totalPrice × (downPaymentPercentage / 100)
remaining = totalPrice - downPayment
installmentCount = 
  if monthly: durationYears × 12
  if yearly:  durationYears
installmentAmount = remaining / installmentCount
```

**On Confirm:**
- Calls `enrollmentAPI.createEnrollment()` with:
  ```typescript
  {
    projectId: project.id,
    totalPrice,
    downPayment,
    installmentDurationYears: selectedDuration,
    monthlyInstallment: installmentAmount, // (or yearly amount)
    inventoryItemId: selectedUnit.id,
    paymentFrequency: 'monthly' | 'yearly',
    isFlexiblePlan: boolean,
    downPaymentPercentage: number,
    unitDetails: selectedUnit.rowData, // full row as JSON
  }
  ```

### 4E. Update `DashboardProjectsPage.tsx`

Replace `ProjectEnrollmentModal` call with `InventoryBrowserModal`:
```tsx
// Before:
<ProjectEnrollmentModal isOpen={!!selectedProject} project={selectedProject} onClose={() => setSelectedProject(null)} />

// After:
<InventoryBrowserModal isOpen={!!selectedProject} project={selectedProject} onClose={() => setSelectedProject(null)} />
```

---

## PHASE 5: API Layer Changes

### 5A. New API Functions

```typescript
// In api.ts or a new inventoryAPI section:

// Fetch inventory for a project (client-side browsing)
async getProjectInventory(projectId: string): Promise<InventoryItem[]>

// Upload inventory rows (admin, after Excel parse)
async uploadProjectInventory(projectId: string, rows: Record<string, string>[]): Promise<void>

// Replace all inventory (admin re-upload)
async replaceProjectInventory(projectId: string, rows: Record<string, string>[]): Promise<void>

// Update single inventory item status (admin manual toggle)
async updateInventoryStatus(itemId: string, status: string): Promise<void>

// Upload blueprint file to Supabase storage
async uploadBlueprint(projectId: string, file: File): Promise<string> // returns URL
```

### 5B. Update `enrollmentAPI.createEnrollment()`

- Accept new fields: `inventoryItemId`, `paymentFrequency`, `isFlexiblePlan`, `downPaymentPercentage`
- Save to `project_enrollments` table
- When creating payment schedule:
  - If `paymentFrequency === 'yearly'`: generate yearly payment entries instead of monthly
  - Down payment still split into 3 monthly payments (unchanged)
  - Installment amounts computed by frequency

### 5C. New Query Hooks

```typescript
// In useClientQueries.ts:
export function useProjectInventory(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-inventory', projectId],
    queryFn: () => inventoryAPI.getProjectInventory(projectId!),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

// In useAdminQueries.ts:
export function useUploadInventory() {
  return useMutation({...});
}
```

---

## PHASE 6: NPM Dependencies

```bash
npm install xlsx
# SheetJS — for parsing Excel files client-side
# Zero backend needed for parsing
```

---

## PHASE 7: File Changes Summary

| File | Action | Details |
|------|--------|---------|
| **Database** | | |
| `migrations/006_inventory_system.sql` | CREATE | New table, columns, RLS, trigger, storage bucket |
| **Types** | | |
| `src/types/index.ts` | EDIT | Add `InventoryItem`, update `Property`, update `Enrollment` |
| **Admin Components** | | |
| `src/components/Projects/AddProjectModal.tsx` | REWRITE | 3-step flow: Basic Details → Excel Upload + Blueprint → Review |
| `src/components/Projects/EditProjectModal.tsx` | EDIT | Add inventory management tab |
| **Client Components** | | |
| `src/components/Projects/InventoryBrowserModal.tsx` | CREATE | Blueprint + Inventory tabs, unit selection |
| `src/components/Projects/InventoryTable.tsx` | CREATE | Dynamic columns, filtering, row selection |
| `src/components/Projects/PaymentPlanModal.tsx` | CREATE | Payment plan config (2yr/3yr/flexible, monthly/yearly) |
| `src/components/Projects/PaymentCalculator.tsx` | CREATE | Pure calculation utility component |
| `src/components/Projects/ProjectEnrollmentModal.tsx` | DEPRECATE | Replaced by InventoryBrowserModal + PaymentPlanModal |
| **Pages** | | |
| `src/pages/Dashboard/Projects/DashboardProjectsPage.tsx` | EDIT | Swap ProjectEnrollmentModal → InventoryBrowserModal |
| **Services** | | |
| `src/services/api.ts` | EDIT | Add inventory CRUD, update createEnrollment for new fields |
| **Hooks** | | |
| `src/hooks/queries/useClientQueries.ts` | EDIT | Add `useProjectInventory` |
| `src/hooks/queries/useAdminQueries.ts` | EDIT | Add `useUploadInventory`, `useReplaceInventory` |

---

## PHASE 8: Implementation Order

Recommended order of implementation:

1. **Database migration** — run `006_inventory_system.sql`
2. **Install `xlsx`** — `npm install xlsx`
3. **Types** — update `src/types/index.ts`
4. **API layer** — inventory CRUD + updated createEnrollment
5. **Query hooks** — client + admin hooks
6. **Admin: AddProjectModal rewrite** — Excel parsing + blueprint upload
7. **Client: InventoryBrowserModal** — blueprint view + inventory table
8. **Client: PaymentPlanModal** — payment configuration
9. **Wire up DashboardProjectsPage** — swap modals
10. **Admin: EditProjectModal** — inventory management tab
11. **Test end-to-end** — full flow admin create → client enroll

---

## Data Flow Diagram

```
ADMIN                                    DATABASE                              CLIENT
─────                                    ────────                              ──────

1. Create Project                        properties
   ├─ basic details ──────────────────► { name, type, location,
   │                                      booking_deadline,
   │                                      inventory_headers,
   │                                      price_column_key,
   │                                      blueprint_url }
   │
   ├─ Upload Excel ───► parse XLSX      project_inventory
   │   (client-side)    ──────────────► [{ row_data: {...}, status },
   │                                     { row_data: {...}, status },
   │                                     ...]
   │
   └─ Upload Blueprint ──────────────► Supabase Storage
                                         project-files/blueprints/

2. Client browses                        project_inventory              ◄── Client fetches
                                         WHERE status='available'           available units

3. Client selects unit                                                      Selected row
   + configures payment plan                                                displayed read-only

4. Client confirms enrollment            project_enrollments            ◄── New enrollment
                                         { inventory_item_id,               with selected unit
                                           payment_frequency,
                                           down_payment_percentage,
                                           is_flexible_plan }
                                         
                                         payments                       ◄── Auto-generated
                                         [schedule entries]                  payment schedule

5. Admin approves                        project_enrollments.status='active'
                                         project_inventory.status='booked'  ← trigger
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| JSONB `row_data` | Each project has different Excel columns — no fixed schema possible |
| Client-side Excel parsing | No backend needed; `xlsx` library runs in browser; parsed rows sent to Supabase directly |
| `inventory_headers` on property | Preserves the original column order for rendering the table UI |
| `price_column_key` on property | Some projects have a TOTAL PRICE column, others don't — admin or auto-detect picks which header holds the price |
| Blueprint as image URL | Simple approach — upload to storage, display in modal |
| Stacked modals | Client sees inventory first (browsing), then payment plan opens on top — clean UX separation |
| Flexible plan min 10% down | Business rule — at least 10% down payment required |
| Trigger for inventory status | Automatic — when enrollment approved/rejected, inventory status updates without extra API call |
