import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from '@prisma/client';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event successfully', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Test Event',
        location: 'Test Location',
        start_time: '2025-02-12T12:00:00Z',
        end_time: '2025-02-12T12:00:00Z',
      };

      const mockEvent: Event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prisma.event, 'create').mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: createEventDto,
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Test Event',
        location: 'Test Location',
        start_time: '2025-02-12T12:00:00Z',
        end_time: '2025-02-12T12:00:00Z',
      };
      jest
        .spyOn(prisma.event, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.create(createEventDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of events', async () => {
      const mockEvents: Event[] = [
        {
          id: 'event-id-123',
          name: 'Event 1',
          location: 'Location 1',
          start_time: new Date(),
          end_time: new Date(),
          shard: 0,
        },
        {
          id: 'event-id-456',
          name: 'Event 2',
          location: 'Location 2',
          start_time: new Date(),
          end_time: new Date(),
          shard: 0,
        },
      ];

      jest.spyOn(prisma.event, 'findMany').mockResolvedValue(mockEvents);

      const result = await service.findAll();

      expect(result).toEqual(mockEvents);
      expect(prisma.event.findMany).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      jest
        .spyOn(prisma.event, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an event if it exists', async () => {
      const mockEvent: Event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent);

      const result = await service.findOne('event-id-123');

      expect(result).toEqual(mockEvent);
      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-id-123' },
      });
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an event successfully', async () => {
      const updateEventDto: UpdateEventDto = {
        name: 'Updated Event Name',
      };

      const mockEvent: Event = {
        id: 'event-id-123',
        name: 'Updated Event Name',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent);
      jest.spyOn(prisma.event, 'update').mockResolvedValue(mockEvent);

      const result = await service.update('event-id-123', updateEventDto);

      expect(result).toEqual(mockEvent);
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-id-123' },
        data: updateEventDto,
      });
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an event successfully', async () => {
      const mockEvent: Event = {
        id: 'event-id-123',
        name: 'Test Event',
        location: 'Test Location',
        start_time: new Date(),
        end_time: new Date(),
        shard: 0,
      };

      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(mockEvent);
      jest.spyOn(prisma.event, 'delete').mockResolvedValue(mockEvent);

      const result = await service.remove('event-id-123');

      expect(result).toEqual(mockEvent);
      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: 'event-id-123' },
      });
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      jest.spyOn(prisma.event, 'findUnique').mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
