export interface IVector2 {
    x: number;
    y: number;
}

export interface IVector3 {
    x: number;
    y: number;
    z: number;
}

export interface IColor {
    r: number;
    g: number;
    b: number;
}

export const enum TextEffect {
    Bold = 1,
    Italic = 2
}

export interface IConsoleMessage {
    name: string;
    content: string;
    color: IColor;
    effects: TextEffect;
}

export interface ITeleportLocation {
    world: string;
    position: IVector3;
    rotation: IVector2;
}
