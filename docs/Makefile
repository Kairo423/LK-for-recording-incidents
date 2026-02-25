# Makefile
.PHONY: up down build restart logs shell migrate createsuperuser

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

shell:
	docker-compose exec backend bash

migrate:
	docker-compose exec backend python manage.py migrate

makemigrations:
	docker-compose exec backend python manage.py makemigrations

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

test:
	docker-compose exec backend python manage.py test

frontend-shell:
	docker-compose exec frontend sh

db-shell:
	docker-compose exec postgres psql -U project_user -d project_db

# 3. Создать миграции и суперпользователя
	docker-compose exec backend python manage.py makemigrations
	docker-compose exec backend python manage.py migrate
	docker-compose exec backend python manage.py createsuperuser

# 4. Проверить работу
# Backend API: http://localhost:8000/api/
# Django Admin: http://localhost:8000/admin/
# React frontend: http://localhost:3000/
# API Documentation: http://localhost:8000/swagger/