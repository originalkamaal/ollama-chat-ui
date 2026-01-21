# 🤖 AI Chat App

A modern, feature-rich AI chat application built with Next.js and Ollama. Features streaming responses, thinking/reasoning display for models like DeepSeek R1, and a clean monochrome UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🔄 Streaming Responses** - Real-time token-by-token response streaming
- **🧠 Thinking Display** - Collapsible thinking/reasoning section for models like DeepSeek R1 that output `<think>` tags
- **💬 Multiple Chat Sessions** - Create, switch between, and delete chat sessions
- **🎨 Clean Monochrome UI** - Modern white/black/gray design inspired by ChatGPT and Claude
- **📝 Rich Markdown** - Full markdown support with syntax-highlighted code blocks
- **📋 Copy Code** - One-click copy for code blocks with language labels
- **🔌 Model Switching** - Switch between different Ollama models on the fly
- **🎯 Prompt Types** - Pre-configured prompt types (Chat, Creative, Coding, Research)
- **⏹️ Stop Generation** - Stop AI response mid-generation
- **💾 Persistent Storage** - Chat history saved to localStorage

## 📋 Prerequisites

- **Node.js** 18+ 
- **Ollama** installed and running locally

## 🚀 Quick Start

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### 2. Start Ollama and Pull a Model

```bash
# Start Ollama service
ollama serve

# Pull a model (in another terminal)
ollama pull deepseek-r1:latest
# or
ollama pull llama3.2:1b
# or any other model
```

### 3. Install Dependencies

```bash
cd ai-chat-app
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [React Markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [Lucide React](https://lucide.dev/) | Icons |
| [Radix UI](https://www.radix-ui.com/) | UI primitives |

## 📁 Project Structure

```
ai-chat-app/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat API endpoint (proxies to Ollama)
│   │   └── models/route.ts    # Models list endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── ChatInterface.tsx      # Main chat interface
│   ├── MessageList.tsx        # Message list with thinking display
│   ├── InputArea.tsx          # Input with send/stop buttons
│   ├── ModelSelector.tsx      # Model dropdown
│   └── PromptTypeSelector.tsx # Prompt type dropdown
├── lib/
│   ├── api-client.ts          # API client with streaming & abort
│   ├── store.ts               # Zustand store for chat state
│   └── prompts.ts             # System prompts configuration
└── types/
    └── index.ts               # TypeScript types
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file (optional):

```env
# Ollama server URL (default: http://localhost:11434)
NEXT_PUBLIC_OLLAMA_BASE_URL=http://localhost:11434
```

### Default Model

Edit `lib/store.ts` to change the default model:

```typescript
currentModel: 'your-preferred-model',
```

## 🎨 Customization

### Adding Prompt Types

Edit `lib/prompts.ts` to add custom prompt types:

```typescript
export const PROMPT_TYPES = {
  myCustomType: {
    label: 'My Type',
    description: 'Custom prompt description',
    icon: 'Sparkles',
    systemPrompt: 'You are a helpful assistant specialized in...',
  },
};
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js and Ollama**
