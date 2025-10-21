import { Router } from 'express';
import multer from 'multer';
import { parseCSVBuffer, basicSummary } from '../utils/parseCSV.js';
import { groq } from '../utils/groqClient.js';

const router = Router();
const upload = multer();

function jsonGuard(req, res, next) {
  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type phải là application/json' });
  }
  next();
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Thiếu file CSV' });
    const records = await parseCSVBuffer(req.file.buffer);
    const summary = basicSummary(records);
    res.json({ summary, sample: records.slice(0, 5) });
  } catch (err) {
    console.error('[CSV upload] error:', err.message);
    res.status(500).json({ error: 'Parse CSV thất bại' });
  }
});

router.post('/from-url', jsonGuard, async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Thiếu URL' });
    const r = await fetch(url);
    if (!r.ok) return res.status(400).json({ error: 'Không tải được CSV từ URL' });
    const buffer = Buffer.from(await r.arrayBuffer());
    const records = await parseCSVBuffer(buffer);
    const summary = basicSummary(records);
    res.json({ summary, sample: records.slice(0, 5) });
  } catch (err) {
    console.error('[CSV from-url] error:', err.message);
    res.status(500).json({ error: 'Parse CSV từ URL thất bại' });
  }
});

router.post('/qa', jsonGuard, async (req, res) => {
  try {
    const { question, summary } = req.body || {};
    if (!question || !summary) return res.status(400).json({ error: 'Thiếu question/summary' });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Bạn là trợ lý phân tích dữ liệu. Chỉ trả lời dựa trên summary CSV." },
        { role: "user", content: `Summary:\n${JSON.stringify(summary, null, 2)}\n\nQuestion: ${question}` }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content ?? 'Không trả lời được.';
    res.json({ reply, timestamp: Date.now() });
  } catch (err) {
    const status = err?.status ?? err?.response?.status;
    const details = err?.response?.data ?? err?.message;
    console.error('[CSV QA] error status:', status);
    console.error('[CSV QA] details:', details);
    res.status(500).json({ error: 'CSV QA failed', status, details });
  }
});

export default router;
