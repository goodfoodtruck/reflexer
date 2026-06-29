export function IconEnemy({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      {/* Sword 1: tip NE, hilt SW */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19L19 5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 13L11 18" />
      <circle cx="3.5" cy="20.5" r="1" fill="currentColor" stroke="none" />

      {/* Sword 2: tip NW, hilt SE */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 19L5 5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 18L18 13" />
      <circle cx="20.5" cy="20.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
