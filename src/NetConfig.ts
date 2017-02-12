import { vp_net_config } from "./Api";
import { Connection } from "./Connection"
import { Callback } from "ffi";
import * as ref from "ref";

export class NetConfig {
  config = new vp_net_config;
  connections: Buffer[] = [];

  constructor() {
    this.config.create = Callback("pointer", ["pointer", "pointer"], this.create);
    this.config.destroy = Callback("void", ["pointer"], this.destroy);
    this.config.connect = Callback("int", ["pointer", "string", "ushort"], this.connect);
    this.config.send = Callback("int", ["pointer", "pointer", "int"], this.send);
    this.config.recv = Callback("int", ["pointer", "pointer", "int"], this.recv);
    this.config.timeout = Callback("int", ["pointer", "int"], this.timeout);
  }

  getConnection(ptr: Buffer): Connection {
    return ref.readObject(ptr) as Connection;
  }

  create = (vpconnection:any) => {
    let connection = new Connection(vpconnection);
    let buf = ref.alloc("Object", connection);
    this.connections.push(buf);
    //console.log("create", ref.address(buf));
    return buf;
  }

  destroy = (ptr: Buffer) => {
    //console.log("destroy", ref.address(ptr));
    this.getConnection(ptr).destroy();
    let idx = this.connections.indexOf(ptr);
    //console.log("idx ", idx);
  };

  connect = (ptr: Buffer, host: string, port: number) => {
    return this.getConnection(ptr).connect(host, port);
  };

  send = (ptr: Buffer, data: Buffer, length: number) => {
    return this.getConnection(ptr).send(data, length);
  };

  recv = (ptr: Buffer, data: Buffer, length: number) => {
    return this.getConnection(ptr).recv(data, length);
  };

  timeout = (ptr: Buffer, seconds: number) => {
    //console.log("timeout", ref.address(ptr));
    return this.getConnection(ptr).timeout(seconds);
  };
}
