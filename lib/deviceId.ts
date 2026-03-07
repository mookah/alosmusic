const DEVICE_KEY = "alosmusic_device_id";

export function getDeviceId() {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(DEVICE_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }

  return id;
}