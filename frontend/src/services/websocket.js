// frontend/src/services/websocket.js
class WebSocketService {
    constructor() {
      this.ws = null;
      this.subscribers = new Map();
    }
  
    connect(token) {
      const wsUrl = `${process.env.REACT_APP_WS_URL}?token=${token}`;
      this.ws = new WebSocket(wsUrl);
  
      this.ws.onopen = () => {
        console.log('WebSocket connected');
      };
  
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.notifySubscribers(data);
      };
  
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(token), 5000);
      };
  
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  
    subscribe(eventType, callback) {
      if (!this.subscribers.has(eventType)) {
        this.subscribers.set(eventType, new Set());
      }
      this.subscribers.get(eventType).add(callback);
  
      // Return unsubscribe function
      return () => {
        this.subscribers.get(eventType).delete(callback);
      };
    }
  
    notifySubscribers(data) {
      const { type, payload } = data;
      if (this.subscribers.has(type)) {
        this.subscribers.get(type).forEach(callback => callback(payload));
      }
    }
  
    disconnect() {
      if (this.ws) {
        this.ws.close();
      }
    }
  }
  
  export const wsService = new WebSocketService();
  export default wsService;