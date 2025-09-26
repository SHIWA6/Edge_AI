# EdgeAI – Full-Stack AI Voice Assistant 🎤🤖

**EdgeAI** is a cutting-edge **AI voice assistant** built with **Next.js** and deployed via **Docker**. It supports **real-time audio processing**, **noise suppression**, and **intelligent AI responses** using the **Google Gemini API**. Optimized for both **desktop and mobile** platforms.  

---

## Features ✨
- **Client-Side Audio Pipeline**  
  - Mobile-optimized with **WebM/Opus formats**  
  - Built-in **noise suppression** for clear audio  

- **Intelligent AI Responses**  
  - **RESTful API** for audio transcription  
  - Powered by **Google Gemini API** for context-aware replies  

- **Seamless UX**  
  - **Browser-native Text-to-Speech (TTS)** for real-time audio feedback  
  - Smooth **state management** for interactive experience  

- **Scalable Deployment**  
  - Dockerized for **production-ready deployment**  
  - Portable and easy to scale  

---

## Tech Stack 🛠️
- **Frontend:** Next.js, React, TailwindCSS  
- **Backend:** Node.js, Express, REST API  
- **AI Integration:** Google Gemini API, TTS & Audio Processing libraries  
- **Deployment:** Docker, optimized for production  

---

## Live Demo 🔗
[Click here to try EdgeAI](#)  

---

## Installation & Setup 🖥️

1. **Clone the repository**  
```bash
git clone https://github.com/<your-username>/EdgeAI.git
cd EdgeAI
```

2. **Install dependencies**  
```bash
npm install
```

3. **Set environment variables**  
Create a `.env` file and add:  
```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
PORT=3000
```

4. **Run locally**  
```bash
npm run dev
```

5. **Docker Deployment**  
```bash
docker build -t edgeai .
docker run -p 3000:3000 edgeai
```

---

## Screenshots 📸
*(Add screenshots or GIFs of the assistant in action here)*  

---

## Contributing 🤝
Contributions are welcome! Feel free to open an issue or submit a pull request.  

---

## License 📝
This project is **MIT licensed**.
