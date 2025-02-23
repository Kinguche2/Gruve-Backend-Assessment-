# Task Management API

This project is a RESTful API built with NestJS for managing tasks associated with events. It allows users to create, read, update, and delete tasks, as well as assign tasks to specific users. The API is secured with JWT authentication and uses Prisma as the ORM for database interactions.

---

## Features

- **Task Management**:

  - Create, read, update, and delete tasks.
  - Assign tasks to users.
  - Fetch tasks associated with a specific event.

- **Authentication**:

  - JWT-based authentication for secure access to endpoints.

- **Validation**:

  - Input validation using DTOs (Data Transfer Objects) and class-validator.

- **Error Handling**:
  - Custom error handling for database operations and invalid requests.

---

## Technologies Used

- **Backend Framework**: <NestJS>
- **Database ORM**: <Prisma>
- **Authentication**: <JWT (JSON Web Tokens)>
- **Testing**: <Jest> and <Supertest>
- **Language**: <TypeScript>

---

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js v16 or higher
- npm or Yarn
- Docker (optional, for running the database locally)

---

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/task-management-api.git
   cd task-management-api

   ```

   ```

   ```

2. **Install Dependencies**:

   ```bash
   npm install

   ```

   ```

   ```

3. **Set Up the Database**:

   - Ensure you have a PostgreSQL database running.
   - Update the `.env` file with your database connection details:

     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/task_management"
     ```

     ```

     ```

4. **Run Database Migrations**:

   ```bash
   npx prisma migrate dev --name init

   ```

   ```

   ```

5. **Start the Application**:

   ```bash
   npm run start

   ```

   ```

   ```

6. **Run the Application in Development Mode**:

   ```bash
   npm run start:dev
   ```

   ```

   ```

---

## API Endpoints

### Tasks

|        | Method                           | Endpoint                        | Description |
| ------ | -------------------------------- | ------------------------------- | ----------- |
| POST   | `/events/:eventId/tasks`         | Create a new task for an event. |
| GET    | `/events/:eventId/tasks`         | Get all tasks for an event.     |
| GET    | `/events/:eventId/tasks/:taskId` | Get a specific task by ID.      |
| PUT    | `/events/:eventId/tasks/:taskId` | Update a specific task by ID.   |
| DELETE | `/events/:eventId/tasks/:taskId` | Delete a specific task by ID.   |             |

---

## Testing

The project includes end-to-end (e2e) tests to ensure the API works as expected. To run the tests:

1. **Run the Tests**:

   ```bash
   npm run test:e2e

   ```

   ```

   ```

2. **Test Coverage**:

   - To generate a test coverage report, run:

     ```bash
     npm run test:cov
     ```

     ```

     ```

---

## Example Requests

### Create a Task

**Request**:

```bash
POST /events/event-id/tasks
Content-Type: application/json

{
"title": "Test Task",
"description": "Test Description",
"due_time": "2023-12-31T23:59:59Z",
"assigned_to": [1, 2]
}

```

**Response**:

```json
{
  "id": "task-id",
  "title": "Test Task",
  "description": "Test Description",
  "due_time": "2023-12-31T23:59:59.000Z",
  "event_id": "event-id",
  "assigned_to": [1, 2]
}
```

### Get All Tasks for an Event

**Request**:

```bash
GET /events/event-id/tasks
```

**Response**:

```json
[
  {
    "id": "task-id-1",
    "title": "Task 1",
    "description": "Description 1",
    "due_time": "2023-12-31T23:59:59.000Z",
    "assigned_to": [1]
  },
  {
    "id": "task-id-2",
    "title": "Task 2",
    "description": "Description 2",
    "due_time": "2023-12-31T23:59:59.000Z",
    "assigned_to": [2]
  }
]
```

### Update a Task

**Request**:

```bash
PUT /events/event-id/tasks/task-id
Content-Type: application/json

{
  "title": "Updated Task",
  "description": "Updated Description",
  "due_time": "2023-12-31T23:59:59Z",
  "assigned_to": [1, 2]
}
```

**Response**:

```json
{
  "id": "task-id",
  "title": "Updated Task",
  "description": "Updated Description",
  "due_time": "2023-12-31T23:59:59.000Z",
  "assigned_to": [1, 2]
}
```

### Delete a Task

**Request**:

```bash
DELETE /events/event-id/tasks/task-id
```

**Response**:

```json
{
  "id": "task-id",
  "title": "Test Task",
  "description": "Test Description",
  "due_time": "2023-12-31T23:59:59.000Z",
  "event_id": "event-id"
}
```

---

## License

This project is licensed under the MIT License. See the <LICENSE> file for details.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---

## Contact

For questions or feedback, please contact <Uche Ogbonna> at <ucheogbonnak@gmail.com>.

---

```

```
