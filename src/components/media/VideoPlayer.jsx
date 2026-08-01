import { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <div
      className="relative w-full overflow-hidden group"
      style={{ aspectRatio: '16/9', backgroundColor: 'var(--color-bg-deep)' }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        className="w-full h-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Controls overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-3 sm:p-6 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to top, rgba(26,33,48,0.6) 0%, transparent 50%)',
          opacity: playing ? 0 : 1,
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            data-cursor="hover"
            className="flex items-center justify-center rounded-full border border-text/40 hover:border-accent hover:bg-accent/10 transition-all duration-500"
            style={{ width: 48, height: 48 }}
          >
            {playing
              ? <Pause size={16} color="var(--color-text)" strokeWidth={1.5} />
              : <Play  size={16} color="var(--color-text)" strokeWidth={1.5} fill="var(--color-text)" />
            }
          </button>

          <button onClick={toggleMute} data-cursor="hover" className="p-3 transition-opacity duration-300 hover:opacity-70">
            {muted
              ? <VolumeX size={16} color="var(--color-text)" strokeWidth={1.5} />
              : <Volume2 size={16} color="var(--color-text)" strokeWidth={1.5} />
            }
          </button>
        </div>
      </div>

      {/* Click to play/pause anywhere */}
      <div className="absolute inset-0" onClick={togglePlay} data-cursor="hover" />

      {/* Controls when playing */}
      {playing && (
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(26,33,48,0.5) 0%, transparent)' }}
        >
          <button onClick={togglePlay} data-cursor="hover" className="p-2">
            <Pause size={16} color="var(--color-text)" strokeWidth={1.5} />
          </button>
          <button onClick={toggleMute} data-cursor="hover" className="p-2">
            {muted
              ? <VolumeX size={16} color="var(--color-text)" strokeWidth={1.5} />
              : <Volume2 size={16} color="var(--color-text)" strokeWidth={1.5} />
            }
          </button>
        </div>
      )}
    </div>
  )
}
