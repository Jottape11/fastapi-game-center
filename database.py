import sqlite3
import os

DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))
BANCO_DADOS = os.path.join(DIRETORIO_ATUAL, "game_center.db")


def conectar():
    conexao = sqlite3.connect(BANCO_DADOS)
    conexao.row_factory = sqlite3.Row
    # Ativa suporte a chaves estrangeiras no SQLite
    conexao.execute("PRAGMA foreign_keys = ON;")
    return conexao


def criar_tabelas():
    with conectar() as conexao:
        cursor = conexao.cursor()

        # Tabela de categorias
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE,
                descricao TEXT
            );
        """)

        # Tabela de produtos (relacionada com categorias 1:N)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                preco REAL NOT NULL,
                estoque INTEGER NOT NULL DEFAULT 0,
                imagem_url TEXT,
                categoria_id INTEGER NOT NULL,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
            );
        """)
        conexao.commit()


def inserir_dados_iniciais():
    with conectar() as conexao:
        cursor = conexao.cursor()

        cursor.execute("SELECT COUNT(*) FROM categorias;")
        if cursor.fetchone()[0] == 0:
            categorias = [
                ("Consoles", "Consoles de videogame e hardware"),
                ("Jogos PlayStation", "Jogos para PS4 e PS5"),
                ("Lançamentos", "Lançamentos e pré-vendas"),
                ("Acessórios", "Controles, fones e periféricos")
            ]
            cursor.executemany("""
                INSERT INTO categorias (nome, descricao)
                VALUES (?, ?);
            """, categorias)
            conexao.commit()

        cursor.execute("SELECT COUNT(*) FROM produtos;")
        if cursor.fetchone()[0] == 0:
            produtos = [
                (
                    "PlayStation 5 Slim 1TB",
                    "Console PlayStation 5 Slim com leitor de disco e 1 controle DualSense.",
                    3799.90,
                    15,
                    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
                    1
                ),
                (
                    "Grand Theft Auto VI (GTA 6)",
                    "Novo jogo da franquia GTA ambientado em Vice City e Leonida.",
                    449.90,
                    50,
                    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
                    3
                ),
                (
                    "Marvel's Spider-Man 2",
                    "Jogo de ação e aventura com Peter Parker e Miles Morales.",
                    299.90,
                    30,
                    "https://images.unsplash.com/photo-1612287233221-50e58849b292?auto=format&fit=crop&w=800&q=80",
                    2
                ),
                (
                    "The Last of Us Part I",
                    "Remake completo da história de Joel e Ellie para PlayStation 5.",
                    279.90,
                    25,
                    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
                    2
                ),
                (
                    "Controle DualSense Preto",
                    "Controle sem fio oficial com gatilhos adaptáveis.",
                    429.90,
                    40,
                    "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80",
                    4
                )
            ]
            cursor.executemany("""
                INSERT INTO produtos (nome, descricao, preco, estoque, imagem_url, categoria_id)
                VALUES (?, ?, ?, ?, ?, ?);
            """, produtos)
            conexao.commit()


def inicializar_banco():
    criar_tabelas()
    inserir_dados_iniciais()


if __name__ == "__main__":
    inicializar_banco()
    print("Banco de dados pronto!")
