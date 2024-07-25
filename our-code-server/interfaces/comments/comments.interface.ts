export interface Comment {
  content: string,
  id: number,
  relPos: string,
  likes: number,
  dislikes: number,
  user: {
    email: string,
  },
}