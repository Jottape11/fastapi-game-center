from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from database import inicializar_banco
from controllers.categoria_controller import router as categoria_router
from controllers.produto_controller import router as produto_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    inicializar_banco()
    yield


app = FastAPI(
    title="Game Center Paulista",
    description="API para o e-commerce Game Center Paulista",
    version="1.0.0",
    lifespan=lifespan
)

# Rotas dos controllers
app.include_router(categoria_router)
app.include_router(produto_router)

# Arquivos estáticos do frontend
DIRETORIO_STATIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(DIRETORIO_STATIC):
    app.mount("/static", StaticFiles(directory=DIRETORIO_STATIC), name="static")


@app.get("/", include_in_schema=False)
def index():
    caminho_index = os.path.join(DIRETORIO_STATIC, "index.html")
    if os.path.exists(caminho_index):
        return FileResponse(caminho_index)
    return {"mensagem": "API Game Center Paulista ativa."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
