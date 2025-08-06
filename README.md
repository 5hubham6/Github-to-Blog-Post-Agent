# GitHub to Blog Agent

Was thinking about writing a blog post for one of my projects and realized I was just going to describe what the code already shows. Figured AI could probably do this better and faster than me manually writing everything out. Started as a simple script but kept adding features as I needed them.

## What it does

![Demo GIF](assets/demo.gif)

```
📂 GitHub URL  →  🤖 AI Analysis  →  📝 Blog Post  →  💾 Export
     |                |                |              |
 [paste link]    [smart analysis]   [markdown]    [download]
```

- Analyzes any public GitHub repository 
- Uses AI to generate blog posts
- Multiple AI providers with automatic fallback
- Real-time progress updates via WebSockets
- Basic web interface 
- Export as Markdown

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
Then go to http://localhost:3002

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
1. Open http://localhost:3002
2. Paste any GitHub repository URL
3. Watch progress as AI analyzes the code
4. Download the generated blog post

### Direct API
```bash
# Health check
curl http://localhost:3001/health

# Generate blog post
curl -X POST http://localhost:3001/api/generate \
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
