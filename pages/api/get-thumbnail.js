import { google } from "googleapis";

/**
 * Handler para buscar URL de thumbnail de um arquivo específico do Google Drive
 */
export default async function handler(req, res) {
    // CONFIGURAÇÃO DOS CABEÇALHOS CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, api_key");

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

    const { fileId } = req.query;

    if (!fileId) {
        return res
            .status(400)
            .json({ error: 'O parâmetro "fileId" é obrigatório.' });
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

        // Busca informações do arquivo
        const file = await drive.files.get({
            fileId: fileId,
            fields: "id, name, mimeType, thumbnailLink, webViewLink",
            supportsAllDrives: true,
        });

        // Aumenta o tamanho da thumbnail se ela existir
        const largerThumbnail = file.data.thumbnailLink
            ? file.data.thumbnailLink.replace("=s220", "=s800")
            : null;

        // Determina o tipo do arquivo
        const getEvidenceType = (mimeType) => {
            if (mimeType.startsWith("video/")) return "video";
            if (mimeType.startsWith("image/")) return "image";
            return "file";
        };

        const type = getEvidenceType(file.data.mimeType);
        let embedUrl = null;

        // Se for um vídeo, cria uma URL de preview/incorporação
        if (type === "video") {
            embedUrl = `https://drive.google.com/file/d/${file.data.id}/preview`;
        }

        const result = {
            id: file.data.id,
            name: file.data.name,
            type: type,
            url: largerThumbnail || file.data.thumbnailLink || file.data.webViewLink,
            embedUrl: embedUrl,
        };

        return res.status(200).json(result);
    } catch (error) {
        console.error("Erro na API get-thumbnail:", error);
        return res.status(500).json({
            error: "Ocorreu um erro interno no servidor.",
            details: error.message,
        });
    }
}
