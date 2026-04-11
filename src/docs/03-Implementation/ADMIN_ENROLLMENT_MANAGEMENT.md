# Admin Enrollment Management Guide

## Overview

The EnrollmentRequestsPage has been enhanced to give admins comprehensive tools for managing project enrollments and verifying project details before approving client access.

## Features

### 1. **Enhanced Enrollment List**

Admin can view all enrollments with:
- Client name and email
- Project information
- Selected unit details (type, floor, number)
- Total investment amount
- Payment plan duration and monthly installment
- Status badge (Pending Review, Approved, Rejected, Completed)
- Created date

### 2. **Advanced Filtering**

- **Search**: Find enrollments by client name, email, or unit number
- **Status Filter**: View All, Pending, Approved, Rejected, or Completed enrollments
- **Statistics**: Quick stats cards showing Pending, Approved, Rejected, and Total request counts

### 3. **Detailed Enrollment View Dialog**

When admin clicks "View" on an enrollment, a comprehensive dialog shows:

#### User Information Section
- Full name and email
- User role

#### Project Information Section ⭐ **ENHANCED**
- **Verification Status Badge**: 🔍 Pending Review OR ✓ Verified (color-coded)
- Project name and location
- Project type (e.g., Residential, Commercial)
- Price range (min-max)
- Project description (preview)
- Key amenities (up to 5, with "more" indicator)

#### Selected Unit Details
- Unit type
- Floor number
- Unit number

#### Financial Details
- Total price
- Down payment amount
- Duration (years and total months)
- Monthly installment (highlighted in gold)

#### Admin Actions History (if already processed)
- Processed date/time
- Admin notes (if approval)
- Rejection reason (if rejected)

#### Related Enrollments Section ⭐ **NEW**
- Shows all other clients enrolled in the same project
- Displays count: "Other Enrollments for [Project Name] (5)"
- Lists each related enrollment with:
  - Client name and email
  - Status badge
  - Unit selection and investment amount
- Scrollable if more than 5 related enrollments

### 4. **Admin Actions**

#### For Pending Enrollments (Status = "Pending"):

**✅ Approve Enrollment Button**
- Opens approval dialog
- Admin can add optional notes
- Updates enrollment status to "active"
- Makes project visible to client in their Project Updates page
- Stores admin notes in database

**❌ Reject Enrollment Button**
- Opens rejection dialog
- Requires rejection reason (mandatory field)
- Updates enrollment status to "rejected"
- Notifies client of rejection
- Deletes associated payment schedule

#### For Approved/Rejected Enrollments:
- View-only mode
- Shows full audit history
- Cannot modify once processed

### 5. **Approval Dialog**

When admin clicks "Approve Enrollment":
```
Dialog shows:
- Confirmation message with client and project details
- Total investment amount
- Optional admin notes textarea
- Cancel / Confirm Approval buttons
```

After approval:
- Enrollment status changes to "active"
- Client can now see project in their Project Updates page
- Payment schedule becomes active
- Client receives notification

### 6. **Rejection Dialog**

When admin clicks "Reject Enrollment":
```
Dialog shows:
- Confirmation message with client and project details
- Mandatory rejection reason field
- Warning: "This action cannot be undone"
- Cancel / Confirm Rejection buttons
```

After rejection:
- Enrollment status changes to "rejected"
- All pending payments are cancelled
- Client receives notification with rejection reason
- Client cannot re-enroll without new application

## Workflow for Admin Verification

### Step 1: Review Pending Enrollments
1. Admin logged in, navigates to Enrollment Requests
2. Filters to show "Pending" status
3. Sees list of clients waiting for project verification

### Step 2: View Enrollment Details
1. Admin clicks "View" button on an enrollment
2. Dialog opens showing:
   - Client information
   - **Project details with amenities and description**
   - Unit selection details
   - **Related enrollments for same project**
   - Financial breakdown

### Step 3: Verify Project Documents
Admin can now assess:
- Project details and amenities for quality
- Number of other clients already interested
- Client's selected unit specifications
- Payment plan feasibility

### Step 4: Make Decision
1. **If verified as acceptable**: Click "Approve Enrollment"
   - Add any internal notes
   - Confirm
   - Client can now access project updates

2. **If rejected**: Click "Reject Enrollment"
   - State reason (e.g., "Project not ready", "Unit unavailable", etc.)
   - Confirm
   - Client notified and cannot access this enrollment

## Database Integration

### Related Tables:
- `project_enrollments`: Stores enrollment requests
- `properties`: Project information with amenities, pricing, description
- `profiles`: Client information
- `enrollment_audit_log`: Tracks all admin actions

### Status Values:
- **pending**: Awaiting admin review (client cannot see project)
- **active**: Approved by admin (client can access project updates)
- **rejected**: Rejected by admin (client cannot access)
- **completed**: Payment completed (client can access)

## API Endpoints Used

```typescript
enrollmentAPI.getAllEnrollments()        // Get all enrollments
enrollmentAPI.approveEnrollment()        // Approve pending enrollment
enrollmentAPI.rejectEnrollment()         // Reject pending enrollment
enrollmentAPI.getEnrollmentDetails()     // Get single enrollment details
enrollmentAPI.getEnrollmentAuditLog()    // Get audit trail
```

## Key Design Decisions

1. **Project Details Inline**: Instead of separate page, project details are shown in the enrollment dialog for context-aware decision making

2. **Related Enrollments**: Shows admin how many clients are interested in same project (helps prioritize high-demand projects)

3. **Verification Status Badge**: Clearly indicates if project has been verified or is still pending

4. **Amenities as Tags**: Easy visual scan of project features

5. **Mandatory Rejection Reason**: Ensures admin provides feedback to clients about why enrollment was rejected

## Future Enhancements

- [ ] Bulk approval (select multiple pending enrollments for same project and approve all at once)
- [ ] Project verification checklist (manual checklist of requirements to verify before approval)
- [ ] Client notification templates (customize rejection/approval messages)
- [ ] Enrollment timeline (show dates of pending -> approved -> payment tracking)
- [ ] Document upload for enrollments (client can upload supporting documents)
- [ ] Approval statistics (track which projects have highest approval rates)

---

**Last Updated**: 2026-03-21
**Component**: `src/pages/Admin/EnrollmentRequestsPage.tsx`
**Status**: ✅ Enhanced with project management features
