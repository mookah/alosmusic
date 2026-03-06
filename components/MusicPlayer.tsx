"use client";

export default function BottomPlayer(){
  return(
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10"></div>

          <div>
            <div className="text-sm font-semibold">No song playing</div>
            <div className="text-xs text-white/60">Select a gospel song</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-2 border border-white/10 rounded-xl">◀</button>

          <button className="px-5 py-2 bg-white text-black rounded-xl font-semibold">
            ▶
          </button>

          <button className="px-3 py-2 border border-white/10 rounded-xl">▶</button>
        </div>

        <div className="hidden md:block w-60">
          <div className="h-2 bg-white/10 rounded-full">
            <div className="h-2 bg-white/40 rounded-full w-1/4"></div>
          </div>
        </div>

      </div>
    </footer>
  )
}