import * as ffi from "ffi";
import * as ref from "ref";
import * as Struct from "ref-struct"

export const vp_instance_t = ref.refType(ref.types.void);
export const vp_net_connection_t  = ref.refType(ref.types.void);
export const vp_net_config = Struct({
  "create": "pointer",
  "destroy": "pointer",
  "connect": "pointer",
  "send": "pointer",
  "recv": "pointer",
  "timeout": "pointer",
  "context": "pointer"
});

export const vp_net_config_p = ref.refType(vp_net_config);

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
  VP_CALLBACK,
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
  VP_CURRENT_CALLBACK,
  VP_CELL_REVISION,
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

export const Lib = ffi.Library("vpsdk", {
  "vp_create": [vp_instance_t, [vp_net_config_p]],
  "vp_destroy": ["int", [vp_instance_t]],
  "vp_connect_universe": ["int", [vp_instance_t, "string", "int"]],
  "vp_login": ["int", [vp_instance_t, "string", "string", "string"]],
  "vp_enter": ["int", [vp_instance_t, "string"]],
  "vp_leave": ["int", [vp_instance_t]],
  "vp_wait": ["int", [vp_instance_t, "int"]],
  "vp_say": ["int", [vp_instance_t, "string"]],
  "vp_console_message": ["int", [vp_instance_t, "int", "string", "string", "int", "uint8", "uint8", "uint8"]],
  "vp_event_set": ["int", [vp_instance_t, "int", "pointer"]],
  "vp_callback_set": ["int", [vp_instance_t, "int", "pointer"]],
  "vp_user_data": ["pointer", [vp_instance_t]],
  "vp_user_data_set": ["void", [vp_instance_t, "pointer"]],
  "vp_state_change": ["int", [vp_instance_t]],
  "vp_int": ["int", [vp_instance_t, "int"]],
  "vp_float": ["float", [vp_instance_t, "int"]],
  "vp_double": ["double", [vp_instance_t, "int"]],
  "vp_string": ["string", [vp_instance_t, "int"]],
  "vp_data": ["pointer", [vp_instance_t, "int", "int*"]],
  "vp_int_set": ["int", [vp_instance_t, "int", "int"]],
  "vp_float_set": ["int", [vp_instance_t, "int", "float"]],
  "vp_double_set": ["int", [vp_instance_t, "int", "double"]],
  "vp_string_set": ["int", [vp_instance_t, "int", "string"]],
  "vp_query_cell_revision": ["int", [vp_instance_t, "int", "int"]],
  "vp_object_add": ["int", [vp_instance_t]],
  "vp_object_load": ["int", [vp_instance_t]],
  "vp_object_bump_begin": ["int", [vp_instance_t, "int", "int"]],
  "vp_object_bump_end": ["int", [vp_instance_t, "int", "int"]],
  "vp_object_change": ["int", [vp_instance_t]],
  "vp_object_click": ["int", [vp_instance_t, "int", "int", "float", "float", "float"]],
  "vp_object_delete": ["int", [vp_instance_t, "int"]],
  "vp_object_get": ["int", [vp_instance_t, "int"]],
  "vp_world_list": ["int", [vp_instance_t, "int"]],
  "vp_user_attributes_by_id": ["int", [vp_instance_t, "int"]],
  "vp_teleport_avatar": ["int", [vp_instance_t, "int", "string", "float", "float", "float", "float", "float"]],
  "vp_net_notify": ["int", [vp_net_connection_t, "int", "int"]]
  // ...
});
