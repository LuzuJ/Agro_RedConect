import { useState, useEffect, useCallback } from 'react';
import { container } from '@/config/container';
import { Post } from '@/models/Post';
import { Comment } from '@/models/Comment';
import { IPostCreate, ICommentCreate } from '@/types';
import { useAuth } from '@/contexts';

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedPosts = await container.postService.getFeed();
      setPosts(fetchedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar publicaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (content: string, image?: string, tags?: string[]) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const postData: IPostCreate = {
      userId: user.id,
      author: user.name,
      authorAvatar: user.avatar,
      content,
      image,
      tags,
    };

    const newPost = await container.postService.createPost(postData);
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const deletePost = async (postId: string) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    await container.postService.deletePost(postId, user.id);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const editPost = async (postId: string, content: string, image?: string) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const updatedPost = await container.postService.updatePost(postId, user.id, content, image);
    if (updatedPost) {
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    }
    return updatedPost;
  };

  const toggleLike = async (postId: string) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const updatedPost = await container.postService.toggleLike(postId, user.id);
    if (updatedPost) {
      setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    }
    return updatedPost;
  };

  return {
    posts,
    isLoading,
    error,
    createPost,
    deletePost,
    editPost,
    toggleLike,
    refreshPosts: fetchPosts,
  };
}

export function usePostComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await container.postService.getComments(postId);
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const commentData: ICommentCreate = {
      postId,
      userId: user.id,
      author: user.name,
      authorAvatar: user.avatar,
      content,
    };

    const newComment = await container.postService.addComment(commentData);
    setComments(prev => [...prev, newComment]);
    return newComment;
  };

  const deleteComment = async (commentId: string) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    await container.postService.deleteComment(commentId, user.id);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const updatedComment = await container.postService.toggleCommentLike(commentId, user.id);
    if (updatedComment) {
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
    }
    return updatedComment;
  };

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    toggleCommentLike,
    refreshComments: fetchComments,
  };
}
