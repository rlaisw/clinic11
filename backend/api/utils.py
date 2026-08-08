import hashlib
import hmac
import io
import base64
import os
from datetime import date, datetime

import qrcode
from django.conf import settings
from django.db import transaction


def generate_qr_code_token(patient_id: str, visit_date: date) -> str:
    secret = settings.SECRET_KEY.encode('utf-8')
    from .models import SickLeaveCertificate
    while True:
        nonce = os.urandom(8).hex()
        payload = f"{patient_id}|{visit_date.isoformat()}|{nonce}"
        signature = hmac.new(secret, payload.encode('utf-8'), hashlib.sha256).hexdigest()
        token = f"{payload}|{signature}"
        if not SickLeaveCertificate.objects.filter(qr_code_token=token).exists():
            return token


def verify_qr_code_token(token: str) -> bool:
    secret = settings.SECRET_KEY.encode('utf-8')
    parts = token.split('|')
    if len(parts) < 4:
        return False
    signature = parts[-1]
    payload = '|'.join(parts[:-1])
    expected = hmac.new(secret, payload.encode('utf-8'), hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)


def generate_qr_code_image_base64(token: str) -> str:
    return generate_qr_code_image_from_data(token)


def generate_qr_code_image_from_data(data: str) -> str:
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def generate_certificate_pdf(certificate, base_url=None) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    verify_base = base_url or settings.PUBLIC_VERIFY_BASE_URL
    verify_url = f"{verify_base}/verify/{certificate.qr_code_token}/"
    qr_img_b64 = generate_qr_code_image_from_data(verify_url)
    qr_data = base64.b64decode(qr_img_b64)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=30*mm, bottomMargin=20*mm, leftMargin=25*mm, rightMargin=25*mm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, spaceAfter=6, alignment=TA_CENTER)
    clinic_style = ParagraphStyle('Clinic', parent=styles['Normal'], fontSize=11, alignment=TA_CENTER, spaceAfter=4, textColor=colors.grey)
    field_style = ParagraphStyle('Field', parent=styles['Normal'], fontSize=11, spaceAfter=6, leading=16)
    label_style = ParagraphStyle('Label', parent=styles['Normal'], fontSize=11, spaceAfter=2, textColor=colors.HexColor('#333'), fontName='Helvetica-Bold')
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.grey, spaceBefore=20)

    elements = []

    elements.append(Paragraph("Certificate of Sick Leave", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(f"{certificate.clinic_name}", clinic_style))
    elements.append(Paragraph(f"{certificate.clinic_address}", clinic_style))
    elements.append(Paragraph(f"Reference No: {certificate.reference_number}", ParagraphStyle('Ref', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER, spaceAfter=12, textColor=colors.HexColor('#333'))))
    elements.append(Spacer(1, 8))

    fields = [
        ("Patient Name", certificate.patient_name),
        ("Consultation Details", certificate.consultation_details),
        ("Diagnosis", certificate.diagnosis),
        ("Recommended Sick Leave", certificate.recommended_sick_leave),
        ("Date", str(certificate.issue_date)),
        ("Issued By", certificate.doctor_display_name or f"Dr. {certificate.doctor_name}"),
    ]

    if certificate.remarks:
        fields.append(("Remarks", certificate.remarks))

    for label, value in fields:
        elements.append(Paragraph(f"<b>{label}:</b>  {value}", field_style))

    elements.append(Spacer(1, 20))

    qr_img = Image(io.BytesIO(qr_data), width=80*mm, height=80*mm)
    qr_table = Table([[qr_img]], colWidths=[80*mm])
    qr_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(qr_table)
    elements.append(Paragraph("Scan to verify this certificate", ParagraphStyle('QRCaption', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))
    elements.append(Spacer(1, 16))

    elements.append(Paragraph(f"This certificate is digitally signed and verified by {certificate.clinic_name}.", footer_style))
    elements.append(Paragraph(f"Certificate ID: {certificate.id}  |  Valid until: {certificate.expiry_date}", footer_style))

    doc.build(elements)
    return buffer.getvalue()


def generate_certificate_pdf_from_template(certificate, base_url=None) -> bytes:
    import fitz
    from django.conf import settings as django_settings

    template_path = getattr(django_settings, 'SICK_LEAVE_CERTIFICATE_TEMPLATE_PATH',
                            os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'template', 'slcv1.pdf'))

    doc = fitz.open(template_path)
    page = doc[0]

    verify_base = base_url or settings.PUBLIC_VERIFY_BASE_URL
    verify_url = f"{verify_base}/verify/{certificate.qr_code_token}/"

    import re
    days_match = re.search(r'\d+', certificate.recommended_sick_leave or '')
    days_str = days_match.group() if days_match else ''
    from datetime import timedelta
    sick_start = certificate.issue_date
    sick_end = certificate.issue_date + timedelta(days=int(days_str) if days_str.isdigit() else 3)
    sick_leave_range = f"{sick_start.isoformat()} to {sick_end.isoformat()}"

    field_values = {
        'SREF': certificate.reference_number or '',
        'consultation-date': certificate.issue_date.isoformat(),
        'patient-name': certificate.patient_name or '',
        'diagnosis': certificate.diagnosis or '',
        'days': days_str,
        'sick-leave-dates': sick_leave_range,
        'remarks': certificate.remarks or '',
    }

    for widget in page.widgets():
        name = widget.field_name
        if name in field_values:
            widget.field_value = field_values[name]
            widget.update()

    qr_img_b64 = generate_qr_code_image_from_data(verify_url)
    qr_data = base64.b64decode(qr_img_b64)

    images = page.get_images(full=True)
    if images:
        img = images[0]
        xref = img[0]
        rects = page.get_image_rects(xref)
        if rects:
            page.insert_image(rects[0], stream=qr_data)

    buffer = io.BytesIO()
    doc.save(buffer, incremental=False, deflate=True)
    doc.close()
    buffer.seek(0)
    return buffer.getvalue()


def compute_expiry_date(issue_date: date) -> date:
    return date(issue_date.year + 10, issue_date.month, issue_date.day)


def generate_reference_number(issue_date: date) -> str:
    from .models import CertificateCounter
    year_code = issue_date.year - 2025
    with transaction.atomic():
        counter, _ = CertificateCounter.objects.select_for_update().get_or_create(id=1)
        counter.last_sequence += 1
        counter.save(update_fields=['last_sequence'])
        seq = counter.last_sequence
    digits = f"{seq:012d}"
    return f"S{year_code:03d}-{digits[0:4]}-{digits[4:8]}-{digits[8:12]}"


# =============================================================================
# Receipt Utilities
# =============================================================================

def generate_receipt_number(issue_date: date) -> str:
    from .models import ReceiptCounter
    year_code = issue_date.year - 2025
    with transaction.atomic():
        counter, _ = ReceiptCounter.objects.select_for_update().get_or_create(id=1)
        counter.last_sequence += 1
        counter.save(update_fields=['last_sequence'])
        seq = counter.last_sequence
    digits = f"{seq:012d}"
    return f"R{year_code:03d}-{digits[0:4]}-{digits[4:8]}-{digits[8:12]}"


def generate_receipt_qr_code_token(patient_id: str, visit_date: date) -> str:
    secret = settings.SECRET_KEY.encode('utf-8')
    from .models import Receipt
    while True:
        nonce = os.urandom(8).hex()
        payload = f"{patient_id}|{visit_date.isoformat()}|{nonce}"
        signature = hmac.new(secret, payload.encode('utf-8'), hashlib.sha256).hexdigest()
        token = f"{payload}|{signature}"
        if not Receipt.objects.filter(qr_code_token=token).exists():
            return token


def verify_receipt_qr_code_token(token: str) -> bool:
    secret = settings.SECRET_KEY.encode('utf-8')
    parts = token.split('|')
    if len(parts) < 4:
        return False
    signature = parts[-1]
    payload = '|'.join(parts[:-1])
    expected = hmac.new(secret, payload.encode('utf-8'), hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)


def generate_receipt_pdf_from_template(receipt, base_url=None) -> bytes:
    import fitz
    from django.conf import settings as django_settings

    template_path = getattr(django_settings, 'RECEIPT_TEMPLATE_PATH',
                            os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'template', 'receipt-f1.pdf'))

    doc = fitz.open(template_path)
    page = doc[0]

    verify_base = base_url or settings.PUBLIC_VERIFY_BASE_URL
    verify_url = f"{verify_base}/verify-receipt/{receipt.qr_code_token}/"

    # Calculate totals
    total_free = float(receipt.total_free)
    consultation_free = float(receipt.consultation_free)
    medications_free = float(receipt.medications_free)
    investigations_free = float(receipt.investigations_free)
    procedures_free = float(receipt.procedures_free)
    misc_free = float(receipt.misc_free)

    field_values = {
        'rref': receipt.rref or '',
        'date': receipt.date.isoformat(),
        'patient_name': receipt.patient_name or '',
        'total_free': f"{total_free:.2f}",
        'Consulation': receipt.consultation or '',
        'Medications': receipt.medications or '',
        'Investigations': receipt.investigations or '',
        'Procedures': receipt.procedures or '',
        'Misc': receipt.misc or '',
        'Consulation_free': f"{consultation_free:.2f}",
        'Medications_free': f"{medications_free:.2f}",
        'Investigations_free': f"{investigations_free:.2f}",
        'Procedures_free': f"{procedures_free:.2f}",
        'Misc_free': f"{misc_free:.2f}",
        ' total_dollars': receipt.total_dollars or '',
        'diagnosis': receipt.diagnosis or '',
    }

    for widget in page.widgets():
        name = widget.field_name
        if name in field_values:
            widget.field_value = field_values[name]
            widget.update()

    qr_img_b64 = generate_qr_code_image_from_data(verify_url)
    qr_data = base64.b64decode(qr_img_b64)

    images = page.get_images(full=True)
    if images:
        img = images[0]
        xref = img[0]
        rects = page.get_image_rects(xref)
        if rects:
            page.insert_image(rects[0], stream=qr_data)

    buffer = io.BytesIO()
    doc.save(buffer, incremental=False, deflate=True)
    doc.close()
    buffer.seek(0)
    return buffer.getvalue()


def number_to_english_words(number: int) -> str:
    """Convert a number to English words (e.g., 1234 -> 'One thousand two hundred thirty-four')."""
    if number == 0:
        return "Zero"
    
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    thousands = ["", "Thousand", "Million", "Billion"]
    
    def convert_hundreds(n: int) -> str:
        result = []
        if n >= 100:
            result.append(ones[n // 100] + " Hundred")
            n %= 100
        if n >= 20:
            result.append(tens[n // 10])
            n %= 10
        elif n >= 10:
            result.append(teens[n - 10])
            n = 0
        if n > 0:
            result.append(ones[n])
        return " ".join(result)
    
    result_parts = []
    for i, unit in enumerate(thousands):
        if number == 0:
            break
        n = number % 1000
        if n > 0:
            part = convert_hundreds(n)
            if unit:
                part += " " + unit
            result_parts.append(part)
        number //= 1000
    
    return " ".join(reversed(result_parts))


def amount_to_english_words(amount: float) -> str:
    """Convert a monetary amount to English words (e.g., 1234.56 -> 'One thousand two hundred thirty-four dollars and fifty-six cents')."""
    dollars = int(amount)
    cents = int(round((amount - dollars) * 100))
    
    result = number_to_english_words(dollars) + " Dollars"
    if cents > 0:
        result += " and " + number_to_english_words(cents) + " Cents"
    return result