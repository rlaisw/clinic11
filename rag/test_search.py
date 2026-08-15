import sys
sys.path.insert(0, r"C:\kilocode\clinic11\rag")
from rag_engine import search_clinic

results = search_clinic("patient with fever", 3)
for r in results:
    print(f"[{r['source_type']}] {r['text'][:100]}")
print(f"Total results: {len(results)}")