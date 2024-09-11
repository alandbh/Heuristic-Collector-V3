export default async function handler(req, res) {
    if (req.method === "POST") {
        const { title, text, files } = req.body;
        // Processar os arquivos e outros dados recebidos
        console.log("Título:", title);
        console.log("Texto:", text);
        console.log("Arquivos:", files);
        res.status(200).json({
            message: "Arquivo recebido com sucesso!",
            title,
            text,
        });
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Método ${req.method} não permitido`);
    }
}
