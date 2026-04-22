class NostrRelay {
    private ws: WebSocket | null = null;
    private url: string;
    private onMessage: (msg: any) => void;
    private subscriptions: Map<string, (event: any) => void> = new Map();

    constructor(url: string, onMessage: (msg: any) => void) {
        this.url = url;
        this.onMessage = onMessage;
    }

    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => console.log('Connected to BIXGRAM Relay');
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const [type, subId, payload] = data;

            if (type === 'EVENT' && this.subscriptions.has(subId)) {
                this.subscriptions.get(subId)!(payload);
            }

            this.onMessage(data);
        };
        this.ws.onclose = () => console.log('Disconnected from Relay');
    }

    subscribe(filters: any[], callback: (event: any) => void): string {
        const subId = Math.random().toString(36).substring(2, 11);
        this.subscriptions.set(subId, callback);
        this.send(['REQ', subId, ...filters]);
        return subId;
    }

    unsubscribe(subId: string) {
        this.send(['CLOSE', subId]);
        this.subscriptions.delete(subId);
    }

    send(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
}

export default NostrRelay;
