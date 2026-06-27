import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface OtherUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface LastMessage {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  otherUser: OtherUser | null;
  lastMessage: LastMessage | null;
  lastReadAt: string | null;
  otherReadAt: string | null;
  updatedAt: string;
  listing?: { id: string; title: string; images?: { url: string }[] } | null;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: OtherUser;
  body: string;
  createdAt: string;
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data;
    },
    refetchInterval: 10000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery<{ messages: Message[]; nextCursor: string | null }>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.get(`/messages/conversations/${conversationId}`);
      return res.data;
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, body }: { conversationId: string; body: string }) => {
      const res = await api.post(`/messages/conversations/${conversationId}`, { body });
      return res.data as Message;
    },
    onSuccess: (msg) => {
      qc.setQueryData(['messages', msg.conversationId], (old: any) => {
        if (!old) return { messages: [msg], nextCursor: null };
        return { ...old, messages: [...old.messages, msg] };
      });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ otherUserId, listingId }: { otherUserId: string; listingId?: string }) => {
      const res = await api.post('/messages/conversations', { otherUserId, listingId });
      return res.data as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
