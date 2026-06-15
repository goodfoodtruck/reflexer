import { motion } from "framer-motion";
import { IconGear } from "../../../assets/icons/IconGear";

interface AgentCardProps {
  id: number;
  name: string;
  heroClass: string;
  imageSrc: string;
  isDimmed: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const STYLES = {
  cardBase: "relative h-[85%] w-[400px] flex flex-col items-center justify-end cursor-pointer focus-visible:outline-none",
  frame: "absolute inset-x-0 bottom-0 top-16 bg-slate-900/40 backdrop-blur-sm border-2 border-slate-700/50 rounded-3xl z-0",
  imageWrapper: "absolute -inset-x-10 bottom-28 -top-32 flex items-end justify-center z-10 pointer-events-none",
  glow: "absolute inset-x-0 bottom-0 h-1/2 bg-amber-500/20 rounded-full blur-3xl",
  image: "h-full w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] origin-bottom",
  badgeWrapper: "absolute top-[100%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20",
  badge: "flex items-center gap-3 px-8 py-4 bg-slate-950/90 border border-amber-500/80 rounded-full text-amber-400 font-bold tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-md whitespace-nowrap",
  infoContainer: "relative z-20 flex-none mb-10 flex flex-col items-center",
  nameText: "text-4xl font-black tracking-widest text-slate-300 drop-shadow-md uppercase",
  classText: "text-amber-500 font-bold tracking-[0.4em] text-xs mt-2 opacity-60",
};

export function AgentCard({ 
  name, 
  heroClass, 
  imageSrc, 
  isDimmed, 
  onSelect, 
  onMouseEnter, 
  onMouseLeave 
}: AgentCardProps) {
  
  return (
    <motion.button 
      className={STYLES.cardBase}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{ 
        opacity: isDimmed ? 0.4 : 1, 
        scale: isDimmed ? 0.95 : 1,
        filter: isDimmed ? "grayscale(50%) blur(2px)" : "grayscale(0%) blur(0px)"
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover="hover"
      initial="rest"
    >

      <motion.div 
        className={STYLES.frame}
        variants={{
          rest: { borderColor: "rgba(51, 65, 85, 0.5)", backgroundColor: "rgba(15, 23, 42, 0.4)" },
          hover: { borderColor: "rgba(245, 158, 11, 0.6)", backgroundColor: "rgba(30, 41, 59, 0.6)", boxShadow: "0 0 40px rgba(245,158,11,0.15)" }
        }}
      />

      <div className={STYLES.imageWrapper}>
        <motion.div 
          className={STYLES.glow}
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        />
        <motion.img 
          src={imageSrc} 
          alt={name} 
          className={STYLES.image} 
          variants={{
            rest: { scale: 1, y: 0 },
            hover: { scale: 1.05, y: -16 }
          }}
        />
      </div>

      <motion.div 
        className={STYLES.badgeWrapper}
        variants={{
          rest: { opacity: 0, y: 20 },
          hover: { opacity: 1, y: 0 }
        }}
      >
        <span className={STYLES.badge}>
          <IconGear className="w-5 h-5" />
          CONFIGURER
        </span>
      </motion.div>
      
      <motion.div 
        className={STYLES.infoContainer}
        variants={{ rest: { y: 0 }, hover: { y: -8 } }}
      >
        <motion.span className={STYLES.nameText} variants={{ rest: { color: "#cbd5e1" }, hover: { color: "#ffffff" } }}>
          {name}
        </motion.span>
        <span className={STYLES.classText}>{heroClass}</span>
      </motion.div>
    </motion.button>
  );
}