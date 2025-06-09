/**
 * Simple HTTP migration:
 *  - Fetch all entries from your LOCAL Strapi
 *  - POST each entry into your REMOTE Strapi
 */

import fs from 'fs/promises';
import fetch from 'node-fetch';

const LOCAL = 'http://localhost:1337';
const REMOTE = 'https://consult-teligence-backend.onrender.com';
const TOKEN  = '<your migration-script API token here>';

// List the collections you want to migrate
const TYPES = ['consultants', 'articles'];

async function migrate() {
  for (const type of TYPES) {
    console.log(`\n→ Migrating ${type}…`);

    // 1) fetch from local Strapi
    const resLocal = await fetch(`${LOCAL}/api/${type}?populate=deep`);
    if (!resLocal.ok) throw new Error(`Failed to fetch local ${type}: ${await resLocal.text()}`);
    const { data } = await resLocal.json();

    // 2) create in remote Strapi
    for (const entry of data) {
      // entry.attributes holds your fields
      const payload = { data: entry.attributes };

      const resRemote = await fetch(`${REMOTE}/api/${type}`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (!resRemote.ok) {
        const body = await resRemote.text();
        console.error(`  ✗ failed to create ${type}#${entry.id}:`, body);
      } else {
        const created = await resRemote.json();
        console.log(`  ✔ ${type}#${entry.id} → id ${created.data.id}`);
      }
    }
  }

  console.log('\n✨ Migration complete!');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
