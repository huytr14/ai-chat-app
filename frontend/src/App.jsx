import { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = 'http://localhost:4000/api';

export default function App() {
  const [mode, setMode] = useState('chat'); // chat | image | csv
  const [history, setHistory] = useState([]); // {role, content, timestamp}
  const [input, setInput] = useState('');

  // Image
  const [image, setImage] = useState(null);
  const imageRef = useRef();

  // CSV
  const [csvSummary, setCsvSummary] = useState(null);
  const [csvSample, setCsvSample] = useState([]);
  const [csvUrl, setCsvUrl] = useState('');

  const addMsg = (role, content) =>
    setHistory(h => [...h, { role, content, timestamp: new Date().toISOString() }]);

  async function sendChat() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    addMsg('user', userMsg);
    setInput('');
    try {
      const { data } = await axios.post(`${API}/chat`, { message: userMsg, history });
      addMsg('assistant', data.reply);
    } catch {
      addMsg('assistant', 'Lỗi gọi chat API.');
    }
  }

  async function sendImage() {
    if (!image) return;
    addMsg('user', `Mình vừa tải ảnh: ${image.name}`);
    try {
      const form = new FormData();
      form.append('image', image);
      form.append('prompt', input || 'Phân tích nội dung bức ảnh này.');
      setInput('');
      const { data } = await axios.post(`${API}/image-chat`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      addMsg('assistant', data.reply);
    } catch {
      addMsg('assistant', 'Lỗi phân tích ảnh.');
    }
  }

  async function uploadCsvFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await axios.post(`${API}/csv-chat/upload`, form);
      setCsvSummary(data.summary);
      setCsvSample(data.sample);
      addMsg('assistant', 'File CSV đã tải. Bạn có thể hỏi: "Tóm tắt dataset", "Cột nào thiếu nhiều nhất?", "Thống kê cơ bản?"');
    } catch {
      addMsg('assistant', 'Không đọc được CSV.');
    }
  }

  async function loadCsvFromUrl() {
    if (!csvUrl) return;
    try {
      const { data } = await axios.post(`${API}/csv-chat/from-url`, { url: csvUrl });
      setCsvSummary(data.summary);
      setCsvSample(data.sample);
      addMsg('assistant', 'CSV từ URL đã tải. Hãy đặt câu hỏi về dữ liệu.');
    } catch {
      addMsg('assistant', 'Không tải được CSV từ URL.');
    }
  }

  async function askCsv() {
    if (!input.trim() || !csvSummary) return;
    const q = input.trim();
    addMsg('user', q);
    setInput('');
    try {
      const { data } = await axios.post(`${API}/csv-chat/qa`, { question: q, summary: csvSummary });
      addMsg('assistant', data.reply);
    } catch {
      addMsg('assistant', 'Lỗi hỏi đáp CSV.');
    }
  }

  const missingChart = csvSummary ? (() => {
    const labels = Object.keys(csvSummary.missingByCol || {});
    const values = Object.values(csvSummary.missingByCol || {});
    return {
      labels,
      datasets: [{ label: 'Số giá trị thiếu theo cột', data: values }]
    };
  })() : null;

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', fontFamily: 'Inter, system-ui' }}>
      <h2>AI Chat App — Text / Image / CSV</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['chat','image','csv'].map(m => (
          <button key={m} onClick={()=>setMode(m)} style={{ padding: '6px 10px', background: mode===m?'#222':'#eee', color: mode===m?'#fff':'#222', borderRadius: 8, border: '1px solid #ccc' }}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Khung chat */}
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, minHeight: 260, marginBottom: 12 }}>
        {history.map((m,i)=>(
          <div key={i} style={{ marginBottom: 8 }}>
            <strong>{m.role === 'user' ? 'Bạn' : 'Assistant'}</strong>
            <span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>{new Date(m.timestamp).toLocaleString()}</span>
            <div style={{ marginTop: 4 }}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* Khu điều khiển */}
      {mode === 'chat' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Nhập tin nhắn..." style={{ flex: 1, padding: 8 }} />
          <button onClick={sendChat}>Gửi</button>
        </div>
      )}

      {mode === 'image' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="file" accept="image/*" ref={imageRef} onChange={e=>setImage(e.target.files?.[0] || null)} />
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Câu hỏi về ảnh (tùy chọn)..." style={{ flex: 1, padding: 8 }} />
            <button onClick={sendImage}>Phân tích ảnh</button>
          </div>
          {image && <img alt="preview" src={URL.createObjectURL(image)} style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #eee' }} />}
        </>
      )}

      {mode === 'csv' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="file" accept=".csv" onChange={uploadCsvFile} />
            <input value={csvUrl} onChange={e=>setCsvUrl(e.target.value)} placeholder="Dán URL CSV (raw)..." style={{ flex: 1, padding: 8 }} />
            <button onClick={loadCsvFromUrl}>Tải từ URL</button>
          </div>

          {csvSummary && (
            <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <h4>Tóm tắt CSV</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(csvSummary, null, 2)}</pre>
              <h4>Mẫu 5 dòng đầu</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(csvSample, null, 2)}</pre>
              {missingChart && (
                <>
                  <h4>Biểu đồ thiếu dữ liệu</h4>
                  <Bar data={missingChart} />
                </>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input value={input} onChange={e=>setInput(e.target.value)} placeholder='Ví dụ: "Tóm tắt dataset", "Cột nào thiếu nhiều nhất?"' style={{ flex: 1, padding: 8 }} />
                <button onClick={askCsv}>Hỏi về CSV</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
