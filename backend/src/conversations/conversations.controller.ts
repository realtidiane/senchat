import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('conversations')
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  create(
    @Body() dto: CreateConversationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.create(dto, userId);
  }

  @Get()
  list(
    @CurrentUser('id') userId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.conversationsService.listForUser(userId, cursor);
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.getById(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { name?: string },
  ) {
    return this.conversationsService.updateGroup(id, userId, body);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.addMember(id, dto.userId, userId);
  }

  @Delete(':id/members/:uid')
  removeMember(
    @Param('id') id: string,
    @Param('uid') uid: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.removeMember(id, uid, userId);
  }

  @Delete(':id/leave')
  leave(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.conversationsService.leave(id, userId);
  }
}
