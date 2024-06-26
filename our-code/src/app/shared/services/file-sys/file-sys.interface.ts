import { Workspace } from '../workspace/workspace.interface';
import { User } from '../auth/auth.interface';

export interface Folder {
    id: number;
    name: string;
    parentId: number;
    parent: Folder;
    folders: Folder[];
    files: File[];
    fileId: number;
    workspaceId: number;
    workspace: Workspace;
}

export interface File {
    id: number;
    name: string;
    content: string;
    parentId: number;
    parent: Folder;
    workspaceId: number;
    workspace: Workspace;
    comments: Comment[];
}

export interface Comment {
    id: number;
    content: string;
    userId: number;
    user: User;
    fileId: number;
    file: File;
    createdAt: Date;
}