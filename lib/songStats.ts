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

    const text = await res.text();

    if (!res.ok) {
      console.error("Failed to increment plays:", res.status, text);
      return;
    }

    try {
      const data = JSON.parse(text);
      console.log("Increment plays response:", data);
    } catch {
      console.error("API did not return JSON:", text);
    }
  } catch (error) {
    console.error("Failed to increment plays:", error);
  }
}