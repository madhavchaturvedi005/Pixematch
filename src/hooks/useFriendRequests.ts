import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAge: number;
  fromUserInterests: string[];
  timestamp: number;
  status: 'pending' | 'accepted' | 'cancelled';
}

export const useFriendRequests = (userId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Friend request socket connected');
      newSocket.emit('register-friend-system', { userId });
    });

    // Receive friend request
    newSocket.on('friend-request-received', (request: FriendRequest) => {
      setRequests(prev => [...prev, request]);
    });

    // Request accepted by other user
    newSocket.on('friend-request-accepted', ({ requestId, roomId }) => {
      console.log('Match confirmed! Joining video chat:', roomId);
      // Navigate to video chat
      window.location.href = '/chat';
    });

    // Request cancelled
    newSocket.on('friend-request-cancelled', ({ requestId, userId: cancelledUserId }) => {
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setBlockedUsers(prev => [...prev, cancelledUserId]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const sendFriendRequest = (toUserId: string, toUserName: string, toUserAge: number) => {
    if (!socket || !userId) return;

    socket.emit('send-friend-request', {
      fromUserId: userId,
      toUserId,
      toUserName,
      toUserAge,
    });

    setSentRequests(prev => [...prev, toUserId]);
  };

  const acceptRequest = (requestId: string) => {
    if (!socket) return;
    socket.emit('accept-friend-request', { requestId });
    setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const cancelRequest = (requestId: string, otherUserId: string) => {
    if (!socket) return;
    socket.emit('cancel-friend-request', { requestId });
    setRequests(prev => prev.filter(r => r.id !== requestId));
    setBlockedUsers(prev => [...prev, otherUserId]);
  };

  return {
    requests,
    sentRequests,
    blockedUsers,
    sendFriendRequest,
    acceptRequest,
    cancelRequest,
  };
};
