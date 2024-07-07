import { IncomingMessage } from "http";
import { Socket } from "socket.io";

export default interface UserSession {
  id: number;
  email: string;
  name: string;
  picture: string;
}

declare module "express-session" {
  interface SessionData {
    user: UserSession;
  }
}

export interface SessionSocket extends Socket {
  request: IncomingMessage & {
    session: {
      user: UserSession;
    };
  };
}
