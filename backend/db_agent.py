import os
import psycopg
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.postgres import PostgresSaver

load_dotenv()

DB_URL = os.getenv("AGENT_DATABASE_URL", "postgresql://postgres:admin@localhost:5432/downsouthregion")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
_agent = None

SYSTEM_PROMPT = """
You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run,
then look at the results of the query and return the answer. Unless the user
specifies a specific number of examples they wish to obtain, always limit your
query to at most {top_k} results.

You can order the results by a relevant column to return the most interesting
examples in the database. Never query for all the columns from a specific table,
only ask for the relevant columns given the question.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.
"""


def get_agent():
    global _agent
    if _agent is not None:
        return _agent

    db = SQLDatabase.from_uri(DB_URL)
    model = ChatOpenAI(model=OPENAI_MODEL)
    toolkit = SQLDatabaseToolkit(db=db, llm=model)
    connection = psycopg.connect(DB_URL, autocommit=True)
    checkpointer = PostgresSaver(conn=connection)
    checkpointer.setup()
    _agent = create_agent(
        model,
        toolkit.get_tools(),
        system_prompt=SYSTEM_PROMPT.format(dialect=db.dialect, top_k=8),
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
