import { IVector2, IVector3 } from "../Interfaces";

export interface IAvatarChangeEvent {
    name: string;
    session: number;
    type: number;
    position: IVector3;
    rotation: IVector2;
}
