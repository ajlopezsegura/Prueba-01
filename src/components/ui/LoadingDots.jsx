export default function LoadingDots({ light = false }) {
  const color = light ? '#F5F0E8' : '#C8A07A'
  return (
    <div className="flex items-center justify-center gap-2" aria-label="Loading">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
            animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
    </div>
  )
}
