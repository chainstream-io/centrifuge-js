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
    let subProtocol = '';
    if (protocol === 'protobuf') {
      subProtocol = 'centrifuge-protobuf';
    }

    // Check if we have HTTP headers to pass (only works in Node.js with 'ws' library)
    // Browser WebSocket API does not support custom headers
    const httpHeaders = this.options.httpHeaders;
    const hasHttpHeaders = httpHeaders && Object.keys(httpHeaders).length > 0;

    if (subProtocol !== '') {
      if (hasHttpHeaders) {
        // Node.js 'ws' library supports third argument with headers
        this._transport = new this.options.websocket(this.endpoint, subProtocol, { headers: httpHeaders });
      } else {
        this._transport = new this.options.websocket(this.endpoint, subProtocol);
      }
    } else {
      if (hasHttpHeaders) {
        // Node.js 'ws' library supports third argument with headers
        this._transport = new this.options.websocket(this.endpoint, undefined, { headers: httpHeaders });
      } else {
        this._transport = new this.options.websocket(this.endpoint);
      }
    }
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
