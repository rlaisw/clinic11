# Receipt Feature Specification

## Description
Create a new receipt tab page for doctors to issue receipts similar to the sick leave certificate functionality. This feature will allow doctors to generate fillable PDF receipts for patient visits with integrated QR code.

## User Scenarios
1. **Issue Receipt**
   - Doctor selects "Receipt" tab on patient dashboard
   - Form displays fillable fields from template
   - Doctor fills in receipt details and clicks "Generate"
   - PDF receipt is generated and QR code displayed

2. **View Receipt**
   - Patient can view their receipt QR code in uneditable format
   - QR code links to the generated PDF receipt

## Success Criteria
- 95% of receipts generated under 2s (performance target)
- QR code scannable by standard QR readers
- All required fields populated correctly
- PDF format maintains fillable fields post-generation

## Functional Requirements
1. **PDF Generation**
   - Uses `C:\kilocode\clinic11\template\receipt-f1.pdf` as base template
   - Populates 12 fillable fields:
     - rref (receipt reference number format is EXAMPLE R001-0000-0000-0001, R001 = 2026 year, R002 = 2027 year, so on)
     - date = Today
     - patient_name
     - total_free
     - Consulation = Consulation description
     - Medications = Medications description
     - Investigations = Investigations description
     - Procedures = Procedures description
     - Misc  =  Misc description
     - Consulation_free = Consulation free
     - Medications_free = Medications free 
     - Investigations_free  = Investigations free
     - Procedures_free  =  Procedures free
     - Misc_free  = Misc free
     - total_dollars = total dollars in English For example, $1,234 is written as "One thousand two hundred thirty-four dollars 
     - diagnosis  = diagnosis description

2. **UI Integration**
   - Add "Receipt" tab before  Sick Leave Certificate tab in layout.tsx
   - Place receipt qrcode to replace at the left bottom "qrcode sample"

3. **Error Handling**
   - Shows validation errors for missing required fields
   - Prevents generation if template invalid

## Data Model
- Receipt template: `receipt-f1.pdf` (Fillable PDF Forms)
- Variables: 
  - rref: Unique receipt reference number
  - date: Today's date
  - patient_name: Patient's full name (linked to Patient model)
  - total_free: Total free amount
  - Consulation: Consultation description
  - Medications: Medications description
  - Investigations: Investigations description
  - Procedures: Procedures description
  - Misc: Misc description
  - Consulation_free: Consultation free amount
  - Medications_free: Medications free amount
  - Investigations_free: Investigations free amount
  - Procedures_free: Procedures free amount
  - Misc_free: Misc free amount
  - total_dollars: Total dollars written in English words
  - diagnosis: Diagnosis description
  - qr_code_token: Unique token for QR code generation (stored in receipt record)
  - status: Receipt status (active/revoked)
- Relationships: 
  - Foreign key to Patient model (each receipt belongs to one patient)
  - One-to-many: Patient can have multiple receipts
- Storage: Receipt metadata persisted in database, PDF generated on-demand

## Integration Points
1. Links to PDF generation endpoint `/api/receipts/generate`
2. QR code generation service
3. Existing doctor permission system

## Constraints
- No new external dependencies allowed
- Must integrate with existing Tab UI pattern
- PDF must maintain fillable fields
- Reception workflow should mirror sick leave pattern

## Assumptions
- PDF generation service is available and functional
- QR code generation works for data URLs
- Doctors will follow template format consistently
- No real-time validation needed during form fill

## Lifecycle States

- **active**: Default state after generation - QR code and PDF are valid
- **revoked**: Set when doctor revokes the receipt - QR verification shows "This receipt has been revoked"
- **expired**: After 10 years from generation date - QR verification shows "This receipt has expired"

Transitions:
- Generated → active (automatic)
- active → revoked (doctor action via API)
- active → expired (automatic, 10-year timestamp)

## Notes
- Receipt generation pattern should mirror sick leave certificate flow
- No new design assets required beyond existing templates
- QR code should match existing sick leave certificate style

## Clarifications 

### Session 2026-08-07  
- Q1: Receipt PDF endpoint configuration  
  A1: Create new endpoint `/api/receipts/generate`
- Q2: Receipt storage and persistence  
  A2: Persist receipts permanently in database (Option A)
- Q3: Patient-receipt relationship  
  A3: Direct foreign key to Patient model (Option A)
- Q4: QR code token uniqueness  
  A4: Generate UUID globally unique tokens (Option A)
- Q5: Lifecycle states  
  A5: Three states - active, revoked, expired (Option A)