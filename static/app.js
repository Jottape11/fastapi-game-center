
// Estado local da aplicação
let categorias = [];
let produtos = [];

// Elementos do DOM
const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
const tabContents = document.querySelectorAll('.tab-content');

const vitrineGrid = document.getElementById('vitrine-grid');
const filtroCategoriaVitrine = document.getElementById('filtro-categoria-vitrine');
const tabelaProdutosBody = document.getElementById('tabela-produtos-body');
const tabelaCategoriasBody = document.getElementById('tabela-categorias-body');

// Modais
const modalProduto = document.getElementById('modal-produto');
const formProduto = document.getElementById('form-produto');
const modalProdutoTitulo = document.getElementById('modal-produto-titulo');
const btnAbrirModalProduto = document.getElementById('btn-abrir-modal-produto');
const btnFecharModalProduto = document.getElementById('btn-fechar-modal-produto');
const btnCancelarModalProduto = document.getElementById('btn-cancelar-modal-produto');
const prodCategoriaSelect = document.getElementById('prod-categoria');

const modalCategoria = document.getElementById('modal-categoria');
const formCategoria = document.getElementById('form-categoria');
const modalCategoriaTitulo = document.getElementById('modal-categoria-titulo');
const btnAbrirModalCategoria = document.getElementById('btn-abrir-modal-categoria');
const btnFecharModalCategoria = document.getElementById('btn-fechar-modal-categoria');
const btnCancelarModalCategoria = document.getElementById('btn-cancelar-modal-categoria');

const toastContainer = document.getElementById('toast-container');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  configurarNavegacao();
  configurarModais();
  configurarFiltros();
  carregarTudo();
});

// Sistema de Notificações Toast
function showToast(mensagem, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `
    <span>${mensagem}</span>
    <span style="cursor:pointer; margin-left:12px; font-weight:bold;">&times;</span>
  `;
  toastContainer.appendChild(toast);

  toast.addEventListener('click', () => toast.remove());
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4000);
}

// Navegação entre Abas
function configurarNavegacao() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });
}

// Configuração de Modais
function configurarModais() {
  // Modal Produto
  btnAbrirModalProduto.addEventListener('click', () => abrirModalProduto());
  btnFecharModalProduto.addEventListener('click', () => fecharModalProduto());
  btnCancelarModalProduto.addEventListener('click', () => fecharModalProduto());
  formProduto.addEventListener('submit', salvarProduto);

  // Modal Categoria
  btnAbrirModalCategoria.addEventListener('click', () => abrirModalCategoria());
  btnFecharModalCategoria.addEventListener('click', () => fecharModalCategoria());
  btnCancelarModalCategoria.addEventListener('click', () => fecharModalCategoria());
  formCategoria.addEventListener('submit', salvarCategoria);

  // Fechar ao clicar no backdrop
  window.addEventListener('click', (e) => {
    if (e.target === modalProduto) fecharModalProduto();
    if (e.target === modalCategoria) fecharModalCategoria();
  });
}

// Configuração de Filtros
function configurarFiltros() {
  filtroCategoriaVitrine.addEventListener('change', () => {
    const catId = filtroCategoriaVitrine.value;
    carregarProdutos(catId ? parseInt(catId) : null);
  });
}

// Carregamento de Dados Iniciais
async function carregarTudo() {
  await carregarCategorias();
  await carregarProdutos();
}

// API: Categorias
async function carregarCategorias() {
  try {
    const resposta = await fetch('/categorias');
    if (!resposta.ok) throw new Error('Erro ao carregar categorias.');
    categorias = await resposta.json();

    renderizarSelectsCategorias();
    renderizarTabelaCategorias();
  } catch (erro) {
    showToast(erro.message, 'error');
  }
}

function renderizarSelectsCategorias() {
  // Select do filtro da vitrine
  const valorAtualFiltro = filtroCategoriaVitrine.value;
  filtroCategoriaVitrine.innerHTML = '<option value="">Todas as Categorias</option>';

  // Select do modal de produto
  prodCategoriaSelect.innerHTML = '<option value="">Selecione uma categoria...</option>';

  categorias.forEach(cat => {
    // Filtro Vitrine
    const optFiltro = document.createElement('option');
    optFiltro.value = cat.id;
    optFiltro.textContent = cat.nome;
    if (String(cat.id) === valorAtualFiltro) optFiltro.selected = true;
    filtroCategoriaVitrine.appendChild(optFiltro);

    // Modal Produto
    const optModal = document.createElement('option');
    optModal.value = cat.id;
    optModal.textContent = cat.nome;
    prodCategoriaSelect.appendChild(optModal);
  });
}

function renderizarTabelaCategorias() {
  tabelaCategoriasBody.innerHTML = '';
  if (categorias.length === 0) {
    tabelaCategoriasBody.innerHTML = `
      <tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Nenhuma categoria cadastrada.</td></tr>
    `;
    return;
  }

  categorias.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${cat.id}</td>
      <td><strong>${escapeHtml(cat.nome)}</strong></td>
      <td style="color: var(--text-muted); font-size: 0.9rem;">${escapeHtml(cat.descricao || 'Sem descrição')}</td>
      <td><span class="badge-tag">${cat.total_produtos || 0} produto(s)</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-edit" onclick="editarCategoria(${cat.id})">✏️ Editar</button>
          <button class="btn btn-sm btn-delete" onclick="excluirCategoria(${cat.id})">🗑️ Excluir</button>
        </div>
      </td>
    `;
    tabelaCategoriasBody.appendChild(tr);
  });
}

function abrirModalCategoria(cat = null) {
  if (cat) {
    modalCategoriaTitulo.textContent = 'Editar Categoria';
    document.getElementById('cat-id').value = cat.id;
    document.getElementById('cat-nome').value = cat.nome;
    document.getElementById('cat-descricao').value = cat.descricao || '';
  } else {
    modalCategoriaTitulo.textContent = 'Cadastrar Nova Categoria';
    formCategoria.reset();
    document.getElementById('cat-id').value = '';
  }
  modalCategoria.classList.add('active');
}

function fecharModalCategoria() {
  modalCategoria.classList.remove('active');
  formCategoria.reset();
}

async function editarCategoria(id) {
  const cat = categorias.find(c => c.id === id);
  if (cat) abrirModalCategoria(cat);
}

async function salvarCategoria(e) {
  e.preventDefault();
  const id = document.getElementById('cat-id').value;
  const payload = {
    nome: document.getElementById('cat-nome').value,
    descricao: document.getElementById('cat-descricao').value
  };

  const url = id ? `/categorias/${id}` : '/categorias';
  const method = id ? 'PUT' : 'POST';

  try {
    const resposta = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.detail || 'Erro ao salvar categoria.');

    showToast(id ? 'Categoria atualizada com sucesso!' : 'Categoria cadastrada com sucesso!');
    fecharModalCategoria();
    await carregarCategorias();
    await carregarProdutos();
  } catch (erro) {
    showToast(erro.message, 'error');
  }
}

async function excluirCategoria(id) {
  const cat = categorias.find(c => c.id === id);
  const confirmacao = confirm(`Tem certeza que deseja excluir a categoria "${cat?.nome}"?\nATENÇÃO: Todos os produtos vinculados a ela também serão removidos!`);
  if (!confirmacao) return;

  try {
    const resposta = await fetch(`/categorias/${id}`, { method: 'DELETE' });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.detail || 'Erro ao excluir categoria.');

    showToast('Categoria removida com sucesso!');
    await carregarCategorias();
    await carregarProdutos();
  } catch (erro) {
    showToast(erro.message, 'error');
  }
}

// API: Produtos
async function carregarProdutos(categoriaId = null) {
  try {
    let url = '/produtos';
    if (categoriaId) url += `?categoria_id=${categoriaId}`;

    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error('Erro ao carregar produtos.');
    produtos = await resposta.json();

    renderizarVitrine();
    renderizarTabelaProdutos();
  } catch (erro) {
    showToast(erro.message, 'error');
  }
}

function renderizarVitrine() {
  vitrineGrid.innerHTML = '';
  if (produtos.length === 0) {
    vitrineGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p style="font-size: 1.2rem;">🎮 Nenhum item encontrado nesta categoria.</p>
      </div>
    `;
    return;
  }

  produtos.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const estoqueStatus = prod.estoque > 5
      ? `<span class="stock-badge stock-in">✓ ${prod.estoque} em estoque</span>`
      : `<span class="stock-badge stock-low">⚠️ Apenas ${prod.estoque} restantes</span>`;

    card.innerHTML = `
      <div class="card-image-wrap">
        <span class="category-tag">${escapeHtml(prod.categoria_nome)}</span>
        <img src="${escapeHtml(prod.imagem_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80')}" alt="${escapeHtml(prod.nome)}" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'">
      </div>
      <div class="card-body">
        <h4 class="card-title">${escapeHtml(prod.nome)}</h4>
        <p class="card-desc">${escapeHtml(prod.descricao || 'Produto de alta performance oficial Game Center Paulista.')}</p>
        <div class="card-footer">
          <div class="price-box">
            <span class="price-label">Preço à vista</span>
            <span class="price-value">R$ ${prod.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ${estoqueStatus}
        </div>
      </div>
    `;
    vitrineGrid.appendChild(card);
  });
}

function renderizarTabelaProdutos() {
  tabelaProdutosBody.innerHTML = '';
  if (produtos.length === 0) {
    tabelaProdutosBody.innerHTML = `
      <tr><td colspan="7" style="text-align:center; color: var(--text-muted);">Nenhum produto cadastrado no momento.</td></tr>
    `;
    return;
  }

  produtos.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${prod.id}</td>
      <td>
        <img class="table-img" src="${escapeHtml(prod.imagem_url || '')}" alt="${escapeHtml(prod.nome)}" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'">
      </td>
      <td>
        <strong>${escapeHtml(prod.nome)}</strong>
        <div style="font-size: 0.8rem; color: var(--text-subtle); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(prod.descricao || '')}
        </div>
      </td>
      <td><span class="badge-tag">${escapeHtml(prod.categoria_nome)}</span></td>
      <td><strong style="color: var(--accent-emerald);">R$ ${prod.preco.toFixed(2)}</strong></td>
      <td>${prod.estoque} un.</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-edit" onclick="editarProduto(${prod.id})">✏️ Editar</button>
          <button class="btn btn-sm btn-delete" onclick="excluirProduto(${prod.id})">🗑️ Excluir</button>
        </div>
      </td>
    `;
    tabelaProdutosBody.appendChild(tr);
  });
}

function abrirModalProduto(prod = null) {
  if (categorias.length === 0) {
    showToast('Cadastre pelo menos uma categoria antes de adicionar um produto!', 'error');
    return;
  }

  if (prod) {
    modalProdutoTitulo.textContent = 'Editar Produto';
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-nome').value = prod.nome;
    document.getElementById('prod-categoria').value = prod.categoria_id;
    document.getElementById('prod-preco').value = prod.preco;
    document.getElementById('prod-estoque').value = prod.estoque;
    document.getElementById('prod-imagem').value = prod.imagem_url || '';
    document.getElementById('prod-descricao').value = prod.descricao || '';
  } else {
    modalProdutoTitulo.textContent = 'Cadastrar Novo Produto';
    formProduto.reset();
    document.getElementById('prod-id').value = '';
  }
  modalProduto.classList.add('active');
}

function fecharModalProduto() {
  modalProduto.classList.remove('active');
  formProduto.reset();
}

async function editarProduto(id) {
  const prod = produtos.find(p => p.id === id);
  if (prod) abrirModalProduto(prod);
}

async function salvarProduto(e) {
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const payload = {
    nome: document.getElementById('prod-nome').value,
    categoria_id: parseInt(document.getElementById('prod-categoria').value),
    preco: parseFloat(document.getElementById('prod-preco').value),
    estoque: parseInt(document.getElementById('prod-estoque').value),
    imagem_url: document.getElementById('prod-imagem').value,
    descricao: document.getElementById('prod-descricao').value
  };

  const url = id ? `/produtos/${id}` : '/produtos';
  const method = id ? 'PUT' : 'POST';

  try {
    const resposta = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.detail || 'Erro ao salvar produto.');

    showToast(id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
    fecharModalProduto();
    await carregarProdutos();
    await carregarCategorias();
  } catch (erro) {
    showToast(erro.message, 'error');
  }
}

async function excluirProduto(id) {
  const prod = produtos.find(p => p.id === id);
  const confirmacao = confirm(`Deseja realmente remover o produto "${prod?.nome}"?`);
  if (!confirmacao) return;

  try {
    const resposta = await fetch(`/produtos/${id}`, { method: 'DELETE' });
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.detail || 'Erro ao excluir produto.');

    showToast('Produto excluído com sucesso!');
    await carregarProdutos();
    await carregarCategorias();
  } catch (erro) {
    showToast(erro.message, 'error');
  }
}

// Utilitário de escape para segurança contra XSS
function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Expor funções globais para botões inline
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.editarCategoria = editarCategoria;
window.excluirCategoria = excluirCategoria;
