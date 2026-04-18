type MenuButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export function MenuButton({ children, onClick }: MenuButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="group relative text-4xl font-bold text-left text-slate-300 transition-all duration-300 w-fit pl-8 hover:translate-x-2"
    >
      <span className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">
        ▶
      </span>
      
      <span className="tracking-wide group-hover:text-amber-400 drop-shadow-md">
        {children}
      </span>
    </button>
  );
}