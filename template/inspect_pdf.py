import fitz
doc = fitz.open("C:\\kilocode\\clinic11\\template\\receipt-f1.pdf")
page = doc[0]
print("--- Form fields found in template ---")
for w in page.widgets():
    print(f'  Field name: "{w.field_name}"')
print(f"Total fields: {len(page.widgets())}")
doc.close()