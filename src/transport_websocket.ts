/** @internal */
export class WebsocketTransport {
  private _transport: any;
  private endpoint: string;
  private options: any;

  constructor(endpoint: string, options: any) {
    this.endpoint = endpoint;
    this.options = options;
    this._transport = null;
  }

  name() {
    return 'websocket';
  }

  subName() {
    return 'websocket';
  }

  emulation() {
    return false;
  }

  supported() {
    return this.options.websocket !== undefined && this.options.websocket !== null;
  }

  initialize(protocol: string, callbacks: any) {
    // Build protocols array for Sec-WebSocket-Protocol header
    const protocols: string[] = [];
    
    if (protocol === 'protobuf') {
      protocols.push('centrifuge-protobuf');
    }

    // Add token via Sec-WebSocket-Protocol header for authentication
    // Note: Sec-WebSocket-Protocol values cannot contain spaces
    // So we use format "Bearer.{token}" or just the token directly
    const wsProtocolToken = this.options.wsProtocolToken;
    if (wsProtocolToken) {
      // Use token directly without "Bearer " prefix since spaces are not allowed
      protocols.push(wsProtocolToken);
    }

    // Determine the protocols argument
    const protocolsArg = protocols.length > 0 ? protocols : undefined;
    this._transport = new this.options.websocket(this.endpoint, protocolsArg);
    
    if (protocol === 'protobuf') {
      this._transport.binaryType = 'arraybuffer';
    }

    this._transport.onopen = () => {
      callbacks.onOpen();
    };

    this._transport.onerror = e => {
      callbacks.onError(e);
    };

    this._transport.onclose = closeEvent => {
      callbacks.onClose(closeEvent);
    };

    this._transport.onmessage = event => {
      callbacks.onMessage(event.data);
    };
  }

  close() {
    this._transport.close();
  }

  send(data: any) {
    this._transport.send(data);
  }
}
