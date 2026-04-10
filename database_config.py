from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Note: Added '+asyncpg' to the URL. An async driver is required for create_async_engine.
DATABASE_URL = "postgresql+asyncpg://postgres:admin@localhost:5432/downsouthregion"


engine = create_async_engine(
    DATABASE_URL,
    echo=False, # Used for query logging
    pool_pre_ping=True # checking weather database connection is active
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    # Removed class_=AttributeError (invalid) and autocommit=False (removed in SQLAlchemy 2.0)
    expire_on_commit=False,
    autocommit=False, # disable automatically changes in database
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    # 'async with' automatically handles closing the session, so try/finally is not needed
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()