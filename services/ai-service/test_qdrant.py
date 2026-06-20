import asyncio
from app.db.qdrant import get_qdrant

async def main():
    client = get_qdrant()
    for col in ["hotels", "activities", "transport", "dining", "culture", "events"]:
        try:
            count = await client.count(collection_name=col)
            print(f"Collection '{col}': {count.count} items")
        except Exception as e:
            print(f"Collection '{col}': Error {e}")

asyncio.run(main())
