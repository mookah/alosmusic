"use client";

import { ReactNode } from "react";
import BottomPlayer from "./BottomPlayer";

export default function PlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <BottomPlayer />
    </>
  );
}