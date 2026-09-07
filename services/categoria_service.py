from database import conectar
import sqlite3


def listar_categorias():
    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute("""
            SELECT 
                c.id, 
                c.nome, 
                c.descricao,
                COUNT(p.id) AS total_produtos
            FROM categorias c
            LEFT JOIN produtos p ON p.categoria_id = c.id
            GROUP BY c.id, c.nome, c.descricao
            ORDER BY c.nome ASC;
        """)
        linhas = cursor.fetchall()
        return [dict(linha) for linha in linhas]


def buscar_categoria(categoria_id: int):
    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute("SELECT id, nome, descricao FROM categorias WHERE id = ?;", (categoria_id,))
        linha = cursor.fetchone()
        return dict(linha) if linha else None


def criar_categoria(dados: dict):
    nome = dados.get("nome", "").strip()
    if not nome:
        raise ValueError("O nome da categoria é obrigatório.")

    descricao = dados.get("descricao", "").strip()

    with conectar() as conexao:
        cursor = conexao.cursor()
        try:
            cursor.execute("""
                INSERT INTO categorias (nome, descricao)
                VALUES (?, ?);
            """, (nome, descricao))
            conexao.commit()
            novo_id = cursor.lastrowid
            return buscar_categoria(novo_id)
        except sqlite3.IntegrityError:
            raise ValueError(f"Já existe uma categoria cadastrada com o nome '{nome}'.")


def atualizar_categoria(categoria_id: int, dados: dict):
    categoria = buscar_categoria(categoria_id)
    if not categoria:
        return None

    nome = dados.get("nome", categoria["nome"]).strip()
    descricao = dados.get("descricao", categoria["descricao"]).strip()

    if not nome:
        raise ValueError("O nome da categoria não pode ser vazio.")

    with conectar() as conexao:
        cursor = conexao.cursor()
        try:
            cursor.execute("""
                UPDATE categorias
                SET nome = ?, descricao = ?
                WHERE id = ?;
            """, (nome, descricao, categoria_id))
            conexao.commit()
            return buscar_categoria(categoria_id)
        except sqlite3.IntegrityError:
            raise ValueError(f"Já existe outra categoria com o nome '{nome}'.")


def excluir_categoria(categoria_id: int):
    categoria = buscar_categoria(categoria_id)
    if not categoria:
        return False

    with conectar() as conexao:
        cursor = conexao.cursor()
        cursor.execute("DELETE FROM categorias WHERE id = ?;", (categoria_id,))
        conexao.commit()
        return True
