import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Event, Task } from '@prisma/client';
import { handlePrismaError } from '../exceptions/prisma.exception';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates if an event exists.
   * @param eventId - The ID of the event to validate.
   * @returns The event if it exists.
   * @throws NotFoundException if the event does not exist.
   * @throws InternalServerErrorException if a database error occurs.
   */
  async validateEvent(eventId: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event;
  }

  /**
   * Creates a new task.
   * @param createTaskDto - The data to create the task.
   * @param event_id - The ID of the event the task belongs to.
   * @returns The created task with assigned_to user IDs.
   * @throws BadRequestException if assigned_to contains invalid user IDs.
   */
  async create(
    createTaskDto: CreateTaskDto,
    event_id: string,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    due_time: string;
    event_id: string;
    assigned_to: number[];
  }> {
    const { title, description, due_time, assigned_to = [] } = createTaskDto;

    await this.validateEvent(event_id);

    if (!Array.isArray(assigned_to)) {
      throw new BadRequestException('assigned_to must be an array of user IDs');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: assigned_to } },
      select: { id: true },
    });

    const validUserIds = users.map((user) => user.id);
    const invalidUserIds = assigned_to.filter(
      (id) => !validUserIds.includes(id),
    );

    if (invalidUserIds.length > 0) {
      throw new BadRequestException(
        `Invalid user IDs: ${invalidUserIds.join(', ')}`,
      );
    }

    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        due_time,
        event: { connect: { id: event_id } },
        assigned_to: assigned_to.length
          ? {
              create: assigned_to.map((userId) => ({
                user: { connect: { id: userId } },
              })),
            }
          : undefined,
      },
      include: { assigned_to: { select: { userId: true } } },
    });

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      due_time: task.due_time.toISOString(),
      event_id,
      assigned_to: task.assigned_to
        .map((assignment) => assignment.userId)
        .sort((a, b) => a - b),
    };
  }

  /**
   * Finds all tasks for a specific event.
   * @param event_id - The ID of the event.
   * @returns A list of tasks with assigned_to user IDs.
   */
  async findAll(event_id: string): Promise<
    {
      id: string;
      title: string;
      description: string;
      due_time: string;
      assigned_to: number[];
    }[]
  > {
    await this.validateEvent(event_id);

    const tasks = await this.prisma.task.findMany({
      where: { event_id },
      include: { assigned_to: { select: { userId: true } } },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      due_time: task.due_time.toISOString(),
      assigned_to: task.assigned_to
        .map((assignment) => assignment.userId)
        .sort((a, b) => a - b),
    }));
  }

  /**
   * Finds a task by its ID and event ID.
   * @param event_id - The ID of the event.
   * @param taskId - The ID of the task.
   * @returns The task with assigned_to user IDs.
   * @throws NotFoundException if the task does not exist.
   */
  async findOne(
    event_id: string,
    taskId: string,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    due_time: string;
    assigned_to: number[];
  }> {
    await this.validateEvent(event_id);

    const task = await this.prisma.task.findUnique({
      where: { id: taskId, event_id },
      include: { assigned_to: { select: { userId: true } } },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      due_time: task.due_time.toISOString(),
      assigned_to: task.assigned_to
        .map((assignment) => assignment.userId)
        .sort((a, b) => a - b),
    };
  }

  /**
   * Updates a task.
   * @param event_id - The ID of the event.
   * @param taskId - The ID of the task.
   * @param updateTaskDto - The data to update the task.
   * @returns The updated task with assigned_to user IDs.
   * @throws NotFoundException if the task does not exist.
   * @throws BadRequestException if assigned_to contains invalid user IDs.
   */
  async update(
    event_id: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    due_time: string;
    assigned_to: number[];
  }> {
    try {
      await this.validateEvent(event_id);

      const { title, description, due_time, assigned_to = [] } = updateTaskDto;

      const taskExists = await this.prisma.task.findUnique({
        where: { id: taskId, event_id },
        include: { assigned_to: { select: { userId: true } } },
      });

      if (!taskExists) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      if (assigned_to.length > 0) {
        const users = await this.prisma.user.findMany({
          where: { id: { in: assigned_to } },
          select: { id: true },
        });

        const validUserIds = users.map((user) => user.id);
        const invalidUserIds = assigned_to.filter(
          (id) => !validUserIds.includes(id),
        );

        if (invalidUserIds.length > 0) {
          throw new BadRequestException(
            `Invalid user IDs: ${invalidUserIds.join(', ')}`,
          );
        }
      }

      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          title,
          description,
          due_time,
          assigned_to: {
            deleteMany: {},
            create: assigned_to.map((userId) => ({
              user: { connect: { id: userId } },
            })),
          },
        },
        include: { assigned_to: { select: { userId: true } } },
      });

      return {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        due_time: updatedTask.due_time.toISOString(),
        assigned_to: updatedTask.assigned_to
          .map((assignment) => assignment.userId)
          .sort((a, b) => a - b),
      };
    } catch (error) {
      // Check if the error is already a NotFoundException
      if (error instanceof NotFoundException) {
        throw error; // Rethrow the NotFoundException
      }
      if (error instanceof BadRequestException) {
        throw error; // Rethrow the NotFoundException
      }

      // Handle other errors using handlePrismaError
      handlePrismaError(error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }

  /**
   * Deletes a task.
   * @param event_id - The ID of the event.
   * @param taskId - The ID of the task.
   * @returns The deleted task.
   * @throws NotFoundException if the task does not exist.
   */
  async remove(event_id: string, taskId: string): Promise<Task> {
    await this.validateEvent(event_id);

    try {
      // Check if the task exists
      const task = await this.prisma.task.findUnique({
        where: { id: taskId, event_id },
      });

      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      // Delete TaskAssignment records first
      await this.prisma.taskAssignment.deleteMany({
        where: { taskId },
      });

      // Then delete the task
      return this.prisma.task.delete({
        where: { id: taskId, event_id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in remove method:', error); // Log the error
      handlePrismaError(error);
      throw error; // Ensure the function always throws
    }
  }
}
