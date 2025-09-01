// migrateUsersToFlatUsers.js
import { readFile } from 'fs/promises';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase service account
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let serviceAccount;
try {
  const fileData = await readFile(serviceAccountPath, 'utf-8');
  serviceAccount = JSON.parse(fileData);
} catch (err) {
  console.error('❌ Failed to load serviceAccountKey.json:', err);
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Shop to role mapping (adjust as needed)
const shopRoleMapping = {
  'SHOP-ADMIN': 'Admin',
  'SHOP-FINANCE': 'Finance',
  'SHOP-MANAGER': 'Manager',
  // Add more if needed
};

// Migration function
async function migrateUsers() {
  try {
    const shopsSnapshot = await db.collection('shops').get();

    for (const shopDoc of shopsSnapshot.docs) {
      const shopId = shopDoc.id;
      const usersRef = db.collection('shops').doc(shopId).collection('users');
      const usersSnapshot = await usersRef.get();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Assign role if missing
        if (!userData.role) {
          userData.role = shopRoleMapping[shopId] || 'Sales';
          console.log(`⚠️ Assigned role '${userData.role}' to user ${userData.fullName}`);
        }

        // Add shopId if missing
        if (!userData.shopId) {
          userData.shopId = shopId;
        }

        // Add UID if missing
        if (!userData.uid) {
          console.warn(`⚠️ User ${userData.fullName} missing UID. Skipping UID assignment.`);
        }

        // Write to flat 'users' collection
        await db.collection('users').doc(userData.uid || userDoc.id).set(userData, { merge: true });
        console.log(`✅ Migrated user ${userData.fullName}`);
      }
    }

    console.log('🎉 Migration to flat users collection completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrateUsers();
