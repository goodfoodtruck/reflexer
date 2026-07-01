import { NavLink, Link } from "react-router-dom";
import { NotificationBell } from "@components/ui/notificationBell/NotificationBell";
import { AvatarIcon } from "@assets/icons/IconAvatar";

const STYLES = {
  nav: "sticky top-0 z-30 flex-none flex items-center gap-4 px-6 h-16 bg-slate-950/70 backdrop-blur-md border-b border-slate-700/60",
  logo: "text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:opacity-90 transition-opacity",
  center: "flex-1 flex items-center justify-center gap-2",
  link: "px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors",
  linkIdle: "text-slate-400 hover:text-amber-300 hover:bg-slate-800/50",
  linkActive: "text-amber-400 bg-amber-500/10",
  right: "flex items-center gap-3",
  profileBtn:
    "group flex items-center justify-center w-10 h-10 bg-slate-800/80 border border-slate-600 rounded-full hover:bg-slate-700 hover:border-amber-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-lg",
  profileIcon: "w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors"
};

type NavbarProps = {
  onOpenProfile: () => void;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${STYLES.link} ${isActive ? STYLES.linkActive : STYLES.linkIdle}`;

export function Navbar({ onOpenProfile }: NavbarProps) {
  return (
    <nav className={STYLES.nav}>
      <Link to="/arena" className={STYLES.logo}>
        REFLEXER
      </Link>

      <div className={STYLES.center}>
        <NavLink to="/arena" className={linkClass} data-guide="nav-arene">
          Arène
        </NavLink>
        <NavLink to="/gambits" className={linkClass} data-guide="nav-gambits">
          Gambits
        </NavLink>
        <NavLink to="/team" className={linkClass} data-guide="nav-equipe">
          Équipe
        </NavLink>
      </div>

      <div className={STYLES.right}>
        <NotificationBell />
        <button
          onClick={onOpenProfile}
          aria-label="Profil"
          className={STYLES.profileBtn}
          data-guide="nav-profil"
        >
          <AvatarIcon className={STYLES.profileIcon} />
        </button>
      </div>
    </nav>
  );
}
