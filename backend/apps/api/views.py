from django.db import connections
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
def health(request):
	"""Health check endpoint.

	Returns 200 OK and a JSON payload when the app can reach the database.
	Returns 503 Service Unavailable if database connection fails.
	"""
	# Quick DB check
	db_conn = connections['default']
	try:
		# ensure_connection will raise if DB unreachable
		db_conn.ensure_connection()
	except Exception:
		return Response({'status': 'unhealthy', 'database': 'unreachable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

	return Response({'status': 'ok', 'database': 'ok'})
