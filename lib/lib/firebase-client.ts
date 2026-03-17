"use client";

import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "./firebase";

export const auth = getAuth(getFirebaseApp());