/* Backfill dish lat/lng from each cook's own profile coordinates.
 * Read-only unless the cook doc has real lat/lng. Never fabricates locations. */
const admin = require('firebase-admin');
const svc = require('../firebase-service-key.json');
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

(async () => {
  const dishes = await db.collection('dishes').get();
  console.log('total dishes:', dishes.size);

  const byCook = {};
  dishes.forEach(d => {
    const x = d.data();
    console.log('dish:', d.id, '|', x.dishName, '| cookUid:', x.cookUid || '-', '| lat:', x.lat, '| lng:', x.lng);
    if (x.cookUid && (!x.lat || !x.lng)) (byCook[x.cookUid] = byCook[x.cookUid] || []).push(d);
  });

  for (const uid of Object.keys(byCook)) {
    const cookSnap = await db.collection('cooks').doc(uid).get();
    if (!cookSnap.exists) { console.log('cook', uid, 'MISSING doc — skip'); continue; }
    const c = cookSnap.data();
    console.log('cook', uid, '| name:', c.kitchenName || c.name || '?', '| hood:', c.neighborhood || '?', '| lat:', c.lat, '| lng:', c.lng);
    if (typeof c.lat === 'number' && typeof c.lng === 'number') {
      for (const d of byCook[uid]) {
        await d.ref.update({ lat: c.lat, lng: c.lng });
        console.log('  -> backfilled dish', d.id, 'with', c.lat, c.lng);
      }
    } else {
      console.log('  -> cook has NO coordinates; nothing written for their', byCook[uid].length, 'dishes');
    }
  }
  console.log('DONE');
  process.exit(0);
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
