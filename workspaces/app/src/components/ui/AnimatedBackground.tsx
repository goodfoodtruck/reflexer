/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

interface ISpark {
  id: string;
  left: string;
  delay: string;
  duration: string;
  height: string;
  width: string;
}

interface IAshes {
  id: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
}

const styles = {
  container: "absolute inset-0 z-0 overflow-hidden pointer-events-none",
  // Brouillard
  fogWrapper: "absolute -inset-[50%] opacity-30 animate-[spin_60s_linear_infinite]",
  fogInner: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1)_0%,transparent_50%)] mix-blend-screen",
  // Rayons de lumière
  raysWrapper: "absolute -top-20 -left-20 w-[150%] h-[150%] opacity-20 mix-blend-overlay -rotate-12 pointer-events-none",
  raysInner: "w-full h-32 bg-gradient-to-b from-amber-500/40 to-transparent blur-3xl translate-y-20",
  // Particules
  ash: "absolute bg-slate-800 opacity-80",
  spark: "absolute bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b,0_0_20px_#ef4444]",
  vignetteRadial: "absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]",
  vignetteLinear: "absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/95 via-black/50 to-transparent"
};

export function AnimatedBackground() {
  const [sparks, setSparks] = useState<ISpark[]>([]);
  const [ashes, setAshes] = useState<IAshes[]>([]);

  useEffect(() => {
    setSparks(
      Array.from({ length: 35 }).map((_, i) => ({
        id: `spark-${i}`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${1 + Math.random() * 2}s`,
        height: `${10 + Math.random() * 25}px`,
        width: `${1 + Math.random() * 2}px`,
      }))
    );

    setAshes(
      Array.from({ length: 25 }).map((_, i) => ({
        id: `ash-${i}`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 7}s`,
        size: `${2 + Math.random() * 5}px`,
      }))
    );
  }, []);

  return (
    <div className={styles.container}>

      <div className={styles.fogWrapper}>
        <div className={styles.fogInner} />
      </div>

      <div className={styles.raysWrapper}>
        <div className={styles.raysInner} />
      </div>

      {ashes.map((a) => (
        <div
          key={a.id}
          className={styles.ash}
          style={{
            left: a.left,
            width: a.size,
            height: a.size,
            bottom: "-50px", 
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            animation: `ash-drift ${a.duration} linear ${a.delay} infinite`,
          }}
        />
      ))}

      {sparks.map((s) => (
        <div
          key={s.id}
          className={styles.spark}
          style={{
            left: s.left,
            width: s.width,
            height: s.height,
            bottom: "-50px", 
            animation: `spark-fly ${s.duration} ease-in ${s.delay} infinite`,
          }}
        />
      ))}

      <div className={styles.vignetteRadial} />
      <div className={styles.vignetteLinear} />
      
    </div>
  );
}