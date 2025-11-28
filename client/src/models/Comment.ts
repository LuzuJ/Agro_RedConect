import { IComment, ICommentCreate } from '@/types';

/**
 * Comment Model
 */
export class Comment implements IComment {
  public id: string;
  public postId: string;
  public userId: string;
  public author: string;
  public authorAvatar: string;
  public content: string;
  public likes: number;
  public likedBy: string[];
  public timestamp: string;

  constructor(data: IComment & { likedBy?: string[] }) {
    this.id = data.id;
    this.postId = data.postId;
    this.userId = data.userId;
    this.author = data.author;
    this.authorAvatar = data.authorAvatar;
    this.content = data.content;
    this.likes = data.likes;
    this.likedBy = data.likedBy || [];
    this.timestamp = data.timestamp;
  }

  static create(data: ICommentCreate): Comment {
    return new Comment({
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      postId: data.postId,
      userId: data.userId,
      author: data.author,
      authorAvatar: data.authorAvatar,
      content: data.content,
      likes: 0,
      likedBy: [],
      timestamp: new Date().toISOString(),
    });
  }

  static fromJSON(json: IComment & { likedBy?: string[] }): Comment {
    return new Comment(json);
  }

  toJSON(): IComment & { likedBy: string[] } {
    return {
      id: this.id,
      postId: this.postId,
      userId: this.userId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      content: this.content,
      likes: this.likes,
      likedBy: this.likedBy,
      timestamp: this.timestamp,
    };
  }

  toggleLike(userId: string): boolean {
    const isLiked = this.likedBy.includes(userId);
    if (isLiked) {
      this.likedBy = this.likedBy.filter(id => id !== userId);
      this.likes = Math.max(0, this.likes - 1);
    } else {
      this.likedBy.push(userId);
      this.likes += 1;
    }
    return !isLiked;
  }
}
