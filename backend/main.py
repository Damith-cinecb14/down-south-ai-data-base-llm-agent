from fastapi import FastAPI

from db_agent import query_db_with_natural_language
from hospital_route import  router as hospital_router
from  service_route import  router as service_router
from  equipment_route import  router as equipment_router
from  agent_route import router as agent_router
from agreement_route import router as agreement_router
import gradio as gr
from uuid import uuid4

app = FastAPI(title="Down South Region Service - ORM Implementation ")

app.include_router(hospital_router)
app.include_router(equipment_router)
app.include_router(service_router)
app.include_router(agent_router)
app.include_router(agreement_router)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "down-south-region"}


def db_agent_gradio_ui():
    with gr.Blocks() as db_ui:
        gr.Markdown("DownSouth Database Agent")
        gr.Markdown("Query Your database with natural languages")

        thread_id = gr.State(str(uuid4()))
        chatbot =gr.Chatbot(label="Conversation")
        msg = gr.Textbox(label="Enter Message")

        def respond(message:str,history:list,current_thread_id:str):
            result = query_db_with_natural_language(message,thread_id=current_thread_id)

            history = history + [
                {"role" : "user", "content" : message},
                {"role" : "assistant", "content" : result}
            ]

            return history, "", current_thread_id

        msg.submit(
            respond,
            inputs=[msg,chatbot,thread_id],
            outputs=[chatbot,msg,thread_id]
        )
    return db_ui

app =gr.mount_gradio_app(app,db_agent_gradio_ui(), "/agent/down-south-service")
