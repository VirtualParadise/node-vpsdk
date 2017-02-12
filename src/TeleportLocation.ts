import { IVector2, IVector3 } from "./Vectors";

export interface TeleportLocation {
    world: string;
    position: IVector3;
    rotation: IVector2;
}