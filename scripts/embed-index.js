#!/usr/bin/env node
import { connect } from '@lancedb/lancedb';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'codebase-index.lance');
const OLLAMA_URL = 'http://localhost:11434/api/embeddings';

async function getEmbedding(text) {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text:latest', prompt: text.slice(0, 3000) }),
  });
  const data = await res.json();
  return data.embedding;
}

async function main() {
  const files = await glob('**/*.{ts,tsx,js,jsx,py}', {
    ignore: ['**/node_modules/**', '**/venv/**', '**/data/**', '**/.git/**', '**/dist/**'],
    absolute: true,
  });
  
  console.log(`Found ${files.length} source files`);
  
  const records = [];
  let count = 0;
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const embedding = await getEmbedding(content);
      records.push({ vector: embedding, path: file, content: content.slice(0, 500) });
      count++;
      process.stdout.write(`\rIndexed: ${count}/${files.length}`);
    } catch (err) {
      console.error(`\nFailed to index ${file}:`, err.message);
    }
  }
  
  const db = await connect(DB_PATH);
  await db.createTable('codebase', records, { mode: 'overwrite' });
  console.log('\nIndexing complete!');
}

main().catch(console.error);