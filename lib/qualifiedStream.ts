"use client";

import { auth } from "@/lib/firebase-client";

export type QualifiedStreamResult = {
  counted: boolean;
  reason?: string;
  qualifiedStreamId?: string;
};

export async function recordQualifiedStream(
  songId: string,
  listenedSeconds: number
): Promise<QualifiedStreamResult> {
  if (!songId) {
    return { counted: false, reason: "missing-song-id" };
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    return { counted: false, reason: "not-signed-in" };
  }

  const token = await currentUser.getIdToken();

  const response = await fetch("/api/qualified-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      songId,
      listenedSeconds,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    counted?: boolean;
    reason?: string;
    qualifiedStreamId?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Failed to record qualified stream");
  }

  return {
    counted: Boolean(data.counted),
    reason: data.reason,
    qualifiedStreamId: data.qualifiedStreamId,
  };
}
