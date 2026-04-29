import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { WsJwtGuard } from './ws-jwt.guard';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
    }),
    MessagesModule,
    UsersModule,
  ],
  providers: [ChatGateway, WsJwtGuard],
  exports: [ChatGateway],
})
export class GatewayModule {}
