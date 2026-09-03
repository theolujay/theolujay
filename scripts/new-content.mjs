#!/usr/bin/env node

import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const kinds = new Set(['note', 'post', 'article']);
const [kind, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(' ').trim();

if (!kinds.has(kind) || !title) {
  console.error('Usage: pnpm content:new <note|post|article> "Title"');
  process.exit(1);
}

const collection = `${kind}s`;
const slug = title
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

if (!slug) {
  console.error('The title must contain at least one letter or number.');
  process.exit(1);
}

const directory = resolve('content', collection, slug);
const file = resolve(directory, 'index.md');

try {
  await access(file, constants.F_OK);
  console.error(
    `Content already exists: content/${collection}/${slug}/index.md`,
  );
  process.exit(1);
} catch {
  // The path is available.
}

const date = new Date().toISOString().slice(0, 10);
const source = `---
title: ${JSON.stringify(title)}
date: ${date}
tags: []
draft: true
---

Start writing here.
`;

await mkdir(directory, { recursive: true });
await writeFile(file, source, 'utf8');

console.log(`Created content/${collection}/${slug}/index.md`);
