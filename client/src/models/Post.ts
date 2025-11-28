import { IPost, IPostCreate } from '@/types';

/**
 * Post Model
 */
export class Post implements IPost {
  public id: string;
  public userId: string;
  public author: string;
  public authorAvatar: string;
  public content: string;
  public image?: string;
  public likes: number;
  public likedBy: string[];
  public comments: number;
  public tags: string[];
  public timestamp: string;

  constructor(data: IPost & { likedBy?: string[] }) {
    this.id = data.id;
    this.userId = data.userId;
    this.author = data.author;
    this.authorAvatar = data.authorAvatar;
    this.content = data.content;
    this.image = data.image;
    this.likes = data.likes;
    this.likedBy = data.likedBy || [];
    this.comments = data.comments;
    this.tags = data.tags;
    this.timestamp = data.timestamp;
  }

  static create(data: IPostCreate): Post {
    return new Post({
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId: data.userId,
      author: data.author,
      authorAvatar: data.authorAvatar,
      content: data.content,
      image: data.image,
      likes: 0,
      likedBy: [],
      comments: 0,
      tags: data.tags || [],
      timestamp: new Date().toISOString(),
    });
  }

  static fromJSON(json: IPost & { likedBy?: string[] }): Post {
    return new Post(json);
  }

  toJSON(): IPost & { likedBy: string[] } {
    return {
      id: this.id,
      userId: this.userId,
      author: this.author,
      authorAvatar: this.authorAvatar,
      content: this.content,
      image: this.image,
      likes: this.likes,
      likedBy: this.likedBy,
      comments: this.comments,
      tags: this.tags,
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

  isLikedBy(userId: string): boolean {
    return this.likedBy.includes(userId);
  }

  incrementComments(): void {
    this.comments += 1;
  }

  decrementComments(): void {
    this.comments = Math.max(0, this.comments - 1);
  }
}
