// pages/api/list-folders.js

import { google } from "googleapis";

/**
 * Converte um MIME type em um tipo de evidência simplificado.
 * @param {string} mimeType - O MIME type do arquivo (ex: 'video/mp4').
 * @returns {string} - O tipo simplificado ('video', 'image', 'file').
 */
function getEvidenceType(mimeType) {
    if (mimeType.startsWith("video/")) {
        return "video";
    }
    if (mimeType.startsWith("image/")) {
        return "image";
    }
    return "file"; // Tipo padrão para outros arquivos
}

/**
 * Função auxiliar para buscar pastas dentro de uma pasta pai.
 * @param {object} drive - Instância autenticada do Google Drive API.
 * @param {string} folderId - O ID da pasta pai.
 * @returns {Promise<Array<{id: string, name: string}>>} - Uma lista de pastas.
 */
async function getFoldersIn(drive, folderId) {
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: "files(id, name)",
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });
        return res.data.files || [];
    } catch (error) {
        console.error(`Erro ao listar pastas em ${folderId}:`, error.message);
        throw new Error("Falha ao buscar pastas no Google Drive.");
    }
}

/**
 * Função auxiliar para buscar arquivos (não pastas) dentro de uma pasta pai.
 * @param {object} drive - Instância autenticada do Google Drive API.
 * @param {string} folderId - O ID da pasta pai.
 * @returns {Promise<Array<{id: string, name: string, mimeType: string}>>} - Uma lista de arquivos.
 */
async function getFilesIn(drive, folderId) {
    try {
        const res = await drive.files.list({
            // Query para buscar por arquivos que NÃO são pastas
            q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
            // Adicionamos mimeType para podermos determinar o tipo do arquivo
            fields: "files(id, name, mimeType, webViewLink)",
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });
        return res.data.files || [];
    } catch (error) {
        console.error(`Erro ao listar arquivos em ${folderId}:`, error.message);
        throw new Error("Falha ao buscar arquivos no Google Drive.");
    }
}

/**
 * Handler principal da rota da API.
 */
export default async function handler(req, res) {
    // CONFIGURAÇÃO DOS CABEÇALHOS CORS
    // Permite que requisições de qualquer origem acessem a API.
    // Para produção, é recomendado substituir '*' pelo domínio da sua aplicação (ex: 'http://localhost:3001').
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Define os métodos HTTP permitidos.
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    // Define os cabeçalhos permitidos na requisição, incluindo o 'api_key' customizado.
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, api_key");

    // O navegador envia uma requisição "preflight" OPTIONS antes da requisição GET
    // para verificar as permissões de CORS. Respondemos com 200 OK para essa verificação.
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // VERIFICAÇÃO DA CHAVE DA API
    const apiKey = req.headers.api_key;
    const expectedApiKey = process.env.API_SECRET_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
        return res.status(401).json({
            error: "Acesso não autorizado. Chave de API inválida ou ausente.",
        });
    }

    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { folderid } = req.query;

    if (!folderid) {
        return res
            .status(400)
            .json({ error: 'O parâmetro "folderid" é obrigatório.' });
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(
                    /\\n/g,
                    "\n"
                ),
            },
            scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        const drive = google.drive({ version: "v3", auth });

        // 1. BUSCAR PASTAS PRINCIPAIS (players)
        const mainFolders = await getFoldersIn(drive, folderid);

        // 2. BUSCAR SUBPASTAS (journeys) E SEUS ARQUIVOS (evidence)
        const structuredResponse = await Promise.all(
            mainFolders.map(async (folder) => {
                // Busca as subpastas (journeys)
                const journeyFolders = await getFoldersIn(drive, folder.id);

                // Para cada journey, busca os arquivos dentro dela
                const journeysWithEvidence = await Promise.all(
                    journeyFolders.map(async (journey) => {
                        const files = await getFilesIn(drive, journey.id);

                        // Mapeia os arquivos para o formato de "evidence"
                        const evidence = files.map((file) => ({
                            id: file.id,
                            name: file.name,
                            type: getEvidenceType(file.mimeType),
                            url: file.webViewLink, // Adiciona a URL de preview
                        }));

                        // Retorna o objeto da subpasta com a lista de arquivos
                        return {
                            id: journey.id,
                            name: journey.name,
                            type: "journey",
                            evidence: evidence,
                        };
                    })
                );

                return {
                    name: folder.name,
                    id: folder.id,
                    type: "player",
                    subfolders: journeysWithEvidence,
                };
            })
        );

        // Ordena o resultado final pelo nome da pasta principal
        structuredResponse.sort((a, b) => a.name.localeCompare(b.name));

        // 3. ENVIAR RESPOSTA
        return res.status(200).json(structuredResponse);
    } catch (error) {
        console.error("Erro na API:", error);
        return res.status(500).json({
            error: "Ocorreu um erro interno no servidor.",
            details: error.message,
        });
    }
}
