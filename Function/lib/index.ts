import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

admin.initializeApp();
const db = admin.firestore();

function formatDayKey(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getISOWeekKey(d: Date) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

async function buildSnapshot(params: {
  type: "daily" | "weekly";
  scope: "zm";
  periodKey: string;
  start: Date;
  end: Date;
}) {
  // Query play_events by dayKey/weekKey + country
  // (Firestore can’t do “between timestamps” efficiently without indexes; we use keys)
  const keyField = params.type === "daily" ? "dayKey" : "weekKey";

  const q = await db
    .collection("play_events")
    .where("country", "==", "ZM")
    .where(keyField, "==", params.periodKey)
    .get();

  const playsBySong = new Map<string, { songId: string; plays: number }>();

  q.forEach((doc) => {
    const { songId } = doc.data() as any;
    if (!songId) return;
    const cur = playsBySong.get(songId) ?? { songId, plays: 0 };
    cur.plays += 1;
    playsBySong.set(songId, cur);
  });

  const itemsSorted = Array.from(playsBySong.values())
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 100)
    .map((x, idx) => ({
      songId: x.songId,
      plays: x.plays,
      rank: idx + 1,
      prevRank: null, // you can fill this later by reading last snapshot
    }));

  const totalPlays = itemsSorted.reduce((sum, i) => sum + i.plays, 0);

  // Get top cover image for thumbnail
  let topCoverUrl: string | null = null;
  if (itemsSorted[0]?.songId) {
    const topSong = await db.collection("songs").doc(itemsSorted[0].songId).get();
    topCoverUrl = (topSong.data() as any)?.coverUrl ?? null;
  }

  const snapshotId = `${params.type}_${params.scope}_${params.periodKey}`;

  await db.collection("chart_snapshots").doc(snapshotId).set(
    {
      type: params.type,
      scope: params.scope,
      periodKey: params.periodKey,
      periodStart: admin.firestore.Timestamp.fromDate(params.start),
      periodEnd: admin.firestore.Timestamp.fromDate(params.end),
      totalPlays,
      topCoverUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      items: itemsSorted,
    },
    { merge: true }
  );
}

// DAILY (runs every night)
export const chartsDailyZM = onSchedule("5 0 * * *", async () => {
  const now = new Date();
  // build yesterday’s daily chart
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 1);

  const dayKey = formatDayKey(start);

  await buildSnapshot({
    type: "daily",
    scope: "zm",
    periodKey: dayKey,
    start,
    end,
  });
});

// WEEKLY (runs every Monday)
export const chartsWeeklyZM = onSchedule("10 0 * * 1", async () => {
  const now = new Date();
  // previous week Monday->Monday
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  // back to Monday
  const day = end.getUTCDay() || 7;
  end.setUTCDate(end.getUTCDate() - (day - 1));

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 7);

  const weekKey = getISOWeekKey(start);

  await buildSnapshot({
    type: "weekly",
    scope: "zm",
    periodKey: weekKey,
    start,
    end,
  });
});