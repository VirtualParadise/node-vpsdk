import { Connection } from "./Connection";

export class NetConfig {
  private connections: Connection[] = [];
  ptr: number;

  constructor(private module: any) {
    this.ptr = module._malloc(7 * 4);
    const pointers = [
      module.addFunction(this.create, "iii"),
      module.addFunction(this.destroy, "vi"),
      module.addFunction(this.connect, "iiii"),
      module.addFunction(this.send, "iiii"),
      module.addFunction(this.recv, "iiii"),
      module.addFunction(this.timeout, "iii"),
      0
    ];
    
    for (let i=0; i<pointers.length; ++i) {
      module.setValue(this.ptr + i * 4, pointers[i], "*");
    }
  }

  getConnection(index: number): Connection {
    return this.connections[index - 1];
  }

  create = (vpconnection:any) => {
    let connection = new Connection(vpconnection, this.module);
    return this.connections.push(connection);
  }

  destroy = (connectionIndex: number) => {
    this.getConnection(connectionIndex).destroy();
    delete this.connections[connectionIndex];
  };

  connect = (connectionIndex: number, hostPtr: number, port: number) => {
    const host = this.module.UTF8ToString(hostPtr)
    return this.getConnection(connectionIndex).connect(host, port);
  };

  send = (connectionIndex: number, dataPtr: number, length: number) => {
    return this.getConnection(connectionIndex).send(new Uint8Array(this.module.HEAP8.buffer, dataPtr, length));
  };

  recv = (connectionIndex: number, dataPtr: number, length: number) => {
    return this.getConnection(connectionIndex).recv(new Uint8Array(this.module.HEAP8.buffer, dataPtr, length));
  };

  timeout = (connectionIndex: number, seconds: number) => {
    return this.getConnection(connectionIndex).timeout(seconds);
  };
}
