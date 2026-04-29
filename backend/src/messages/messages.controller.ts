import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesQueryDto, SearchMessagesDto } from './dto/messages-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations/:id/messages')
  getHistory(
    @Param('id') conversationId: string,
    @Query() query: MessagesQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.getHistory(
      conversationId,
      userId,
      query.cursor,
      query.limit,
    );
  }

  @Get('conversations/:id/messages/search')
  search(
    @Param('id') conversationId: string,
    @Query() query: SearchMessagesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.search(conversationId, userId, query.q, query.limit);
  }

  @Delete('messages/:id')
  deleteMessage(
    @Param('id') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messagesService.softDelete(messageId, userId);
  }
}
