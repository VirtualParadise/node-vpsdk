import { NetConfig } from "./NetConfig";
import * as path from "path";

const loader = require("vpsdk-wasm");

export let Lib: Functions;
export class Functions {
  private netConfig: NetConfig;
  private events: { [index: number]: { [index: number]: (sender: number) => void; }} = {};
  private callbacks: { [index: number]: { [index: number]: (sender: number, rc: number, reference: number) => void; }} = {};
  private handleEventPtr: number;
  private handleCallbackPtr: number;

  constructor(private module: any) {
    this.netConfig = new NetConfig(module);
    this.handleEventPtr = module.addFunction(this.handleEvent, "vi");
    this.handleCallbackPtr = module.addFunction(this.handleCallback, "viii");
  }

  vp_create() {
    const instance = this.module.ccall("vp_create", "number", ["number"], [this.netConfig.ptr]);
    this.events[instance] = {};
    this.callbacks[instance] = {};
    return instance;
  }

  vp_destroy(instance: number) {
    const result = this.module.ccall("vp_destroy", null, ["number"]);
    delete this.events[instance];
    delete this.callbacks[instance];
    return result;
  }

  vp_connect_universe = this.module.cwrap("vp_connect_universe", "number", ["number", "string", "number"]);
  vp_login = this.module.cwrap("vp_login", "number", ["number", "string", "string", "string"]);
  vp_enter = this.module.cwrap("vp_enter", "number", ["number", "string"]);
  vp_leave = this.module.cwrap("vp_leave", "number", ["number"]);
  vp_say = this.module.cwrap("vp_say", "number", ["number", "string"]);
  vp_console_message = this.module.cwrap("vp_console_message", "number", ["number", "number", "string", "string", "number", "number", "number", "number"]);
  
  private handleEvent = (sender: number) => {
    const eventIndex = this.vp_int(sender, Integers.VP_CURRENT_EVENT);
    const handler = this.events[sender][eventIndex];
    if (handler) {
      handler(sender);
    }
  }

  vp_event_set(instance: number, eventIndex: number, handler: (sender: number) => void) {
    this.events[instance][eventIndex] = handler;
    return this.module.ccall("vp_event_set", "number", ["number", "number", "number"], [instance, eventIndex, this.handleEventPtr]);
  }

  private handleCallback = (sender: number, rc: number, reference: number) => {
    const callbackIndex = this.vp_int(sender, Integers.VP_CURRENT_CALLBACK);
    const handler = this.callbacks[sender][callbackIndex];
    if (handler) {
      handler(sender, rc, reference);
    }
  }

  vp_callback_set(instance: number, callbackIndex: number, handler: (sender: number, rc: number, reference: number) => void) {
    this.callbacks[instance][callbackIndex] = handler;
    return this.module.ccall("vp_callback_set", "number", ["number", "number", "number"], [instance, callbackIndex, this.handleCallbackPtr]);
  }

  vp_user_data = this.module.cwrap("vp_user_data", "number", ["number"]);
  vp_user_data_set = this.module.cwrap("vp_user_data_set", "void", ["number", "number"]);
  vp_state_change = this.module.cwrap("vp_state_change", "number", ["number"]);
  vp_int = this.module.cwrap("vp_int", "number", ["number", "number"]);
  vp_float = this.module.cwrap("vp_float", "number", ["number", "number"]);
  vp_double = this.module.cwrap("vp_double", "double", ["number", "number"]);
  vp_string = this.module.cwrap("vp_string", "string", ["number", "number"]);
  vp_data = this.module.cwrap("vp_data", "number", ["number", "number", "number"]);
  vp_int_set = this.module.cwrap("vp_int_set", "number", ["number", "number", "number"]);
  vp_float_set = this.module.cwrap("vp_float_set", "number", ["number", "number", "number"]);
  vp_double_set = this.module.cwrap("vp_double_set", "number", ["number", "number", "double"]);
  vp_string_set = this.module.cwrap("vp_string_set", "number", ["number", "number", "string"]);
  vp_query_cell_revision = this.module.cwrap("vp_query_cell_revision", "number", ["number", "number", "number"]);
  vp_object_add = this.module.cwrap("vp_object_add", "number", ["number"]);
  vp_object_load = this.module.cwrap("vp_object_load", "number", ["number"]);
  vp_object_bump_begin = this.module.cwrap("vp_object_bump_begin", "number", ["number", "number", "number"]);
  vp_object_bump_end = this.module.cwrap("vp_object_bump_end", "number", ["number", "number", "number"]);
  vp_object_change = this.module.cwrap("vp_object_change", "number", ["number"]);
  vp_object_click = this.module.cwrap("vp_object_click", "number", ["number", "number", "number", "number", "number", "number"]);
  vp_object_delete = this.module.cwrap("vp_object_delete", "number", ["number", "number"]);
  vp_object_get = this.module.cwrap("vp_object_get", "number", ["number", "number"]);
  vp_world_list = this.module.cwrap("vp_world_list", "number", ["number", "number"]);
  vp_user_attributes_by_id = this.module.cwrap("vp_user_attributes_by_id", "number", ["number", "number"]);
  vp_teleport_avatar = this.module.cwrap("vp_teleport_avatar", "number", ["number", "number", "string", "number", "number", "number", "number", "number"]);
  vp_net_notify = this.module.cwrap("vp_net_notify", "number", ["number", "number", "number"])
}

export function initializeVpsdk(): Promise<void> {
  if (Lib) {
    return;
  }
  
  return new Promise<void>((resolve, reject) => {
    loader({
      locateFile: (name: string) => path.join(path.dirname(require.resolve("vpsdk-wasm")), name)
    }).then((module: any) => {
        Lib = new Functions(module);
        resolve();
    }, (error: any) => reject(error));
  });
}

export enum Integers {
  VP_AVATAR_SESSION,
  VP_AVATAR_TYPE,
  VP_MY_TYPE,
  VP_OBJECT_ID,
  VP_OBJECT_TYPE,
  VP_OBJECT_TIME,
  VP_OBJECT_USER_ID,
  VP_WORLD_STATE,
  VP_WORLD_USERS,
  VP_REFERENCE_NUMBER,
  VP_CURRENT_CALLBACK,
  VP_USER_ID,
  VP_USER_REGISTRATION_TIME,
  VP_USER_ONLINE_TIME,
  VP_USER_LAST_LOGIN,
  /**
   *  @deprecated
   */
  VP_FRIEND_ID,
  VP_FRIEND_USER_ID,
  VP_FRIEND_ONLINE,
  VP_MY_USER_ID,
  VP_PROXY_TYPE,
  VP_PROXY_PORT,
  VP_CELL_X,
  VP_CELL_Z,
  VP_TERRAIN_TILE_X,
  VP_TERRAIN_TILE_Z,
  VP_TERRAIN_NODE_X,
  VP_TERRAIN_NODE_Z,
  VP_TERRAIN_NODE_REVISION,
  VP_CLICKED_SESSION,
  VP_CHAT_TYPE,
  VP_CHAT_COLOR_RED,
  VP_CHAT_COLOR_GREEN,
  VP_CHAT_COLOR_BLUE,
  VP_CHAT_EFFECTS,
  VP_DISCONNECT_ERROR_CODE,
  VP_URL_TARGET,
  VP_CURRENT_EVENT,
  //VP_CURRENT_CALLBACK,
  VP_CELL_REVISION = 38,
  VP_CELL_STATUS,
  VP_JOIN_ID
}

export enum Floats {
  VP_AVATAR_X,
  VP_AVATAR_Y,
  VP_AVATAR_Z,
  VP_AVATAR_YAW,
  VP_AVATAR_PITCH,
  VP_MY_X,
  VP_MY_Y,
  VP_MY_Z,
  VP_MY_YAW,
  VP_MY_PITCH,
  VP_OBJECT_X,
  VP_OBJECT_Y,
  VP_OBJECT_Z,
  VP_OBJECT_ROTATION_X,
  VP_OBJECT_ROTATION_Y,
  VP_OBJECT_ROTATION_Z,
  VP_OBJECT_ROTATION_ANGLE,
  VP_TELEPORT_X,
  VP_TELEPORT_Y,
  VP_TELEPORT_Z,
  VP_TELEPORT_YAW,
  VP_TELEPORT_PITCH,
  VP_CLICK_HIT_X,
  VP_CLICK_HIT_Y,
  VP_CLICK_HIT_Z,
  VP_JOIN_X,
  VP_JOIN_Y,
  VP_JOIN_Z,
  VP_JOIN_YAW,
  VP_JOIN_PITCH
}

export enum Strings {
  VP_AVATAR_NAME,
  VP_CHAT_MESSAGE,
  VP_OBJECT_MODEL,
  VP_OBJECT_ACTION,
  VP_OBJECT_DESCRIPTION,
  VP_WORLD_NAME,
  VP_USER_NAME,
  VP_USER_EMAIL,
  VP_WORLD_SETTING_KEY,
  VP_WORLD_SETTING_VALUE,
  VP_FRIEND_NAME,
  VP_PROXY_HOST,
  VP_TELEPORT_WORLD,
  VP_URL,
  VP_JOIN_WORLD,
  VP_JOIN_NAME,
  VP_START_WORLD
}

export enum Events {
  VP_EVENT_CHAT,
  VP_EVENT_AVATAR_ADD,
  VP_EVENT_AVATAR_CHANGE,
  VP_EVENT_AVATAR_DELETE,
  VP_EVENT_OBJECT,
  VP_EVENT_OBJECT_CHANGE,
  VP_EVENT_OBJECT_DELETE,
  VP_EVENT_OBJECT_CLICK,
  VP_EVENT_WORLD_LIST,
  VP_EVENT_WORLD_SETTING,
  VP_EVENT_WORLD_SETTINGS_CHANGED,
  VP_EVENT_FRIEND,
  VP_EVENT_WORLD_DISCONNECT,
  VP_EVENT_UNIVERSE_DISCONNECT,
  VP_EVENT_USER_ATTRIBUTES,
  VP_EVENT_CELL_END,
  VP_EVENT_TERRAIN_NODE,
  VP_EVENT_AVATAR_CLICK,
  VP_EVENT_TELEPORT,
  VP_EVENT_URL,
  VP_EVENT_OBJECT_BUMP_BEGIN,
  VP_EVENT_OBJECT_BUMP_END,
  VP_EVENT_TERRAIN_NODE_CHANGED,
  VP_EVENT_JOIN
}

export enum Callbacks {
  VP_CALLBACK_OBJECT_ADD = 0,
  VP_CALLBACK_OBJECT_CHANGE,
  VP_CALLBACK_OBJECT_DELETE,
  VP_CALLBACK_GET_FRIENDS,
  VP_CALLBACK_FRIEND_ADD,
  VP_CALLBACK_FRIEND_DELETE,
  VP_CALLBACK_TERRAIN_QUERY,
  VP_CALLBACK_TERRAIN_NODE_SET,
  VP_CALLBACK_OBJECT_GET,
  VP_CALLBACK_OBJECT_LOAD,
  VP_CALLBACK_LOGIN,
  VP_CALLBACK_ENTER,
  VP_CALLBACK_JOIN,
	VP_CALLBACK_CONNECT_UNIVERSE,
  VP_CALLBACK_WORLD_PERMISSION_USER_SET,
  VP_CALLBACK_WORLD_PERMISSION_SESSION_SET,
  VP_CALLBACK_WORLD_SETTING_SET,
}

export enum NetReturnCode {
    VP_NET_RC_SUCCESS = 0,
    VP_NET_RC_CONNECTION_ERROR = -1,
    VP_NET_RC_WOULD_BLOCK = -2
}

export enum NetNotify {
    VP_NET_NOTIFY_CONNECT,
    VP_NET_NOTIFY_DISCONNECT,
    VP_NET_NOTIFY_READ_READY,
    VP_NET_NOTIFY_WRITE_READY,
    VP_NET_NOTIFY_TIMEOUT
}

