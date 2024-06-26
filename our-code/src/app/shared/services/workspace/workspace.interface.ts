import { User } from '../user/user.interface';

export interface Workspace {
  workspace: any;
  id: number;
  name: string;
  owner: string;
  user: User;
}