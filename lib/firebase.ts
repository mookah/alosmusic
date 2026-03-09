import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBDTiHTNQicJU4BQRrAAPdq6YDrcE8NKY",
  authDomain: "alosmusic-f5bc9.firebaseapp.com",
  projectId: "alosmusic-f5bc9",
  storageBucket: "alosmusic-f5bc9.appspot.com",
  messagingSenderId: "1040240070779",
  appId: "1:1040240070779:web:1c45e2dc04fcc1419e92de",
  measurementId: "G-DDM66G2RNN",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export default app;