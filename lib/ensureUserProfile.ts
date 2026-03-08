import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type EnsureUserProfileParams = {
  uid: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
};

export async function ensureUserProfile({
  uid,
  email,
  name,
  photoURL,
}: EnsureUserProfileParams) {
  if (!uid) return;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: email || "",
      name: name || "",
      bio: "",
      photoURL: photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await setDoc(
    ref,
    {
      email: email || snap.data()?.email || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}