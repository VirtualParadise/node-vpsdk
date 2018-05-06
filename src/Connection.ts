import { Lib, NetNotify, NetReturnCode } from "./Api";
import * as net from "net";
import * as timers from "timers";

export class Connection {
  socket: net.Socket;
  timer: NodeJS.Timer;
  connected: boolean;
  data: Buffer[] = [];

  constructor(private vpconnection: number, private sdkModule: any) {
    this.connected = false;
    this.socket = new net.Socket();
  }

  destroy() {
    //console.log("destroy(" + this + ")");
    this.socket.destroy();
    this.socket = null;
  }

  connect(host: string, port: number) {
    //console.log("connect", host, port);
    this.socket.connect(port, host, () => {
      //console.log("connected!")
      this.connected = true;
      Lib.vp_net_notify(this.vpconnection, NetNotify.VP_NET_NOTIFY_CONNECT, NetReturnCode.VP_NET_RC_SUCCESS);
    });

    this.socket.on("error", (error) => {
      //console.log("error", error);
      if (this.connected) {
      } else {
        //console.log("error, not connected");
        Lib.vp_net_notify(this.vpconnection, NetNotify.VP_NET_NOTIFY_CONNECT, NetReturnCode.VP_NET_RC_CONNECTION_ERROR);
      }
    });

    this.socket.on("data", (data) => {
      this.data.push(data);
      if (this.vpconnection !== null) {
        Lib.vp_net_notify(this.vpconnection, NetNotify.VP_NET_NOTIFY_READ_READY, 0);
      }
    });

    this.socket.on("close", () => {
      if (this.vpconnection !== null) {
        Lib.vp_net_notify(this.vpconnection, NetNotify.VP_NET_NOTIFY_DISCONNECT, 0);
      }
    });
  }

  send(data: Uint8Array) {
    //data = ref.reinterpret(data, length);
    this.socket.write(data);
    return data.length;
  }

  recv(destination: Uint8Array) {
    let destinationOffset = 0;
    while (this.data.length !== 0) {
      let buffer = this.data[0];
      let bytesToCopy = destination.length - destinationOffset;
      if (buffer.length > bytesToCopy) {
        destination.set(buffer.slice(0, bytesToCopy), destinationOffset);
        this.data[0] = buffer.slice(bytesToCopy);
        destinationOffset += bytesToCopy;
        break;
      } else {
        destination.set(buffer, destinationOffset);
        destinationOffset += buffer.length;
        this.data.shift();
      }
    }
    return destinationOffset === 0 ? NetReturnCode.VP_NET_RC_WOULD_BLOCK : destinationOffset;
  }

  timeout(seconds: number) {
    //console.log("timeout", seconds);
    if (this.timer) {
      timers.clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (seconds >= 0) {
      this.timer = timers.setTimeout(() => {
        Lib.vp_net_notify(this.vpconnection, NetNotify.VP_NET_NOTIFY_TIMEOUT, 0);
      }, seconds * 1000);
    } else if (this.timer) {
      timers.clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
