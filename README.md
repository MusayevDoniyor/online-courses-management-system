# 🎓 Online Courses Management System

This project is a robust backend system for an online learning platform, built with **NestJS** and **PostgreSQL**. It provides a comprehensive set of features for managing courses, modules, lessons, enrollments, and assignments. The system is designed with a clear separation of roles (admin, instructor, student) and uses JWT for secure authentication.

---

## ✨ Features

- **User Authentication**: Secure user registration and login with JWT-based authentication.
- **Role-Based Access Control (RBAC)**: Differentiated access levels for admins, instructors, and students.
- **Course Management**: Admins and instructors can create, update, and delete courses.
- **Module and Lesson Management**: Organize courses into modules and lessons.
- **Student Enrollment**: Students can enroll in available courses.
- **Lesson Tracking**: Track student progress by marking lessons as complete.
- **Assignment Submission**: Students can submit assignments for grading.
- **Grading System**: Instructors can grade submissions and provide feedback.

---

## 🛠️ Technologies Used

- **Backend**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Authentication**: [JWT (JSON Web Tokens)](https://jwt.io/)
- **API Documentation**: [Swagger](https://swagger.io/)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [Docker](https://www.docker.com/get-started)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/online-courses-management-system.git
cd online-courses-management-system
```

### 2. Create Environment File

Create a `.env` file by copying the template:

```bash
cp .env.production.template .env
```

Update the `.env` file with your configuration:

```env
# Application
APP_PORT=4000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-strong-password
DB_NAME=online_courses_db
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d
```

### 3. Install Dependencies

```bash
npm install
```

---

## 🐳 Running with Docker

This is the recommended way to run the application for both development and production.

### Start the Application

```bash
docker-compose up --build
```

The application will be available at `http://localhost:4000`.

### Stop the Application

```bash
docker-compose down
```

---

## 📝 API Documentation

Once the application is running, you can access the Swagger API documentation at:

[http://localhost:4000/api](http://localhost:4000/api)

This provides a detailed overview of all available endpoints, their parameters, and expected responses.

---

## 📁 Project Structure

```
.
├── src
│   ├── admin
│   ├── assignments
│   ├── auth
│   ├── common
│   ├── course
│   ├── enrollments
│   ├── lessons
│   └── modules
├── test
└── ... (configuration files)
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a pull request.

---

## 📄 License

This project is licensed under the MIT License.
