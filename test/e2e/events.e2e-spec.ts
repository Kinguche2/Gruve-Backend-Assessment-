import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateEventDto } from '../../src/events/dto/create-event.dto';
import { UpdateEventDto } from '../../src/events/dto/update-event.dto';
import { Event } from '@prisma/client';
import { AuthService } from '../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let jwtService: JwtService;
  let authToken: string; // Store the JWT token

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService); // Get AuthService
    jwtService = moduleFixture.get<JwtService>(JwtService); // Get JwtService

    // Create a test user and generate a token
    const testUser = { id: 1, email: 'test@example.com' };
    authToken = jwtService.sign({ email: testUser.email, sub: testUser.id });
  }, 30000); // Increase timeout for setup

  afterAll(async () => {
    // Delete TaskAssignment records first
    await prisma.taskAssignment.deleteMany();
    // Then delete tasks
    await prisma.task.deleteMany();
    // Finally, delete events
    await prisma.event.deleteMany();
    // Finally, delete Users
    await prisma.user.deleteMany();
    await app.close();
  }, 30000);

  describe('POST /events', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .send(createEventDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Test Event',
        location: 'Test Location',
        start_time: expect.any(String),
        end_time: expect.any(String),
      });
    });
  });

  describe('GET /events', () => {
    it('should return a list of events', async () => {
      const mockEvent: Event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prisma.event, 'findMany').mockResolvedValue([mockEvent]);

      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: 'Test Event',
            location: 'Test Location',
          }),
        ]),
      );
    });
  });

  describe('GET /events/:id', () => {
    it('should return an event by ID', async () => {
      const event = await prisma.event.create({
        data: {
          name: 'Test Event',
          location: 'Test Location',
          start_time: new Date('2025-05-01T10:00:00Z'),
          end_time: new Date('2025-05-01T12:00:00Z'),
          shard: 1,
        },
      });

      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(event);

      const response = await request(app.getHttpServer())
        .get(`/events/${event.id}`)
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .expect(200);

      expect(response.body).toEqual({
        id: event.id,
        name: 'Test Event',
        location: 'Test Location',
        start_time: event.start_time.toISOString(),
        end_time: event.end_time.toISOString(),
        shard: 1, // Include shard in the test data
      });
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/events/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Event with ID non-existent-id not found',
        error: 'Not Found',
      });
    });
  });

  describe('PUT /events/:id', () => {
    it('should update an event', async () => {
      const event = await prisma.event.create({
        data: {
          name: 'Test Event',
          location: 'Test Location',
          start_time: new Date('2025-05-01T10:00:00Z'),
          end_time: new Date('2025-05-01T12:00:00Z'),
          shard: 1,
        },
      });

      const updateEventDto: UpdateEventDto = {
        name: 'Updated Event Name',
        location: 'Updated Venue',
      };

      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prisma.event, 'update').mockResolvedValue(event);

      const response = await request(app.getHttpServer())
        .put(`/events/${event.id}`)
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .send(updateEventDto)
        .expect(200);

      expect(response.body).toEqual({
        id: event.id,
        ...updateEventDto,
        start_time: event.start_time.toISOString(),
        end_time: event.end_time.toISOString(),
        shard: 1, // Include shard in the expected response
      });
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .put('/events/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Event with ID non-existent-id not found',
        error: 'Not Found',
      });
    });
  });

  describe('DELETE /events/:id', () => {
    it('should delete an event', async () => {
      const event = await prisma.event.create({
        data: {
          name: 'Test Event',
          location: 'Test Location',
          start_time: new Date('2025-05-01T10:00:00Z'),
          end_time: new Date('2025-05-01T12:00:00Z'),
          shard: 1,
        },
      });

      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(event);
      jest.spyOn(prisma.event, 'delete').mockResolvedValue(event);

      const response = await request(app.getHttpServer())
        .delete(`/events/${event.id}`)
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .expect(200);

      expect(response.body).toEqual({
        message: 'Event deleted successfully',
      });
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .delete('/events/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`) // Include the token
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Event with ID non-existent-id not found',
        error: 'Not Found',
      });
    });
  });
});
