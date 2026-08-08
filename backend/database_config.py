import os
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

load_dotenv(Path(__file__).with_name(".env"))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:admin@localhost:5432/downsouthregion",
)


engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
