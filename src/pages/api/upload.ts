import { NextApiRequest, NextApiResponse } from "next";
import formidable, { File, Fields } from "formidable";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filename: (name, ext, part) => {
      const timestamp = Date.now();
      return `${timestamp}-${part.originalFilename}`;
    },
  });

  form.parse(req, (err, fields: Fields, files: formidable.Files) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ error: "File upload error" });
    }

    const fileKeys = Object.keys(files);

    if (fileKeys.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const firstFileKey = fileKeys[0];
    const uploadedFile = files[firstFileKey];

    if (!uploadedFile) {
      return res.status(400).json({ error: "No valid file found" });
    }

    try {
      let fileName: string;

      if (Array.isArray(uploadedFile)) {
        // 배열인 경우 첫 번째 파일 처리
        fileName = path.basename(uploadedFile[0].filepath);
      } else {
        // 단일 파일 처리
        fileName = path.basename((uploadedFile as formidable.File).filepath);
      }

      const publicPath = `/uploads/${fileName}`;
      res.status(200).json({ url: publicPath });
    } catch (error) {
      console.error("Error handling file:", error);
      res.status(500).json({ error: "File handling failed" });
    }
  });
}
