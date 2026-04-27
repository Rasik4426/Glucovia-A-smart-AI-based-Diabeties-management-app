/**
 * GlucoseAlertSystem
 * ─────────────────────────────────────────────────────────────────────────────
 * Mounts invisibly on all 3 dashboards (child / parent / doctor).
 *
 * CHILD role
 *  • Watches own glucose logs every 10 s.
 *  • On a critical reading (< 70 or > 250):
 *      – Shows SOS banner
 *      – Fires browser / SW push notification
 *      – Vibrates device (SOS pattern)
 *      – Creates ParentReminder records for every linked parent + doctor
 *
 * PARENT / DOCTOR role
 *  • Polls ParentReminder records every 5 s.
 *  • On a new unread ALERT → vibrate + push notification.
 *  • Polls Reminder records for each linked child every 60 s.
 *  • If a child has a scheduled reminder that is >2 h overdue and has no
 *    matching log entry today → fires a "missed medication" push notification.
 */
// @ts-ignore
import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { Phone, X, Bell } from 'lucide-react';
import {
  registerServiceWorker,
  requestNotificationPermission,
  showLocalNotification,
  vibrateSOSPattern,
  vibrateDevice,
} from '@/lib/pushNotifications';

// ─── helpers ──────────────────────────────────────────────────────────────────

// @ts-ignore
function isCritical(level) {
  return level < 70 || level > 250;
}

/** Returns true if reminder time (HH:MM) was more than thresholdMinutes ago */
// @ts-ignore
function isOverdue(timeStr, thresholdMinutes = 120) {
  if (!timeStr) return false;
  const [hh, mm] = timeStr.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(hh, mm, 0, 0);
  // @ts-ignore
  return now - scheduled > thresholdMinutes * 60 * 1000 && now > scheduled;
}

/** Returns true if there's at least one insulin/glucose log today for childEmail */
// @ts-ignore
function hasLogToday(logs, childEmail) {
  const today = new Date().toDateString();
  // @ts-ignore
  return logs.some(l => l.user_email === childEmail && new Date(l.log_date).toDateString() === today);
}

// ─── component ────────────────────────────────────────────────────────────────

// @ts-ignore
export default function GlucoseAlertSystem({ userEmail, role }) {
  const [sosAlert, setSosAlert] = useState(null);
  const lastAlertedId = useRef(null);
  const lastParentAlertId = useRef(null);
  const notifiedMissed = useRef(new Set());
  // @ts-ignore
  const queryClient = useQueryClient();

  // Bootstrap service worker + notification permission on mount
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    enabled: !!userEmail,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    // @ts-ignore
    queryFn: () => base44.entities.User.list(),
    enabled: !!userEmail,
  });

  // ── CHILD: watch own latest glucose logs ──────────────────────────────────
  const { data: glucoseLogs = [] } = useQuery({
    queryKey: ['glucoseLogsAlert', userEmail],
    // @ts-ignore
    queryFn: () => base44.entities.GlucoseLog.filter({ user_email: userEmail }, '-log_date', 5),
    enabled: !!userEmail && role === 'child',
    refetchInterval: 10000,
  });

  // ── PARENT/DOCTOR: incoming alert reminders ───────────────────────────────
  const { data: parentAlerts = [] } = useQuery({
    queryKey: ['parentAlertsRT', userEmail],
    // @ts-ignore
    queryFn: () => base44.entities.ParentReminder.filter({ to_email: userEmail }, '-sent_at', 20),
    enabled: !!userEmail && (role === 'parent' || role === 'doctor'),
    refetchInterval: 5000,
  });

  // ── PARENT/DOCTOR: linked children's scheduled reminders ─────────────────
  const linkedEmails =
    role === 'doctor'
      // @ts-ignore
      ? user?.linked_child_emails || []
      : role === 'parent'
      // @ts-ignore
      ? user?.linked_children || []
      : [];

  const { data: childReminders = [] } = useQuery({
    queryKey: ['childReminders', userEmail],
    queryFn: async () => {
      if (!linkedEmails.length) return [];
      const results = await Promise.all(
        // @ts-ignore
        linkedEmails.map(em =>
          // @ts-ignore
          base44.entities.Reminder.filter({ user_email: em, is_active: true }, '-created_date', 50)
        )
      );
      return results.flat();
    },
    enabled: !!userEmail && (role === 'parent' || role === 'doctor') && linkedEmails.length > 0,
    refetchInterval: 60000,
  });

  // Insulin logs for today — to detect missed doses
  const { data: todayInsulinLogs = [] } = useQuery({
    queryKey: ['todayInsulinLogs', linkedEmails.join(',')],
    queryFn: async () => {
      if (!linkedEmails.length) return [];
      const results = await Promise.all(
        // @ts-ignore
        linkedEmails.map(em =>
          // @ts-ignore
          base44.entities.InsulinLog.filter({ user_email: em }, '-log_date', 20)
        )
      );
      return results.flat();
    },
    enabled: !!userEmail && (role === 'parent' || role === 'doctor') && linkedEmails.length > 0,
    refetchInterval: 60000,
  });

  // ── Effect: CHILD critical glucose ───────────────────────────────────────
  useEffect(() => {
    if (role !== 'child' || glucoseLogs.length === 0) return;
    const latest = glucoseLogs[0];
    if (!latest || latest.id === lastAlertedId.current) return;
    if (!isCritical(latest.glucose_level)) return;

    lastAlertedId.current = latest.id;
    const level = latest.glucose_level;
    const isLow = level < 70;
    const title = isLow ? '🚨 LOW BLOOD SUGAR ALERT!' : '⚠️ HIGH BLOOD SUGAR ALERT!';
    const body = isLow
      ? `Your blood sugar is ${level} mg/dL — very low! Take action immediately.`
      : `Your blood sugar is ${level} mg/dL — very high! Seek help if needed.`;

    vibrateSOSPattern();
    showLocalNotification(title, body, {
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 600, 300, 600],
      url: '/ChildDashboard',
      tag: 'glucose-critical',
    });

    // @ts-ignore
    const doctor = allUsers.find(u => u.role === 'doctor' && (u.linked_child_emails || []).includes(userEmail));

    // @ts-ignore
    setSosAlert({ level, isLow, title, body, doctorPhone: doctor?.phone_number, doctorName: doctor?.full_name || doctor?.email });

    // Notify parents + doctors via ParentReminder records
    // @ts-ignore
    const parents = allUsers.filter(u => u.role === 'parent' && (u.linked_children || []).includes(userEmail));
    // @ts-ignore
    const doctors = allUsers.filter(u => u.role === 'doctor' && (u.linked_child_emails || []).includes(userEmail));
    const recipients = [...parents, ...doctors];
    // @ts-ignore
    const childName = user?.full_name || userEmail;
    const alertMsg = isLow
      ? `🚨 LOW SUGAR ALERT: ${childName} has a blood sugar of ${level} mg/dL (LOW). Check immediately!`
      : `⚠️ HIGH SUGAR ALERT: ${childName} has a blood sugar of ${level} mg/dL (HIGH). Please review.`;

    recipients.forEach(r =>
      // @ts-ignore
      base44.entities.ParentReminder.create({
        from_email: userEmail,
        to_email: r.email,
        message: alertMsg,
        reminder_type: 'glucose_test',
        is_read: false,
        sent_at: new Date().toISOString(),
      })
    );
  }, [glucoseLogs, allUsers, role, userEmail, user]);

  // ── Effect: PARENT/DOCTOR — new alert reminder ────────────────────────────
  useEffect(() => {
    if (role === 'child' || parentAlerts.length === 0) return;
    const latest = parentAlerts[0];
    if (!latest || latest.id === lastParentAlertId.current) return;
    if (!latest.message?.includes('ALERT')) return;
    if (latest.is_read) return;

    lastParentAlertId.current = latest.id;
    vibrateDevice([300, 100, 300, 100, 600]);
    showLocalNotification('🚨 Patient Glucose Alert', latest.message, {
      requireInteraction: true,
      url: role === 'parent' ? '/ParentDashboard' : '/DoctorDashboard',
      tag: 'patient-alert',
    });
  }, [parentAlerts, role]);

  // ── Effect: PARENT/DOCTOR — missed medication check ───────────────────────
  useEffect(() => {
    if (role === 'child' || !childReminders.length) return;

    // @ts-ignore
    childReminders.forEach(reminder => {
      if (reminder.reminder_type !== 'insulin') return;
      if (!isOverdue(reminder.time)) return;

      const key = `${reminder.user_email}_${reminder.time}_${new Date().toDateString()}`;
      if (notifiedMissed.current.has(key)) return;

      // Check if they actually logged insulin today
      if (hasLogToday(todayInsulinLogs, reminder.user_email)) return;

      notifiedMissed.current.add(key);
      // @ts-ignore
      const childUser = allUsers.find(u => u.email === reminder.user_email);
      const childName = childUser?.full_name || reminder.user_email;
      const title = '💉 Missed Insulin Dose';
      const body = `${childName} may have missed their scheduled insulin dose at ${reminder.time}. Please check in.`;

      vibrateDevice([400, 100, 400]);
      showLocalNotification(title, body, {
        requireInteraction: true,
        url: role === 'parent' ? '/ParentDashboard' : '/DoctorDashboard',
        tag: `missed-insulin-${reminder.user_email}`,
      });
    });
  }, [childReminders, todayInsulinLogs, allUsers, role]);

  if (!sosAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 p-4 shadow-2xl ${
          // @ts-ignore
          sosAlert.isLow
            ? 'bg-gradient-to-r from-red-600 to-rose-600'
            : 'bg-gradient-to-r from-orange-500 to-amber-500'
        }`}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <div className="text-4xl flex-shrink-0 animate-pulse">
              {sosAlert.
// @ts-ignore
              isLow ? '🚨' : '⚠️'}
            </div>
            <div className="flex-1">
              <p className="text-white font-extrabold text-base">{sosAlert.
// @ts-ignore
              title}</p>
              <p className="text-white/90 text-sm mt-0.5">{sosAlert.
// @ts-ignore
              body}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {sosAlert.
// @ts-ignore
                doctorPhone && (
                  <a
                    // @ts-ignore
                    href={`tel:${sosAlert.doctorPhone}`}
                    className="flex items-center gap-1.5 bg-white text-red-600 rounded-full px-4 py-2 text-sm font-bold shadow-md active:scale-95 transition-transform"
                  >
                    <Phone className="w-4 h-4" />
                    📞 Call Dr. {sosAlert.
// @ts-ignore
                    doctorName}
                  </a>
                )}
                <a
                  href="tel:911"
                  className="flex items-center gap-1.5 bg-white/20 text-white border border-white/40 rounded-full px-4 py-2 text-sm font-bold active:scale-95 transition-transform"
                >
                  🆘 Emergency (911)
                </a>
              </div>
            </div>
            <button
              onClick={() => setSosAlert(null)}
              className="text-white/80 hover:text-white ml-2 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}