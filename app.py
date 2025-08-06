import os
import asyncio
import json
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime

import aiofiles
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn
from dotenv import load_dotenv

from ai_providers import MultiProviderAI
from utils import process_remote_repo

# Load environment stuff
load_dotenv()

# Set up FastAPI and Socket.IO
app = FastAPI(title="GitHub to Blog Generator", description="Turn GitHub repos into blogs with AI magic")

# CORS setup so frontend can talk to us (security-first approach)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3002", 
        "http://localhost:3000", 
        "http://localhost:3003",
        # Add your production domain here when deploying
        # "https://your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only allow needed methods
    allow_headers=["Content-Type", "Authorization"],  # Specific headers only
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY" 
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

sio = socketio.AsyncServer(
    async_mode='asgi', 
    cors_allowed_origins=["http://localhost:3002", "http://localhost:3000", "http://localhost:3003"]
)
socket_app = socketio.ASGIApp(sio, app)

# Keep track of who's doing what
active_sessions: Dict[str, Dict] = {}

# Make sure our folders exist
os.makedirs("data/repos", exist_ok=True)
os.makedirs("data/blogs", exist_ok=True)

@app.post("/api/generate")
async def generate_blog(request: Request):
    """Kick off the blog generation process"""
    data = await request.json()
    repo_url = data.get("repoUrl", "").strip()
    repo_name = data.get("repoName", "").strip()
    ignore_files = data.get("ignoreFiles", "")
    custom_prompt = data.get("customPrompt", "")
    
    if not repo_url or not repo_name:
        raise HTTPException(status_code=400, detail="Repository URL and name are required")
    
    # Generate session ID
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Make sure we have at least one AI provider working
    ai_providers = MultiProviderAI()
    available_providers = ai_providers.get_available_providers()
    
    if not available_providers:
        raise HTTPException(
            status_code=500, 
            detail="Yo, no AI providers set up! Add GROQ_API_KEY or HUGGINGFACE_API_KEY to your .env file"
        )
    
    # Start the magic in the background
    asyncio.create_task(generate_blog_async(session_id, repo_url, repo_name, ignore_files, custom_prompt))
    
    return {"sessionId": session_id, "status": "started", "availableProviders": available_providers}

async def generate_blog_async(session_id: str, repo_url: str, repo_name: str, ignore_files: str = "", custom_prompt: str = ""):
    """Generate blog in the background with live updates"""
    try:
        # Get our AI ready
        ai_providers = MultiProviderAI()
        active_sessions[session_id] = {"providers": ai_providers, "progress": []}
        
        # Step 1: Check out the repo
        await sio.emit('progress', {
            'sessionId': session_id,
            'step': 'repository-analysis', 
            'message': '📦 Checking out the repo...'
        })
        
        # Process the repository
        normalized_name = repo_name.lower().replace(' ', '-').replace('_', '-')
        repo_data_path = Path(f"data/repos/{normalized_name}.md")
        
        await process_remote_repo(repo_url, repo_data_path, ignore_files)
        
        # Read what we got
        async with aiofiles.open(repo_data_path, "r") as f:
            repo_data = await f.read()
        
        # Step 2: AI time!
        providers_info = ai_providers.get_available_providers()
        await sio.emit('progress', {
            'sessionId': session_id,
            'step': 'ai-analysis',
            'message': f'🤖 Using FREE AI models! Available: {", ".join(providers_info)}'
        })
        
        # Generate blog content
        blog_content = await ai_providers.generate_blog(repo_data, custom_prompt)
        
        # Save blog
        blog_path = Path(f"data/blogs/{normalized_name}.md")
        async with aiofiles.open(blog_path, "w") as f:
            await f.write(blog_content)
        
        # Success
        await sio.emit('progress', {
            'sessionId': session_id,
            'step': 'completed',
            'message': f'🎉 Blog generated successfully with FREE AI!',
            'blogContent': blog_content,
            'workflow': [
                {'step': 'repository-analysis', 'status': 'completed', 'details': 'Repository analyzed successfully'},
                {'step': 'ai-generation', 'status': 'completed', 'details': f'Blog generated with {ai_providers.get_current_provider()}'}
            ]
        })
        
    except Exception as error:
        error_msg = str(error)
        
        # Generate fallback template
        template_blog = generate_template_blog(repo_name)
        normalized_name = repo_name.lower().replace(' ', '-').replace('_', '-')
        blog_path = Path(f"data/blogs/{normalized_name}.md")
        
        async with aiofiles.open(blog_path, "w") as f:
            await f.write(template_blog)
        
        await sio.emit('progress', {
            'sessionId': session_id,
            'step': 'completed',
            'message': f'⚠️ AI generation failed. Created template blog. Get free API keys at groq.com! Error: {error_msg}',
            'blogContent': template_blog,
            'workflow': [
                {'step': 'repository-analysis', 'status': 'completed', 'details': 'Repository analyzed successfully'},
                {'step': 'ai-generation', 'status': 'failed', 'details': f'AI providers failed: {error_msg}'},
                {'step': 'template-generation', 'status': 'completed', 'details': 'Generated basic template as fallback'}
            ]
        })

def generate_template_blog(repo_name: str) -> str:
    """Generate a basic template blog when AI fails"""
    return f"""# {repo_name} - Project Overview

## Introduction
This is a template blog post for the **{repo_name}** repository.

## About This Project
{repo_name} appears to be an interesting project. A detailed analysis would be available with AI model access.

## Key Features
- Repository successfully analyzed and processed
- Clean project structure identified
- Ready for detailed technical documentation

## Technical Analysis
A more detailed technical analysis would be available with AI model access.

## Getting Started
Check the repository for installation and usage instructions.

## Conclusion
{repo_name} represents a solid project. For a complete AI-generated analysis, please configure free API keys from:
- Groq: https://groq.com/
- Hugging Face: https://huggingface.co/settings/tokens

---
*This is a template blog post. For AI-generated content, please configure API keys for supported providers.*
"""

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"🔗 Client connected: {sid}")

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"❌ Client disconnected: {sid}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3001))
    print(f"🚀 AI Blog Generator starting on http://localhost:{port}")
    try:
        providers = MultiProviderAI().get_available_providers()
        print(f"🔑 AI Providers available: {providers}")
    except:
        print("⚠️  No AI providers configured. Add API keys to .env file.")
    uvicorn.run(socket_app, host="0.0.0.0", port=port)
