import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksService', () => {
  let tasksService: TasksService;
  let prismaService: PrismaService;

  const prismaServiceMock = {
    event: {
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    taskAssignment: {
      deleteMany: jest.fn(), // Add this
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock, // Use the mock
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('validateEvent', () => {
    it('should return the event if it exists', async () => {
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };
      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);

      const result = await tasksService.validateEvent('event1');
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(null);

      await expect(tasksService.validateEvent('event1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a task with valid input', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task 1',
        description: 'Description 1',
        due_time: '2023-12-31T00:00:00Z',
        assigned_to: [1, 2],
      };
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };
      const users = [
        {
          id: 1,
          email: 'test@example.com',
          password: 'StrongPassWord@123',
          name: 'first name',
        },
        {
          id: 2,
          email: 'fun@example.com',
          password: 'StrongPassWord@123',
          name: 'Last name',
        },
      ];
      const task = {
        id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        due_time: new Date('2023-12-31T00:00:00Z'),
        event_id: 'event1',
        assigned_to: [{ userId: 1 }, { userId: 2 }],
      };

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);
      jest.spyOn(prismaService.task, 'create').mockResolvedValue(task);

      const result = await tasksService.create(createTaskDto, 'event1');
      expect(result).toEqual({
        id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        due_time: '2023-12-31T00:00:00.000Z',
        event_id: 'event1',
        assigned_to: [1, 2],
      });
    });

    it('should throw BadRequestException if assigned_to contains invalid user IDs', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Task 1',
        description: 'Description 1',
        due_time: '2023-12-31T00:00:00Z',
        assigned_to: [1, 99], // 99 is invalid
      };
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };
      const users = [
        {
          id: 1,
          email: 'test@example.com',
          password: 'StrongPassWord@123',
          name: 'first name',
        },
      ];

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

      await expect(
        tasksService.create(createTaskDto, 'event1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for an event', async () => {
      const tasks = [
        {
          id: 'task1',
          title: 'Task 1',
          description: 'Description 1',
          due_time: new Date('2023-12-31T00:00:00Z'),
          event_id: 'event1',
          assigned_to: [{ userId: 1 }, { userId: 2 }],
        },
      ];
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.task, 'findMany').mockResolvedValue(tasks);

      const result = await tasksService.findAll('event1');
      expect(result).toEqual([
        {
          id: 'task1',
          title: 'Task 1',
          description: 'Description 1',
          due_time: '2023-12-31T00:00:00.000Z',
          assigned_to: [1, 2],
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      const task = {
        id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        due_time: new Date('2023-12-31T00:00:00Z'),
        event_id: 'event1',
        assigned_to: [{ userId: 1 }, { userId: 2 }],
      };
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(task);

      const result = await tasksService.findOne('event1', 'task1');
      expect(result).toEqual({
        id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        due_time: '2023-12-31T00:00:00.000Z',
        assigned_to: [1, 2],
      });
    });

    it('should throw NotFoundException if the task does not exist', async () => {
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(null);

      await expect(tasksService.findOne('event1', 'task1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        due_time: '2024-01-01T00:00:00Z',
        assigned_to: [1, 2],
      };
      const task = {
        id: 'task1',
        title: 'Updated Task',
        description: 'Updated Description',
        due_time: new Date('2024-01-01T00:00:00Z'),
        event_id: 'event1',
        assigned_to: [{ userId: 1 }, { userId: 2 }],
      };
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };
      const users = [
        {
          id: 1,
          email: 'test@example.com',
          password: 'StrongPassWord@123',
          name: 'first name',
        },
        {
          id: 2,
          email: 'fun@example.com',
          password: 'StrongPassWord@123',
          name: 'Last name',
        },
      ];

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(task);
      jest.spyOn(prismaService.task, 'update').mockResolvedValue(task);

      const result = await tasksService.update(
        'event1',
        'task1',
        updateTaskDto,
      );
      expect(result).toEqual({
        id: 'task1',
        title: 'Updated Task',
        description: 'Updated Description',
        due_time: '2024-01-01T00:00:00.000Z',
        assigned_to: [1, 2],
      });
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const task = {
        id: 'task1',
        title: 'Task 1',
        description: 'Description 1',
        due_time: new Date('2023-12-31T00:00:00Z'),
        event_id: 'event1',
      };
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(task);
      jest
        .spyOn(prismaService.taskAssignment, 'deleteMany')
        .mockResolvedValue({ count: 1 }); // Mock deleteMany
      jest.spyOn(prismaService.task, 'delete').mockResolvedValue(task);

      const result = await tasksService.remove('event1', 'task1');
      expect(result).toEqual(task);
    });

    it('should throw NotFoundException if the task does not exist', async () => {
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(null);

      await expect(tasksService.remove('event1', 'task1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prismaService.event, 'findUnique').mockResolvedValue(event);
      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(tasksService.remove('event1', 'task1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
