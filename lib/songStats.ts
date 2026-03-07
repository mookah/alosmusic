import { getDeviceId } from "@/lib/deviceId";

export async function incrementSongPlays(songId: string) {
  if (!songId) return;

  try {
    const res = await fetch("/api/streams/increment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        songId,
        deviceId: getDeviceId(),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to increment plays:", text);
    }
  } catch (error) {
    console.error("Failed to increment plays:", error);
  }
}