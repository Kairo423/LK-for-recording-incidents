import os
import time
import psycopg2
from psycopg2 import OperationalError

def wait_for_db():
    """Wait for PostgreSQL to be available."""
    db_config = {
        'dbname': os.getenv('DB_NAME'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'host': os.getenv('DB_HOST', 'postgres'),
        'port': os.getenv('DB_PORT', '5432'),
    }
    
    max_retries = 30
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(**db_config)
            conn.close()
            print("Database is available!")
            return True
        except OperationalError:
            print(f"Waiting for database... ({i+1}/{max_retries})")
            time.sleep(2)
    
    print("Database connection failed!")
    return False

if __name__ == '__main__':
    wait_for_db()