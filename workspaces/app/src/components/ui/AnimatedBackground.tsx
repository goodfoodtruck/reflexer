/* eslint-disable react-hooks/purity */
export function AnimatedBackground() {
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
    size: `${2 + Math.random() * 4}px`
  }));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none">
      
      <div 
        className="absolute inset-[-50%] opacity-20 animate-grid"
        style={{
          backgroundImage: `linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          transform: 'rotateX(60deg) rotateZ(45deg) scale(1.5)',
          transformOrigin: 'center center',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_90%)]" />

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animation: 'float-up ease-in infinite',
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-950/80 to-transparent blur-xl" />
    </div>
  );
}