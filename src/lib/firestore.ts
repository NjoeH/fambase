import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function getUserFamilyId(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().familyId ?? null) : null;
}

export async function createFamily(
  name: string,
  uid: string,
  displayName: string,
  email: string,
): Promise<string> {
  const familyRef = doc(collection(db, "families"));
  const familyId = familyRef.id;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  await setDoc(familyRef, {
    name,
    createdBy: uid,
    inviteCode,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "families", familyId, "members", uid), {
    role: "admin",
    joinedAt: serverTimestamp(),
    displayName,
    email,
  });

  await setDoc(doc(db, "inviteCodes", inviteCode), {
    familyId,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "users", uid),
    { familyId, displayName, email },
    { merge: true },
  );

  return familyId;
}

export async function joinFamilyByCode(
  code: string,
  uid: string,
  displayName: string,
  email: string,
): Promise<string | null> {
  const codeSnap = await getDoc(doc(db, "inviteCodes", code.toUpperCase()));
  if (!codeSnap.exists()) return null;

  const { familyId } = codeSnap.data() as { familyId: string };

  await setDoc(doc(db, "families", familyId, "members", uid), {
    role: "member",
    joinedAt: serverTimestamp(),
    displayName,
    email,
  });

  await setDoc(
    doc(db, "users", uid),
    { familyId, displayName, email },
    { merge: true },
  );

  return familyId;
}
