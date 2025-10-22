import { google } from "googleapis";

/**
 * Converte um MIME type em um tipo de evidência simplificado.
 * @param {string} mimeType - O MIME type do arquivo (ex: 'video/mp4').
 * @returns {string} - O tipo simplificado ('video', 'image', 'file').
 */
function getEvidenceType(mimeType = "") {
    if (mimeType.startsWith("video/")) {
        return "video";
    }
    if (mimeType.startsWith("image/")) {
        return "image";
    }
    return "file";
}

/**
 * Busca todos os arquivos dentro de uma pasta, lidando com paginação.
 * @param {object} drive - Instância autenticada do Google Drive API.
 * @param {string} folderId - O ID da pasta pai.
 * @returns {Promise<Array<{id: string, name: string, type: string}>>}
 */
async function getFilesInFolder(drive, folderId) {
    let files = [];
    let pageToken = null;

    try {
        do {
            const res = await drive.files.list({
                q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
                fields: "nextPageToken, files(id, name, mimeType)",
                pageSize: 1000,
                pageToken,
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
            });

            if (res.data.files) {
                files = files.concat(
                    res.data.files.map((file) => ({
                        id: file.id,
                        name: file.name,
                        type: getEvidenceType(file.mimeType),
                    }))
                );
            }

            pageToken = res.data.nextPageToken;
        } while (pageToken);

        return files;
    } catch (error) {
        console.error(`Erro ao listar arquivos na pasta ${folderId}:`, error.message);
        throw new Error("Falha ao buscar arquivos no Google Drive.");
    }
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, api_key");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

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
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/drive.readonly"],
        });

        const drive = google.drive({ version: "v3", auth });
        const files = await getFilesInFolder(drive, folderid);

        return res.status(200).json(files);
    } catch (error) {
        console.error("Erro na API listfiles:", error);
        return res.status(500).json({
            error: "Ocorreu um erro interno no servidor.",
            details: error.message,
        });
    }
}
