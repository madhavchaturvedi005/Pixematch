import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { AuthUser } from './useAuth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useUserPresence = (user: AuthUser | null) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Presence registered:', user.username);
      console.log('User data being sent:', {
        hasImage1: !!user.image1,
        hasImage2: !!user.image2,
        hasImage3: !!user.image3
      });
      
      socket.emit('register-presence', {
        name: user.username,
        username: user.username,
        age: user.age || 25, 
        gender: user.gender || 'other',
        interests: user.interests || [],
        bio: user.description || `Hi, I'm ${user.username}!`,
        description: user.description,
        country: user.country || 'Unknown',
        image1: user.image1 || null,
        image2: user.image2 || null,
        image3: user.image3 || null
      });
    });

    socket.on('disconnect', () => {
      console.log('Presence disconnected:', user.username);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef.current;
};
