#!/usr/bin/env node
import { connect } from '@lancedb/lancedb';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'codebase-index.lance');
const OLLAMA_URL = 'http://localhost:11434/api/embeddings';

async function getEmbedding(text) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text:latest', prompt: text }),
  });
  const data = await response.json();
  return data.embedding;
}

async function main() {
  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.log('Usage: node scripts/search-index.js <query>');
    process.exit(1);
  }
  
  console.log(`Searching for: "${query}"`);
  
  const db = await connect(DB_PATH);
  const table = await db.openTable('codebase');
  const queryEmbedding = await getEmbedding(query);
  
  const results = await table
    .search(queryEmbedding, 'vector')
    .limit(10)
    .toArray();
  
  console.log('\nResults:\n');
  for (const row of results) {
    // L2 distance - lower is better, convert to similarity score
    const distance = Math.max(0, -row._distance);
    const score = (1 / (1 + distance)).toFixed(3);
    console.log(`[score: ${score}] ${path.relative(process.cwd(), row.path)}`);
    console.log(`  ${row.content.slice(0, 150)}...\n`);
  }
}

main().catch(console.error);