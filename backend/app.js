import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRouter from './routes/chat.js';
import imageChatRouter from './routes/imageChat.js';
import csvChatRouter from './routes/csvChat.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => res.send('Server đang chạy'));

app.use('/api/chat', chatRouter);
app.use('/api/image-chat', imageChatRouter);
app.use('/api/csv-chat', csvChatRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend: http://localhost:${port}`));
