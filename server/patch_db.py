from sqlalchemy import text
from database import engine

sql_commands = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id VARCHAR",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_pass VARCHAR",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS official_id VARCHAR",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR",
    "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS server_region VARCHAR",
    "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hr_contact VARCHAR"
]

with engine.connect() as conn:
    for cmd in sql_commands:
        try:
            conn.execute(text(cmd))
            print(f"SUCCESS: {cmd}")
        except Exception as e:
            print(f"FAILED: {cmd} - {e}")
    conn.commit()
print("PATCH COMPLETE")
