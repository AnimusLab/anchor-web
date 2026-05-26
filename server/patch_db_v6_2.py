import os
import sys
from sqlalchemy import text

# Add current dir to path to import database
sys.path.append(os.getcwd())
from database import engine

def patch_db_v6_2():
    print("Connecting to database to apply Institutional Identity (v6.2) patches...")
    
    with engine.connect() as conn:
        tables = ["enterprise_users", "regulatory_officials"]
        
        columns = [
            ("identity_subtype", "VARCHAR(255)"),
            ("provisioned_capabilities", "TEXT"),
            ("jurisdiction_scope", "VARCHAR(255)"),
            ("entity_visibility_scope", "VARCHAR(255)"),
            ("governance_scope", "VARCHAR(255)"),
            ("institutional_origin", "VARCHAR(255)"),
            ("delegation_rights", "BOOLEAN")
        ]
        
        for table in tables:
            print(f"Checking {table} table...")
            for col_name, col_type in columns:
                try:
                    # Generic check for column existence
                    conn.execute(text(f"SELECT {col_name} FROM {table} LIMIT 1"))
                    # print(f"  Column '{col_name}' already exists in {table}.")
                except Exception:
                    # If we are in PostgreSQL, we need to rollback before next command
                    try:
                        conn.rollback()
                    except:
                        pass
                        
                    print(f"  Adding '{col_name}' to {table}...")
                    try:
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"  ✓ {col_name} added.")
                    except Exception as e:
                        print(f"  ✗ Failed to add {col_name}: {e}")
                        try:
                            conn.rollback()
                        except:
                            pass

    print("Database patch complete.")

if __name__ == "__main__":
    patch_db_v6_2()
