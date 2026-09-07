# 🎮 Game Center Paulista — E-commerce & Gestão de Games

Projeto desenvolvido para a entrega do **Checkpoint 4 (CP4) — Computational Thinking With Python (FIAP)**.

Aplicação full stack de e-commerce de games desenvolvida com **FastAPI**, arquitetura estrita em camadas (**Controller** e **Service**), persistência relacional com **SQLite** e interface web moderna em **HTML5/CSS3/JavaScript (Fetch API)**.

---

## 🧭 1. Entendendo o Projeto: O que é e como funciona?

Esta aplicação é **Full Stack**, composta por três pilares essenciais:
1. **Frontend (Interface do Usuário):** Desenvolvido em HTML5, CSS3 moderno e Vanilla JavaScript (sem frameworks pesados). É onde o cliente visualiza os jogos, filtra categorias e realiza operações de cadastro, edição e exclusão.
2. **Backend (API RESTful):** Desenvolvido em Python com **FastAPI**, dividindo estritamente as responsabilidades entre *Controllers* (rotas) e *Services* (regras de negócio).
3. **Banco de Dados (Persistência Real):** Banco relacional **SQLite** gravado no arquivo físico `game_center.db`, com integridade referencial ativa (`PRAGMA foreign_keys = ON;`).

---

## 🏛️ 2. Arquitetura em Camadas (Controller vs Service)

Para cumprir as boas práticas de engenharia de software e a exigência do projeto, o código foi organizado na **Analogia do Restaurante**:

```
      Cliente (Usuário no Navegador)
                   │
                   ▼
    ┌─────────────────────────────┐
    │     CONTROLLER (O Garçom)   │  --> Atende os pedidos HTTP, valida formatos e entrega respostas
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │     SERVICE (O Cozinheiro)  │  --> Aplica as regras de negócio, valida consistências e manipula dados
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─────────────────────────────┐
    │     DATABASE (A Despensa)   │  --> Arquivo SQLite físico (game_center.db)
    └─────────────────────────────┘
```

- **Controller (`controllers/`):** É o garçom. Recebe as requisições HTTP (`GET`, `POST`, `PUT`, `DELETE`), verifica se os parâmetros básicos vieram corretos e repassa ao Service. Quando o Service finaliza, o Controller responde ao cliente com o status HTTP semântico (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`). **O Controller nunca faz consultas SQL diretas.**
- **Service (`services/`):** É o cozinheiro. Aplica as regras de negócio: valida se o preço é positivo, se o estoque é válido e se a categoria vinculada realmente existe no banco antes de cadastrar ou alterar um produto. Em seguida, executa os comandos SQL parametrizados com segurança contra SQL Injection.

---

## 📂 3. Mapa Detalhado de Arquivos (Para que serve cada um?)

| Arquivo / Pasta | Tipo | Função e Responsabilidade no Projeto |
| :--- | :--- | :--- |
| [`main.py`](file:///c:/Users/jpmas/Downloads/CP4%20python/main.py) | **Ponto de Entrada** | Inicia a aplicação FastAPI, registra os roteadores (`categoria_controller` e `produto_controller`), inicializa o banco de dados no startup e serve os arquivos estáticos do frontend. |
| [`database.py`](file:///c:/Users/jpmas/Downloads/CP4%20python/database.py) | **Banco de Dados** | Gerencia as conexões com o SQLite, ativa obrigatoriamente as Foreign Keys (`PRAGMA foreign_keys = ON;`), cria as tabelas relacionais 1:N e insere os dados iniciais dos jogos (PS5, GTA 6, etc.). |
| [`controllers/produto_controller.py`](file:///c:/Users/jpmas/Downloads/CP4%20python/controllers/produto_controller.py) | **Controller** | Mapeia os endpoints REST de produtos (`/produtos`), tratando os métodos `GET`, `POST`, `PUT`, `DELETE` e os códigos de resposta HTTP. |
| [`controllers/categoria_controller.py`](file:///c:/Users/jpmas/Downloads/CP4%20python/controllers/categoria_controller.py) | **Controller** | Mapeia os endpoints REST de categorias (`/categorias`), recebendo requisições e delegando a execução ao service. |
| [`services/produto_service.py`](file:///c:/Users/jpmas/Downloads/CP4%20python/services/produto_service.py) | **Service** | Regras de negócio de produtos: valida se a categoria pai existe, valida preços/estoques, executa `JOIN` entre produtos e categorias e realiza as operações no banco. |
| [`services/categoria_service.py`](file:///c:/Users/jpmas/Downloads/CP4%20python/services/categoria_service.py) | **Service** | Regras de negócio de categorias: valida nomes obrigatórios e duplicados, lista categorias com contagem de produtos vinculados e executa exclusões. |
| [`static/index.html`](file:///c:/Users/jpmas/Downloads/CP4%20python/static/index.html) | **Frontend** | Estrutura semântica da interface web: Vitrine Gamer, tabelas de gestão CRUD, formulários e modais interativos. |
| [`static/style.css`](file:///c:/Users/jpmas/Downloads/CP4%20python/static/style.css) | **Frontend** | Design visual moderno gamer em Dark Theme, utilizando variáveis CSS, gradientes, efeitos de glassmorphism e layout responsivo. |
| [`static/app.js`](file:///c:/Users/jpmas/Downloads/CP4%20python/static/app.js) | **Frontend** | Lógica da interface que consome a API de forma assíncrona (`fetch()` com `async/await`), atualizando a tela em tempo real sem recarregar a página. |
| [`game_center.db`](file:///c:/Users/jpmas/Downloads/CP4%20python/game_center.db) | **Persistência** | Arquivo físico do banco de dados relacional SQLite onde todas as informações ficam gravadas permanentemente. |
| [`test_api.py`](file:///c:/Users/jpmas/Downloads/CP4%20python/test_api.py) | **Testes** | Bateria de testes automatizados que valida todos os 8 fluxos de CRUD, integridade referencial e tratamento de erros da API. |
| [`requirements.txt`](file:///c:/Users/jpmas/Downloads/CP4%20python/requirements.txt) | **Dependências** | Lista de pacotes necessários para executar a aplicação (`fastapi`, `uvicorn`). |
| [`README.md`](file:///c:/Users/jpmas/Downloads/CP4%20python/README.md) | **Documentação** | Este guia completo explicando o funcionamento, arquitetura e execução do projeto. |

---

## ⚡ 4. Ciclo de Vida de uma Ação (O Percurso dos Dados)

Quando um usuário clica na interface para cadastrar um novo jogo, como o **GTA 6**:

```
[ 1. FRONTEND: index.html + app.js ]
   │  O usuário preenche os campos e clica em "Salvar Produto".
   │  O JavaScript coleta os dados e dispara:
   │  fetch('/produtos', { method: 'POST', body: JSON })
   ▼
[ 2. SERVIDOR: main.py ]
   │  O FastAPI na porta 8000 recebe a chamada e direciona para o roteador de produtos.
   ▼
[ 3. CONTROLLER: controllers/produto_controller.py ]
   │  A função @router.post("") recebe o payload JSON.
   │  Ela não toca no banco; ela aciona: produto_service.criar_produto(dados)
   ▼
[ 4. SERVICE: services/produto_service.py ]
   │  O Service realiza as validações de domínio:
   │  1. Nome é válido? (Sim)
   │  2. Preço >= 0? (Sim)
   │  3. A categoria escolhida existe no banco? (Sim, consulta e valida a chave estrangeira)
   │  Executa o comando SQL:
   │  INSERT INTO produtos (nome, preco, estoque, categoria_id...) VALUES (...)
   │  Persiste no arquivo game_center.db e retorna o produto recém-criado com seu novo ID.
   ▼
[ 5. RESPOSTA DO CONTROLLER ]
   │  O Controller devolve a resposta HTTP para a internet:
   │  Status: 201 Created com o JSON do produto.
   ▼
[ 6. ATUALIZAÇÃO NO FRONTEND: app.js ]
      O JavaScript recebe o Status 201:
      - Fecha o modal na tela;
      - Dispara uma notificação toast ("Produto cadastrado com sucesso!");
      - Atualiza dinamicamente a vitrine e a tabela sem precisar dar F5 na página.
```

---

## 🗄️ 5. Modelagem Relacional (1:N)

- **`categorias` (Entidade 1 - Pai):**
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `nome`: `TEXT NOT NULL UNIQUE` (ex.: *Consoles*, *Jogos PlayStation*, *Acessórios*)
  - `descricao`: `TEXT`

- **`produtos` (Entidade N - Filhos):**
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `nome`: `TEXT NOT NULL` (ex.: *PlayStation 5 Slim*, *GTA 6*, *Spider-Man 2*)
  - `descricao`: `TEXT`
  - `preco`: `REAL NOT NULL`
  - `estoque`: `INTEGER NOT NULL DEFAULT 0`
  - `imagem_url`: `TEXT`
  - `categoria_id`: `INTEGER NOT NULL`, Chave Estrangeira referenciando `categorias(id)` com `ON DELETE CASCADE`.

---

## 🚀 6. Como Executar o Projeto

### Pré-requisitos
- Python 3.10 ou superior instalado.

### 1. Instalar as dependências
```bash
pip install -r requirements.txt
```

### 2. Iniciar a aplicação
> [!IMPORTANT]
> A aplicação deve ser sempre iniciada a partir do arquivo **`main.py`** na raiz do projeto:
```bash
python main.py
```
*Ou via Uvicorn:*
```bash
uvicorn main:app --reload --port 8000
```

### 3. Acessar no Navegador
- **Loja Game Center Paulista (Frontend):** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Documentação Interativa Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Documentação Alternativa ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 4. Executar os Testes Automatizados
Para comprovar que todas as rotas e regras de negócio estão funcionando com 100% de integridade:
```bash
python test_api.py
```

---

## 📡 7. Resumo dos Endpoints da API

### Categorias
| Método | Rota | Descrição | Status Retornado |
| :--- | :--- | :--- | :--- |
| `GET` | `/categorias` | Lista todas as categorias e total de produtos | `200 OK` |
| `GET` | `/categorias/{id}` | Busca os detalhes de uma categoria por ID | `200 OK` / `404 Not Found` |
| `POST` | `/categorias` | Cria uma nova categoria | `201 Created` / `400 Bad Request` |
| `PUT` | `/categorias/{id}` | Atualiza nome ou descrição de uma categoria | `200 OK` / `404 Not Found` |
| `DELETE` | `/categorias/{id}` | Remove uma categoria e produtos associados | `200 OK` / `404 Not Found` |

### Produtos
| Método | Rota | Descrição | Status Retornado |
| :--- | :--- | :--- | :--- |
| `GET` | `/produtos` | Lista produtos (suporta filtro `?categoria_id=X`) | `200 OK` |
| `GET` | `/produtos/{id}` | Busca produto com nome da categoria vinculada | `200 OK` / `404 Not Found` |
| `POST` | `/produtos` | Cadastra novo produto vinculado a uma categoria | `201 Created` / `400 Bad Request` |
| `PUT` | `/produtos/{id}` | Atualiza dados cadastrais de um produto | `200 OK` / `404 Not Found` |
| `DELETE` | `/produtos/{id}` | Remove um produto do catálogo | `200 OK` / `404 Not Found` |
