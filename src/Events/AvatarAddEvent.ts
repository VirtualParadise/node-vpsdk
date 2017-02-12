import { IAvatarChangeEvent } from "./AvatarChangeEvent"

export interface IAvatarAddEvent extends IAvatarChangeEvent {
    userId: number;
}

