import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Criar pasta 'uploads' se não existir
const UPLOADS_FOLDER = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// Configuração do multer (upload para arquivo local)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Rota para upload
app.post("/upload", upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhuma imagem enviada" });
        }

        // URL completa para acessar a imagem
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        // Lê o arquivo e retorna a imagem diretamente na resposta
        const imageBuffer = fs.readFileSync(path.join(UPLOADS_FOLDER, req.file.filename));

        res.json({
            message: "Upload realizado com sucesso!",
            imageUrl, // URL para acessar a imagem
            imageBase64: imageBuffer.toString("base64") // Retorna a imagem em Base64
        });
    } catch (error) {
        console.error("Erro no upload:", error.message);
        res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
});

// Servir arquivos estáticos (para acessar imagens via URL)
app.use("/uploads", express.static(UPLOADS_FOLDER));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
