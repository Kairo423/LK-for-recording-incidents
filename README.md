# IMS — Incident Management System
IMS (Incident Management System) — веб‑приложение для учёта и управления производственными/организационными происшествиями, с аналитикой и разграничением прав доступа.  
[Документация](./docs/documentation.docx)  
[Структура](./docs/filelist.txt)  

## Стек
Backend: Django, Django REST Framework, drf-yasg (Swagger/Redoc), SimpleJWT (JWT-аутентификация), PostgreSQL  
Frontend: React + TypeScript + Vite, TailwindCSS / UI-компоненты  
Инфраструктура: Docker, docker-compose, Nginx  

## Основные возможности

1. Регистрация и аутентификация пользователей (JWT: access + refresh)
2. Роли и права:
Администратор | Руководитель | Сотрудник
3. Управление пользователями и подразделениями
4. Регистрация происшествий:
тип, статус, подразделение, автор, ответственный
описание, ущерб, простой, пострадавшие
файлы‑вложения и комментарии
5. Фильтрация и аналитика по инцидентам
6. Конфигурируемые сроки жизни JWT‑токенов через админку / API
7. Swagger / Redoc документация по API

## Структура репозитория

### В корне:

backend — Django‑проект (API, модели, миграции)  
frontend — React/Vite SPA  
docker-compose.yml — оркестрация сервисов (Postgres, backend, frontend, Nginx)  
Dockerfile.frontend, Dockerfile.backend — контейнеры  
docker — конфигурация Nginx и init‑скрипт Postgres  
documentation.docx — сгенерированная документация по проекту  

### Ключевые модули backend:

settings.py — настройки проекта, DRF, SimpleJWT  
urls.py — корневые URL, подключение приложений и Swagger  
users — пользователи, профили, подразделения, роли, JWT‑вьюхи  
incidents — модели и API для инцидентов  
api — вспомогательные эндпоинты (/health/ и пр.)  

## Быстрый старт (локально, без Docker, НЕ для production)

### Backend

1. Клонирование репозитория 
```git clone https://github.com/Kairo423/LK-for-recording-incidents```
2. Переход в директоорию backend
```cd backend```
3. Создание виртуального окружения
```python -m venv venv```
4. Активация виртуального окружения
```venv\Scripts\Activate```
5. Установка зависимостей
```pip install -r requirements.txt```
6. Применение миграций в базу данных
```python manage.py migrate```
7. Создание суперпользователя
```python manage.py createsuperuser```
8. Запуск встроенного development-сервера Django
```python manage.py runserver```
9. Вернуться в директорию проекта
```cd ..```

### Frontend

1. Переход в директоорию frontend
```cd frontend```
2. Установка зависимостей
```npm install```
3. Запуск сервера разработки
```npm run dev```

## Запуск через Docker Compose

В корне проекта есть docker-compose.yml, который поднимает:  

postgres — БД PostgreSQL  
backend — Django + Gunicorn  
frontend — React/Vite  
nginx — обратный прокси + статика  

1. Создайте .env в корне:
```
# Django
DEBUG=False
SECRET_KEY=your_django_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database
DB_NAME=ims-db
DB_USER=ims_user
DB_PASSWORD=supersecret
DB_HOST=postgres
DB_PORT=5432

# React
REACT_APP_API_URL=http://localhost:8000/api
```
2. Откройте Docker Desktop (или установите и запустите на сервере)

3. Запуск из ../IMS : 
```docker compose up -d --build```

### Полезные команды 
```
# Логи бекенда
docker compose logs -f backend

# Войти внутрь контейнера backend
docker compose exec backend bash

# Выполнить миграции вручную (если нужно)
docker compose exec backend python manage.py migrate

# Создать суперпользователя
docker compose exec backend python manage.py createsuperuser
```

### После запуска 
Nginx доступен на http://localhost/ (проксирует frontend + backend)
