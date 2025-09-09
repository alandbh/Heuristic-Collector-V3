// pages/api/rename-file.js

import { google } from "googleapis";

/**
 * Handler da API para renomear um arquivo no Google Drive.
 */
export default async function handler(req, res) {
    // CONFIGURAÇÃO DOS CABEÇALHOS CORS
    res.setHeader("Access-Control-Allow-Origin", "*"); // Para produção, restrinja ao seu domínio
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, api_key");

    // Responde à requisição preflight OPTIONS
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // VERIFICAÇÃO DA CHAVE DA API
    const apiKey = req.headers.api_key;
    const expectedApiKey = process.env.API_SECRET_KEY;
    if (!apiKey || apiKey !== expectedApiKey) {
        return res
            .status(401)
            .json({
                error: "Acesso não autorizado. Chave de API inválida ou ausente.",
            });
    }

    // VERIFICA O MÉTODO DA REQUISIÇÃO
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // VERIFICA OS PARÂMETROS DO CORPO DA REQUISIÇÃO
    const { fileId, newName } = req.body;
    if (!fileId || !newName) {
        return res
            .status(400)
            .json({
                error: 'Os parâmetros "fileId" e "newName" são obrigatórios.',
            });
    }

    try {
        // AUTENTICAÇÃO COM O GOOGLE
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(
                    /\\n/g,
                    "\n"
                ),
            },
            // IMPORTANTE: O escopo agora permite leitura e escrita.
            scopes: ["https://www.googleapis.com/auth/drive"],
        });

        const drive = google.drive({ version: "v3", auth });

        // EXECUTA A OPERAÇÃO DE RENOMEAR (UPDATE)
        await drive.files.update({
            fileId: fileId,
            requestBody: {
                name: newName,
            },
            supportsAllDrives: true, // Necessário para Drives Compartilhados
        });

        // RETORNA SUCESSO
        return res
            .status(200)
            .json({ success: true, message: "Arquivo renomeado com sucesso." });
    } catch (error) {
        console.error("Erro ao renomear arquivo:", error);
        return res
            .status(500)
            .json({
                error: "Falha ao renomear o arquivo.",
                details: error.message,
            });
    }
}
