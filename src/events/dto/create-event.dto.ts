import { IsString, IsDateString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  location: string;

  @IsString()
  name: string;

  @IsDateString()
  start_time: string; // Use `@IsDateString()` to validate ISO date format

  @IsDateString()
  end_time: string;
}

export class EventDto {
  id: string;
  location: string;
  name: string;
  start_time: Date;
  end_time: Date;
}
