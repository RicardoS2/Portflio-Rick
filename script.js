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

const root = document.documentElement;
const certContainer = document.getElementById('secao-certificados');
const projContainer = document.getElementById('secao-projetos');
const themeInput = document.getElementById('input');

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (themeInput) {
        themeInput.checked = theme === 'light';
    }
}

window.toggleTheme = function () {
    const current = root.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
};

function renderCertificates() {
    if (!certContainer) return;
    const tmpl = document.getElementById('modelo-certificado');
    certContainer.innerHTML = '';

    certificationsData.forEach((cert, index) => {
        const clone = tmpl.content.cloneNode(true);
        const card = clone.querySelector('.card');

        card.classList.add('certificado-card');

        card.style.setProperty('--delay', `${0.2 + index * 0.1}s`);

        clone.querySelector('.icone-recurso').textContent = cert.icon;
        clone.querySelector('.nome-certificado').textContent = cert.name;
        clone.querySelector('.desc-certificado').textContent = cert.desc;

        card.addEventListener('click', () => window.open(cert.url, '_blank'));
        certContainer.appendChild(clone);
    });
}

async function fetchGitHubProjects() {
    const CACHE_KEY = 'github_repos_cache_v3';
    const EXP = 60 * 60 * 1000;
    const api = '/api/projetos';

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < EXP) return parsed.data;
        } catch (e) {}
    }

    const GITHUB_API_URL =
        'https://api.github.com/users/RicardoS2/repos?per_page=100';

    try {
        const res = await fetch(GITHUB_API_URL);
        if (!res.ok) throw new Error('Erro ao consultar API do GitHub');
        const rawData = await res.json();

        const data = rawData
            .filter((repo) => !repo.fork && repo.description)
            .map((repo) => ({
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stars: repo.stargazers_count,
                url: repo.html_url,
                owner: repo.owner.login,
                updatedAt: repo.updated_at,
            }));

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

async function fetchReadmeImage(owner, repo) {
    const CACHE_KEY = `readme_img_${repo}`;
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return cached === 'null' ? null : cached;

    const README_URL = `https://api.github.com/repos/${owner}/${repo}/readme`;

    try {
        const res = await fetch(README_URL);
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

window.toggleProjectDescription = function (event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const description = button.previousElementSibling;
    const card = button.closest('.card');

    if (description.classList.contains('expanded')) {
        description.classList.remove('expanded');
        card.classList.remove('expanded');
        button.textContent = 'Ver Mais';
        button.setAttribute('aria-expanded', 'false');
    } else {
        description.classList.add('expanded');
        card.classList.add('expanded');
        button.textContent = 'Ver Menos';
        button.setAttribute('aria-expanded', 'true');
    }
};

async function renderProjects() {
    if (!projContainer) return;

    projContainer.innerHTML = '';
    const loading = document.createElement('p');
    loading.className = 'placeholder';
    loading.textContent = 'Carregando projetos...';
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

        card.style.setProperty('--delay', `${0.1 + index * 0.1}s`);

        clone.querySelector('.nome-projeto').textContent =
            repo.name || 'Sem nome';
        descriptionElement.textContent = repo.description || 'Sem descrição.';
        clone.querySelector('.linguagem-projeto').textContent =
            repo.language || '';
        clone.querySelector('.estrelas-projeto').textContent =
            repo.stars > 0 ? `★ ${repo.stars}` : '';

        card.setAttribute('data-url', repo.url);

        tempDiv.textContent = repo.description || '';
        const fullHeight = tempDiv.offsetHeight;

        if (fullHeight > HEIGHT_LIMIT_PX) {
            expandButton.style.display = 'block';
            expandButton.textContent = 'Ver Mais';
            expandButton.addEventListener(
                'click',
                window.toggleProjectDescription,
            );
            descriptionElement.classList.remove('expanded');
            card.classList.remove('expanded');
        } else {
            expandButton.style.display = 'none';
            descriptionElement.classList.add('expanded');
        }

        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-expandir-desc')) {
                window.open(repo.url, '_blank');
            }
        });

        const thumbWrapper = clone.querySelector('.miniatura');
        fetchReadmeImage(repo.owner, repo.name).then((img) => {
            if (img)
                thumbWrapper.innerHTML = `<img src="${img}" alt="Miniatura do Projeto ${repo.name}" loading="lazy">`;
            else
                thumbWrapper.innerHTML = `<i class="fa-solid fa-folder-open" style="font-size: 32px; color: var(--accent); margin-top: 24px;"></i>`;
        });

        projContainer.appendChild(clone);
    }

    document.body.removeChild(tempDiv);
}

document.addEventListener('DOMContentLoaded', () => {
    const initialTheme = localStorage.getItem('theme') || 'dark';
    setTheme(initialTheme);

    const links = document.querySelectorAll('.nav-link, footer [data-target]');
    const paginas = document.querySelectorAll('.pagina');

    function showPage(id) {
        paginas.forEach((p) => p.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');

        document
            .querySelectorAll('.links-nav .nav-link')
            .forEach((l) => l.classList.remove('active'));
        document
            .querySelectorAll(`.links-nav [data-target="${id}"]`)
            .forEach((l) => l.classList.add('active'));

        if (id !== 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const urlHash = window.location.hash.replace('#', '');
    const initialPage =
        urlHash && document.getElementById(urlHash) ? urlHash : 'home';
    showPage(initialPage);

    links.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const alvo = link.dataset.target;
            if (alvo) {
                showPage(alvo);
                history.pushState(null, '', `#${alvo}`);
            }
        });
    });

    window.addEventListener('popstate', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        showPage(hash);
    });

    if (themeInput) {
        themeInput.addEventListener('change', window.toggleTheme);
    }

    renderCertificates();
    renderProjects();

    if (window.setupTechMarquee) {
        window.setupTechMarquee();
    }
});
