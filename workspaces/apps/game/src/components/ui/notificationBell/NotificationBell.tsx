import { useNotifications } from '@hooks/useNotifications';
import { useState } from 'react';
import { STYLES } from './notificationBellStyle';


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
      <button
          data-guide="notification-bell"
          onClick={onToggle}
          className={STYLES.bellBtn}
      >
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
                      {playerWon ? 'Tu as gagné' : 'Tu as perdu'}
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
