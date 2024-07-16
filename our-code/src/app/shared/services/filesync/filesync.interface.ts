import { User } from "../auth/auth.interface";

export interface Collaborator extends User {
    awarenessClientId: number;
}