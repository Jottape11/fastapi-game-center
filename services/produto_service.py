from database import conectar
from services.categoria_service import buscar_categoria
import sqlite3


def listar_produtos(categoria_id: int = None):
    with conectar() as conexao:
        cursor = conexao.cursor()
        sql = """
            SELECT 
                p.id,
                p.nome,
                p.descricao,
                p.preco,
                p.estoque,
                p.imagem_url,
                p.categoria_id,
                c.nome AS categoria_nome
            FROM produtos p
            JOIN categorias c ON p.categoria_id = c.id
        """
        parametros = []
        if categoria_id:
            sql += " WHERE p.categoria_id = ?"
            parametros.append(categoria_id)

        sql += " ORDER BY p.id DESC;"

        cursor.execute(sql, parametros)
        linhas = cursor.fetchall()
        return [dict(linha) for linha in linhas]


def buscar_produto(produto_id: int):
    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute("""
            SELECT 
                p.id,
                p.nome,
                p.descricao,
                p.preco,
                p.estoque,
                p.imagem_url,
                p.categoria_id,
                c.nome AS categoria_nome
            FROM produtos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?;
        """, (produto_id,))
        linha = cursor.fetchone()
        return dict(linha) if linha else None


def criar_produto(dados: dict):
    nome = dados.get("nome", "").strip()
    if not nome:
        raise ValueError("O nome do produto é obrigatório.")

    try:
        preco = float(dados.get("preco", 0))
        if preco < 0:
            raise ValueError("O preço não pode ser negativo.")
    except (ValueError, TypeError):
        raise ValueError("Preço inválido.")

    try:
        estoque = int(dados.get("estoque", 0))
        if estoque < 0:
            raise ValueError("O estoque não pode ser negativo.")
    except (ValueError, TypeError):
        raise ValueError("Estoque inválido.")

    categoria_id = dados.get("categoria_id")
    if not categoria_id:
        raise ValueError("A categoria vinculada é obrigatória.")

    # Verifica se a categoria informada existe no banco
    categoria = buscar_categoria(int(categoria_id))
    if not categoria:
        raise ValueError("A categoria informada não existe.")

    descricao = dados.get("descricao", "").strip()
    imagem_url = dados.get("imagem_url", "").strip()
    if not imagem_url:
        imagem_url = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80"

    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute("""
            INSERT INTO produtos (nome, descricao, preco, estoque, imagem_url, categoria_id)
            VALUES (?, ?, ?, ?, ?, ?);
        """, (nome, descricao, preco, estoque, imagem_url, categoria_id))
        conexao.commit()
        novo_id = cursor.lastrowid
        return buscar_produto(novo_id)


def atualizar_produto(produto_id: int, dados: dict):
    produto_atual = buscar_produto(produto_id)
    if not produto_atual:
        return None

    nome = dados.get("nome", produto_atual["nome"]).strip()
    if not nome:
        raise ValueError("O nome do produto não pode ser vazio.")

    try:
        preco = float(dados.get("preco", produto_atual["preco"]))
        if preco < 0:
            raise ValueError("O preço não pode ser negativo.")
    except (ValueError, TypeError):
        raise ValueError("Preço inválido.")

    try:
        estoque = int(dados.get("estoque", produto_atual["estoque"]))
        if estoque < 0:
            raise ValueError("O estoque não pode ser negativo.")
    except (ValueError, TypeError):
        raise ValueError("Estoque inválido.")

    categoria_id = int(dados.get("categoria_id", produto_atual["categoria_id"]))
    categoria = buscar_categoria(categoria_id)
    if not categoria:
        raise ValueError("A categoria informada não existe.")

    descricao = dados.get("descricao", produto_atual["descricao"]).strip()
    imagem_url = dados.get("imagem_url", produto_atual["imagem_url"]).strip()

    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute("""
            UPDATE produtos
            SET nome = ?, descricao = ?, preco = ?, estoque = ?, imagem_url = ?, categoria_id = ?
            WHERE id = ?;
        """, (nome, descricao, preco, estoque, imagem_url, categoria_id, produto_id))
        conexao.commit()
        return buscar_produto(produto_id)


def excluir_produto(produto_id: int):
    produto = buscar_produto(produto_id)
    if not produto:
        return False

    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute("DELETE FROM produtos WHERE id = ?;", (produto_id,))
        conexao.commit()
        return True
