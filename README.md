# Game Center Paulista

Plataforma de e-commerce e gerenciamento de catálogo de games desenvolvida com **FastAPI** e banco de dados relacional **SQLite**, estruturada em arquitetura em camadas (**Controller** e **Service**).

Projeto desenvolvido para o **Checkpoint 4 (CP4) — Computational Thinking With Python (FIAP)**.

---

## Destaques do Projeto

- **Arquitetura em Camadas:** Separação estrita de responsabilidades entre rotas HTTP (**Controller**) e regras de negócio/persistência (**Service**).
- **Banco de Dados Relacional (1:N):** Modelagem com integridade referencial no SQLite via `PRAGMA foreign_keys = ON;` e exclusão em cascata.
- **CRUD Completo:** Endpoints RESTful para criação, leitura, atualização e remoção de produtos e categorias.
- **Frontend Moderno:** Interface web com vitrine de produtos, barra de busca instantânea, filtros por categoria e painéis administrativos para gestão de estoque.
- **Documentação Automática:** OpenAPI/Swagger integrado nativamente.

---

## Estrutura de Pastas

```
fastapi-game-center/
├── main.py                  # Ponto de entrada, configuração do FastAPI e arquivos estáticos
├── database.py              # Conexão SQLite, chaves estrangeiras e carga inicial
├── controllers/             # Camada Controller (rotas HTTP e status codes)
│   ├── categoria_controller.py
│   └── produto_controller.py
├── services/                # Camada Service (regras de negócio e queries SQL)
│   ├── categoria_service.py
│   └── produto_service.py
├── static/                  # Frontend Web (HTML5, CSS3 moderno e Vanilla JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── test_api.py              # Bateria de testes automatizados da API
├── requirements.txt         # Dependências do projeto
└── game_center.db           # Banco de dados SQLite persistente
```

---

## Modelagem de Dados (1:N)

O projeto possui duas entidades relacionadas com cardinalidade **1:N**:

```
[ Categorias ] 1 ───────< N [ Produtos ]
  - id (PK)                    - id (PK)
  - nome                       - nome, descricao, preco, estoque, imagem_url
  - descricao                  - categoria_id (FK -> categorias.id)
```

---

## Como Executar

### Pré-requisitos
- Python 3.10 ou superior instalado.

### 1. Clonar o repositório
```bash
git clone https://github.com/Jottape11/fastapi-game-center.git
cd fastapi-game-center
```

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Iniciar o servidor
```bash
python main.py
```

### 4. Acessar a aplicação
- **Loja / Interface Web:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Documentação Swagger:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Documentação ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 5. Executar os testes automatizados
```bash
python test_api.py
```

---

## Endpoints da API

### Categorias (`/categorias`)
| Método | Rota | Descrição | Status Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/categorias` | Lista todas as categorias com contagem de produtos | `200 OK` |
| `GET` | `/categorias/{id}` | Retorna detalhes de uma categoria por ID | `200 OK` |
| `POST` | `/categorias` | Cria uma nova categoria | `201 Created` |
| `PUT` | `/categorias/{id}` | Atualiza nome ou descrição da categoria | `200 OK` |
| `DELETE` | `/categorias/{id}` | Remove a categoria e produtos associados em cascata | `200 OK` |

### Produtos (`/produtos`)
| Método | Rota | Descrição | Status Sucesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/produtos` | Lista produtos (suporta filtro `?categoria_id=ID`) | `200 OK` |
| `GET` | `/produtos/{id}` | Retorna produto detalhado com nome da categoria | `200 OK` |
| `POST` | `/produtos` | Cadastra novo produto vinculado a uma categoria existente | `201 Created` |
| `PUT` | `/produtos/{id}` | Atualiza dados cadastrais de um produto | `200 OK` |
| `DELETE` | `/produtos/{id}` | Remove um produto do catálogo | `200 OK` |

---

## Licença

Desenvolvido para fins acadêmicos na FIAP — Engenharia de Software.
