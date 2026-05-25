/**
 * Nirserve - Sistema de Organização de Arquivos
 * Foco exclusivo no requisito de salvamento automático por pastas.
 */

// Armazenamento em memória (Simula o salvamento)
let repository = {
    arduino: [],
    lego: []
};

// Elementos do DOM
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const fileCategory = document.getElementById('file-category');
const arduinoFolder = document.getElementById('arduino-folder');
const legoFolder = document.getElementById('lego-folder');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

/**
 * Inicialização
 */
function init() {
    // Carregar dados salvos se existirem (LocalStorage)
    const savedData = localStorage.getItem('nirserve_simple_data');
    if (savedData) {
        repository = JSON.parse(savedData);
    }
    renderFolders();
}

/**
 * Renderiza o conteúdo das pastas designadas
 */
function renderFolders() {
    // Renderizar Pasta Arduino
    renderFolderContent(arduinoFolder, repository.arduino, 'blue');
    
    // Renderizar Pasta Lego
    renderFolderContent(legoFolder, repository.lego, 'emerald');
}

/**
 * Auxiliar para renderizar conteúdo de uma pasta específica
 */
function renderFolderContent(container, files, color) {
    if (files.length === 0) {
        container.innerHTML = '<p class="text-slate-600 italic text-sm py-4 text-center">Nenhum arquivo nesta pasta.</p>';
        return;
    }

    container.innerHTML = files.map(file => `
        <div class="bg-slate-700/50 p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-${color}-500/30 transition-all group">
            <div class="flex items-center gap-3">
                <i class="fas ${file.icon} text-${color}-400 text-lg"></i>
                <div>
                    <p class="text-sm font-semibold truncate max-w-[200px]" title="${file.name}">${file.name}</p>
                    <p class="text-[10px] text-slate-500">${file.date} • ${file.size}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="downloadFile('${file.id}')" class="text-slate-500 hover:text-white transition-colors" title="Baixar">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="deleteFile('${file.id}', '${file.category}')" class="text-slate-500 hover:text-red-400 transition-colors" title="Remover">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Lógica Principal: Upload e Salvamento por Pastas
 */
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const files = fileInput.files;
    const category = fileCategory.value;

    if (files.length === 0) {
        showToast("Selecione arquivos para salvar.", "error");
        return;
    }

    // Processar cada arquivo e salvar na pasta designada
    Array.from(files).forEach(file => {
        const fileData = {
            id: 'file_' + Date.now() + Math.random().toString(36).substr(2, 5),
            name: file.name,
            size: formatBytes(file.size),
            date: new Date().toLocaleDateString('pt-BR'),
            category: category,
            icon: getIconByExtension(file.name)
        };

        // Salvamento automático na respectiva pasta
        repository[category].push(fileData);
    });

    // Persistência e Atualização da UI
    saveAndRefresh();
    showToast(`${files.length} arquivo(s) salvos na pasta ${category.toUpperCase()}.`);
    uploadForm.reset();
});

/**
 * Utilitários
 */
function saveAndRefresh() {
    localStorage.setItem('nirserve_simple_data', JSON.stringify(repository));
    renderFolders();
}

function getIconByExtension(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['ino', 'cpp'].includes(ext)) return 'fa-microchip';
    if (['stl', 'obj'].includes(ext)) return 'fa-cube';
    if (['ev3', 'spike', 'py'].includes(ext)) return 'fa-robot';
    return 'fa-file-code';
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `fixed bottom-8 right-8 text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3 z-50 ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`;
    toast.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3000);
}

window.deleteFile = function(id, category) {
    repository[category] = repository[category].filter(f => f.id !== id);
    saveAndRefresh();
    showToast("Arquivo removido da pasta.", "info");
};

window.downloadFile = function(id) {
    // Simulação de download para validação de integridade
    showToast("Validando integridade e iniciando download...", "success");
};

// Iniciar
init();
