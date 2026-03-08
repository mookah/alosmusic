import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const songId = String(body?.songId || "").trim();
    const deviceId = String(body?.deviceId || "").trim();

    if (!songId || !deviceId) {
      return NextResponse.json(
        { ok: false, error: "Missing songId or deviceId" },
        { status: 400 }
      );
    }

    const cooldownMs = 60 * 60 * 1000;
    const key = `${songId}_${deviceId}`;

    const logRef = adminDb.collection("playLogs").doc(key);
    const songRef = adminDb.collection("songs").doc(songId);

    const logSnap = await logRef.get();

    if (logSnap.exists) {
      const data = logSnap.data();
      const lastPlayedAt = data?.lastPlayedAt?.toMillis?.() ?? 0;

      if (Date.now() - lastPlayedAt < cooldownMs) {
        return NextResponse.json({
          ok: true,
          counted: false,
          reason: "cooldown",
        });
      }
    }

    await adminDb.runTransaction(async (tx) => {
      tx.set(
        logRef,
        {
          songId,
          deviceId,
          lastPlayedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.set(
        songRef,
        {
          plays: FieldValue.increment(1),
        },
        { merge: true }
      );
    });

    return NextResponse.json({
      ok: true,
      counted: true,
    });
  } catch (error) {
    console.error("Stream increment API error:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}