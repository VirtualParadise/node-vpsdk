export enum ChatType {
    Normal,
    ConsoleMessage
}

export interface IChatEvent {
    session: number;
    name: string;
    message: string;
    type: ChatType;
}
