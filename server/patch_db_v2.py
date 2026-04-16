from sqlalchemy import text
from database import engine

sql_commands = [
    "ALTER TABLE users ALTER COLUMN hashed_key DROP NOT NULL",
    "ALTER TABLE users ALTER COLUMN entity_id DROP NOT NULL",
    # Just in case others are not null
    "ALTER TABLE users ALTER COLUMN status DROP NOT NULL",
    "ALTER TABLE users ALTER COLUMN email_verified DROP NOT NULL"
]

with engine.connect() as conn:
    for cmd in sql_commands:
        try:
            conn.execute(text(cmd))
            print(f"SUCCESS: {cmd}")
        except Exception as e:
            print(f"FAILED: {cmd} - {e}")
    conn.commit()
print("PATCH 2 COMPLETE")
