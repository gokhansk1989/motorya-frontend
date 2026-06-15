'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

import { useConversations, useMessages, useSendMessage, type Conversation, type Message } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { Send, MessageCircle, Lock, Check, CheckCheck, Circle } from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://98.93.139.51';

function Avatar({ user, size = 40 }: { user: { displayName: string; avatarUrl?: string } | null; size?: number }) {
  if (!user) return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--bg-3)' }} />;
  return user.avatarUrl ? (
    <img src={user.avatarUrl} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--accent)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: size * 0.4, color: '#fff', flexShrink: 0 }}>
      {user.displayName[0]}
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typing, setTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: conversations = [] } = useConversations();
  const { data: msgData } = useMessages(activeId);
  const messages = msgData?.messages ?? [];
  const sendMessage = useSendMessage();

  const activeConv = conversations.find(c => c.id === activeId) ?? null;

  // URL'den conv param'ını oku
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conv = params.get('conv');
    if (conv) setActiveId(conv);
  }, []);

  // Socket bağlantısı
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    const socket = io(`${API_URL}/chat`, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });
    socket.on('user:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
    });
    socket.on('message:new', (msg: Message) => {
      qc.setQueryData(['messages', msg.conversationId], (old: any) => {
        if (!old) return { messages: [msg], nextCursor: null };
        const exists = old.messages.find((m: Message) => m.id === msg.id);
        if (exists) return old;
        return { ...old, messages: [...old.messages, msg] };
      });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    });
    socket.on('message:read', ({ conversationId, userId: readerId }: any) => {
      if (readerId !== user.id) {
        qc.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
    });
    socket.on('message:typing', ({ userId: tid, typing: t }: any) => {
      if (tid !== user.id) setTyping(t);
    });

    return () => { socket.disconnect(); };
  }, [user]);

  // Konuşma değişince odaya katıl + okundu işaretle
  useEffect(() => {
    if (!activeId || !socketRef.current) return;
    socketRef.current.emit('join:conversation', { conversationId: activeId });
    api.post(`/messages/conversations/${activeId}/read`).catch(() => null);
    setTyping(false);
  }, [activeId]);

  // Yeni mesajda aşağı kaydır
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeId) return;
    sendMessage.mutate({ conversationId: activeId, body: input.trim() });
    setInput('');
    socketRef.current?.emit('message:typing', { conversationId: activeId, typing: false });
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!activeId) return;
    socketRef.current?.emit('message:typing', { conversationId: activeId, typing: val.length > 0 });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('message:typing', { conversationId: activeId, typing: false });
    }, 2000);
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '96px 0', color: 'var(--ink-3)' }}>
      <p>Mesajlarını görmek için <Link href="/giris" style={{ color: 'var(--accent)' }}>giriş yap</Link></p>
    </div>
  );

  return (
    <div className="m-wrap" style={{ paddingBottom: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 72px)', gap: 0, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line-soft)', marginTop: 16 }}>

        {/* SOL — Konuşma listesi */}
        <div style={{ borderRight: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', background: 'var(--bg-1)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line-soft)' }}>
            <h1 className="m-display" style={{ fontSize: 18, margin: 0 }}>Mesajlar</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 11.5, color: 'var(--ink-3)' }}>
              <Lock size={11} />
              Uçtan uca şifreli
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
                <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ fontSize: 13.5 }}>Henüz mesajın yok</p>
              </div>
            ) : conversations.map(conv => {
              const isActive = conv.id === activeId;
              const isOnline = conv.otherUser ? onlineUsers.has(conv.otherUser.id) : false;
              const isUnread = conv.lastMessage && conv.lastMessage.senderId !== user.id &&
                (!conv.lastReadAt || new Date(conv.lastMessage.createdAt) > new Date(conv.lastReadAt));

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 18px', background: isActive ? 'var(--bg-2)' : 'transparent',
                    border: 0, cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--line-soft)',
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar user={conv.otherUser} size={44} />
                    {isOnline && (
                      <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: 'var(--good)', border: '2px solid var(--bg-1)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: isUnread ? 700 : 500, fontSize: 14, color: 'var(--ink)' }}>
                        {conv.otherUser?.displayName ?? 'Kullanıcı'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {conv.lastMessage ? timeAgo(conv.lastMessage.createdAt) : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {conv.lastMessage?.senderId === user.id && (
                        <CheckCheck size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      )}
                      <span style={{
                        fontSize: 12.5, color: isUnread ? 'var(--ink-2)' : 'var(--ink-3)',
                        fontWeight: isUnread ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {conv.lastMessage?.body ?? (conv.listing ? `📦 ${conv.listing.title}` : 'Yeni konuşma')}
                      </span>
                      {isUnread && (
                        <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SAĞ — Mesaj alanı */}
        {!activeId ? (
          <div style={{ display: 'grid', placeItems: 'center', background: 'var(--bg-0)', color: 'var(--ink-3)' }}>
            <div style={{ textAlign: 'center' }}>
              <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p style={{ fontSize: 15 }}>Bir konuşma seç</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-0)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--line-soft)', background: 'var(--bg-1)' }}>
              <Avatar user={activeConv?.otherUser ?? null} size={38} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{activeConv?.otherUser?.displayName ?? 'Kullanıcı'}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                  {activeConv?.otherUser && onlineUsers.has(activeConv.otherUser.id) ? (
                    <span style={{ color: 'var(--good)' }}>● Çevrimiçi</span>
                  ) : typing ? (
                    <span style={{ color: 'var(--accent)' }}>yazıyor…</span>
                  ) : 'çevrimdışı'}
                </div>
              </div>
              {activeConv?.listing && (
                <Link href={`/ilan/${activeConv.listing.id}`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-2)', borderRadius: 8, textDecoration: 'none', fontSize: 12.5, color: 'var(--ink-2)' }}>
                  {activeConv.listing.images?.[0] && <img src={activeConv.listing.images[0].url} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} alt="" />}
                  <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeConv.listing.title}</span>
                </Link>
              )}
            </div>

            {/* Mesajlar */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {messages.map((msg, i) => {
                const isMine = msg.sender.id === user.id;
                const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender.id !== msg.sender.id);
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                    {!isMine && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && <Avatar user={msg.sender} size={28} />}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '68%', padding: '8px 12px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMine ? 'var(--accent)' : 'var(--bg-2)',
                      color: isMine ? '#fff' : 'var(--ink)',
                      fontSize: 14, lineHeight: 1.45,
                    }}>
                      {msg.body}
                      <div style={{ fontSize: 10.5, marginTop: 3, textAlign: 'right', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                        {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        {isMine && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 28 }} />
                  <div style={{ padding: '8px 14px', background: 'var(--bg-2)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-3)', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line-soft)', display: 'flex', gap: 10, background: 'var(--bg-1)' }}>
              <input
                value={input}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Mesaj yaz…"
                style={{
                  flex: 1, height: 42, padding: '0 14px', background: 'var(--bg-2)',
                  border: '1px solid var(--line)', borderRadius: 21,
                  color: 'var(--ink)', fontSize: 14, outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                style={{
                  width: 42, height: 42, borderRadius: '50%', background: 'var(--accent)',
                  border: 0, display: 'grid', placeItems: 'center', color: '#fff', cursor: 'pointer',
                  opacity: !input.trim() ? 0.5 : 1, flexShrink: 0,
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
