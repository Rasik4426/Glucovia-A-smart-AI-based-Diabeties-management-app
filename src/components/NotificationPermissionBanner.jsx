/**
 * Shows a one-time banner asking the user to enable push notifications.
 * Dismisses permanently once permission is granted or explicitly denied.
 */
import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestNotificationPermission, registerServiceWorker } from '@/lib/pushNotifications';

export default function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') setShow(true);
  }, []);

  const handleEnable = async () => {
    await registerServiceWorker();
    const result = await requestNotificationPermission();
    setShow(false);
    if (result === 'granted') {
      // Show a test notification so the user knows it works
      const reg = await navigator.serviceWorker?.ready;
      reg?.showNotification('✅ Notifications enabled!', {
        body: 'You will now receive instant alerts for critical glucose readings.',
        icon: '/favicon.ico',
      });
    }
  };

  if (!show) return null;

  return (
    <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
        <Bell className="w-5 h-5 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-teal-800 text-sm">Enable Push Notifications</p>
        <p className="text-teal-600 text-xs mt-0.5">Get instant alerts when a critical glucose reading is logged — even when the app is in the background.</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button size="sm" onClick={handleEnable} className="rounded-xl bg-teal-500 hover:bg-teal-600 text-xs">
          Enable
        </Button>
        <button onClick={() => setShow(false)} className="text-teal-400 hover:text-teal-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}