'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/cms/ui/use-toast';

interface SocketUser {
  userId: string;
  username: string;
  role: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  lastActivity: Date;
}

interface TypingIndicator {
  userId: string;
  username: string;
  roomId: string;
  isTyping: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  [key: string]: any;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: SocketUser[];
  typingUsers: Map<string, Set<string>>; // roomId -> Set of userIds
  notifications: Notification[];
  unreadNotificationCount: number;
  
  // Methods
  joinArticleRoom: (articleId: string) => void;
  leaveArticleRoom: (articleId: string) => void;
  sendArticleUpdate: (articleId: string, changes: any, version: number) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  updatePresenceStatus: (status: 'online' | 'away' | 'busy') => void;
  markNotificationAsRead: (notificationId: string) => void;
  requestData: (type: string, params: any) => Promise<any>;
  
  // Event listeners
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  serverUrl?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000' 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      toast({
        title: 'Connected',
        description: 'Real-time connection established',
        duration: 2000,
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, don't auto-reconnect
        toast({
          title: 'Disconnected',
          description: 'You have been disconnected from the server',
          variant: 'destructive',
        });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current === maxReconnectAttempts) {
        toast({
          title: 'Connection Failed',
          description: 'Unable to establish real-time connection. Some features may be limited.',
          variant: 'destructive',
        });
      }
    });

    // Presence events
    newSocket.on('presence:online_users', (users: SocketUser[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('presence:user_online', (user: { userId: string; username: string; avatar?: string }) => {
      setOnlineUsers(prev => [...prev.filter(u => u.userId !== user.userId), {
        ...user,
        role: 'user',
        status: 'online',
        lastActivity: new Date()
      }]);
    });

    newSocket.on('presence:user_offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
    });

    newSocket.on('presence:status_update', ({ userId, status }: { userId: string; status: string }) => {
      setOnlineUsers(prev => prev.map(u => 
        u.userId === userId ? { ...u, status: status as any, lastActivity: new Date() } : u
      ));
    });

    // Typing indicators
    newSocket.on('typing:update', (data: TypingIndicator) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const roomUsers = newMap.get(data.roomId) || new Set();
        
        if (data.isTyping) {
          roomUsers.add(data.userId);
        } else {
          roomUsers.delete(data.userId);
        }
        
        if (roomUsers.size === 0) {
          newMap.delete(data.roomId);
        } else {
          newMap.set(data.roomId, roomUsers);
        }
        
        return newMap;
      });
    });

    // Notifications
    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadNotificationCount(prev => prev + 1);
      
      // Show toast for important notifications
      if (notification.type !== 'info') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'error' ? 'destructive' : 'default',
        });
      }
    });

    newSocket.on('notification:unread_count', ({ count }: { count: number }) => {
      setUnreadNotificationCount(count);
    });

    // Article events
    newSocket.on('article:user_joined', ({ userId, username, articleId, usersInRoom }) => {
      console.log(`${username} joined article ${articleId}`, usersInRoom);
    });

    newSocket.on('article:user_left', ({ userId, username, articleId }) => {
      console.log(`${username} left article ${articleId}`);
    });

    newSocket.on('article:changes', (data) => {
      // This will be handled by the article editor component
      console.log('Article changes received:', data);
    });

    // Article lifecycle events
    newSocket.on('article:created', (data) => {
      console.log('New article created:', data);
    });

    newSocket.on('article:updated', (data) => {
      console.log('Article updated:', data);
    });

    newSocket.on('article:deleted', (data) => {
      console.log('Article deleted:', data);
    });

    newSocket.on('article:published', (data) => {
      console.log('Article published:', data);
    });

    newSocket.on('article:status_changed', (data) => {
      console.log('Article status changed:', data);
    });

    // Error handling
    newSocket.on('error', ({ message }: { message: string }) => {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user, serverUrl, toast]);

  // Methods
  const joinArticleRoom = useCallback((articleId: string) => {
    if (socket?.connected) {
      socket.emit('article:join', articleId);
    }
  }, [socket]);

  const leaveArticleRoom = useCallback((articleId: string) => {
    if (socket?.connected) {
      socket.emit('article:leave', articleId);
    }
  }, [socket]);

  const sendArticleUpdate = useCallback((articleId: string, changes: any, version: number) => {
    if (socket?.connected) {
      socket.emit('article:update', { articleId, changes, version });
    }
  }, [socket]);

  const startTyping = useCallback((roomId: string) => {
    if (socket?.connected) {
      socket.emit('typing:start', roomId);
    }
  }, [socket]);

  const stopTyping = useCallback((roomId: string) => {
    if (socket?.connected) {
      socket.emit('typing:stop', roomId);
    }
  }, [socket]);

  const updatePresenceStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    if (socket?.connected) {
      socket.emit('presence:update', status);
    }
  }, [socket]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (socket?.connected) {
      socket.emit('notification:mark_read', notificationId);
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    }
  }, [socket]);

  const requestData = useCallback((type: string, params: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('request:data', type, params, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Request failed'));
        }
      });
    });
  }, [socket]);

  // Event listener management
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, handler);
    }
  }, [socket]);

  const off = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, handler);
    }
  }, [socket]);

  const emit = useCallback((event: string, ...args: any[]) => {
    if (socket?.connected) {
      socket.emit(event, ...args);
    }
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    notifications,
    unreadNotificationCount,
    joinArticleRoom,
    leaveArticleRoom,
    sendArticleUpdate,
    startTyping,
    stopTyping,
    updatePresenceStatus,
    markNotificationAsRead,
    requestData,
    on,
    off,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};