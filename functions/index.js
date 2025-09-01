import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Callable function for admin to create a new user
 * data: { email: string }
 */
export const createUser = functions.https.onCall(async (data, context) => {
  // Only admins can create users
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can create users."
    );
  }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError("invalid-argument", "Email required");
  }

  const defaultPassword = "Temp@1234";

  // Create user in Firebase Auth
  const userRecord = await admin.auth().createUser({
    email,
    password: defaultPassword
  });

  // Store passwordChanged flag in Firestore
  await db.collection("users").doc(userRecord.uid).set({
    email,
    passwordChanged: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { uid: userRecord.uid, message: "User created successfully" };
});
