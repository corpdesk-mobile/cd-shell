/**
 * A lightweight, type-safe event emitter for cd-shell ecosystem.
 * Works for HttpFxEvents, UI notifications, and other reactive interactions.
 */
export class FxEventEmitter {
    constructor() {
        this.listeners = [];
    }
    /**
     * Subscribe to events.
     * @param handler Function to be called when an event is emitted.
     * @returns A function to unsubscribe.
     */
    on(handler) {
        this.listeners.push(handler);
        return () => this.off(handler);
    }
    /**
     * Remove a specific listener.
     */
    off(handler) {
        this.listeners = this.listeners.filter((h) => h !== handler);
    }
    /**
     * Emit a new event to all listeners.
     */
    async emit(event) {
        for (const handler of this.listeners) {
            try {
                await handler(event);
            }
            catch (err) {
                console.error(`[FxEventEmitter] Handler error:`, err);
            }
        }
    }
    /**
     * Remove all listeners — typically on module unload.
     */
    clear() {
        this.listeners = [];
    }
    /**
     * Check if there are any listeners.
     */
    hasListeners() {
        return this.listeners.length > 0;
    }
}
