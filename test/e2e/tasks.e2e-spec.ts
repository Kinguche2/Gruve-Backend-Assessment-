import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { PrismaService } from '../../src/prisma/prisma.service';

import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../../src/tasks/dto/update-task.dto';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { TasksService } from '../../src/tasks/tasks.service';
import { TasksController } from '../../src/tasks/tasks.controller';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let tasksService: TasksService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              findUnique: jest.fn(),
            },
            task: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            taskAssignment: {
              deleteMany: jest.fn(),
            },
            user: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tasksService = moduleFixture.get<TasksService>(TasksService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /events/:eventId/tasks', () => {
    it('should create a task', async () => {
      const eventId = 'event-id';
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        due_time: '2023-12-31T23:59:59Z',
        assigned_to: [1, 2],
      };

      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue({ id: eventId } as any);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue([{ id: 1 }, { id: 2 }] as any);
      jest.spyOn(prismaService.task, 'create').mockResolvedValue({
        id: 'task-id',
        title: 'Test Task',
        description: 'Test Description',
        due_time: new Date('2023-12-31T23:59:59Z'),
        event_id: eventId,
        assigned_to: [{ userId: 1 }, { userId: 2 }],
      } as any);

      const response = await request(app.getHttpServer())
        .post(`/events/${eventId}/tasks`)
        .send(createTaskDto)
        .expect(201);

      expect(response.body).toEqual({
        id: 'task-id',
        title: 'Test Task',
        description: 'Test Description',
        due_time: '2023-12-31T23:59:59.000Z',
        event_id: eventId,
        assigned_to: [1, 2],
      });
    });
  });

  describe('GET /events/:eventId/tasks', () => {
    it('should return all tasks for an event', async () => {
      const eventId = 'event-id';

      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue({ id: eventId } as any);
      jest.spyOn(prismaService.task, 'findMany').mockResolvedValue([
        {
          id: 'task-id-1',
          title: 'Task 1',
          description: 'Description 1',
          due_time: new Date('2023-12-31T23:59:59Z'),
          event_id: eventId,
          assigned_to: [{ userId: 1 }],
        },
        {
          id: 'task-id-2',
          title: 'Task 2',
          description: 'Description 2',
          due_time: new Date('2023-12-31T23:59:59Z'),
          event_id: eventId,
          assigned_to: [{ userId: 2 }],
        },
      ] as any);

      const response = await request(app.getHttpServer())
        .get(`/events/${eventId}/tasks`)
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 'task-id-1',
          title: 'Task 1',
          description: 'Description 1',
          due_time: '2023-12-31T23:59:59.000Z',
          assigned_to: [1],
        },
        {
          id: 'task-id-2',
          title: 'Task 2',
          description: 'Description 2',
          due_time: '2023-12-31T23:59:59.000Z',
          assigned_to: [2],
        },
      ]);
    });
  });

  describe('GET /events/:eventId/tasks/:taskId', () => {
    it('should return a task by ID', async () => {
      const eventId = 'event-id';
      const taskId = 'task-id';

      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue({ id: eventId } as any);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue({
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        due_time: new Date('2023-12-31T23:59:59Z'),
        event_id: eventId,
        assigned_to: [{ userId: 1 }],
      } as any);

      const response = await request(app.getHttpServer())
        .get(`/events/${eventId}/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toEqual({
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        due_time: '2023-12-31T23:59:59.000Z',
        assigned_to: [1],
      });
    });
  });

  describe('PUT /events/:eventId/tasks/:taskId', () => {
    it('should update a task', async () => {
      const eventId = 'event-id';
      const taskId = 'task-id';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        due_time: '2023-12-31T23:59:59Z',
        assigned_to: [1, 2],
      };

      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue({ id: eventId } as any);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue({
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        due_time: new Date('2023-12-31T23:59:59Z'),
        event_id: eventId,
        assigned_to: [{ userId: 1 }],
      } as any);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue([{ id: 1 }, { id: 2 }] as any);
      jest.spyOn(prismaService.task, 'update').mockResolvedValue({
        id: taskId,
        title: 'Updated Task',
        description: 'Updated Description',
        due_time: new Date('2023-12-31T23:59:59Z'),
        event_id: eventId,
        assigned_to: [{ userId: 1 }, { userId: 2 }],
      } as any);

      const response = await request(app.getHttpServer())
        .put(`/events/${eventId}/tasks/${taskId}`)
        .send(updateTaskDto)
        .expect(200);

      expect(response.body).toEqual({
        id: taskId,
        title: 'Updated Task',
        description: 'Updated Description',
        due_time: '2023-12-31T23:59:59.000Z',
        assigned_to: [1, 2],
      });
    });
  });

  describe('DELETE /events/:eventId/tasks/:taskId', () => {
    it('should delete a task', async () => {
      const eventId = 'event-id';
      const taskId = 'task-id';

      jest
        .spyOn(prismaService.event, 'findUnique')
        .mockResolvedValue({ id: eventId } as any);
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue({
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        due_time: new Date('2023-12-31T23:59:59Z'),
        event_id: eventId,
        assigned_to: [{ userId: 1 }],
      } as any);
      jest
        .spyOn(prismaService.taskAssignment, 'deleteMany')
        .mockResolvedValue({} as any);
      jest.spyOn(prismaService.task, 'delete').mockResolvedValue({
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        due_time: new Date('2023-12-31T23:59:59Z'),
        event_id: eventId,
      } as any);

      const response = await request(app.getHttpServer())
        .delete(`/events/${eventId}/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toEqual({
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        due_time: '2023-12-31T23:59:59.000Z',
        event_id: eventId,
      });
    });
  });
});
