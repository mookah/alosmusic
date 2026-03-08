"use client";

import React from "react";
import BottomPlayer from "./BottomPlayer";

export default function PlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomPlayer />
    </>
  );
}