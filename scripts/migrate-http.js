// scripts/migrate-http.js
//
// Simple HTTP migration for Strapi:
// 1) Fetch from your LOCAL (http://localhost:1337)
// 2) POST into your RENDER Strapi

const fetch = require('node-fetch');    // v2
const FormData = require('form-data')

const LOCAL = 'http://localhost:1337';
const REMOTE = 'https://consult-teligence-backend.onrender.com';
const TOKEN  = '73a2a02d60ef8ed60ba805a163d7cdcb50ff7f4316c6a6a14e6b42400ea444f831b3a9fd64d67775a0f09e09b7bc6070cd694fa3ab9ff5be5720063ab1569d28f12e77c4fd2ff2b5b2f600e7858b9d127cecfc620e2eba6750a97454fa059e5d870cb012d5d7d45aa228a490e5111f90bc61fc336390b22473f8f748ff6971eb';
const REMOTE_TOKEN = '1f35e58061c5363554a3befa57f37959ef6f1b26df98687925fe87f0488e5c699e4938b34e549ef79df5449f018c59762dbd3c27ee700e209363352ecc47b2294afee1b98fc3de725205ddccb016bca87c0caa832e4adbc9fee6d6d3159d69e32e97ca3b8bbd71c2224e4abd82aadf89e2bbbc8ae1c5e183d56002d700b68179'

const TYPES = ['consultants','articles'];

//////////////////////////////////////
// ─── HELPER FUNCTIONS ─────────────
//////////////////////////////////////

// Wrap fetch to your local Strapi (with optional auth & v4 format)
function fetchLocal(path, opts = {}) {
  const headers = { ...(opts.headers||{}) };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  // Force v4 response shape if you want: uncomment the next line
  // headers['Strapi-Response-Format'] = 'v4';
  return fetch(LOCAL + path, { ...opts, headers });
}

// Strip any Strapi system keys at any depth
function stripSystemKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(stripSystemKeys);
  }
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [k,v] of Object.entries(obj)) {
      if (![
        'id','documentId',
        'createdAt','updatedAt','publishedAt','locale'
      ].includes(k)) {
        clean[k] = stripSystemKeys(v);
      }
    }
    return clean;
  }
  return obj;
}

//////////////////////////////////////
// ─── STEP 1: MIGRATE MEDIA ────────
//////////////////////////////////////

async function migrate() {
  for (const type of TYPES) {
    console.log(`\n→ Migrating ${type}…`);

    // 1) fetch all entries locally, populating everything
    const resLocal = await fetchLocal(`/api/${type}?populate=*`);
    if (!resLocal.ok) {
      throw new Error(`Failed to fetch local ${type}: ${await resLocal.text()}`);
    }
    const { data } = await resLocal.json();

    for (const entry of data) {
      // 2) strip off Strapi internals
      const {
        id, documentId,
        createdAt, updatedAt, publishedAt, locale,
        profileImage,         // grab images separately
        ...rawAttrs
      } = entry;

      // 3) deep-clean remaining fields
      const attrs = stripSystemKeys(rawAttrs);

      // 4) create the entry on remote (without images)
      const createRes = await fetch(`${REMOTE}/api/${type}`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${REMOTE_TOKEN}`,
        },
        body: JSON.stringify({ data: attrs }),
      });
      if (!createRes.ok) {
        console.error(`  ✗ failed to create ${type}#${id}:`, await createRes.text());
        continue;
      }
      const { data: created } = await createRes.json();
      console.log(`  ✔ ${type}#${id} → remote id ${created.id}`);

      // 5) if this is a consultant and has images, upload & attach them now
      if (type === 'consultants' && Array.isArray(profileImage) && profileImage.length) {
        for (const img of profileImage) {
          // some entries store file details in img.attributes
          const fileAttrs = img.attributes || img;
          // build a URL (handles absolute vs relative)
          const fileUrl = fileAttrs.url

          console.log(`    Uploading image for consultant#${created.id} from ${fileUrl}`);
          // 5a) download the image bytes
          const fileBuf = await (await fetchLocal(fileUrl)).buffer();

          // 5b) upload & attach in one shot
          const form = new FormData();
          form.append('files', fileBuf, {
            filename: fileAttrs.hash + fileAttrs.ext,
            contentType: fileAttrs.mime,
          });
          form.append('ref',  'api::consultant.consultant');  // content-type UID
          form.append('refId', created.id.toString());         // the new remote ID
          form.append('field','profileImage');                // the media field name

          const upRes = await fetch(`${REMOTE}/api/upload`, {
            method:  'POST',
            headers: { Authorization: `Bearer ${REMOTE_TOKEN}` },
            body: form,
          });
          if (!upRes.ok) {
            console.error(`    ✗ image attach failed:`, await upRes.text());
          } else {
            console.log(`    ✔ image attached to consultant#${created.id}`);
          }
        }
      }
    }
  }

  console.log('\n✨ Migration complete!');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});