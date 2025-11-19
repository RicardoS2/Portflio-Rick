import fetch from 'node-fetch';

const GITHUB_USER = 'RicardoS2';
const GITHUB_PAT = process.env.GITHUB_PAT;

export default async function githubProjects(req, res) {
    if (!GITHUB_PAT) {
        return res.status(500).json({
            error: 'Erro de Configuração: GITHUB_PAT não está definido.',
        });
    }

    const url = `https://api.github.com/user/repos?affiliation=owner,collaborator&sort=updated&per_page=100`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `token ${GITHUB_PAT}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': GITHUB_USER,
            },
        });

        if (!response.ok) {
            const status = response.status;
            const errorDetails = await response.text();

            return res.status(status).json({
                error: `Falha na API GitHub. Status: ${status}`,
                details: errorDetails.substring(0, 200),
            });
        }

        const repos = await response.json();

        const projectData = repos
            .filter(
                (repo) =>
                    repo.private === false &&
                    repo.fork === false &&
                    repo.description,
            )
            .map((repo) => ({
                id: repo.id,
                name: repo.name,
                url: repo.html_url,
                description: repo.description,
                language: repo.language || 'N/A',
                stars: repo.stargazers_count,
                updatedAt: repo.updated_at,
                owner: repo.owner.login,
            }));

        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        return res.status(200).json(projectData);
    } catch (error) {
        console.error('API Runtime Error:', error.message);
        return res.status(500).json({
            error: 'Erro de Execução Interna ao se conectar com o GitHub.',
            details: error.message,
        });
    }
}
