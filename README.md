# GitHub to Blog Agent

Was thinking about writing a blog post for one of my projects and realized I was just going to describe what the code already shows. Figured AI could probably do this better and faster than me manually writing everything out. Started as a simple script but kept adding features as I needed them.

## What it does

```
📂 GitHub URL  →  🤖 AI Analysis  →  📝 Blog Post  →  💾 Export
     |                |                |              |
 [paste link]    [smart analysis]   [markdown]    [download]
```

- Analyzes any public GitHub repository 
- Uses AI to generate engaging blog posts
- Multiple AI providers with automatic fallback
- Real-time progress updates via WebSockets
- Modern web interface with animations
- Export as Markdown, HTML, or PDF

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   Next.js UI    │    │  FastAPI     │    │   AI APIs   │
│                 │◄──►│   Server     │◄──►│             │
│ • TypeScript    │    │              │    │ • Groq      │
│ • Tailwind CSS  │    │ • WebSockets │    │ • HuggingFace│
│ • Real-time UI  │    │ • Security   │    │ • OpenAI    │
└─────────────────┘    └──────────────┘    └─────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   File I/O   │
                       │  Processing  │
                       └──────────────┘
```

## Running it

### Quick start with Docker
```bash
# Copy environment template
cp .env.template .env
# Edit .env with your API keys (need at least one)

docker-compose up
```
Then go to http://localhost:8000

### Manual setup
```bash
# Backend
pip install -r requirements.txt
python app.py

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```
│   Next.js 14    │◄────────────────►│   Python API     │
│   Frontend      │    Socket.io     │   FastAPI        │
│                 │                  │                  │
│ • Tailwind CSS  │                  │ • Multi-AI       │
│ • Framer Motion │                  │ • Async Tasks    │
│ • TypeScript    │                  │ • CORS Enabled   │
└─────────────────┘                  └──────────────────┘
                                              │
                                              ▼
                                    ## Current Status

### ✅ What's Working Right Now
- Basic web interface for pasting GitHub URLs
- AI provider integration (Groq, HuggingFace, OpenAI)
- Fallback system when one provider fails
- Real-time updates during processing
- Simple Next.js frontend
- Docker setup for deployment
- Markdown export

### 🏗️ Infrastructure I've Set Up
- **Security**: Basic headers, CORS, environment variables
- **Docker**: Container setup with health checks
- **Documentation**: Security notes, deployment info
- **Frontend**: Next.js with TypeScript and Tailwind

### 🚀 Next When I Get Time
- Batch processing for multiple repos
- Save generated posts locally
- Different blog post styles
- Better error handling

## Features I've built

### Core stuff
- GitHub repository analysis and content extraction
- AI-powered blog post generation with multiple providers
- Real-time updates during processing
- Basic web interface

### AI Integration
- **Groq**: Fast and free (main choice)
- **HuggingFace**: Also free, good backup
- **OpenAI**: When you need better quality
- **Automatic fallback**: Switches providers if one fails

### File structure
```
├── app.py              # FastAPI server with WebSocket support
├── ai_providers.py     # Multi-AI provider integration  
├── utils.py           # Helper functions
├── frontend/          # Next.js application
│   ├── src/app/       # App router and main components
│   └── src/components/ # Reusable UI components
├── data/             # Generated content storage
└── docker-compose.yml # Container setup
```

## API Keys Setup

Need at least one of these (free options work great):

```bash
# Free options (recommended to start)
GROQ_API_KEY=gsk_your-key-here
HUGGINGFACE_API_KEY=hf_your-token-here

# Paid options (higher quality)
OPENAI_API_KEY=sk-your-openai-key-here

# Enterprise option
AZURE_OPENAI_API_KEY=your-azure-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

Copy `.env.template` to `.env` and add your keys.

## How to use it

### Web Interface
1. Open http://localhost:8000
2. Paste any GitHub repository URL
3. Watch progress as AI analyzes the code
4. Download the generated blog post

### Direct API
```bash
# Health check
curl http://localhost:8000/health

# Generate blog post
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/user/repo"}'
```

## Future ideas (when I get time)

- [ ] **Batch processing**: Analyze multiple repos at once
- [ ] **Save posts locally**: Keep generated content organized
- [ ] **Different templates**: Technical posts vs beginner-friendly styles
- [ ] **Azure AI Foundry integration**: Seems like a better option for quality
- [ ] **Direct publishing**: Push to Medium, Dev.to automatically
- [ ] **Better error messages**: More helpful feedback when things fail
- [ ] **Custom prompts**: Let users adjust the writing style
- [ ] **Export options**: PDF, HTML, different markdown formats

## Tech stack

**Backend**: Python 3.13, FastAPI, WebSocket, asyncio  
**Frontend**: Next.js 14, TypeScript, Tailwind CSS  
**AI**: Groq, HuggingFace Inference API, OpenAI GPT models  
**Infrastructure**: Docker, basic health checks  
**Security**: CORS, security headers, environment variables  

## Development

### Security Notes
- All API keys use environment variables
- Copy `.env.template` to `.env` and set your values
- Never commit `.env` file to version control
- Security audit documentation in `SECURITY.md`

### Adding new AI providers
The `ai_providers.py` module uses a provider pattern. To add a new AI service:

1. Create a new provider class with `generate()` method
2. Add provider initialization in the factory
3. Include it in the fallback chain
4. Update environment template with required variables

### Docker deployment
The app includes Docker configuration:
- Basic container setup
- Health check endpoints
- Environment-based configuration

## Why I built this

Was putting off writing a blog post about one of my projects because I kept thinking "I'll just end up describing what's already in the README and code comments anyway." Then I thought - why not let AI read through everything and write the blog post for me?

Started with just OpenAI but kept hitting rate limits during testing, so I added Groq and HuggingFace since they're free and work pretty well. The frontend started as basic HTML but I was learning Next.js at the time so decided to make it look decent.

## Contributing

Feel free to fork and improve! This is just a personal project but happy to make it better.

Some areas that could use work:
- Better error messages for users
- More customization options for blog format
- Performance optimizations for large repos
- Better mobile experience

## License

MIT - do whatever you want with it
```

</details>

### 🎯 Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth 3D animations
- **Socket.io Client** - Real-time communication

### ⚡ Backend Stack
- **Python 3.13** - Modern Python with async support
- **FastAPI** - High-performance async API framework
- **Socket.io** - WebSocket communication
- **Multi-Provider AI** - Groq, HuggingFace, OpenAI integration
- **Async Architecture** - Non-blocking operations
- **Docker** - Containerized deployment ready

## 🚀 Quick Start Guide

### 📋 Prerequisites
```bash
# Option 1: Local Development
Python 3.13+
Node.js 18+
npm or yarn

# Option 2: Docker (Recommended for Production)
Docker
Docker Compose
```

### 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/5hubham6/Github-to-Blog-Post-Agent.git
cd Github-to-Blog-Post-Agent
```

2. **Set up Python environment**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.template .env
```

3. **Configure AI Provider** (Choose your weapon!)

<details>
<summary><b>🚀 Groq (Recommended - Lightning Fast & Free)</b></summary>

```bash
# 1. Visit https://groq.com/
# 2. Sign up with Google/GitHub
# 3. Generate your free API key
# 4. Add to .env file:
GROQ_API_KEY=gsk_your-groq-key-here
```
</details>

<details>
<summary><b>🤗 HuggingFace (Also Free & Reliable)</b></summary>

```bash
# 1. Visit https://huggingface.co/
# 2. Create account and generate token
# 3. Add to .env file:
HUGGINGFACE_API_KEY=hf_your-token-here
```
</details>

<details>
<summary><b>💡 OpenAI (Premium Option)</b></summary>

```bash
# Add to .env file:
OPENAI_API_KEY=sk-your-openai-key
```
</details>

4. **Launch the application**

<details>
<summary><b>🐳 Docker Way (Recommended)</b></summary>

```bash
# Copy environment template for Docker
cp .env.docker .env

# Edit .env with your API keys
# Then run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3003
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/docs

</details>

<details>
<summary><b>💻 Local Development Way</b></summary>

```bash
# Terminal 1: Start Python backend
python app.py

# Terminal 2: Start Next.js frontend
cd frontend
npm install
npm run dev
```

</details>

5. **Start generating!** 🎉
   - Open http://localhost:3003
   - Paste any GitHub repository URL
   - Watch the AI magic happen ✨

## 🎬 See It In Action

<div align="center">

### ⚡ From GitHub Repo to Professional Blog in Minutes

```
🔗 Paste GitHub URL → 🤖 AI Analysis → ✨ Beautiful Blog Post → 📝 Ready to Publish!
```

*Demo GIF coming soon! In the meantime, here's what happens:*

1. **Paste repo URL** → App fetches and analyzes code structure
2. **AI magic begins** → Multiple AI providers work in parallel
3. **Real-time updates** → Watch progress with smooth animations
4. **Blog generated** → Professional, engaging content ready to go!

</div>

## 🐳 Docker Deployment

### Quick Start with Docker
```bash
# Clone and setup
git clone https://github.com/5hubham6/Github-to-Blog-Post-Agent.git
cd Github-to-Blog-Post-Agent

# Setup environment
cp .env.docker .env
# Edit .env with your API keys

# Launch with Docker Compose
docker-compose up -d

# Access at http://localhost:3003
```

### Docker Commands
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build -d
```

### Production Deployment
```bash
# For production, set proper environment variables
export GROQ_API_KEY=your_actual_key
export NODE_ENV=production

# Run in production mode
docker-compose -f docker-compose.yml up -d
```

## 🎨 Features Showcase

### 🌟 Beautiful UI/UX
- **3D Floating Particles** - Dynamic background animations
- **Glassmorphism Design** - Modern frosted glass aesthetics
- **Real-time Progress** - Live updates during generation
- **Responsive Layout** - Works perfectly on all devices
- **Dark Theme** - Easy on the eyes, professional look

### 🤖 AI Integration
- **Multi-Provider System** - Automatic fallbacks ensure reliability
- **Smart Repository Analysis** - Understands code structure and purpose
- **Professional Blog Generation** - Creates engaging, well-structured content
- **Markdown Export** - Ready-to-publish format

### ⚡ Technical Excellence
- **Async Architecture** - Non-blocking operations for better performance
- **WebSocket Communication** - Real-time bidirectional updates
- **Error Handling** - Graceful degradation and user-friendly messages
- **Type Safety** - Full TypeScript integration on frontend

## 🔮 Future Roadmap

### 🎯 Short Term (Coming Soon™)
- [ ] **Azure OpenAI Integration** - Once we figure out those student account restrictions 😅
- [ ] **Custom Prompt Templates** - User-defined blog styles
- [ ] **Batch Processing** - Generate multiple blogs at once
- [ ] **Export Options** - PDF, HTML, various markdown flavors

### 🌟 Medium Term 
- [ ] **Blog Template Gallery** - Pre-designed layouts
- [ ] **SEO Optimization** - Meta tags, keywords generation
- [ ] **Social Media Integration** - Auto-post to dev.to, medium.com
- [ ] **Analytics Dashboard** - Track your generated content

### 🚀 Long Term Vision
- [ ] **Chrome Extension** - Generate blogs directly from GitHub
- [ ] **GitHub Action** - Automated blog generation on commits
- [ ] **Team Collaboration** - Multi-user blog management
- [ ] **Custom AI Training** - Fine-tuned models for your style

## 💭 The Development Journey

### 🎢 Challenges We Conquered

**The Great Language Migration** �  
Started with TypeScript/Node.js, realized Python's ecosystem was perfect for AI work. Migration taught us the importance of choosing the right tool for the job!

**UI/UX Revolution** 🎨  
Went from basic HTML to a stunning Next.js application with 3D animations. Sometimes you gotta rebuild to get it right!

**The Azure AI Foundry Saga** 💸  
*"Let's try Azure AI Foundry!"* - Student account limitations had other plans. Classic learning experience - sometimes the free tier teaches you more than the premium one!

**Multi-AI Provider Architecture** 🤖  
Building a system that gracefully handles multiple AI providers wasn't trivial, but the reliability it provides is worth every line of code.

### 🏆 What We Learned
- **Free doesn't mean inferior** - Groq and HuggingFace models are incredibly capable
- **User experience matters** - A beautiful interface makes the tool more enjoyable to use
- **Fallbacks are crucial** - When dealing with external APIs, always have Plan B (and C!)
- **Community feedback shapes products** - Every suggestion made this tool better

### 📊 Fun Development Stats
- **☕ Coffee consumed**: 47+ cups (and counting)
- **🔄 Complete rewrites**: 2 (TypeScript → Python, Basic UI → Next.js)  
- **🤖 AI providers integrated**: 3+ (with more coming)
- **😅 Azure account restrictions faced**: Too many to count
- **🎨 UI iterations**: 12+ (until we got that perfect glassmorphism look)
- **🐛 Bugs squashed**: 200+ (the good kind of problem solving)
- **✨ "It works!" moments**: Priceless

### 🎉 Project Milestones
- ✅ **V1.0**: Basic TypeScript version with single AI provider
- ✅ **V2.0**: Complete Python rewrite with FastAPI
- ✅ **V2.5**: Beautiful Next.js frontend with 3D animations
- ✅ **V3.0**: Multi-AI provider system with real-time updates
- 🚧 **V3.5**: Azure integration (when student accounts cooperate!)
- 📋 **V4.0**: Browser extension and GitHub Actions

## 🤝 Contributing

We love contributions! Here's how you can help:

### 🐛 Found a Bug?
Open an issue with:
- Clear description of the problem
- Steps to reproduce
- Your environment details

### 💡 Have an Idea?
- Check existing issues first
- Open a feature request
- Let's discuss implementation

### 🔧 Want to Code?
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## 📈 Project Stats

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/5hubham6/Github-to-Blog-Post-Agent?style=social)
![GitHub forks](https://img.shields.io/github/forks/5hubham6/Github-to-Blog-Post-Agent?style=social)
![GitHub issues](https://img.shields.io/github/issues/5hubham6/Github-to-Blog-Post-Agent)
![GitHub pull requests](https://img.shields.io/github/issues-pr/5hubham6/Github-to-Blog-Post-Agent)
![GitHub last commit](https://img.shields.io/github/last-commit/5hubham6/Github-to-Blog-Post-Agent)
![GitHub repo size](https://img.shields.io/github/repo-size/5hubham6/Github-to-Blog-Post-Agent)

</div>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** - For providing lightning-fast free AI inference
- **HuggingFace** - For the amazing open-source model ecosystem
- **Next.js Team** - For the incredible React framework
- **FastAPI** - For making Python APIs a joy to build
- **The Open Source Community** - For inspiration and countless learning resources

## 📞 Connect & Support

<div align="center">

### Built with ❤️ by [@5hubham6](https://github.com/5hubham6) - someone who got tired of writing blog posts manually

[![GitHub](https://img.shields.io/badge/GitHub-5hubham6-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/5hubham6)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://5hubham6.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/shubham-more-dev)

**⭐ Star this repo if it helped you create awesome blog content!**  
**🍴 Fork it and make it even better!**

---

### 🎯 Quick Links
- 🚀 [Get Started](https://github.com/5hubham6/Github-to-Blog-Post-Agent#-quick-start-guide)
- 🐛 [Report Bug](https://github.com/5hubham6/Github-to-Blog-Post-Agent/issues)
- 💡 [Request Feature](https://github.com/5hubham6/Github-to-Blog-Post-Agent/issues)
- 🤝 [Contribute](https://github.com/5hubham6/Github-to-Blog-Post-Agent#-contributing)

*Made possible by free AI models, countless debugging sessions, and way too much coffee* ☕  
*"Turning GitHub repos into blog gold since 2025"* ✨

</div>