import sys
import os
import json
import re
from typing import List, Dict
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db
from app.models.app import AppCreate

async def load_frontend_apps() -> List[Dict]:
    """Load apps from the frontend TypeScript file"""
    frontend_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        'src', 'data', 'apps.ts'
    )
    
    with open(frontend_path, 'r') as f:
        content = f.read()
        
        # Extract the array content between [ and ]
        # Find the last occurrence of '=' before the first '['
        equals_pos = content.rfind('=', 0, content.find('['))
        if equals_pos != -1:
            # Start from after the '=' sign
            content = content[equals_pos + 1:]
        
        # Find the first '[' and last ']'
        start = content.find('[')
        end = content.rfind(']') + 1
        
        if start == -1 or end == 0:
            raise ValueError("Could not find valid array brackets in the TypeScript file")
            
        apps_array = content[start:end]
        
        # Use regex to clean and format the JSON string
        apps_json = re.sub(r"(\w+):", r'"\1":', apps_array)  # Add quotes around keys
        apps_json = re.sub(r"'", '"', apps_json)  # Replace single quotes with double quotes
        apps_json = re.sub(r'//.*', '', apps_json)  # Remove single-line comments
        apps_json = re.sub(r'/\*.*?\*/', '', apps_json, flags=re.DOTALL)  # Remove multi-line comments
        apps_json = re.sub(r',(\s*[\]}])', r'\1', apps_json)  # Remove trailing commas
        
        # Log cleaned JSON for debugging
        print("Cleaned Apps JSON:", apps_json)
        
        # Parse JSON
        try:
            return json.loads(apps_json)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {e}")
            print("Faulty JSON Content:", apps_json)
            raise

async def sync_apps():
    """Sync frontend apps with backend database"""
    db_generator = get_db()
    db = next(db_generator)
    try:
        # Get existing apps from database
        response = db.table('apps').select('id').execute()
        existing_app_ids = {app['id'] for app in response.data}
        
        # Load frontend apps
        frontend_apps = await load_frontend_apps()
        
        # Find apps that need to be added
        apps_to_add = [
            AppCreate(id=app['id'], name=app['name'], category=app['category']).model_dump()
            for app in frontend_apps if app['id'] not in existing_app_ids
        ]
        
        if apps_to_add:
            # Insert new apps
            response = db.table('apps').insert(apps_to_add).execute()
            print(f"Added {len(apps_to_add)} new apps to the database")
            for app in apps_to_add:
                print(f"- {app['name']} ({app['id']})")
        else:
            print("All apps are already in sync")
            
    except Exception as e:
        print(f"Error syncing apps: {e}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(sync_apps())
