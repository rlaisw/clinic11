# Feature Specification: Digital Sick Leave Certificate

**Feature Branch**: `002-sick-leave-certificate`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Add sick leave certificate tab to patient page, with QR code verification"

## Clarifications

### Session 2026-07-12

- Q: Certificate Lifecycle - what happens when a certificate needs correcting or invalidating? → A: Revocation only (no amendment). Certificates can be voided by the doctor; voided QR codes show "This certificate has been revoked." Certificates expire after 10 years from issue date.
- Q: HKID Privacy & Search Access Control - who can search by HKID and is HKID masked? → A: HKID visible and searchable without restriction by any authorized clinic staff or doctor.
- Q: Multi-Language Support - should certificates support Chinese and/or English? → A: English only for initial release. Chinese (Traditional) language support deferred to a future iteration.
- Q: Share Method - how are certificates shared with employers/schools? → A: Share generates a time-limited (31-day) secure download link with single-use or limited views to the PDF certificate.
- Q: Verification Endpoint Abuse Prevention - should the public verification endpoint have abuse controls? → A: Simple rate limiting (100 requests per IP per minute) — no additional access control.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Doctor signs and issues sick leave certificate (Priority: P1)

As a doctor, I want to access a Sick Leave Certificate tab on the patient's detail page so that I can digitally sign and issue an official sick leave certificate for the patient after a consultation.

**Why this priority**: This is the core feature — without the ability to sign and issue certificates, the feature has no value.

**Independent Test**: Can be fully tested by navigating to a patient's page, selecting the Sick Leave Certificate tab, filling in the certificate data, and signing it. Delivers a signed digital certificate ready for printing and sharing.

**Acceptance Scenarios**:

1. **Given** I am viewing a patient's detail page, **When** I click the Sick Leave Certificate tab, **Then** I see a pre-printed certificate form populated with the patient's name and consultation details.
2. **Given** I have reviewed the certificate details, **When** I click the "Sign & Issue" button, **Then** the certificate is digitally signed and saved to the system.
3. **Given** I am issuing a certificate, **When** the system automatically includes the clinic name, address, my name, my email, telephone number, and today's date, **Then** all fields are present and correct on the certificate.
4. **Given** I have signed a certificate, **When** I view it, **Then** a unique Encrypted QR Code is displayed on the certificate.

---

### User Story 2 - Save, print, and share certificates (Priority: P1)

As a doctor, I want to save, print (as PDF), and share the signed sick leave certificate so that I can provide official documentation to the patient for their employer or school.

**Why this priority**: Saving and outputting the certificate are essential workflows — without them, the certificate cannot be delivered.

**Independent Test**: Can be tested by signing a certificate and then using the save, print, and share actions to confirm each produces the correct output.

**Acceptance Scenarios**:

1. **Given** a signed certificate exists, **When** I click "Save", **Then** the certificate is saved to the system with all associated consultation data.
2. **Given** a signed certificate exists, **When** I click "Print", **Then** a PDF version of the certificate is generated for printing.
3. **Given** a signed certificate exists, **When** I click "Share", **Then** I can share the certificate with an employer or school via a download link or email.
4. **Given** the system generates the certificate, **When** it is printed or shared, **Then** the QR Code is visibly displayed on the certificate.

---

### User Story 3 - Anyone can verify a certificate by scanning the QR code (Priority: P2)

As an employer or school administrator, I want to scan the QR code on a sick leave certificate so that I can verify its authenticity and confirm it was issued by the clinic and signed by the doctor.

**Why this priority**: Verification is a key value proposition — it provides trust in the certificate's authenticity.

**Independent Test**: Can be tested by scanning a QR code from a real certificate and confirming the verification page shows "Verified by the clinic and signed by doctor," and scanning a fake code shows "Fake — certificate cannot be verified."

**Acceptance Scenarios**:

1. **Given** I scan a QR code from a valid, signed certificate, **When** the verification page loads, **Then** it displays "Verified by the clinic and signed by doctor" along with the certificate details.
2. **Given** I scan a QR code that has been tampered with or is not from the system, **When** the verification page loads, **Then** it displays "Fake — certificate cannot be verified."
3. **Given** I scan a QR code, **When** the system checks the unique patient-visit-date combination, **Then** a reused or duplicated QR code is detected and shown as fake.

---

### User Story 4 - Search certificates by QR code, patient name, or HKID (Priority: P2)

As a clinic staff member, I want to search for sick leave certificates by QR code content, patient name, or HKID so that I can retrieve any certificate for review or re-issuance.

**Why this priority**: Searchability supports clinic workflows — finding past certificates quickly saves time.

**Independent Test**: Can be tested by searching for a known certificate using each search method and confirming it is found.

**Acceptance Scenarios**:

1. **Given** certificates exist in the system, **When** I search by patient name, **Then** matching certificates are displayed.
2. **Given** certificates exist in the system, **When** I search by HKID, **Then** matching certificates are displayed.
3. **Given** certificates exist in the system, **When** I scan or enter a QR code, **Then** the matching certificate is displayed.

---

### Edge Cases

- What happens when the doctor tries to sign a certificate for a patient who has no existing consultation data?
- How does the system handle a QR code that is scanned after the certificate has been revoked? (Show "This certificate has been revoked.")
- What happens if the PDF generation fails due to missing data fields?
- How does the system handle a patient name change between the consultation and certificate issuance?
- What happens when a share link expires or is accessed after certificate revocation?
- How does the system respond when a certificate QR code is scanned after the 10-year expiry date? (Show "This certificate has expired.")

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a new "Sick Leave Certificate" tab on the patient detail page at `/doctor/patients/[patient_id]/`.
- **FR-002**: System MUST pre-populate the certificate form with the patient's name and consultation details from the existing patient record.
- **FR-003**: The certificate form MUST display the following editable fields: Patient's Name, Consultation Details, Diagnosis, Recommended Sick Leave.
- **FR-004**: The certificate form MUST auto-populate and display (non-editable): Clinic Name, Clinic Address, Doctor Name, Doctor's Email, Telephone Number, and Date.
- **FR-005**: Doctor MUST be able to digitally sign the certificate with a single "Sign & Issue" action.
- **FR-006**: Upon signing, the system MUST generate a unique Encrypted QR Code that encodes the patient-visit-date combination.
- **FR-007**: The QR Code MUST be unique for every combination of patient identity and visit date — no two certificates for different patients or different dates may share the same QR code. Each certificate automatically expires 10 years from the issue date.
- **FR-008**: The system MUST display the QR Code visibly on the certificate.
- **FR-009**: The system MUST automatically save all certificate data to the system upon signing.
- **FR-010**: The system MUST allow the doctor to generate a PDF version of the signed certificate for printing.
- **FR-011**: The system MUST allow the doctor to share the certificate with employers or schools by generating a time-limited (31-day) secure download link with single-use or limited views to the PDF certificate.
- **FR-012**: The system MUST provide a publicly accessible verification endpoint accessible by scanning the QR code, with simple rate limiting (100 requests per IP per minute).
- **FR-013**: When a valid, untampered QR code is scanned, the verification page MUST display "Verified by the clinic and signed by doctor" along with the certificate summary.
- **FR-014**: When an invalid, tampered, or duplicated QR code is scanned, the verification page MUST display "Fake — certificate cannot be verified."
- **FR-015**: The system MUST allow authorized clinic staff (doctors and staff) to search for certificates by QR code content, patient name, and HKID without restriction.
- **FR-016**: The system MUST reject duplicate QR codes — if someone attempts to reuse a QR code from one patient-visit-date on another, verification must fail.
- **FR-017**: The system MUST prevent unauthorized modification of signed certificate data.
- **FR-018**: Doctor MUST be able to revoke (void) a signed certificate. Once revoked, the corresponding QR code verification MUST display "This certificate has been revoked."

### Key Entities *(include if feature involves data)*

- **SickLeaveCertificate**: Represents an issued digital sick leave certificate. Key attributes: Certificate ID, Patient Name, HKID, Consultation Details, Diagnosis, Recommended Sick Leave, Clinic Name, Clinic Address, Doctor Name, Doctor Email, Telephone Number, Issue Date, Expiry Date (10 years from issue), QR Code Token, Status (active/revoked), Signature Timestamp, Revoked Timestamp.
- **CertificateVerification**: Represents the verification record for QR code lookups. Key attributes: Verification Token (derived from QR code), Certificate Reference, Patient-Visit-Date Composite Key, Status (active/revoked/expired), Verified Timestamp.
- **Patient**: Existing entity referenced by the certificate. Key attributes: Patient Name, HKID, Consultation History.
- **Doctor**: Existing entity performing the signing. Key attributes: Doctor Name, Email, Telephone Number, Associated Clinic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Doctors can navigate to the Sick Leave Certificate tab and sign a certificate in under 2 minutes from opening the patient page.
- **SC-002**: A signed certificate can be saved, printed as PDF, and shared within 1 minute of signing.
- **SC-003**: 100% of certificates issued contain a unique QR Code — no two certificates share the same QR code.
- **SC-004**: QR code verification returns the correct result (verified or fake) within 3 seconds of scanning.
- **SC-005**: Authorized clinic staff can find any certificate by patient name, HKID, or QR code within 5 seconds.
- **SC-006**: A tampered, duplicated, or revoked QR code is correctly identified as unverifiable 100% of the time.
- **SC-007**: 95% of doctors report the certificate issuance workflow as easy or very easy to use.
- **SC-008**: An expired certificate (past 10-year mark) shows "This certificate has expired" upon QR code verification.

## Assumptions

- Doctors are already authenticated and authorized within the existing clinic system.
- The patient page (`/doctor/patients/[patient_id]/`) and its tab navigation already exist as part of the system.
- Existing patient and doctor profile data (name, HKID, consultation details) is available through the system.
- The system will use a cryptographic signing approach (rather than a handwritten signature capture) for the "digital signature."
- The verification page is publicly accessible — no login required to scan and verify a QR code.
- HKID is already stored as part of the patient record in the existing system.
- PDF generation is acceptable as a print substitute during development (no physical printer required).
- The share feature will provide a secure, time-limited (31-day) download link with single-use or limited views for the PDF certificate.
- Certificates and verification page are English-only for the initial release. Chinese (Traditional) support is out of scope for v1.