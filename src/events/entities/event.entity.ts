import { Task } from '../../tasks/entities/task.entity';

export class Event {
  id: number;
  name: string;
  location: string;
  start_time: Date;
  end_time: Date;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}
