let categorias = [];
let produtos = [];
let categoriaAtiva = null;
let termoBusca = '';
let ordenacaoAtiva = 'relevancia';

// Ícones SVG no padrão Reicon
const ICONS = {
  cart: `<svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  edit: `<svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  trash: `<svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
  check: `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  alert: `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
};

// Elementos
const navButtons = document.querySelectorAll('.nav-btn[data-tab]');
const tabPanes = document.querySelectorAll('.tab-pane');

const vitrineGrid = document.getElementById('vitrine-grid');
const categoryChipsList = document.getElementById('category-chips-list');
const contadorProdutos = document.getElementById('contador-produtos');
const inputBusca = document.getElementById('input-busca');
const btnLimparBusca = document.getElementById('btn-limpar-busca');
const selectOrdenacao = document.getElementById('ordenar-produtos');

const tabelaProdutosBody = document.getElementById('tabela-produtos-body');
const tabelaCategoriasBody = document.getElementById('tabela-categorias-body');

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
  setupNavigation();
  setupModals();
  setupSearchAndFilter();
  carregarDadosIniciais();
});

// Toast Notifications
function showToast(mensagem, tipo = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-msg ${tipo}`;
  const icone = tipo === 'success' ? ICONS.check : ICONS.alert;
  toast.innerHTML = `
    ${icone}
    <span style="flex:1;">${escapeHtml(mensagem)}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

// Navegação entre abas
function setupNavigation() {
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      navButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });
}

// Configuração de Modais
function setupModals() {
  btnAbrirModalProduto.addEventListener('click', () => abrirModalProduto());
  btnFecharModalProduto.addEventListener('click', () => fecharModalProduto());
  btnCancelarModalProduto.addEventListener('click', () => fecharModalProduto());
  formProduto.addEventListener('submit', salvarProduto);

  btnAbrirModalCategoria.addEventListener('click', () => abrirModalCategoria());
  btnFecharModalCategoria.addEventListener('click', () => fecharModalCategoria());
  btnCancelarModalCategoria.addEventListener('click', () => fecharModalCategoria());
  formCategoria.addEventListener('submit', salvarCategoria);

  window.addEventListener('click', (e) => {
    if (e.target === modalProduto) fecharModalProduto();
    if (e.target === modalCategoria) fecharModalCategoria();
  });
}

// Busca e Ordenação
function setupSearchAndFilter() {
  inputBusca.addEventListener('input', () => {
    termoBusca = inputBusca.value.trim().toLowerCase();
    btnLimparBusca.classList.toggle('hidden', termoBusca.length === 0);
    renderizarVitrine();
  });

  btnLimparBusca.addEventListener('click', () => {
    inputBusca.value = '';
    termoBusca = '';
    btnLimparBusca.classList.add('hidden');
    renderizarVitrine();
    inputBusca.focus();
  });

  selectOrdenacao.addEventListener('change', () => {
    ordenacaoAtiva = selectOrdenacao.value;
    renderizarVitrine();
  });
}

// Carga Inicial
async function carregarDadosIniciais() {
  await carregarCategorias();
  await carregarProdutos();
}

// API: Categorias
async function carregarCategorias() {
  try {
    const res = await fetch('/categorias');
    if (!res.ok) throw new Error('Falha ao carregar categorias.');
    categorias = await res.json();

    renderCategoryChips();
    renderizarSelectCategoriasModal();
    renderizarTabelaCategorias();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderCategoryChips() {
  categoryChipsList.innerHTML = '';

  const btnTodos = document.createElement('button');
  btnTodos.className = `chip ${categoriaAtiva === null ? 'active' : ''}`;
  btnTodos.textContent = 'Todos os Produtos';
  btnTodos.addEventListener('click', () => {
    categoriaAtiva = null;
    updateActiveChip();
    carregarProdutos();
  });
  categoryChipsList.appendChild(btnTodos);

  categorias.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = `chip ${categoriaAtiva === cat.id ? 'active' : ''}`;
    chip.textContent = cat.nome;
    chip.addEventListener('click', () => {
      categoriaAtiva = cat.id;
      updateActiveChip();
      carregarProdutos(cat.id);
    });
    categoryChipsList.appendChild(chip);
  });
}

function updateActiveChip() {
  const chips = categoryChipsList.querySelectorAll('.chip');
  chips.forEach((chip, index) => {
    if (index === 0 && categoriaAtiva === null) {
      chip.classList.add('active');
    } else if (index > 0 && categorias[index - 1]?.id === categoriaAtiva) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function renderizarSelectCategoriasModal() {
  prodCategoriaSelect.innerHTML = '<option value="">Selecione uma categoria...</option>';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.nome;
    prodCategoriaSelect.appendChild(opt);
  });
}

function renderizarTabelaCategorias() {
  tabelaCategoriasBody.innerHTML = '';
  if (categorias.length === 0) {
    tabelaCategoriasBody.innerHTML = `
      <tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 2rem;">Nenhuma categoria registrada.</td></tr>
    `;
    return;
  }

  categorias.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${cat.id}</td>
      <td><strong style="color:#ffffff;">${escapeHtml(cat.nome)}</strong></td>
      <td style="color: var(--text-muted); font-size: 0.84rem;">${escapeHtml(cat.descricao || 'Sem descrição')}</td>
      <td><span style="font-weight:600; color: #93c5fd;">${cat.total_produtos || 0} produto(s)</span></td>
      <td>
        <div class="cell-actions">
          <button class="btn-icon" title="Editar" onclick="editarCategoria(${cat.id})">${ICONS.edit}</button>
          <button class="btn-icon btn-icon-danger" title="Excluir" onclick="excluirCategoria(${cat.id})">${ICONS.trash}</button>
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
    modalCategoriaTitulo.textContent = 'Adicionar Categoria';
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
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erro ao salvar categoria.');

    showToast(id ? 'Categoria atualizada.' : 'Categoria cadastrada com sucesso.');
    fecharModalCategoria();
    await carregarCategorias();
    await carregarProdutos(categoriaAtiva);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function excluirCategoria(id) {
  const cat = categorias.find(c => c.id === id);
  const ok = confirm(`Deseja remover a categoria "${cat?.nome}"?\nTodos os produtos vinculados a ela serão excluídos.`);
  if (!ok) return;

  try {
    const res = await fetch(`/categorias/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erro ao excluir categoria.');

    showToast('Categoria removida.');
    if (categoriaAtiva === id) categoriaAtiva = null;
    await carregarCategorias();
    await carregarProdutos();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// API: Produtos
async function carregarProdutos(catId = null) {
  try {
    let url = '/produtos';
    if (catId) url += `?categoria_id=${catId}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar produtos.');
    produtos = await res.json();

    renderizarVitrine();
    renderizarTabelaProdutos();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderizarVitrine() {
  let lista = [...produtos];

  // Filtro de busca textual
  if (termoBusca) {
    lista = lista.filter(p =>
      p.nome.toLowerCase().includes(termoBusca) ||
      (p.descricao && p.descricao.toLowerCase().includes(termoBusca)) ||
      (p.categoria_nome && p.categoria_nome.toLowerCase().includes(termoBusca))
    );
  }

  // Ordenação
  if (ordenacaoAtiva === 'preco-crescente') {
    lista.sort((a, b) => a.preco - b.preco);
  } else if (ordenacaoAtiva === 'preco-decrescente') {
    lista.sort((a, b) => b.preco - a.preco);
  } else if (ordenacaoAtiva === 'nome') {
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  contadorProdutos.textContent = `Exibindo ${lista.length} produto(s)`;

  vitrineGrid.innerHTML = '';
  if (lista.length === 0) {
    vitrineGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1rem; font-weight: 500;">Nenhum produto encontrado para os critérios selecionados.</p>
      </div>
    `;
    return;
  }

  lista.forEach(prod => {
    const card = document.createElement('article');
    card.className = 'product-item';

    const estoqueIn = prod.estoque > 5;
    const parcelas = (prod.preco / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const precoFormatado = prod.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    card.innerHTML = `
      <div class="product-media">
        <span class="product-category-tag">${escapeHtml(prod.categoria_nome)}</span>
        <img src="${escapeHtml(prod.imagem_url || '')}" alt="${escapeHtml(prod.nome)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'">
      </div>
      <div class="product-details">
        <h3 class="product-name">${escapeHtml(prod.nome)}</h3>
        <p class="product-description">${escapeHtml(prod.descricao || 'Produto original com garantia de fábrica.')}</p>
        
        <div class="product-pricing">
          <div class="price-main">R$ ${precoFormatado}</div>
          <div class="price-installment">ou em até 10x de R$ ${parcelas} sem juros</div>
        </div>

        <div class="product-action-row">
          <div class="stock-indicator">
            <span class="stock-dot ${estoqueIn ? 'in' : 'low'}"></span>
            <span style="color: ${estoqueIn ? 'var(--text-muted)' : 'var(--warning)'}; font-size: 0.74rem;">
              ${estoqueIn ? `${prod.estoque} unidades` : `Apenas ${prod.estoque} restantes`}
            </span>
          </div>
          <button class="btn-buy" onclick="adicionarAoCarrinho('${escapeHtml(prod.nome)}')">
            ${ICONS.cart}
            <span>Comprar</span>
          </button>
        </div>
      </div>
    `;
    vitrineGrid.appendChild(card);
  });
}

function adicionarAoCarrinho(nome) {
  showToast(`Item adicionado: ${nome}`);
}

function renderizarTabelaProdutos() {
  tabelaProdutosBody.innerHTML = '';
  if (produtos.length === 0) {
    tabelaProdutosBody.innerHTML = `
      <tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 2rem;">Nenhum produto cadastrado.</td></tr>
    `;
    return;
  }

  produtos.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${prod.id}</td>
      <td>
        <img class="table-thumb" src="${escapeHtml(prod.imagem_url || '')}" alt="${escapeHtml(prod.nome)}" onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'">
      </td>
      <td>
        <strong style="color: #ffffff;">${escapeHtml(prod.nome)}</strong>
        <div style="font-size: 0.76rem; color: var(--text-subtle); max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(prod.descricao || '')}
        </div>
      </td>
      <td><span style="color: var(--text-muted);">${escapeHtml(prod.categoria_nome)}</span></td>
      <td><strong style="color: #ffffff;">R$ ${prod.preco.toFixed(2)}</strong></td>
      <td>${prod.estoque} un.</td>
      <td>
        <div class="cell-actions">
          <button class="btn-icon" title="Editar" onclick="editarProduto(${prod.id})">${ICONS.edit}</button>
          <button class="btn-icon btn-icon-danger" title="Excluir" onclick="excluirProduto(${prod.id})">${ICONS.trash}</button>
        </div>
      </td>
    `;
    tabelaProdutosBody.appendChild(tr);
  });
}

function abrirModalProduto(prod = null) {
  if (categorias.length === 0) {
    showToast('Cadastre ao menos uma categoria antes de criar um produto.', 'error');
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
    modalProdutoTitulo.textContent = 'Adicionar Produto';
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
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erro ao salvar produto.');

    showToast(id ? 'Produto atualizado com sucesso.' : 'Produto cadastrado.');
    fecharModalProduto();
    await carregarProdutos(categoriaAtiva);
    await carregarCategorias();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function excluirProduto(id) {
  const prod = produtos.find(p => p.id === id);
  const ok = confirm(`Deseja remover o produto "${prod?.nome}"?`);
  if (!ok) return;

  try {
    const res = await fetch(`/produtos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erro ao excluir produto.');

    showToast('Produto removido.');
    await carregarProdutos(categoriaAtiva);
    await carregarCategorias();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.editarCategoria = editarCategoria;
window.excluirCategoria = excluirCategoria;
window.adicionarAoCarrinho = adicionarAoCarrinho;
