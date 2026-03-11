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
    window.dispatchEvent(
      new CustomEvent("alos:play", {
        detail: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          genre: track.genre,
          coverURL: track.coverURL || track.coverUrl,
          audioURL: track.audioURL || track.audioUrl,
          queue: tracks,
          startIndex: tracks.findIndex((t) => t.id === track.id),
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