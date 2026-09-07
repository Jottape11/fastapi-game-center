from fastapi import APIRouter, HTTPException, status
from services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("", status_code=status.HTTP_200_OK)
def listar_categorias():
    return categoria_service.listar_categorias()


@router.get("/{categoria_id}", status_code=status.HTTP_200_OK)
def buscar_categoria(categoria_id: int):
    categoria = categoria_service.buscar_categoria(categoria_id)
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    return categoria


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_categoria(dados: dict):
    try:
        return categoria_service.criar_categoria(dados)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro)
        )


@router.put("/{categoria_id}", status_code=status.HTTP_200_OK)
def atualizar_categoria(categoria_id: int, dados: dict):
    try:
        categoria = categoria_service.atualizar_categoria(categoria_id, dados)
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )
        return categoria
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro)
        )


@router.delete("/{categoria_id}", status_code=status.HTTP_200_OK)
def excluir_categoria(categoria_id: int):
    removido = categoria_service.excluir_categoria(categoria_id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    return {"mensagem": "Categoria removida com sucesso"}
