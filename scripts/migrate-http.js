const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');    // v2
const FormData = require('form-data')

const REMOTE = process.env.REMOTE;
const LOCAL = process.env.LOCAL;
const TOKEN = process.env.TOKEN;
const REMOTE_TOKEN = process.env.REMOTE_TOKEN;
const TYPES = ['consultants','articles'];

function fetchLocal(path, opts = {}) {
  const headers = { ...(opts.headers||{}) };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return fetch(LOCAL + path, { ...opts, headers });
}

function stripSystemKeys(obj) {
  if (Array.isArray(obj)) return obj.map(stripSystemKeys);
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [k,v] of Object.entries(obj)) {
      if (!['id','documentId','createdAt','updatedAt','publishedAt','locale'].includes(k)) {
        clean[k] = stripSystemKeys(v);
      }
    }
    return clean;
  }
  return obj;
}

async function migrate() {
  for (const type of TYPES) {
    console.log(`\n→ Migrating ${type}…`);

    const resLocal = await fetchLocal(`/api/${type}?populate=*`);
    if (!resLocal.ok) throw new Error(await resLocal.text());
    const { data } = await resLocal.json();

    for (const entry of data) {
      const localId = entry.id;
      const { profileImage, ...attrs } = entry;
      const cleanAttrs = stripSystemKeys(attrs);

      // === CONSULTANTS ===
      if (type === 'consultants') {
        console.log(`  • consultant#${localId}`);

        let mediaId = null;
        if (profileImage) {
          // 1) Upload image to Media Library
          const imgRes = await fetchLocal(profileImage.url);
          const buf    = await imgRes.buffer();
          const form   = new FormData();
          form.append('files', buf, {
            filename:    profileImage.hash + profileImage.ext,
            contentType: profileImage.mime,
          });
          // associate right away
          form.append('ref',   'api::consultant.consultant');
          form.append('refId', '0');    // dummy: we only need the upload step
          form.append('field','profileImage');

          const upRes = await fetch(`${REMOTE}/api/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${REMOTE_TOKEN}` },
            body: form
          });

          if (!upRes.ok) {
            console.error(`    ✗ upload failed:`, await upRes.text());
            continue;
          }
          const [fileObj] = await upRes.json();
          mediaId = fileObj.id;
          console.log(`    ✔ uploaded media id ${mediaId}`);
        }

        // 2) Create consultant including media relation (if any)
        const payload = { ...cleanAttrs };
        if (mediaId) payload.profileImage = mediaId;

        const createRes = await fetch(`${REMOTE}/api/consultants`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${REMOTE_TOKEN}`,
          },
          body: JSON.stringify({ data: payload }),
        });

        if (!createRes.ok) {
          console.error(
            `    ✗ create failed:`,
            await createRes.text()
          );
        } else {
          const { data: created } = await createRes.json();
          console.log(`    ✔ created remote id ${created.id}` +
                      (mediaId ? ' (with image)' : ''));
        }

        continue;
      }

      // === ARTICLES ===
      const createRes = await fetch(`${REMOTE}/api/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${REMOTE_TOKEN}`,
        },
        body: JSON.stringify({ data: cleanAttrs }),
      });

      if (!createRes.ok) {
        console.error(
          `  ✗ create ${type}#${localId} failed:`,
          await createRes.text()
        );
      } else {
        const { data: created } = await createRes.json();
        console.log(`  ✔ ${type}#${localId} → remote id ${created.id}`);
      }
    }
  }

  console.log('\n✨ Migration complete!');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});