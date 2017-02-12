import { Lib, vp_instance_t, NetNotify, NetReturnCode } from "./Api";
import * as net from "net";
import * as timers from "timers";
import * as ref from "ref";
import * as ffi from "ffi";

export class Connection {
  socket: net.Socket;
  timer: NodeJS.Timer;
  connected: boolean;
  data: Buffer[] = [];

  constructor(private vpconnection: Buffer) {
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

  send(data: Buffer, length: number) {
    data = ref.reinterpret(data, length);
    this.socket.write(data);
    return length;
  }

  recv(data: Buffer, length: number) {
    let destinationOffset = 0;
    data = ref.reinterpret(data, length);
    while (this.data.length !== 0) {
      let buffer = this.data[0];
      let bytesToCopy = length - destinationOffset;
      if (buffer.length > bytesToCopy) {
        buffer.copy(data, destinationOffset, 0, bytesToCopy);
        this.data[0] = buffer.slice(bytesToCopy);
        destinationOffset += bytesToCopy;
        break;
      } else {
        buffer.copy(data, destinationOffset, 0);
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
