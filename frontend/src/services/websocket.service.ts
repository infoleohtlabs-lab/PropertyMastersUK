import { io, Socket } from 'socket.io-client';

export interface WebSocketConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface SocketEventHandler {
  event: string;
  handler: (...args: any[]) => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private eventHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: WebSocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config,
    };
    this.maxReconnectAttempts = this.config.reconnectionAttempts || 5;

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for current connection attempt
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;

      try {
        this.socket = io(this.config.url, {
          auth: {
            token: this.config.token,
          },
          autoConnect: false,
          reconnection: this.config.reconnection,
          reconnectionAttempts: this.config.reconnectionAttempts,
          reconnectionDelay: this.config.reconnectionDelay,
        });

        this.setupEventListeners();

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reattachEventHandlers();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.isConnecting = false;
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.handleReconnection();
          }
        });

        this.socket.connect();
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit ${event}: WebSocket not connected`);
    }
  }

  on(event: string, handler: (...args: any[]) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)!.add(handler);
    
    if (this.socket) {
      this.socket.on(event, handler);
    }

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler);
      if (this.socket) {
        this.socket.off(event, handler);
      }
    } else {
      this.eventHandlers.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  once(event: string, handler: (...args: any[]) => void): void {
    if (this.socket?.connected) {
      this.socket.once(event, handler);
    } else {
      console.warn(`Cannot listen to ${event}: WebSocket not connected`);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): 'connected' | 'connecting' | 'disconnected' {
    if (this.socket?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  updateToken(token: string): void {
    this.config.token = token;
    if (this.socket) {
      this.socket.auth = { token };
      if (this.socket.connected) {
        this.socket.disconnect().connect();
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
    });
  }

  private reattachEventHandlers(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket!.on(event, handler);
      });
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectionDelay! * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.socket?.connected) {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
          this.handleReconnection();
        });
      }
    }, delay);
  }

  // Utility methods for common patterns
  joinRoom(roomId: string): void {
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.emit('leave_room', { roomId });
  }

  sendMessage(data: any): void {
    this.emit('send_message', data);
  }

  // Health check
  ping(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const startTime = Date.now();
      
      this.socket.emit('ping', startTime);
      
      this.socket.once('pong', (timestamp) => {
        const latency = Date.now() - timestamp;
        resolve(latency);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);
    });
  }
}