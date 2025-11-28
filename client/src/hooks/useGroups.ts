import { useState, useEffect, useCallback } from 'react';
import { container } from '@/config';
import { Group } from '@/models/Group';
import { IGroupCreate } from '@/types';
import { useAuth } from '@/contexts';

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allGroups = await container.groupService.getAllGroups();
      setGroups(allGroups);
    } catch (err) {
      setError('Error al cargar los grupos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const searchGroups = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      if (!query.trim()) {
        await loadGroups();
        return;
      }
      const results = await container.groupService.searchGroups(query);
      setGroups(results);
    } catch (err) {
      setError('Error al buscar grupos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups]);

  const filterByCategory = useCallback(async (category: string) => {
    try {
      setIsLoading(true);
      if (!category) {
        await loadGroups();
        return;
      }
      const results = await container.groupService.getGroupsByCategory(category);
      setGroups(results);
    } catch (err) {
      setError('Error al filtrar grupos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups]);

  const createGroup = useCallback(async (data: Omit<IGroupCreate, 'adminId'>) => {
    if (!user) return null;
    try {
      const newGroup = await container.groupService.createGroup({
        ...data,
        adminId: user.id,
      });
      setGroups(prev => [newGroup, ...prev]);
      return newGroup;
    } catch (err) {
      setError('Error al crear el grupo');
      console.error(err);
      return null;
    }
  }, [user]);

  const joinGroup = useCallback(async (groupId: string) => {
    if (!user) return false;
    try {
      const updatedGroup = await container.groupService.joinGroup(groupId, user.id);
      if (updatedGroup) {
        setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al unirse al grupo');
      console.error(err);
      return false;
    }
  }, [user]);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!user) return false;
    try {
      const updatedGroup = await container.groupService.leaveGroup(groupId, user.id);
      if (updatedGroup) {
        setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al abandonar el grupo');
      console.error(err);
      return false;
    }
  }, [user]);

  const deleteGroup = useCallback(async (groupId: string) => {
    if (!user) return false;
    try {
      const success = await container.groupService.deleteGroup(groupId, user.id);
      if (success) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al eliminar el grupo');
      console.error(err);
      return false;
    }
  }, [user]);

  return {
    groups,
    isLoading,
    error,
    searchGroups,
    filterByCategory,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    refreshGroups: loadGroups,
  };
}

export function useMyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMyGroups = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const myGroups = await container.groupService.getMyGroups(user.id);
        setGroups(myGroups);
      } catch (err) {
        console.error('Error loading my groups:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMyGroups();
  }, [user]);

  return { groups, isLoading };
}

export function useGroupCategories() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await container.groupService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  return { categories };
}
