import { GroupRepository } from '@/repositories/GroupRepository';
import { Group } from '@/models/Group';
import { IGroupCreate } from '@/types';

export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async getAllGroups(): Promise<Group[]> {
    return this.groupRepository.getAllGroups();
  }

  async getGroupById(id: string): Promise<Group | null> {
    return this.groupRepository.getGroupById(id);
  }

  async searchGroups(query: string): Promise<Group[]> {
    return this.groupRepository.searchGroups(query);
  }

  async getMyGroups(userId: string): Promise<Group[]> {
    return this.groupRepository.getGroupsByMember(userId);
  }

  async getGroupsByCategory(category: string): Promise<Group[]> {
    return this.groupRepository.getGroupsByCategory(category);
  }

  async createGroup(data: IGroupCreate): Promise<Group> {
    return this.groupRepository.createGroup(data);
  }

  async updateGroup(id: string, data: Partial<Group>, userId: string): Promise<Group | null> {
    const group = await this.groupRepository.getGroupById(id);
    if (!group || !group.isAdmin(userId)) return null;
    return this.groupRepository.updateGroup(id, data);
  }

  async joinGroup(groupId: string, userId: string): Promise<Group | null> {
    const group = await this.groupRepository.getGroupById(groupId);
    if (!group) return null;
    if (group.isMember(userId)) return group;
    return this.groupRepository.joinGroup(groupId, userId);
  }

  async leaveGroup(groupId: string, userId: string): Promise<Group | null> {
    const group = await this.groupRepository.getGroupById(groupId);
    if (!group) return null;
    if (group.isAdmin(userId)) return null; // Admin can't leave
    if (!group.isMember(userId)) return group;
    return this.groupRepository.leaveGroup(groupId, userId);
  }

  async deleteGroup(id: string, userId: string): Promise<boolean> {
    const group = await this.groupRepository.getGroupById(id);
    if (!group || !group.isAdmin(userId)) return false;
    return this.groupRepository.deleteGroup(id);
  }

  async getCategories(): Promise<string[]> {
    const groups = await this.groupRepository.getAllGroups();
    const categories = new Set<string>();
    for (const group of groups) {
      categories.add(group.category);
    }
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }
}
