import { IDatabaseProvider } from '@/lib/database';
import { STORE_NAMES } from '@/lib/database';
import { Group } from '@/models/Group';
import { IGroup, IGroupCreate } from '@/types';

export class GroupRepository {
  constructor(private readonly db: IDatabaseProvider) {}

  async getAllGroups(): Promise<Group[]> {
    const groups = await this.db.getAll<IGroup & { memberIds?: string[]; category?: string; adminId?: string }>(STORE_NAMES.GROUPS);
    return groups.map(g => Group.fromJSON(g));
  }

  async getGroupById(id: string): Promise<Group | null> {
    const group = await this.db.getById<IGroup & { memberIds?: string[]; category?: string; adminId?: string }>(STORE_NAMES.GROUPS, id);
    return group ? Group.fromJSON(group) : null;
  }

  async searchGroups(query: string): Promise<Group[]> {
    const groups = await this.getAllGroups();
    const lowerQuery = query.toLowerCase();
    return groups.filter(
      g => 
        g.name.toLowerCase().includes(lowerQuery) || 
        g.description.toLowerCase().includes(lowerQuery) ||
        g.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getGroupsByMember(userId: string): Promise<Group[]> {
    const groups = await this.getAllGroups();
    return groups.filter(g => g.isMember(userId));
  }

  async getGroupsByAdmin(userId: string): Promise<Group[]> {
    const groups = await this.getAllGroups();
    return groups.filter(g => g.isAdmin(userId));
  }

  async getGroupsByCategory(category: string): Promise<Group[]> {
    const groups = await this.getAllGroups();
    return groups.filter(g => g.category === category);
  }

  async createGroup(data: IGroupCreate): Promise<Group> {
    const group = Group.create(data);
    await this.db.add(STORE_NAMES.GROUPS, group.toJSON());
    return group;
  }

  async updateGroup(id: string, data: Partial<IGroup>): Promise<Group | null> {
    const existingGroup = await this.getGroupById(id);
    if (!existingGroup) return null;

    const updatedData = {
      ...existingGroup.toJSON(),
      ...data,
    };

    await this.db.put(STORE_NAMES.GROUPS, updatedData);
    return Group.fromJSON(updatedData);
  }

  async joinGroup(groupId: string, userId: string): Promise<Group | null> {
    const group = await this.getGroupById(groupId);
    if (!group) return null;

    group.addMember(userId);
    await this.db.put(STORE_NAMES.GROUPS, group.toJSON());
    return group;
  }

  async leaveGroup(groupId: string, userId: string): Promise<Group | null> {
    const group = await this.getGroupById(groupId);
    if (!group) return null;

    // El admin no puede abandonar el grupo
    if (group.isAdmin(userId)) return null;

    group.removeMember(userId);
    await this.db.put(STORE_NAMES.GROUPS, group.toJSON());
    return group;
  }

  async deleteGroup(id: string): Promise<boolean> {
    try {
      await this.db.delete(STORE_NAMES.GROUPS, id);
      return true;
    } catch {
      return false;
    }
  }
}
