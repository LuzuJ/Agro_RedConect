import { IDatabaseProvider, STORE_NAMES } from '@/lib/database';
import { IPost, IComment, IPostCreate, ICommentCreate } from '@/types';
import { Post } from '@/models/Post';
import { Comment } from '@/models/Comment';

export class PostRepository {
  constructor(private db: IDatabaseProvider) {}

  // ============ POSTS ============

  async getAllPosts(): Promise<Post[]> {
    const posts = await this.db.getAll<IPost & { likedBy?: string[] }>(STORE_NAMES.POSTS);
    return posts
      .map(p => Post.fromJSON(p))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getPostById(id: string): Promise<Post | null> {
    const post = await this.db.getById<IPost & { likedBy?: string[] }>(STORE_NAMES.POSTS, id);
    return post ? Post.fromJSON(post) : null;
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    const posts = await this.db.getByIndex<IPost & { likedBy?: string[] }>(
      STORE_NAMES.POSTS, 
      'userId', 
      userId
    );
    return posts
      .map(p => Post.fromJSON(p))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createPost(data: IPostCreate): Promise<Post> {
    const post = Post.create(data);
    await this.db.add(STORE_NAMES.POSTS, post.toJSON());
    return post;
  }

  async updatePost(post: Post): Promise<Post>;
  async updatePost(postId: string, updates: { content?: string; image?: string; tags?: string[] }): Promise<Post | null>;
  async updatePost(postOrId: Post | string, updates?: { content?: string; image?: string; tags?: string[] }): Promise<Post | null> {
    if (typeof postOrId === 'string') {
      // Update by ID with partial updates
      const post = await this.getPostById(postOrId);
      if (!post) return null;
      
      if (updates?.content !== undefined) {
        post.content = updates.content;
      }
      if (updates?.image !== undefined) {
        post.image = updates.image;
      }
      if (updates?.tags !== undefined) {
        post.tags = updates.tags;
      }
      
      await this.db.put(STORE_NAMES.POSTS, post.toJSON());
      return post;
    } else {
      // Update with Post object
      await this.db.put(STORE_NAMES.POSTS, postOrId.toJSON());
      return postOrId;
    }
  }

  async deletePost(id: string): Promise<void> {
    // Eliminar comentarios asociados primero
    const comments = await this.getCommentsByPostId(id);
    for (const comment of comments) {
      await this.deleteComment(comment.id);
    }
    await this.db.delete(STORE_NAMES.POSTS, id);
  }

  async togglePostLike(postId: string, userId: string): Promise<Post | null> {
    const post = await this.getPostById(postId);
    if (!post) return null;
    
    post.toggleLike(userId);
    await this.updatePost(post);
    return post;
  }

  // ============ COMMENTS ============

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const comments = await this.db.getByIndex<IComment & { likedBy?: string[] }>(
      STORE_NAMES.COMMENTS, 
      'postId', 
      postId
    );
    return comments
      .map(c => Comment.fromJSON(c))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createComment(data: ICommentCreate): Promise<Comment> {
    const comment = Comment.create(data);
    await this.db.add(STORE_NAMES.COMMENTS, comment.toJSON());
    
    // Incrementar contador de comentarios en el post
    const post = await this.getPostById(data.postId);
    if (post) {
      post.incrementComments();
      await this.updatePost(post);
    }
    
    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    const comments = await this.db.getAll<IComment>(STORE_NAMES.COMMENTS);
    const comment = comments.find(c => c.id === id);
    
    if (comment) {
      // Decrementar contador de comentarios en el post
      const post = await this.getPostById(comment.postId);
      if (post) {
        post.decrementComments();
        await this.updatePost(post);
      }
    }
    
    await this.db.delete(STORE_NAMES.COMMENTS, id);
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<Comment | null> {
    const comments = await this.db.getAll<IComment & { likedBy?: string[] }>(STORE_NAMES.COMMENTS);
    const commentData = comments.find(c => c.id === commentId);
    if (!commentData) return null;

    const comment = Comment.fromJSON(commentData);
    comment.toggleLike(userId);
    await this.db.put(STORE_NAMES.COMMENTS, comment.toJSON());
    return comment;
  }
}
