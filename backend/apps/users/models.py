from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
	"""Простейшая пользовательская модель, наследующая стандартную.

	Оставлена пустой для расширения в будущем (например, добавление полей).
	Нужна чтобы значение AUTH_USER_MODEL = 'users.User' в settings.py было корректно.
	"""
	pass
