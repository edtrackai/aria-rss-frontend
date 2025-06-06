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

export const SocketProviderV2: React.FC<SocketProviderProps> = ({ 
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
  
  // Use refs for cleanup tracking
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);
  const eventHandlersRef = useRef<Map<string, Set<Function>>>(new Map());
  
  const maxReconnectAttempts = 5;

  // Cleanup all event handlers
  const cleanupEventHandlers = useCallback(() => {
    if (socketRef.current) {
      eventHandlersRef.current.forEach((handlers, event) => {
        handlers.forEach(handler => {
          socketRef.current?.off(event, handler as any);
        });
      });
      eventHandlersRef.current.clear();
    }
  }, []);

  // Register event handler with tracking
  const registerEventHandler = useCallback((event: string, handler: Function) => {
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }
    eventHandlersRef.current.get(event)!.add(handler);
    socketRef.current?.on(event, handler as any);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        cleanupEventHandlers();
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setTypingUsers(new Map());
        setNotifications([]);
        setUnreadNotificationCount(0);
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
    const handleConnect = () => {
      if (!mountedRef.current) return;
      
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      
      toast({
        title: 'Connected',
        description: 'Real-time connection established',
        duration: 2000,
      });
    };

    const handleDisconnect = (reason: string) => {
      if (!mountedRef.current) return;
      
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        toast({
          title: 'Disconnected',
          description: 'You have been disconnected from the server',
          variant: 'destructive',
        });
      }
    };

    const handleConnectError = (error: Error) => {
      if (!mountedRef.current) return;
      
      console.error('Socket connection error:', error);
      reconnectAttemptsRef.current++;
      
      if (reconnectAttemptsRef.current === maxReconnectAttempts) {
        toast({
          title: 'Connection Failed',
          description: 'Unable to establish real-time connection. Some features may be limited.',
          variant: 'destructive',
        });
      }
    };

    // Presence event handlers
    const handleOnlineUsers = (users: SocketUser[]) => {
      if (!mountedRef.current) return;
      setOnlineUsers(users);
    };

    const handleUserOnline = (user: { userId: string; username: string; avatar?: string }) => {
      if (!mountedRef.current) return;
      
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== user.userId);
        return [...filtered, {
          ...user,
          role: 'user',
          status: 'online',
          lastActivity: new Date()
        }];
      });
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      if (!mountedRef.current) return;
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
    };

    const handleStatusUpdate = ({ userId, status }: { userId: string; status: string }) => {
      if (!mountedRef.current) return;
      
      setOnlineUsers(prev => prev.map(u => 
        u.userId === userId ? { ...u, status: status as any, lastActivity: new Date() } : u
      ));
    };

    // Typing indicator handler
    const handleTypingUpdate = (data: TypingIndicator) => {
      if (!mountedRef.current) return;
      
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
    };

    // Notification handlers
    const handleNewNotification = (notification: Notification) => {
      if (!mountedRef.current) return;
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadNotificationCount(prev => prev + 1);
      
      if (notification.type !== 'info') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'error' ? 'destructive' : 'default',
        });
      }
    };

    const handleUnreadCount = ({ count }: { count: number }) => {
      if (!mountedRef.current) return;
      setUnreadNotificationCount(count);
    };

    // Article event handlers
    const handleArticleUserJoined = ({ userId, username, articleId, usersInRoom }: any) => {
      if (!mountedRef.current) return;
      console.log(`${username} joined article ${articleId}`, usersInRoom);
    };

    const handleArticleUserLeft = ({ userId, username, articleId }: any) => {
      if (!mountedRef.current) return;
      console.log(`${username} left article ${articleId}`);
    };

    const handleArticleChanges = (data: any) => {
      if (!mountedRef.current) return;
      console.log('Article changes received:', data);
    };

    const handleError = ({ message }: { message: string }) => {
      if (!mountedRef.current) return;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    };

    // Register all event handlers
    registerEventHandler('connect', handleConnect);
    registerEventHandler('disconnect', handleDisconnect);
    registerEventHandler('connect_error', handleConnectError);
    registerEventHandler('presence:online_users', handleOnlineUsers);
    registerEventHandler('presence:user_online', handleUserOnline);
    registerEventHandler('presence:user_offline', handleUserOffline);
    registerEventHandler('presence:status_update', handleStatusUpdate);
    registerEventHandler('typing:update', handleTypingUpdate);
    registerEventHandler('notification:new', handleNewNotification);
    registerEventHandler('notification:unread_count', handleUnreadCount);
    registerEventHandler('article:user_joined', handleArticleUserJoined);
    registerEventHandler('article:user_left', handleArticleUserLeft);
    registerEventHandler('article:changes', handleArticleChanges);
    registerEventHandler('article:current_users', (data: any) => {
      if (!mountedRef.current) return;
      console.log('Current article users:', data);
    });
    registerEventHandler('error', handleError);

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      cleanupEventHandlers();
      
      if (newSocket) {
        newSocket.disconnect();
      }
      
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
      setTypingUsers(new Map());
      setNotifications([]);
      setUnreadNotificationCount(0);
    };
  }, [user, serverUrl, toast, cleanupEventHandlers, registerEventHandler]);

  // Methods
  const joinArticleRoom = useCallback((articleId: string) => {
    if (socket?.connected && mountedRef.current) {
      socket.emit('article:join', articleId);
    }
  }, [socket]);

  const leaveArticleRoom = useCallback((articleId: string) => {
    if (socket?.connected && mountedRef.current) {
      socket.emit('article:leave', articleId);
    }
  }, [socket]);

  const sendArticleUpdate = useCallback((articleId: string, changes: any, version: number) => {
    if (socket?.connected && mountedRef.current) {
      socket.emit('article:update', { articleId, changes, version });
    }
  }, [socket]);

  const startTyping = useCallback((roomId: string) => {
    if (socket?.connected && mountedRef.current) {
      socket.emit('article:typing', { articleId: roomId.replace('article:', ''), isTyping: true });
    }
  }, [socket]);

  const stopTyping = useCallback((roomId: string) => {
    if (socket?.connected && mountedRef.current) {
      socket.emit('article:typing', { articleId: roomId.replace('article:', ''), isTyping: false });
    }
  }, [socket]);

  const updatePresenceStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    if (socket?.connected && mountedRef.current) {
      socket.emit('presence:update', { status });
    }
  }, [socket]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (socket?.connected && mountedRef.current) {
      socket.emit('notification:mark_read', notificationId);
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    }
  }, [socket]);

  const requestData = useCallback((type: string, params: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socket?.connected || !mountedRef.current) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      socket.emit('request:data', type, params, (response: any) => {
        clearTimeout(timeout);
        
        if (!mountedRef.current) {
          reject(new Error('Component unmounted'));
          return;
        }
        
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
    if (socket && mountedRef.current) {
      registerEventHandler(event, handler);
    }
  }, [socket, registerEventHandler]);

  const off = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socket && mountedRef.current) {
      socket.off(event, handler);
      const handlers = eventHandlersRef.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(event);
        }
      }
    }
  }, [socket]);

  const emit = useCallback((event: string, ...args: any[]) => {
    if (socket?.connected && mountedRef.current) {
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