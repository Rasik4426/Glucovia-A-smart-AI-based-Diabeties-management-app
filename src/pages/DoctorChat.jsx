// @ts-ignore
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function DoctorChat() {
  const [message, setMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  // ── 1. Current user ──────────────────────────────────────────────
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });
  // @ts-ignore
  const email = user?.email;
  // @ts-ignore
  const role = user?.role || 'child';

  // ── 2. All app users (for name resolution) ────────────────────────
  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    // @ts-ignore
    queryFn: () => base44.entities.User.list(),
    enabled: !!email,
  });

  // ── 3. Messages I SENT ────────────────────────────────────────────
  const { data: sentMessages = [] } = useQuery({
    queryKey: ['chatSent', email],
    // @ts-ignore
    queryFn: () => base44.entities.ChatMessage.filter({ from_email: email }, '-sent_at', 500),
    enabled: !!email,
    refetchInterval: 3000,
  });

  // ── 4. Messages I RECEIVED ────────────────────────────────────────
  const { data: receivedMessages = [] } = useQuery({
    queryKey: ['chatReceived', email],
    // @ts-ignore
    queryFn: () => base44.entities.ChatMessage.filter({ to_email: email }, '-sent_at', 500),
    enabled: !!email,
    refetchInterval: 3000,
  });

  // ── 5. Build contact list ─────────────────────────────────────────
  // Start with linked accounts based on role
  const linkedEmails = useMemo(() => {
    // @ts-ignore
    const me = allUsers.find(u => u.email === email) || user;
    if (!me) return [];

    if (role === 'child') {
      // Doctors who linked this child
      const doctors = allUsers
        // @ts-ignore
        .filter(u => u.role === 'doctor' && (u.linked_child_emails || []).includes(email))
        // @ts-ignore
        .map(u => u.email);
      // Parents who linked this child
      const parents = allUsers
        // @ts-ignore
        .filter(u => u.role === 'parent' && (u.linked_children || []).includes(email))
        // @ts-ignore
        .map(u => u.email);
      return [...doctors, ...parents];
    }
    if (role === 'doctor') return me.linked_child_emails || [];
    if (role === 'parent') return me.linked_children || [];
    return [];
  }, [allUsers, email, role, user]);

  // Also add anyone who has already messaged me (so conversations aren't lost)
  const contactEmails = useMemo(() => {
    const fromMessages = [
      // @ts-ignore
      ...sentMessages.map(m => m.to_email),
      // @ts-ignore
      ...receivedMessages.map(m => m.from_email),
    ].filter(e => e && e !== email);
    return [...new Set([...linkedEmails, ...fromMessages])];
  }, [linkedEmails, sentMessages, receivedMessages, email]);

  const contacts = useMemo(() =>
    contactEmails
      // @ts-ignore
      .map(e => allUsers.find(u => u.email === e) || { email: e, full_name: e, role: 'unknown' })
      .filter(Boolean),
    [contactEmails, allUsers]
  );

  // ── 6. Messages for selected conversation ─────────────────────────
  const conversationMessages = useMemo(() => {
    if (!selectedContact) return [];
    const seen = new Set();
    return [...sentMessages, ...receivedMessages]
      .filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return (
          // @ts-ignore
          (m.from_email === email && m.to_email === selectedContact.email) ||
          // @ts-ignore
          (m.from_email === selectedContact.email && m.to_email === email)
        );
      })
      // @ts-ignore
      .sort((a, b) => new Date(a.sent_at || a.created_date) - new Date(b.sent_at || b.created_date));
  }, [sentMessages, receivedMessages, selectedContact, email]);

  // ── 7. Send message ───────────────────────────────────────────────
  const sendMutation = useMutation({
    // @ts-ignore
    mutationFn: (msg) => base44.entities.ChatMessage.create({
      from_email: email,
      // @ts-ignore
      to_email: selectedContact.email,
      message: msg,
      // @ts-ignore
      from_name: user?.full_name || email,
      from_role: role,
      is_read: false,
      sent_at: new Date().toISOString(),
    }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chatSent', email] });
      queryClient.invalidateQueries({ queryKey: ['chatReceived', email] });
    },
  });

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || !selectedContact || sendMutation.isPending) return;
    // @ts-ignore
    sendMutation.mutate(trimmed);
  };

  useEffect(() => {
    // @ts-ignore
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  // ── 8. Helpers ────────────────────────────────────────────────────
  // @ts-ignore
  const unreadCount = (contactEmail) =>
    // @ts-ignore
    receivedMessages.filter(m => m.from_email === contactEmail && !m.is_read).length;

  const roleEmoji = { child: '🧒', parent: '👨‍👩‍👧', doctor: '👨‍⚕️', unknown: '👤' };
  const backPath = role === 'child' ? '/ChildDashboard' : role === 'parent' ? '/ParentDashboard' : '/DoctorDashboard';

  // @ts-ignore
  const lastMessage = (contactEmail) => {
    const msgs = [...sentMessages, ...receivedMessages]
      .filter(m =>
        (m.from_email === email && m.to_email === contactEmail) ||
        (m.from_email === contactEmail && m.to_email === email)
      )
      // @ts-ignore
      .sort((a, b) => new Date(b.sent_at || b.created_date) - new Date(a.sent_at || a.created_date));
    return msgs[0];
  };

  // ── 9. UI ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 flex-shrink-0">
        {selectedContact ? (
          <button
            onClick={() => setSelectedContact(null)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
        ) : (
          <Link to={backPath}>
            <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-800 truncate">
            {selectedContact
              // @ts-ignore
              ? `${roleEmoji[selectedContact.role] || '👤'} ${selectedContact.full_name || selectedContact.email}`
              : '💬 Messages'}
          </h1>
          {selectedContact && (
            <p className="text-xs text-slate-400 capitalize">{selectedContact.
// @ts-ignore
            role}</p>
          )}
        </div>
        {selectedContact?.
// @ts-ignore
        phone_number && (
          <a href={`tel:${selectedContact.
// @ts-ignore
          phone_number}`}>
            <
// @ts-ignore
            Button size="sm" className="rounded-full bg-green-500 hover:bg-green-600 gap-2 shadow">
              <Phone className="w-4 h-4" /> Call
            </Button>
          </a>
        )}
      </div>

      {/* Contact list */}
      {!selectedContact && (
        <div className="flex-1 overflow-y-auto space-y-3 pt-4">
          {contacts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-5xl mb-3">💬</div>
              <p className="font-medium">No contacts yet</p>
              <p className="text-xs mt-1 max-w-xs mx-auto">
                {role === 'child'
                  ? 'Your doctor or parent will appear here once they link your account'
                  : 'Link patient or child accounts to start chatting'}
              </p>
            </div>
          ) : (
            contacts.map(contact => {
              const unread = unreadCount(contact.email);
              const last = lastMessage(contact.email);
              return (
                <motion.button
                  key={contact.email}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedContact(contact)}
                  className="w-full bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4 hover:border-teal-200 hover:bg-teal-50 transition-all text-left shadow-sm"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-2xl shadow-md">
                      {
// @ts-ignore
                      roleEmoji[contact.role] || '👤'}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800">{contact.full_name || contact.email}</p>
                    <p className="text-xs text-slate-400 capitalize truncate">
                      {last ? last.message : contact.role}
                    </p>
                  </div>
                  {last && (
                    <p className="text-xs text-slate-300 flex-shrink-0">
                      {format(new Date(last.sent_at || last.created_date), 'HH:mm')}
                    </p>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      )}

      {/* Chat view */}
      {selectedContact && (
        <div className="flex-1 flex flex-col overflow-hidden mt-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
            {conversationMessages.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-2">👋</p>
                <p className="text-sm">Say hello to start the conversation!</p>
              </div>
            )}
            {conversationMessages.map((msg, i) => {
              const isMine = msg.from_email === email;
              return (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {!isMine && (
                      <p className="text-xs font-semibold text-teal-600 mb-0.5">
                        {msg.from_name || msg.from_email}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-teal-100' : 'text-slate-400'}`}>
                      {format(new Date(msg.sent_at || msg.created_date), 'HH:mm')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 flex gap-2 bg-white flex-shrink-0">
            <Input
              // @ts-ignore
              value={message}
              // @ts-ignore
              onChange={e => setMessage(e.target.value)}
              // @ts-ignore
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="rounded-full border-slate-200 flex-1"
            />
            <
// @ts-ignore
            Button
              onClick={handleSend}
              disabled={!message.trim() || sendMutation.isPending}
              className="rounded-full w-10 h-10 p-0 bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}