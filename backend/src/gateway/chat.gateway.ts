import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { UsersService } from '../users/users.service';

// Socket event constants (duplicated to avoid ESM/CJS import issues)
const EVENTS = {
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  MESSAGE_NEW: 'message:new',
  MESSAGE_STATUS: 'message:status',
  TYPING_UPDATE: 'typing:update',
  PRESENCE_CHANGE: 'presence:change',
  CONVERSATION_UPDATED: 'conversation:updated',
  MEMBER_ADDED: 'member:added',
  MEMBER_REMOVED: 'member:removed',
  ERROR: 'error',
} as const;

interface SendMessagePayload {
  conversationId: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface ReadMessagePayload {
  conversationId: string;
  messageId: string;
}

interface TypingPayload {
  conversationId: string;
}

@WebSocketGateway({
  cors: {
    origin: true, // reflect request origin — allows any LAN device in dev
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, displayName: true },
      });

      if (!user) {
        client.disconnect();
        return;
      }

      (client as any).userId = user.id;

      // Join personal room
      client.join(`user:${user.id}`);

      // Join all conversation rooms
      const memberships = await this.prisma.conversationMember.findMany({
        where: { userId: user.id },
        select: { conversationId: true },
      });
      for (const m of memberships) {
        client.join(`conv:${m.conversationId}`);
      }

      // Set online
      await this.usersService.setOnlineStatus(user.id, true);
      this.server.emit(EVENTS.PRESENCE_CHANGE, {
        userId: user.id,
        isOnline: true,
        lastSeen: new Date().toISOString(),
      });

      this.logger.log(`Client connected: ${user.id}`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (!userId) return;

    await this.usersService.setOnlineStatus(userId, false);
    this.server.emit(EVENTS.PRESENCE_CHANGE, {
      userId,
      isOnline: false,
      lastSeen: new Date().toISOString(),
    });

    this.logger.log(`Client disconnected: ${userId}`);
  }

  @SubscribeMessage(EVENTS.MESSAGE_SEND)
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    try {
      const message = await this.messagesService.create({
        conversationId: payload.conversationId,
        senderId: userId,
        type: payload.type as any,
        content: payload.content,
        fileUrl: payload.fileUrl,
        fileName: payload.fileName,
        fileSize: payload.fileSize,
      });

      this.server
        .to(`conv:${payload.conversationId}`)
        .emit(EVENTS.MESSAGE_NEW, message);
    } catch (error: any) {
      client.emit(EVENTS.ERROR, {
        code: 'MESSAGE_SEND_FAILED',
        message: error.message || 'Failed to send message',
      });
    }
  }

  @SubscribeMessage(EVENTS.MESSAGE_READ)
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReadMessagePayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    try {
      await this.messagesService.markRead(payload.conversationId, userId);

      this.server.to(`conv:${payload.conversationId}`).emit(
        EVENTS.MESSAGE_STATUS,
        {
          conversationId: payload.conversationId,
          userId,
          readAt: new Date().toISOString(),
        },
      );
    } catch (error) {
      this.logger.error('Failed to mark read', error);
    }
  }

  @SubscribeMessage(EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.to(`conv:${payload.conversationId}`).emit(EVENTS.TYPING_UPDATE, {
      conversationId: payload.conversationId,
      userId,
      isTyping: true,
    });
  }

  @SubscribeMessage(EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.to(`conv:${payload.conversationId}`).emit(EVENTS.TYPING_UPDATE, {
      conversationId: payload.conversationId,
      userId,
      isTyping: false,
    });
  }

  emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conv:${conversationId}`).emit(event, data);
  }

  async joinUserToConversation(userId: string, conversationId: string) {
    const sockets = await this.server.in(`user:${userId}`).fetchSockets();
    for (const socket of sockets) {
      socket.join(`conv:${conversationId}`);
    }
  }
}
