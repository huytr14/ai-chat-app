import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { groq } from "../utils/groqClient.js";

const router = Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 4 * 1024 * 1024 }, // theo docs: base64 request limit ~4MB
  fileFilter: (_req, file, cb) => {
    if (!/image\/(png|jpe?g)/.test(file.mimetype)) {
      return cb(new Error("Chỉ hỗ trợ PNG/JPG"));
    }
    cb(null, true);
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Thiếu ảnh" });

    const prompt = req.body?.prompt || "Mô tả nội dung bức ảnh.";
    const base64 = fs.readFileSync(req.file.path, { encoding: "base64" });
    const ext = (req.file.mimetype || "image/png").split("/")[1] || "png";
    const dataUrl = `data:image/${ext};base64,${base64}`;

    // Model vision mới — xem Groq docs / Images and Vision
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content ?? "Không phân tích được ảnh.";
    res.json({ reply, timestamp: Date.now(), filename: req.file.originalname });
  } catch (err) {
    const status = err?.status ?? err?.response?.status;
    const details = err?.response?.data ?? err?.message;
    console.error("[IMAGE] error status:", status);
    console.error("[IMAGE] details:", details);
    res.status(500).json({ error: "Image chat failed", status, details });
  } finally {
    if (req.file) fs.unlink(req.file.path, () => {});
  }
});

export default router;
