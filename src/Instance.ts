import { NetConfig } from "./NetConfig";
import { Lib, Callbacks, Events, Integers, Floats, Strings } from "./Api";
import { EventEmitter } from "events";
import { IAvatarAddEvent, IAvatarChangeEvent, IAvatarDeleteEvent, IChatEvent } from "./Events";
import { ITeleportLocation, IConsoleMessage } from "./Interfaces";
import * as ffi from "ffi";

export class Instance extends EventEmitter {
  static netConfig = new NetConfig;
  vpinstance: any;

  nativeCallbacks: Buffer[] = [];
  nativeEvents: Buffer[] = [];

  private connectPromise: Promise<void>;

  constructor() {
    super();

    this.vpinstance = Lib.vp_create(Instance.netConfig.config.ref());
    this.setEvent(Events.VP_EVENT_CHAT, () => this.handleChat());
    this.setEvent(Events.VP_EVENT_AVATAR_ADD, () => this.handleAvatarAdd());
    this.setEvent(Events.VP_EVENT_AVATAR_CHANGE, () => this.handleAvatarChange());
    this.setEvent(Events.VP_EVENT_AVATAR_DELETE, () => this.handleAvatarDelete());
    this.setEvent(Events.VP_EVENT_UNIVERSE_DISCONNECT, () => this.emit("universeDisconnect"));
    this.setEvent(Events.VP_EVENT_WORLD_DISCONNECT, () => this.emit("worldDisconnect"));
  }

  destroy() {
    Lib.vp_destroy(this.vpinstance);
    this.vpinstance = null;
  }

  private setEvent(event: number, handler: () => void) {
    let nativeHandler = ffi.Callback("void", ["pointer"], (sender: any) => {
      handler();
    });
    this.nativeEvents[event] = nativeHandler;
    Lib.vp_event_set(this.vpinstance, event, nativeHandler);
  }

  private setCallback(callback: number, handler: (rc: number) => void) {
    let nativeHandler = ffi.Callback("void", ["pointer", "int"], (sender: any, rc: number) => {
      handler(rc);
    });
    this.nativeCallbacks[callback] = nativeHandler;
    Lib.vp_callback_set(this.vpinstance, callback, nativeHandler);
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

  connect(host:string, port:number) {
    return new Promise((resolve, reject) => {
      this.setCallback(Callbacks.VP_CALLBACK_CONNECT_UNIVERSE, (rc) => {
        if (rc) {
          reject(rc);
        } else {
          resolve(null);
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
}
