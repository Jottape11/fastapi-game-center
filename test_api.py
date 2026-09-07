"""
Script de testes automatizados da API Game Center Paulista.
Valida todas as operações de CRUD, integridade referencial e códigos HTTP.
"""

from fastapi.testclient import TestClient
from main import app
import sys

client = TestClient(app)

def testar_tudo():
    print("Iniciando testes automatizados da API Game Center Paulista...\n")

    # 1. Teste de Categorias: Listar
    print("[1/8] Testando GET /categorias...")
    resp = client.get("/categorias")
    assert resp.status_code == 200, f"Erro status: {resp.status_code}"
    categorias = resp.json()
    assert len(categorias) > 0, "Deveria haver categorias iniciais"
    print(f" -> OK: {len(categorias)} categorias encontradas.")

    # 2. Teste de Categorias: Criar nova
    print("[2/8] Testando POST /categorias...")
    payload_cat = {"nome": "Realidade Virtual (VR)", "descricao": "Óculos VR e acessórios imersivos"}
    resp = client.post("/categorias", json=payload_cat)
    assert resp.status_code == 201, f"Erro status: {resp.status_code}, {resp.text}"
    cat_criada = resp.json()
    cat_id = cat_criada["id"]
    print(f" -> OK: Categoria criada #{cat_id} - '{cat_criada['nome']}'.")

    # 3. Teste de Categorias: Tentativa de duplicação
    print("[3/8] Testando validação de nome duplicado em POST /categorias...")
    resp = client.post("/categorias", json=payload_cat)
    assert resp.status_code == 400, "Deveria retornar 400 para nome duplicado"
    print(" -> OK: Rejeitou duplicidade corretamente com status 400.")

    # 4. Teste de Produtos: Criar vinculado à nova categoria
    print("[4/8] Testando POST /produtos com categoria válida...")
    payload_prod = {
        "nome": "PlayStation VR2 Horizon Bundle",
        "descricao": "Headset de RV de última geração para PS5",
        "preco": 4299.90,
        "estoque": 8,
        "imagem_url": "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
        "categoria_id": cat_id
    }
    resp = client.post("/produtos", json=payload_prod)
    assert resp.status_code == 201, f"Erro status: {resp.status_code}, {resp.text}"
    prod_criado = resp.json()
    prod_id = prod_criado["id"]
    print(f" -> OK: Produto criado #{prod_id} vinculado à categoria #{cat_id}.")

    # 5. Teste de Integridade: Tentar criar produto com categoria inexistente
    print("[5/8] Testando integridade referencial: POST /produtos com categoria inexistente...")
    payload_invalido = {
        "nome": "Item Fantasma",
        "preco": 100.0,
        "estoque": 1,
        "categoria_id": 999999
    }
    resp = client.post("/produtos", json=payload_invalido)
    assert resp.status_code == 400, "Deveria retornar 400 para categoria inexistente"
    print(" -> OK: Rejeitou chave estrangeira inválida corretamente.")

    # 6. Teste de Produtos: Atualizar
    print("[6/8] Testando PUT /produtos/{id}...")
    payload_update = {
        "nome": "PlayStation VR2 Horizon Bundle - Edição Limitada",
        "preco": 3999.90,
        "estoque": 12,
        "categoria_id": cat_id,
        "descricao": "Atualizado com desconto especial",
        "imagem_url": prod_criado["imagem_url"]
    }
    resp = client.put(f"/produtos/{prod_id}", json=payload_update)
    assert resp.status_code == 200, f"Erro status: {resp.status_code}"
    prod_atualizado = resp.json()
    assert prod_atualizado["preco"] == 3999.90
    print(f" -> OK: Produto #{prod_id} atualizado com sucesso.")

    # 7. Teste de Produtos: Listar com filtro
    print("[7/8] Testando GET /produtos com filtro por categoria...")
    resp = client.get(f"/produtos?categoria_id={cat_id}")
    assert resp.status_code == 200
    prods_filtrados = resp.json()
    assert len(prods_filtrados) == 1
    assert prods_filtrados[0]["id"] == prod_id
    print(f" -> OK: Filtro retornou exatamente o produto da categoria #{cat_id}.")

    # 8. Teste de Exclusão (DELETE)
    print("[8/8] Testando DELETE /produtos/{id} e DELETE /categorias/{id}...")
    resp = client.delete(f"/produtos/{prod_id}")
    assert resp.status_code == 200
    resp_check = client.get(f"/produtos/{prod_id}")
    assert resp_check.status_code == 404
    
    resp_cat = client.delete(f"/categorias/{cat_id}")
    assert resp_cat.status_code == 200
    resp_cat_check = client.get(f"/categorias/{cat_id}")
    assert resp_cat_check.status_code == 404
    print(" -> OK: Exclusões de produto e categoria validadas (retornando 404 após remoção).")

    print("\nTODOS OS TESTES PASSARAM COM SUCESSO!")

if __name__ == "__main__":
    testar_tudo()
