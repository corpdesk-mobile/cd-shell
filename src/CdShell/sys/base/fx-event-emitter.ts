/**
 * A lightweight, type-safe event emitter for cd-shell ecosystem.
 * Works for HttpFxEvents, UI notifications, and other reactive interactions.
 */

export type FxEventHandler<T> = (event: T) => void | Promise<void>;

export class FxEventEmitter<T = any> {
  private listeners: FxEventHandler<T>[] = [];

  /**
   * Subscribe to events.
   * @param handler Function to be called when an event is emitted.
   * @returns A function to unsubscribe.
   */
  on(handler: FxEventHandler<T>): () => void {
    this.listeners.push(handler);
    return () => this.off(handler);
  }

  /**
   * Remove a specific listener.
   */
  off(handler: FxEventHandler<T>): void {
    this.listeners = this.listeners.filter((h) => h !== handler);
  }

  /**
   * Emit a new event to all listeners.
   */
  async emit(event: T): Promise<void> {
    for (const handler of this.listeners) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[FxEventEmitter] Handler error:`, err);
      }
    }
  }

  /**
   * Remove all listeners — typically on module unload.
   */
  clear(): void {
    this.listeners = [];
  }

  /**
   * Check if there are any listeners.
   */
  hasListeners(): boolean {
    return this.listeners.length > 0;
  }
}
