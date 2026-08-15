import sqlite3
import os
import hashlib
from pathlib import Path
import lancedb
import pyarrow as sa

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", "db.sqlite3")
LANCEDB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "lancedb_data")
DATA_FILES = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "files")


def get_clinic_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_lancedb():
    db = lancedb.connect(LANCEDB_PATH)
    return db


def get_or_create_text_table(db):
    try:
        table = db.open_table("text_embeddings")
    except:
        schema = sa.schema([
            sa.field("id", sa.string()),
            sa.field("text", sa.string()),
            sa.field("source", sa.string()),
            sa.field("source_id", sa.string()),
            sa.field("source_type", sa.string()),
            sa.field("embedding", sa.list_(sa.float32(), 384)),
        ])
        table = db.create_table("text_embeddings", schema=schema, mode="overwrite")
    return table


def get_or_create_image_table(db):
    try:
        table = db.open_table("image_embeddings")
    except:
        schema = sa.schema([
            sa.field("id", sa.string()),
            sa.field("path", sa.string()),
            sa.field("source", sa.string()),
            sa.field("source_id", sa.string()),
            sa.field("embedding", sa.list_(sa.float32(), 512)),
        ])
        table = db.create_table("image_embeddings", schema=schema, mode="overwrite")
    return table


def index_clinic_data():
    conn = get_clinic_db()
    db = init_lancedb()
    text_table = get_or_create_text_table(db)
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")

    cursor = conn.execute("SELECT id, first_name, last_name, hkid, address, phone FROM api_patient")
    rows = cursor.fetchall()
    data = []
    for row in rows:
        text = f"Patient: {row['first_name']} {row['last_name']}, HKID: {row['hkid']}, Address: {row['address']}, Phone: {row['phone']}"
        embedding = model.encode(text).tolist()
        data.append({
            "id": f"patient_{row['id']}",
            "text": text,
            "source": "clinic_db",
            "source_id": str(row["id"]),
            "source_type": "patient",
            "embedding": embedding,
        })

    cursor2 = conn.execute("SELECT id, diagnosis, consultation_details, recommended_sick_leave, remarks, patient_name FROM api_sickleavecertificate")
    rows2 = cursor2.fetchall()
    for row in rows2:
        text = f"Sick Leave Certificate - Patient: {row['patient_name']}, Diagnosis: {row['diagnosis']}, Consultation: {row['consultation_details']}, Sick Leave: {row['recommended_sick_leave']}, Remarks: {row['remarks'] or ''}"
        embedding = model.encode(text).tolist()
        data.append({
            "id": f"cert_{row['id']}",
            "text": text,
            "source": "clinic_db",
            "source_id": str(row["id"]),
            "source_type": "sick_leave_certificate",
            "embedding": embedding,
        })

    cursor3 = conn.execute("SELECT id, diagnosis, consultation, medications, patient_name FROM api_receipt")
    rows3 = cursor3.fetchall()
    for row in rows3:
        text = f"Receipt - Patient: {row['patient_name']}, Diagnosis: {row['diagnosis']}, Consultation: {row['consultation']}, Medications: {row['medications']}"
        embedding = model.encode(text).tolist()
        data.append({
            "id": f"receipt_{row['id']}",
            "text": text,
            "source": "clinic_db",
            "source_id": str(row["id"]),
            "source_type": "receipt",
            "embedding": embedding,
        })

    if data:
        text_table.add(data)
    conn.close()
    return len(data)


def search_clinic(query: str, top_k: int = 5) -> list[dict]:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    query_embedding = model.encode(query).tolist()
    db = init_lancedb()
    text_table = db.open_table("text_embeddings")
    results = text_table.search(query_embedding).limit(top_k).to_list()
    return results


if __name__ == "__main__":
    count = index_clinic_data()
    print(f"Indexed {count} clinic records into LanceDB")