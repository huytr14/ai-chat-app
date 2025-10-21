import { Router } from "express";
import { groq } from "../utils/groqClient.js";

const router = Router();

/** body: { message: string, history?: [{role:'user'|'assistant', content:string}] } */
router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: "Thiếu message" });

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      // Có thể đổi lên 'llama-3.3-70b-versatile' để tăng chất lượng
      model: "llama-3.1-8b-instant",
      messages
    });

    const reply = completion.choices?.[0]?.message?.content ?? "Không có phản hồi.";
    res.json({ reply, timestamp: Date.now() });
  } catch (err) {
    const status = err?.status ?? err?.response?.status;
    const details = err?.response?.data ?? err?.message;
    console.error("[CHAT] error status:", status);
    console.error("[CHAT] details:", details);
    res.status(500).json({ error: "Chat failed", status, details });
  }
});

export default router;
