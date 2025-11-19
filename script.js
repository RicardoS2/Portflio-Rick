// script.js - CÓDIGO FINAL OTIMIZADO COM NOVO SWITCH

// --- CONFIGS E CERTIFICADOS ---
const certificationsData = [
    {
        name: 'Minicurso IBRACON',
        desc: 'Acústica para Edificações.',
        icon: '📢',
        url: 'https://drive.google.com/file/d/1vbiq5g9ZUw-JuSTuEGlE3f0TvuVOIiVR/view',
    },
    {
        name: '30º Enc. Regional',
        desc: 'Participação no evento IBRACON.',
        icon: '🏗️',
        url: 'https://drive.google.com/file/d/1ACNZXM9jnqW6S-l6szdAu6IVjmknPNLK/view',
    },
    {
        name: 'Nivelamento ITEC',
        desc: 'Participação nas atividades do ITEC.',
        icon: '✨',
        url: 'https://drive.google.com/file/d/1vbiq5g9ZUw-JuSTuEGlE3f0TvuVOIiVR/view',
    },
    {
        name: 'Monitor Voluntário',
        desc: 'Material didático de Prog. Estruturada.',
        icon: '💻',
        url: 'https://drive.google.com/file/d/1AuPSkAZOnhvmTb8xzPnyAbPblpHT-rwS/view',
    },
    {
        name: 'Cisco Networking',
        desc: 'Certificação Linux Essentials.',
        icon: '🌐',
        url: 'https://drive.google.com/file/d/1z0Y5PzL38BX5ZVMz5gTRb15GNhp1HE42/view?usp=sharing',
    },
    {
        name: '14ª SITEC - Org',
        desc: 'Comissão Organizadora SITEC.',
        icon: '🛡️',
        url: 'https://drive.google.com/file/d/127vefTmeRX5yg-ezy3BcCNbcCNbcNpxEuMZN/view?usp=sharing',
    },
];

// --- SELETORES ---
const root = document.documentElement;
const certContainer = document.getElementById('secao-certificados');
const projContainer = document.getElementById('secao-projetos');

// --- THEME SWITCHER (ATUALIZADO PARA O NOVO SWITCH) ---
const themeInput = document.getElementById('input');

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Sincroniza o estado do novo input
    if (themeInput) {
        themeInput.checked = theme === 'dark';
    }
}

window.toggleTheme = function () {
    const current = root.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
};

// Inicializa o tema ao carregar
const initialTheme = localStorage.getItem('theme') || 'dark';
setTheme(initialTheme);
// Força a sincronização inicial do checkbox (caso o localStorage esteja vazio)
if (themeInput) {
    themeInput.checked = initialTheme === 'dark';
}

// --- CERTIFICADOS ---
function renderCertificates() {
    if (!certContainer) return;
    const tmpl = document.getElementById('modelo-certificado');
    certContainer.innerHTML = '';
    certificationsData.forEach((cert, index) => {
        const clone = tmpl.content.cloneNode(true);
        const card = clone.querySelector('.card');
        // animação em cascata via delay CSS custom property
        card.style.setProperty('--delay', `${0.2 + index * 0.1}s`);
        clone.querySelector('.icone-recurso').textContent = cert.icon;
        clone.querySelector('.nome-certificado').textContent = cert.name;
        clone.querySelector('.desc-certificado').textContent = cert.desc;
        card.addEventListener('click', () => window.open(cert.url, '_blank'));
        certContainer.appendChild(clone);
    });
}

// --- FETCH GITHUB PROJECTS (usa cache) ---
async function fetchGitHubProjects() {
    const CACHE_KEY = 'github_repos_cache_v3';
    const EXP = 60 * 60 * 1000;
    const api = '/api/projetos';

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < EXP) return parsed.data;
        } catch (e) {
            /* ignore parse errors */
        }
    }

    try {
        const API_ENDPOINT = `${window.location.origin}${api}`;
        const res = await fetch(API_ENDPOINT);
        if (!res.ok) throw new Error('Erro ao consultar API');
        const data = await res.json();
        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data }),
        );
        return data;
    } catch (err) {
        console.error('API Error:', err);
        if (cached) {
            try {
                return JSON.parse(cached).data;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
}

// --- BUSCA IMAGEM README (tenta extrair primeira imagem) ---
async function fetchReadmeImage(owner, repo) {
    const CACHE_KEY = `readme_img_${repo}`;
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return cached === 'null' ? null : cached;

    try {
        const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/readme`,
        );
        if (!res.ok) {
            sessionStorage.setItem(CACHE_KEY, 'null');
            return null;
        }
        const data = await res.json();
        const content = atob(data.content || '');
        const match =
            content.match(/!\[.*?\]\((.*?)\)/) ||
            content.match(/<img[^>]+src=["']([^"']+)["']/);
        let url = match ? match[1] : null;
        if (url && !url.startsWith('http')) {
            url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${url.replace(
                /^\.\//,
                '',
            )}`;
        }
        sessionStorage.setItem(CACHE_KEY, url || 'null');
        return url;
    } catch {
        sessionStorage.setItem(CACHE_KEY, 'null');
        return null;
    }
}

// --- EXPANDIR DESCRIÇÃO ---
function toggleProjectDescription(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const description = button.previousElementSibling;
    const card = button.closest('.card');

    if (description.classList.contains('expanded')) {
        description.classList.remove('expanded');
        card.classList.remove('expanded');
        button.textContent = 'Ver Mais';
    } else {
        description.classList.add('expanded');
        card.classList.add('expanded');
        button.textContent = 'Ver Menos';
    }
}

// --- RENDER PROJETOS (sem inline CSS no HTML) ---
async function renderProjects() {
    if (!projContainer) return;
    projContainer.innerHTML = '';
    const loading = document.createElement('p');
    loading.className = 'placeholder';
    loading.textContent = 'Carregando...';
    projContainer.appendChild(loading);

    const repos = await fetchGitHubProjects();

    if (!repos || repos.length === 0) {
        projContainer.innerHTML = '';
        const errCard = document.createElement('div');
        errCard.className = 'card';
        const p = document.createElement('p');
        p.textContent =
            '⚠ Não foi possível carregar projetos ou nenhum projeto encontrado com descrição.';
        errCard.appendChild(p);
        projContainer.appendChild(errCard);
        return;
    }

    const sorted = repos
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10);
    projContainer.innerHTML = '';
    const tmpl = document.getElementById('modelo-projeto');

    // medidor de altura (temporário, invisível)
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText =
        'visibility:hidden;position:absolute;box-sizing:border-box;width:216px;line-height:1.4;font-size:0.9rem;';
    document.body.appendChild(tempDiv);
    const HEIGHT_LIMIT_PX = 60;

    for (const [index, repo] of sorted.entries()) {
        const clone = tmpl.content.cloneNode(true);
        const card = clone.querySelector('.card');
        const descriptionElement = clone.querySelector('.desc-projeto');
        const expandButton = clone.querySelector('.btn-expandir-desc');

        // delay por cascata (usado apenas para timing via style property)
        card.style.setProperty('--delay', `${0.1 + index * 0.1}s`);

        clone.querySelector('.nome-projeto').textContent =
            repo.name || 'Sem nome';
        descriptionElement.textContent = repo.description || 'Sem descrição.';
        clone.querySelector('.linguagem-projeto').textContent =
            repo.language || '';
        clone.querySelector('.estrelas-projeto').textContent =
            repo.stars > 0 ? `★ ${repo.stars}` : '';

        tempDiv.textContent = repo.description || '';
        const fullHeight = tempDiv.offsetHeight;
        if (fullHeight > HEIGHT_LIMIT_PX) {
            expandButton.style.display = 'block';
            expandButton.textContent = 'Ver Mais';
            expandButton.addEventListener('click', toggleProjectDescription);
            descriptionElement.classList.remove('expanded');
            card.classList.remove('expanded');
        } else {
            expandButton.style.display = 'none';
            descriptionElement.classList.add('expanded');
        }

        card.addEventListener('click', () => window.open(repo.url, '_blank'));

        const thumb = clone.querySelector('.miniatura');
        fetchReadmeImage(repo.owner, repo.name).then((img) => {
            if (img)
                thumb.innerHTML = `<img src="${img}" alt="${repo.name}" loading="lazy">`;
        });

        projContainer.appendChild(clone);
    }

    document.body.removeChild(tempDiv);
}

// --- NAVEGAÇÃO / INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // navegação
    const links = document.querySelectorAll('.nav-link, footer [data-target]');
    const paginas = document.querySelectorAll('.pagina');

    function showPage(id) {
        paginas.forEach((p) => p.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');

        links.forEach((l) => l.classList.remove('active'));
        links.forEach((l) => {
            if (l.dataset.target === id) l.classList.add('active');
        });
    }

    const initialPage = document.querySelector('.pagina')
        ? document.querySelector('.pagina').id
        : 'home';
    showPage(initialPage);

    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const alvo = link.dataset.target;
            if (alvo) showPage(alvo);
        });
    });

    // EVENTO DO NOVO SWITCH: Quando o checkbox muda, ele chama toggleTheme
    if (themeInput) {
        themeInput.addEventListener('change', window.toggleTheme);
    }

    // renderizações iniciais
    renderCertificates();
    renderProjects();
});
