class EventBus extends EventTarget {
    private static instance: EventBus;

    private constructor() {
        super();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    // Typed wrapper for emitting events
    emit(eventName: string, detail?: any) {
        this.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    // Typed wrapper for listening
    on(eventName: string, callback: (e: CustomEvent) => void) {
        this.addEventListener(eventName, callback as EventListener);
    }

    // Typed wrapper for removing listeners
    off(eventName: string, callback: (e: CustomEvent) => void) {
        this.removeEventListener(eventName, callback as EventListener);
    }
}

export const eventBus = EventBus.getInstance();