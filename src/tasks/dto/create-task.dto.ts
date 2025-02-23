import {
  IsString,
  IsArray,
  ArrayMinSize,
  IsInt,
  IsISO8601,
  IsNotEmpty,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user must be assigned' })
  @IsInt({ each: true }) // Ensures all array elements are integers
  assigned_to: number[];

  @IsISO8601({ strict: true }, { message: 'Invalid ISO8601 date format' })
  due_time: string;
}
