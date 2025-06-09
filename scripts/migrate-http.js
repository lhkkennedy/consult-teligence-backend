const fetch = require('node-fetch');    // v2
const FormData = require('form-data')

const LOCAL = 'http://localhost:1337';
const REMOTE = 'https://consult-teligence-backend.onrender.com';
const TOKEN  = '73a2a02d60ef8ed60ba805a163d7cdcb50ff7f4316c6a6a14e6b42400ea444f831b3a9fd64d67775a0f09e09b7bc6070cd694fa3ab9ff5be5720063ab1569d28f12e77c4fd2ff2b5b2f600e7858b9d127cecfc620e2eba6750a97454fa059e5d870cb012d5d7d45aa228a490e5111f90bc61fc336390b22473f8f748ff6971eb';
const REMOTE_TOKEN = '637ce6074fd4a8a7727b82ee0cbc76de949b04bc49c53df758377b4405957a27050aa7bdac520c75535cab0607e95a3fe539d1cdc34590b8e5bd48e611dcfc31f28e4d6a86688255ed710f3bbc273e79c34f9bf2b24cc25e935c9e7658a7a49013f98bde1ab4c3808b3e112461fb12af810e74c1676e0dfdcbb54524eee00180'

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