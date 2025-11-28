import { PostRepository } from '@/repositories/PostRepository';
import { Post } from '@/models/Post';
import { Comment } from '@/models/Comment';
import { IPostCreate, ICommentCreate } from '@/types';

export class PostService {
  constructor(private postRepository: PostRepository) {}

  // ============ POSTS ============

  async getFeed(): Promise<Post[]> {
    return this.postRepository.getAllPosts();
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.postRepository.getPostById(id);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return this.postRepository.getPostsByUserId(userId);
  }

  async createPost(data: IPostCreate): Promise<Post> {
    if (!data.content.trim()) {
      throw new Error('El contenido no puede estar vacío');
    }
    return this.postRepository.createPost(data);
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.getPostById(postId);
    if (!post) {
      throw new Error('Publicación no encontrada');
    }
    if (post.userId !== userId) {
      throw new Error('No tienes permiso para eliminar esta publicación');
    }
    await this.postRepository.deletePost(postId);
  }

  async updatePost(postId: string, userId: string, content: string, image?: string): Promise<Post | null> {
    const post = await this.postRepository.getPostById(postId);
    if (!post) {
      throw new Error('Publicación no encontrada');
    }
    if (post.userId !== userId) {
      throw new Error('No tienes permiso para editar esta publicación');
    }

    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return this.postRepository.updatePost(postId, { content, image, tags });
  }

  async toggleLike(postId: string, userId: string): Promise<Post | null> {
    return this.postRepository.togglePostLike(postId, userId);
  }

  // ============ COMMENTS ============

  async getComments(postId: string): Promise<Comment[]> {
    return this.postRepository.getCommentsByPostId(postId);
  }

  async addComment(data: ICommentCreate): Promise<Comment> {
    if (!data.content.trim()) {
      throw new Error('El comentario no puede estar vacío');
    }
    return this.postRepository.createComment(data);
  }

  async deleteComment(commentId: string, _userId: string): Promise<void> {
    // En una implementación real, verificaríamos que el usuario sea el autor
    await this.postRepository.deleteComment(commentId);
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<Comment | null> {
    return this.postRepository.toggleCommentLike(commentId, userId);
  }
}
