import { IGroup, IGroupCreate } from '@/types';

export class Group {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public image: string,
    public members: number,
    public memberIds: string[],
    public adminId: string,
    public createdAt: string,
    public category: string = 'General'
  ) {}

  private static generateId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static create(data: IGroupCreate): Group {
    return new Group(
      Group.generateId(),
      data.name,
      data.description,
      data.image,
      1, // El admin cuenta como primer miembro
      [data.adminId],
      data.adminId,
      new Date().toISOString(),
      'General'
    );
  }

  static fromJSON(data: IGroup & { memberIds?: string[]; category?: string; adminId?: string }): Group {
    return new Group(
      data.id,
      data.name,
      data.description,
      data.image,
      data.members,
      data.memberIds || [],
      data.adminId || '',
      data.createdAt,
      data.category || 'General'
    );
  }

  toJSON(): IGroup & { memberIds: string[]; category: string; adminId: string } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      image: this.image,
      members: this.members,
      memberIds: this.memberIds,
      adminId: this.adminId,
      createdAt: this.createdAt,
      category: this.category,
      isJoined: false, // Se calcula dinámicamente
    };
  }

  isMember(userId: string): boolean {
    return this.memberIds.includes(userId);
  }

  isAdmin(userId: string): boolean {
    return this.adminId === userId;
  }

  addMember(userId: string): void {
    if (!this.memberIds.includes(userId)) {
      this.memberIds.push(userId);
      this.members = this.memberIds.length;
    }
  }

  removeMember(userId: string): void {
    const index = this.memberIds.indexOf(userId);
    if (index > -1) {
      this.memberIds.splice(index, 1);
      this.members = this.memberIds.length;
    }
  }
}
