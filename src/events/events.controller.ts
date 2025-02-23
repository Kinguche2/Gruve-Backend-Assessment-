import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UsePipes,
  NotFoundException,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, EventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { omit } from 'lodash';

@Controller('events')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() data: CreateEventDto): Promise<EventDto> {
    const file = await this.eventsService.create(data);
    const withOutShard = omit(file, ['shard']);
    return withOutShard;
  }

  @Get()
  async findAll(): Promise<EventDto[]> {
    try {
      const events = await this.eventsService.findAll();
      return events.map((event) => ({
        id: event.id,
        name: event.name,
        location: event.location,
        start_time: event.start_time,
        end_time: event.end_time,
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EventDto> {
    const withOutShard = await this.eventsService.findOne(id);
    return withOutShard;
  }

  @Put(':id')
  //@UsePipes(new ZodValidationPipe(updateEventSchema))
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventDto> {
    const result = await this.eventsService.update(id, updateEventDto);
    const withOutShard = omit(result, ['shard']);
    return withOutShard;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{}> {
    await this.eventsService.remove(id);
    return { message: 'Event deleted successfully' };
  }
}
