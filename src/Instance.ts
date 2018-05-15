import { EventEmitter } from "events";
import { Callbacks, Datas, Events, Floats, Integers, Lib, Strings, initializeVpsdk } from "./Api";
import { IAvatarAddEvent, IAvatarChangeEvent, IAvatarDeleteEvent, IChatEvent } from "./Events";
import { ICellQueryResult, IConsoleMessage, IObject, ITeleportLocation, QueryStatus } from "./Interfaces";

class ICellQueryResolveReject {
  resolve: (result: ICellQueryResult) => void; 
  reject: (error: any) => void;
}

export class Instance extends EventEmitter {
  private vpinstance: any;
  private connectPromise: Promise<void>;
  private cellResolveRejects: { [index: string]: ICellQueryResolveReject; } = {};
  private currentCellObjects: IObject[] = [];

  destroy() {
    Lib.vp_destroy(this.vpinstance);
    this.vpinstance = null;
  }

  private setEvent(event: number, handler: () => void) {
    Lib.vp_event_set(this.vpinstance, event, handler);
  }

  private setCallback(callback: number, handler: (rc: number, reference: number) => void) {
    Lib.vp_callback_set(this.vpinstance, callback, (sender, rc, reference) => handler(rc, reference));
  }

  private handleAvatarAdd() {
    let data: IAvatarAddEvent = {
      session: Lib.vp_int(this.vpinstance, Integers.VP_AVATAR_SESSION),
      userId: Lib.vp_int(this.vpinstance, Integers.VP_USER_ID),
      name: Lib.vp_string(this.vpinstance, Strings.VP_AVATAR_NAME),
      type: Lib.vp_int(this.vpinstance, Integers.VP_AVATAR_TYPE),
      position: {
        x: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_X),
        y: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_Y),
        z: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_Z)
      },
      rotation: {
        x: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_PITCH),
        y: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_YAW)
      }
    };

    this.emit("avatarAdd", data);
  }

  private handleAvatarDelete() {
    let data: IAvatarDeleteEvent = {
      name: Lib.vp_string(this.vpinstance, Strings.VP_AVATAR_NAME),
      session: Lib.vp_int(this.vpinstance, Integers.VP_AVATAR_SESSION)
    };
    this.emit("avatarDelete", data);
  }

  private handleAvatarChange() {
    let data: IAvatarChangeEvent = {
      name: Lib.vp_string(this.vpinstance, Strings.VP_AVATAR_NAME),
      session: Lib.vp_int(this.vpinstance, Integers.VP_AVATAR_SESSION),
      type: Lib.vp_int(this.vpinstance, Integers.VP_AVATAR_TYPE),
      position: {
        x: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_X),
        y: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_Y),
        z: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_Z)
      },
      rotation: {
        x: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_PITCH),
        y: Lib.vp_double(this.vpinstance, Floats.VP_AVATAR_YAW)
      }
    };
    this.emit("avatarChange", data);
  }

  private handleChat() {
    let data: IChatEvent = {
      session: Lib.vp_int(this.vpinstance, Integers.VP_AVATAR_SESSION),
      name: Lib.vp_string(this.vpinstance, Strings.VP_AVATAR_NAME),
      message: Lib.vp_string(this.vpinstance, Strings.VP_CHAT_MESSAGE),
      type: Lib.vp_string(this.vpinstance, Integers.VP_CHAT_TYPE), 
    }
    this.emit("chat", data);
  }

  async connect(host?:string, port?:number): Promise<void> {
    host = host || "universe.virtualparadise.org";
    port = port || 57000;
    
    if (!this.vpinstance) {
      await initializeVpsdk();
      this.vpinstance = Lib.vp_create();

      this.setEvent(Events.VP_EVENT_CHAT, () => this.handleChat());
      this.setEvent(Events.VP_EVENT_AVATAR_ADD, () => this.handleAvatarAdd());
      this.setEvent(Events.VP_EVENT_AVATAR_CHANGE, () => this.handleAvatarChange());
      this.setEvent(Events.VP_EVENT_AVATAR_DELETE, () => this.handleAvatarDelete());
      this.setEvent(Events.VP_EVENT_UNIVERSE_DISCONNECT, () => this.emit("universeDisconnect"));
      this.setEvent(Events.VP_EVENT_WORLD_DISCONNECT, () => this.emit("worldDisconnect"));
      this.setEvent(Events.VP_EVENT_OBJECT, () => this.handleObject());
      this.setEvent(Events.VP_EVENT_CELL_END, () => this.handleCellEnd());
    }
    
    return await new Promise<void>((resolve, reject) => {
      this.setCallback(Callbacks.VP_CALLBACK_CONNECT_UNIVERSE, (rc) => {
        if (rc) {
          reject(rc);
        } else {
          resolve();
        }
      });

      var rc = Lib.vp_connect_universe(this.vpinstance, host, port);
      if (rc) {
        reject(rc);
      }
    });
  }

  login(username: string, password: string, botName: string) {
    return new Promise((resolve, reject) => {
      this.setCallback(Callbacks.VP_CALLBACK_LOGIN, (rc) => {
        if (rc) {
          reject(rc);
        } else {
          resolve(null);
        }
      });

      var rc = Lib.vp_login(this.vpinstance, username, password, botName);
      if (rc) {
        reject(rc);
      }
    });
  }


  enter(world: string) {
    return new Promise((resolve, reject) => {
      this.setCallback(Callbacks.VP_CALLBACK_ENTER, (rc) => {
        if (rc) {
          reject(rc);
        } else {
          resolve(null);
        }
      });

      var rc = Lib.vp_enter(this.vpinstance, world);
      if (rc) {
        reject(rc);
      }
    });
  }

  setAvatar(position: number[], yaw: number, pitch: number, type: number) {
    Lib.vp_int_set(this.vpinstance, Integers.VP_MY_TYPE, type);
    Lib.vp_double_set(this.vpinstance, Floats.VP_MY_X, position[0]);
    Lib.vp_double_set(this.vpinstance, Floats.VP_MY_Y, position[1]);
    Lib.vp_double_set(this.vpinstance, Floats.VP_MY_Z, position[2]);
    Lib.vp_double_set(this.vpinstance, Floats.VP_MY_YAW, yaw);
    Lib.vp_double_set(this.vpinstance, Floats.VP_MY_PITCH, pitch);
    Lib.vp_state_change(this.vpinstance);
  }

  say(message: string) {
    Lib.vp_say(this.vpinstance, message);
  }

  teleportAvatar(session: number, location: ITeleportLocation) {
    Lib.vp_teleport_avatar(this.vpinstance, session, location.world, 
      location.position.x, location.position.y, location.position.z, 
      location.rotation.x, location.rotation.y);
  }

  consoleMessage(messageDescription: IConsoleMessage, session?: number) {
    Lib.vp_console_message(
      this.vpinstance, session ? session : 0,
      messageDescription.name, messageDescription.content, messageDescription.effects,
      messageDescription.color.r, messageDescription.color.g, messageDescription.color.b);
  }

  queryCell(x: number, z: number, revision?: number) {
    revision = revision || 0;

    const key = this.getCellKey(x, z);
    const promise = new Promise<ICellQueryResult>((resolve, reject) => {
      this.cellResolveRejects[key] = { resolve: resolve, reject: reject };
    });
    Lib.vp_query_cell_revision(this.vpinstance, x, z, revision);
    return promise;
  }
  
  private getCellKey(x: number, z: number) {
    return `${x} ${z}`
  }

  private readObject() {
    const sourceData = Lib.vp_data(this.vpinstance, Datas.VP_OBJECT_DATA);
    let data: Uint8Array;
    if (sourceData) {
      data = new Uint8Array(sourceData.length);
      data.set(sourceData);
    }
    
    const object: IObject = {
      id: Lib.vp_int(this.vpinstance, Integers.VP_OBJECT_ID),
      type: Lib.vp_int(this.vpinstance, Integers.VP_OBJECT_TYPE),
      owner: Lib.vp_int(this.vpinstance, Integers.VP_OBJECT_USER_ID),
      model: Lib.vp_string(this.vpinstance, Strings.VP_OBJECT_MODEL),
      description: Lib.vp_string(this.vpinstance, Strings.VP_OBJECT_DESCRIPTION),
      action: Lib.vp_string(this.vpinstance, Strings.VP_OBJECT_ACTION),
      position: {
        x: Lib.vp_double(this.vpinstance, Floats.VP_OBJECT_X),
        y: Lib.vp_double(this.vpinstance, Floats.VP_OBJECT_Y),
        z: Lib.vp_double(this.vpinstance, Floats.VP_OBJECT_Z)
      },
      rotationAxis: {
        x: Lib.vp_float(this.vpinstance, Floats.VP_OBJECT_ROTATION_X),
        y: Lib.vp_float(this.vpinstance, Floats.VP_OBJECT_ROTATION_Y),
        z: Lib.vp_float(this.vpinstance, Floats.VP_OBJECT_ROTATION_Z)
      },
      rotationAngle: Lib.vp_float(this.vpinstance, Floats.VP_OBJECT_ROTATION_ANGLE),
      date: new Date(Lib.vp_int(this.vpinstance, Integers.VP_OBJECT_TIME) * 1000),
      data: data
    };
    return object;
  }

  private handleObject() {
    const sessionId = Lib.vp_int(this.vpinstance, Integers.VP_AVATAR_SESSION);
    const object = this.readObject();
    if (sessionId === 0) {
      this.currentCellObjects.push(object);
    } else {
      //TODO: handle object add event
    }
  }
  
  private handleCellEnd() {
    const x = Lib.vp_int(this.vpinstance, Integers.VP_CELL_X);
    const z = Lib.vp_int(this.vpinstance, Integers.VP_CELL_Z);
    const revision = Lib.vp_int(this.vpinstance, Integers.VP_CELL_REVISION);
    const status = Lib.vp_int(this.vpinstance, Integers.VP_CELL_STATUS);
    const objects = this.currentCellObjects;
    this.currentCellObjects = [];

    const key = this.getCellKey(x, z);
    if (status === QueryStatus.Modified || status === QueryStatus.NotModified) {
      this.cellResolveRejects[key].resolve({
        status: status,
        revision: revision,
        objects: objects
      });
    } else {
      this.cellResolveRejects[key].reject(`query failed: ${status}`);
    }
    delete this.cellResolveRejects[key];
  }
}
