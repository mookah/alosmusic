import { auth } from "@/lib/firebase-client";

export async function trackPlay(songId: string) {
  if (!songId) return { counted: false, uniqueListener: false };

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { counted: false, uniqueListener: false, reason: "not-signed-in" };
  }

  const token = await currentUser.getIdToken();

  const res = await fetch("/api/track-play", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ songId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to track play");
  }

  return res.json();
}