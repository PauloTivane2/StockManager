'use client';

import React from 'react';
import { useNotification } from '../../contexts/notification-context';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-danger" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-info" />;
      default:
        return null;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/30';
      case 'error':
        return 'bg-danger/10 border-danger/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      case 'info':
        return 'bg-info/10 border-info/30';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor(notification.type)} shadow-lg animate-in fade-in slide-in-from-right-4`}
        >
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <div className="flex-1">
            {notification.title && (
              <h3 className="font-semibold text-foreground">{notification.title}</h3>
            )}
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
