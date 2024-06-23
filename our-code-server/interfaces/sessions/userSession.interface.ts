export default interface UserSession {
  id: number;
  email: string;
  name: string;
  picture: string;
}

declare module 'express-session' {
  interface SessionData {
    user: UserSession;
  }
}
