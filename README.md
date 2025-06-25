# 🎓 Online Kurslarni Boshqarish Tizimi (NestJS + PostgreSQL)

Bu loyiha NestJS asosida qurilgan backend bo‘lib, foydalanuvchilar kurslarga yozilishi, mashg‘ulotlarni ko‘rishi, topshiriqlarni bajarishi va natijalarni kuzatishi mumkin. Admin foydalanuvchilar va kurslarni boshqaradi.

---

## 🚀 Texnologiyalar

- **Backend**: [NestJS](https://nestjs.com/)
- **Ma'lumotlar bazasi**: PostgreSQL (Docker konteyner orqali)
- **ORM**: TypeORM
- **Autentifikatsiya**: JWT
- **Konteynerizatsiya**: Docker + Docker Compose
- **Versiya nazorati**: Git + GitHub
- **CI/CD**: GitHub Actions + Oracle Cloud

---

## ⚙️ Ishga tushirish

### 1. Repozitoriyani klon qiling

```bash
git clone https://github.com/username/online-courses-management-system.git
cd online-courses-management-system
```

### 2. .env faylni tayyorlang

bash

```bash
cp .env.production.template .env
```

Keyin .env faylga quyidagilarni kiriting:

```bash
DATABASE_URL=postgresql://postgres:2009@localhost:5432/online_courses_db
JWT_SECRET=your-secret
JWT_EXPIRES_IN=1d
```

### 3. Docker orqali ishga tushirish (dev muhit)

```bash
docker-compose up --build
```

API ishlay boshlaydi: http://localhost:3000
