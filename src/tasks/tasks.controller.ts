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
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events/:eventId/tasks')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(createTaskDto, eventId);
  }

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    return this.tasksService.findAll(eventId);
  }

  @Get(':taskId')
  async findOne(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findOne(eventId, taskId);
  }

  @Put(':taskId')
  async update(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const updatedTask = await this.tasksService.update(
      eventId,
      taskId,
      updateTaskDto,
    );
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return updatedTask;
  }

  @Delete(':taskId')
  async remove(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
  ) {
    return await this.tasksService.remove(eventId, taskId);
  }
}
