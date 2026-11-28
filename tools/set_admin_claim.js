/* Grant, remove or check the Firebase custom claim `admin: true` on a user.
 *
 * The backend treats a token with admin: true as an admin (e.g. PUT /api/cooks/:cookId/verification),
 * and Firestore rules that call isAdmin() check request.auth.token.admin.
 *
 * Usage (from the project root, needs firebase-service-key.json):
 *   node tools/set_admin_claim.js <email>            grant admin
 *   node tools/set_admin_claim.js <email> --remove   remove admin
 *   node tools/set_admin_claim.js <email> --check    show current claims only
 *
 * Other custom claims on the user are kept. The change shows up in the user's ID token
 * after it refreshes: sign out and back in (or wait up to 1 hour).
 */
const admin = require('firebase-admin');
const svc = require('../firebase-service-key.json');

const [email, flag] = process.argv.slice(2);
if (!email || (flag && !['--remove', '--check'].includes(flag))) {
  console.error('Usage: node tools/set_admin_claim.js <email> [--remove | --check]');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(svc) });

(async () => {
  const user = await admin.auth().getUserByEmail(email);
  const before = user.customClaims || {};
  console.log('user:', user.uid, '| email verified:', user.emailVerified, '| claims before:', JSON.stringify(before));

  if (flag === '--check') {
    process.exit(0);
  }

  const after = { ...before };
  if (flag === '--remove') {
    delete after.admin;
  } else {
    after.admin = true;
  }

  await admin.auth().setCustomUserClaims(user.uid, Object.keys(after).length ? after : null);

  const check = await admin.auth().getUser(user.uid);
  console.log('claims after:', JSON.stringify(check.customClaims || {}));
  console.log(flag === '--remove' ? 'Admin removed.' : 'Admin granted.',
    'It takes effect after the user signs out and back in (or within 1 hour).');
  process.exit(0);
})().catch(e => {
  console.error('ERR:', e.code || '', e.message);
  process.exit(1);
});
