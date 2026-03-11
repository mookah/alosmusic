"use client";

import React from "react";
import SongCard from "./SongCard";

type Track = {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  coverURL?: string;
  coverUrl?: string;
  audioURL?: string;
  audioUrl?: string;
  plays?: number;
};

type HotlistRowProps = {
  title?: string;
  tracks: Track[];
  activeTrackId?: string;
};

export default function HotlistRow({
  title = "Hotlist",
  tracks,
  activeTrackId,
}: HotlistRowProps) {
  if (!tracks || tracks.length === 0) return null;

  function handlePlay(track: Track) {
    const normalizedQueue = tracks.map((item) => ({
      ...item,
      coverURL: item.coverURL || item.coverUrl || "/default-cover.jpg",
      coverUrl: item.coverUrl || item.coverURL || "/default-cover.jpg",
      audioURL: item.audioURL || item.audioUrl || "",
      audioUrl: item.audioUrl || item.audioURL || "",
    }));

    const normalizedTrack = {
      ...track,
      coverURL: track.coverURL || track.coverUrl || "/default-cover.jpg",
      coverUrl: track.coverUrl || track.coverURL || "/default-cover.jpg",
      audioURL: track.audioURL || track.audioUrl || "",
      audioUrl: track.audioUrl || track.audioURL || "",
    };

    if (!normalizedTrack.audioURL) {
      console.error("No audio URL found for track:", normalizedTrack);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("alos:play", {
        detail: {
          ...normalizedTrack,
          queue: normalizedQueue,
          startIndex: normalizedQueue.findIndex((t) => t.id === track.id),
        },
      })
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white md:text-2xl">
          {title}
        </h2>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="min-w-[170px] max-w-[170px] flex-shrink-0 snap-start md:min-w-[210px] md:max-w-[210px]"
          >
            <SongCard
              title={track.title}
              artist={track.artist}
              coverURL={track.coverURL || track.coverUrl || "/default-cover.jpg"}
              genre={track.genre || "Gospel"}
              plays={track.plays}
              active={activeTrackId === track.id}
              onPlay={() => handlePlay(track)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}