from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from services import produto_service

router = APIRouter(prefix="/produtos", tags=["Produtos"])


@router.get("", status_code=status.HTTP_200_OK)
def listar_produtos(categoria_id: Optional[int] = Query(None)):
    return produto_service.listar_produtos(categoria_id)


@router.get("/{produto_id}", status_code=status.HTTP_200_OK)
def buscar_produto(produto_id: int):
    produto = produto_service.buscar_produto(produto_id)
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    return produto


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_produto(dados: dict):
    try:
        return produto_service.criar_produto(dados)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro)
        )


@router.put("/{produto_id}", status_code=status.HTTP_200_OK)
def atualizar_produto(produto_id: int, dados: dict):
    try:
        produto = produto_service.atualizar_produto(produto_id, dados)
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado"
            )
        return produto
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro)
        )


@router.delete("/{produto_id}", status_code=status.HTTP_200_OK)
def excluir_produto(produto_id: int):
    removido = produto_service.excluir_produto(produto_id)
    if not removido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    return {"mensagem": "Produto removido com sucesso"}
