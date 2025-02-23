import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsISO8601,
  ArrayMinSize,
} from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user must be assigned' })
  @IsInt({ each: true }) // Ensures all array elements are integers
  assigned_to?: number[];

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Invalid ISO8601 date format' })
  due_time?: string;
}
