from database import engine
from sqlalchemy import inspect
import os

try:
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("EXISTING TABLES:")
    for t in tables:
        print(f" - {t}")
        # Check columns for 'users' if it exists
        if t == 'users':
            columns = [c['name'] for c in inspector.get_columns('users')]
            print(f"   COLUMNS: {columns}")
except Exception as e:
    print(f"ERROR: {e}")
