// A browser-compatible event emitter implementation
// This replaces Node.js's EventEmitter for browser environments

export class CustomEventEmitter {
  private listeners: Record<string, Function[]> = {};

  on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => {
        listener(...args);
      });
    }
  }

  removeListener(event: string, listener: Function): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      this.listeners[event] = eventListeners.filter(l => l !== listener);
    }
  }
  
  // Add 'off' method as an alias for removeListener to match the standard EventEmitter API
  off(event: string, listener: Function): void {
    this.removeListener(event, listener);
  }
}
