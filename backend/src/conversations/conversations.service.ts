import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConversationDto, creatorId: string) {
    if (dto.type === 'DIRECT') {
      if (dto.memberIds.length !== 1) {
        throw new BadRequestException('Direct conversation requires exactly one other member');
      }
      const existing = await this.findDirectConversation(creatorId, dto.memberIds[0]);
      if (existing) return existing;
    }

    if (dto.type === 'GROUP' && !dto.name) {
      throw new BadRequestException('Group conversation requires a name');
    }

    const allMemberIds = [creatorId, ...dto.memberIds.filter((id) => id !== creatorId)];

    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type,
        name: dto.name || null,
        members: {
          create: allMemberIds.map((userId, index) => ({
            userId,
            role: index === 0 ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });

    return { ...conversation, lastMessage: null, unreadCount: 0 };
  }

  async listForUser(userId: string, cursor?: string, limit = 20) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          where: { deletedAt: null },
          include: {
            sender: {
              select: { id: true, displayName: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const membership = conv.members.find((m) => m.userId === userId);
        const unreadCount = membership
          ? await this.prisma.message.count({
              where: {
                conversationId: conv.id,
                createdAt: { gt: membership.lastReadAt },
                senderId: { not: userId },
                deletedAt: null,
              },
            })
          : 0;

        const lastMsg = conv.messages[0] || null;
        const lastMessage = lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              type: lastMsg.type,
              senderId: lastMsg.senderId,
              senderName: lastMsg.sender.displayName,
              createdAt: lastMsg.createdAt.toISOString(),
            }
          : null;

        const { messages, ...rest } = conv;
        return { ...rest, lastMessage, unreadCount };
      }),
    );

    return result;
  }

  async getById(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });

    if (!conv) throw new NotFoundException('Conversation not found');
    if (!conv.members.some((m) => m.userId === userId)) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    return conv;
  }

  async addMember(conversationId: string, targetUserId: string, actorId: string) {
    const conv = await this.getById(conversationId, actorId);

    if (conv.type !== 'GROUP') {
      throw new BadRequestException('Cannot add members to direct conversation');
    }

    const actor = conv.members.find((m) => m.userId === actorId);
    if (!actor || actor.role === 'MEMBER') {
      throw new ForbiddenException('Only admins or owner can add members');
    }

    if (conv.members.length >= 256) {
      throw new BadRequestException('Group is full (max 256 members)');
    }

    return this.prisma.conversationMember.create({
      data: {
        conversationId,
        userId: targetUserId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: { id: true, displayName: true, avatar: true, isOnline: true },
        },
      },
    });
  }

  async removeMember(conversationId: string, targetUserId: string, actorId: string) {
    const conv = await this.getById(conversationId, actorId);

    if (conv.type !== 'GROUP') {
      throw new BadRequestException('Cannot remove members from direct conversation');
    }

    const actor = conv.members.find((m) => m.userId === actorId);
    if (!actor || actor.role === 'MEMBER') {
      throw new ForbiddenException('Only admins or owner can remove members');
    }

    const target = conv.members.find((m) => m.userId === targetUserId);
    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'OWNER') throw new ForbiddenException('Cannot remove the owner');

    await this.prisma.conversationMember.delete({ where: { id: target.id } });
    return { removed: true };
  }

  async leave(conversationId: string, userId: string) {
    const conv = await this.getById(conversationId, userId);
    const member = conv.members.find((m) => m.userId === userId);
    if (!member) throw new NotFoundException('Not a member');

    if (member.role === 'OWNER' && conv.type === 'GROUP') {
      const next =
        conv.members.find((m) => m.userId !== userId && m.role === 'ADMIN') ||
        conv.members.find((m) => m.userId !== userId);
      if (next) {
        await this.prisma.conversationMember.update({
          where: { id: next.id },
          data: { role: 'OWNER' },
        });
      }
    }

    await this.prisma.conversationMember.delete({ where: { id: member.id } });
    return { left: true };
  }

  async updateGroup(conversationId: string, userId: string, data: { name?: string }) {
    const conv = await this.getById(conversationId, userId);
    if (conv.type !== 'GROUP') throw new BadRequestException('Not a group');

    const member = conv.members.find((m) => m.userId === userId);
    if (!member || member.role === 'MEMBER') {
      throw new ForbiddenException('Only admins or owner can update group');
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data,
    });
  }

  private async findDirectConversation(userA: string, userB: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { members: { some: { userId: userA } } },
          { members: { some: { userId: userB } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatar: true, isOnline: true },
            },
          },
        },
      },
    });
    return conv ? { ...conv, lastMessage: null, unreadCount: 0 } : null;
  }
}
