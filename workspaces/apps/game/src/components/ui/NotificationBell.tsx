import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const STYLES = {
  wrapper: 'absolute top-8 right-8 z-20',
  bellBtn: 'relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-colors',
  badge: 'absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-black',
  panel: 'absolute top-12 right-0 w-80 bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden',
  panelHeader: 'px-5 py-4 border-b border-slate-700/30',
  panelTitle: 'text-xs font-black tracking-[0.2em] uppercase text-amber-500',
  empty: 'px-5 py-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest',
  list: 'flex flex-col divide-y divide-slate-700/30 max-h-72 overflow-y-auto',
  item: 'flex flex-col gap-1 px-5 py-4 hover:bg-slate-800/50 transition-colors cursor-pointer',
  itemFrom: 'text-xs font-black text-white uppercase tracking-widest',
  itemResult: 'text-[10px] font-bold uppercase tracking-widest',
  itemWon: 'text-emerald-400',
  itemLost: 'text-rose-400',
  itemDate: 'text-[10px] text-slate-600 font-medium'
};

export function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => setIsOpen((prev) => !prev);

  const onMarkRead = async (id: string) => {
    await markRead(id);
    if (notifications.length === 1) setIsOpen(false);
  };

  return (
    <div className={STYLES.wrapper}>
      <button onClick={onToggle} className={STYLES.bellBtn}>
        🔔
        {unreadCount > 0 && (
          <span className={STYLES.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={STYLES.panel}>
          <div className={STYLES.panelHeader}>
            <p className={STYLES.panelTitle}>Notifications</p>
          </div>

          {notifications.length === 0 ? (
            <p className={STYLES.empty}>Aucune notification</p>
          ) : (
            <div className={STYLES.list}>
              {notifications.map((notif) => {
                const playerWon = notif.winner === 'ENEMY';
                return (
                  <div
                    key={notif._id}
                    className={STYLES.item}
                    onClick={() => onMarkRead(notif._id)}
                  >
                    <p className={STYLES.itemFrom}>Défié par {notif.fromName}</p>
                    <p
                      className={`${STYLES.itemResult} ${playerWon ? STYLES.itemWon : STYLES.itemLost}`}
                    >
                      {playerWon ? '✓ Tu as gagné' : '✗ Tu as perdu'}
                    </p>
                    <p className={STYLES.itemDate}>
                      {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
