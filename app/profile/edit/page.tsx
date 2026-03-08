"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import SiteShell from "@/components/Site/SiteShell";

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const previewURL = useMemo(() => {
    if (!photo) return photoURL || "/default-avatar.png";
    return URL.createObjectURL(photo);
  }, [photo, photoURL]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProfile(uid: string) {
      try {
        setLoadingProfile(true);

        const refDoc = doc(db, "users", uid);
        const snap = await getDoc(refDoc);

        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setPhotoURL(data.photoURL || "");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        alert("Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    }

    if (!authReady) return;

    if (!user) {
      setLoadingProfile(false);
      return;
    }

    loadProfile(user.uid);
  }, [user, authReady]);

  useEffect(() => {
    return () => {
      if (photo) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [photo, previewURL]);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be 2MB or less.");
      return;
    }

    setPhoto(file);
  }

  async function handleSave() {
    if (!user) {
      alert("Please log in first.");
      return;
    }

    const cleanName = name.trim();
    const cleanBio = bio.trim();

    if (!cleanName) {
      alert("Artist name is required.");
      return;
    }

    try {
      setLoading(true);

      let uploadedPhotoURL = photoURL;

      if (photo) {
        const storageRef = ref(storage, `profiles/${user.uid}/avatar`);
        await uploadBytes(storageRef, photo);
        uploadedPhotoURL = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: cleanName,
          bio: cleanBio,
          photoURL: uploadedPhotoURL,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setPhotoURL(uploadedPhotoURL);
      setPhoto(null);
      alert("Profile updated!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  if (!authReady || loadingProfile) {
    return (
      <SiteShell title="Edit Profile">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 text-white">
            Loading profile...
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell title="Edit Profile">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 text-white">
            Please log in to edit your profile.
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title="Edit Profile">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <img
                src={previewURL}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="text-lg font-semibold text-white">
                {name.trim() || "Artist Profile"}
              </div>
              <div className="text-sm text-white/60">
                Update your artist details and profile photo
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Artist Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-white/35"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter artist name"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm text-white/70">Bio</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-white/35"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell listeners about yourself"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm text-white/70">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-2 block w-full text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-purple-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </SiteShell>
  );
}