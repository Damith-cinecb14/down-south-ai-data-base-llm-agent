import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.postgres import PostgresSaver

load_dotenv(Path(__file__).with_name(".env"))

DB_URL = os.getenv("AGENT_DATABASE_URL", "postgresql://postgres:admin@localhost:5432/downsouthregion")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
_agent = None


def sqlalchemy_database_url(connection_url: str) -> str:
    """Select the installed psycopg v3 driver for SQLAlchemy connections."""
    if connection_url.startswith("postgresql://"):
        return connection_url.replace("postgresql://", "postgresql+psycopg://", 1)
    if connection_url.startswith("postgres://"):
        return connection_url.replace("postgres://", "postgresql+psycopg://", 1)
    return connection_url


def psycopg_database_url(connection_url: str) -> str:
    """Convert a SQLAlchemy-style URL into a URL accepted by psycopg."""
    return connection_url.replace("postgresql+psycopg://", "postgresql://", 1)

SYSTEM_PROMPT = """
You are the read-only service intelligence assistant for the Down South Region.
Answer factual questions only from the connected {dialect} database by using the
SQL tools. Never guess database values and never substitute a count when the user
asks for names, details, models, serial numbers, status, contact information, or
"all information".

Treat machine, device, and asset as synonyms for equipment. Use the hospitals,
equipment, services, and service_agreements tables as appropriate, joining them
when hospital names or equipment names are needed. For equipment-detail requests,
include the equipment name, hospital, model, serial number, and status when those
fields exist. For hospital-information requests, include name, address, email,
and telephone. Preserve conversation context when the user asks a follow-up.

For ordinary questions, limit results to at most {top_k} rows. If the user
explicitly asks for all, every, a complete list, or all information, return every
matching row. Clearly say when a requested value is not recorded.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE,
CREATE, or similar). Do not expose database credentials or internal SQL errors.
"""


def get_agent():
    global _agent
    if _agent is not None:
        return _agent

    db = SQLDatabase.from_uri(sqlalchemy_database_url(DB_URL))
    model = ChatOpenAI(model=OPENAI_MODEL)
    toolkit = SQLDatabaseToolkit(db=db, llm=model)
    connection = psycopg.connect(psycopg_database_url(DB_URL), autocommit=True)
    checkpointer = PostgresSaver(conn=connection)
    checkpointer.setup()
    _agent = create_agent(
        model,
        toolkit.get_tools(),
        system_prompt=SYSTEM_PROMPT.format(dialect=db.dialect, top_k=20),
        checkpointer=checkpointer,
    )
    return _agent

def query_db_with_natural_language(user_input: str, thread_id: str = "1"):
    try:
        agent = get_agent()
        config = {"configurable": {"thread_id": thread_id}}

        output_result = None

        for step in agent.stream(
                {"messages" : [{"role"  : "user", "content" :user_input}]},
                      config,
                      stream_mode="values"
        ):
            # print(step)
            if "messages" in step:
                last_message = step["messages"][-1]
                if hasattr(last_message, "content"):
                    output_result = last_message.content

        return output_result if output_result else "No content was returned."
    except Exception as e:
        return f"Error Occurred - {str(e)}"
