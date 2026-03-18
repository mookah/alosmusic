import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

const PLAY_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!bearerToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(bearerToken);
    const userId = decoded.uid;

    const body = await req.json();
    const songId = typeof body.songId === "string" ? body.songId.trim() : "";

    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    const songRef = adminDb.collection("songs").doc(songId);
    const historyRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("playHistory")
      .doc(songId);

    const [songSnap, historySnap] = await Promise.all([
      songRef.get(),
      historyRef.get(),
    ]);

    if (!songSnap.exists) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const now = Date.now();

    let shouldCountPlay = true;
    let shouldCountUnique = false;

    if (!historySnap.exists) {
      shouldCountUnique = true;
    } else {
      const historyData = historySnap.data();
      const lastCountedAt =
        historyData?.lastCountedAt?.toMillis?.() ??
        historyData?.lastCountedAt ??
        0;

      if (now - lastCountedAt < PLAY_COOLDOWN_MS) {
        shouldCountPlay = false;
      }
    }

    if (!shouldCountPlay) {
      return NextResponse.json({
        counted: false,
        uniqueListener: false,
        reason: "cooldown",
      });
    }

    const updates: Record<string, unknown> = {
      plays: FieldValue.increment(1),
      recentPlays: FieldValue.increment(1),
    };

    if (shouldCountUnique) {
      updates.uniqueListeners = FieldValue.increment(1);
    }

    await Promise.all([
      songRef.set(updates, { merge: true }),
      historyRef.set(
        {
          lastCountedAt: FieldValue.serverTimestamp(),
          playCount: FieldValue.increment(1),
          songId,
        },
        { merge: true }
      ),
    ]);

    return NextResponse.json({
      counted: true,
      uniqueListener: shouldCountUnique,
    });
  } catch (error) {
    console.error("track-play route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}