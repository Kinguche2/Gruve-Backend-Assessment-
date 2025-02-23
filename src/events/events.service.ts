import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from '@prisma/client';
import { handlePrismaError } from '../exceptions/prisma.exception';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new event.
   * @param createEventDto - The data to create the event.
   * @returns The created event.
   */
  async create(createEventDto: CreateEventDto): Promise<Event> {
    try {
      return await this.prisma.event.create({ data: createEventDto });
    } catch (error) {
      handlePrismaError(error);
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  /**
   * Finds all events.
   * @returns A list of events.
   */
  async findAll(): Promise<Event[]> {
    try {
      return await this.prisma.event.findMany();
    } catch (error) {
      handlePrismaError(error);
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  /**
   * Finds an event by its ID.
   * @param id - The ID of the event.
   * @returns The event if it exists.
   * @throws NotFoundException if the event does not exist.
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Updates an event.
   * @param id - The ID of the event.
   * @param updateEventDto - The data to update the event.
   * @returns The updated event.
   * @throws NotFoundException if the event does not exist.
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return await this.prisma.event.update({
      where: { id },
      data: updateEventDto,
    });
  }

  /**
   * Deletes an event.
   * @param id - The ID of the event.
   * @returns The deleted event.
   * @throws NotFoundException if the event does not exist.
   */
  async remove(id: string): Promise<Event> {
    const event = await this.prisma.event.findUnique({ where: { id } });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return await this.prisma.event.delete({ where: { id } });
  }
}
