import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { MessageType } from '@prisma/client';

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  type: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMessageData) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: data.conversationId,
          userId: data.senderId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        type: data.type,
        content: data.content || null,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getHistory(conversationId: string, userId: string, cursor?: string, limit = 50) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;
    const sliced = hasMore ? messages.slice(0, limit) : messages;

    return {
      messages: sliced,
      nextCursor: hasMore ? sliced[sliced.length - 1].id : null,
      hasMore,
    };
  }

  async search(conversationId: string, userId: string, query: string, limit = 20) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
        content: { contains: query },
        deletedAt: null,
      },
      include: {
        sender: {
          select: { id: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async softDelete(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('Can only delete your own messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  async markRead(conversationId: string, userId: string) {
    return this.prisma.conversationMember.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });
  }
}
