# 🤖 AI Full-Stack Chat Application

## 🎯 Overview
A lightweight **AI Chat Application** that supports:
- 🧠 Multi-turn text conversation  
- 🖼️ Chatting about uploaded images  
- 📊 Chatting with data from CSV files (via upload or URL)

This project was built as part of the **AI Full-Stack Intern Assignment**, demonstrating both frontend and backend integration with **Groq API (Llama 3 & Llama 4 Vision models)**.

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite) + Axios + Chart.js + React Markdown |
| **Backend** | Node.js + Express + Groq SDK |
| **AI Models** | `llama-3.1-8b-instant` (Text) & `meta-llama/llama-4-scout-17b-16e-instruct` (Image) |
| **Data Tools** | Multer (File Upload), csv-parse |
| **Styling** | Minimal custom CSS with Flexbox |
| **Environment** | `.env` for secret keys & configuration |

---

## 🔑 How to Get Your Groq API Key

1. Go to **[Groq Console](https://console.groq.com/keys)**.  
2. Log in with your account or sign up (free).  
3. Click **"Create API Key"**.  
4. Copy your key — it should start with `gsk_...`  
5. In your local `backend/` folder, create a file named `.env`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=4000
   ```
6. ⚠️ **Never share or commit this key** to GitHub.  
   Add `.env` to `.gitignore` before pushing your project.

---

## 🧩 Features

### 🗨️ Multi-turn Chat
- Keeps full conversation history (user + assistant).  
- Supports Markdown formatting and timestamps.

### 🖼️ Image Chat
- Upload JPG/PNG images.  
- The assistant analyzes image contents using **Llama 4 Vision**.  
- Displays a live preview of the uploaded image.

### 📈 CSV Data Chat
- Upload or link to CSV files (e.g., GitHub raw URLs).  
- Automatically summarizes dataset columns, missing values, and statistics.  
- Ask natural questions:
  - “Summarize the dataset.”
  - “Which column has the most missing values?”
  - “Plot a histogram of price.”
- Displays inline tables and bar charts.

---

## 🧠 Architecture

```
frontend/
  ├── src/App.jsx        # Main chat interface
  ├── assets/            # Images / icons
backend/
  ├── app.js             # Express entry point
  ├── routes/
  │    ├── chat.js       # Text chat route
  │    ├── imageChat.js  # Vision chat route
  │    └── csvChat.js    # CSV data chat route
  ├── utils/
  │    └── groqClient.js # Groq SDK client
.env                      # Contains GROQ_API_KEY
```

---

## 🧰 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/ai-chat-app.git
cd ai-chat-app
```

### 2️⃣ Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3️⃣ Add your Groq API key
Create `backend/.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=4000
```

### 4️⃣ Run servers
Open two terminals:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Access app at:  
👉 **Frontend:** http://localhost:5173  
👉 **Backend:** http://localhost:4000

---

## 🎥 Demo Video
**▶️ Demo:** `https://drive.google.com/file/d/1Xn8_JlsDXceX9RjkRmKxRe37AtBZIoIX/view?usp=sharing

---

## 👨‍💻 Author
**Tran Gia Huy**  
AI / Full-Stack Developer  
📧 [tghuy140104@gmail.com]  
🌐 [GitHub Profile](https://github.com/huytr14)
