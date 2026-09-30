import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

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

const MIN_LISTEN_SECONDS = 30;
const QUALIFIED_COOLDOWN_MS = 24 * 60 * 60 * 1000;

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

    const songId =
      typeof body.songId === "string" ? body.songId.trim() : "";

    const listenedSeconds = Number(body.listenedSeconds);

    if (!songId) {
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });
    }

    if (
      !Number.isFinite(listenedSeconds) ||
      listenedSeconds < MIN_LISTEN_SECONDS
    ) {
      return NextResponse.json(
        { error: "Listening threshold not reached" },
        { status: 400 }
      );
    }

    const songRef = adminDb.collection("songs").doc(songId);
    const historyRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("qualifiedStreamHistory")
      .doc(songId);

    const qualifiedStreamRef = adminDb.collection("qualifiedStreams").doc();

    const result = await adminDb.runTransaction(async (transaction) => {
      const [songSnap, historySnap] = await Promise.all([
        transaction.get(songRef),
        transaction.get(historyRef),
      ]);

      if (!songSnap.exists) {
        throw new Error("SONG_NOT_FOUND");
      }

      const songData = songSnap.data() || {};
      const artistUid =
        typeof songData.uid === "string" ? songData.uid : "";

      if (artistUid && artistUid === userId) {
        return {
          counted: false,
          reason: "own-song",
        };
      }

      if (historySnap.exists) {
        const historyData = historySnap.data();
        const lastQualifiedAt =
          historyData?.lastQualifiedAt?.toMillis?.() ??
          historyData?.lastQualifiedAt ??
          0;

        if (
          typeof lastQualifiedAt === "number" &&
          Date.now() - lastQualifiedAt < QUALIFIED_COOLDOWN_MS
        ) {
          return {
            counted: false,
            reason: "cooldown",
          };
        }
      }

      transaction.set(qualifiedStreamRef, {
        songId,
        userId,
        artistUid,
        artist:
          typeof songData.artist === "string" ? songData.artist : "",
        title:
          typeof songData.title === "string" ? songData.title : "",
        listenedSeconds: Math.floor(listenedSeconds),
        qualified: true,
        fraudFlag: false,
        source: "signed-in-listener",
        qualifiedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(
        historyRef,
        {
          songId,
          lastQualifiedAt: FieldValue.serverTimestamp(),
          qualifiedCount: FieldValue.increment(1),
        },
        { merge: true }
      );

      transaction.set(
        songRef,
        {
          qualifiedStreams: FieldValue.increment(1),
        },
        { merge: true }
      );

      return {
        counted: true,
        reason: "qualified",
        qualifiedStreamId: qualifiedStreamRef.id,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "SONG_NOT_FOUND") {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    console.error("qualified-stream route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
