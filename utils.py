import os
import asyncio
import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Optional


async def process_remote_repo(repo_url: str, output_path: Path, ignore_files: str = "") -> None:
    """
    Process a remote GitHub repository using repomix
    """
    try:
        print(f"📦 Processing repository: {repo_url}")
        
        # Build repomix command
        cmd = ["npx", "repomix", repo_url, "--output", str(output_path)]
        
        # Add ignore patterns if provided
        if ignore_files.strip():
            ignore_patterns = [pattern.strip() for pattern in ignore_files.split(',') if pattern.strip()]
            for pattern in ignore_patterns:
                cmd.extend(["--ignore", pattern])
        
        # Run repomix command
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=os.getcwd()
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            error_msg = stderr.decode('utf-8') if stderr else 'Unknown error'
            raise Exception(f"Failed to process repository: {error_msg}")
        
        print(f"✅ Repository processed successfully: {output_path}")
        
        # Verify output file exists and has content
        if not output_path.exists() or output_path.stat().st_size == 0:
            raise Exception("Repository processing completed but output file is empty")
            
    except Exception as e:
        print(f"❌ Error processing repository: {e}")
        raise


def normalize_filename(name: str) -> str:
    """Normalize filename by removing special characters and spaces"""
    import re
    # Replace spaces and underscores with hyphens, remove special chars
    normalized = re.sub(r'[^\w\-]', '', name.lower().replace(' ', '-').replace('_', '-'))
    # Remove multiple consecutive hyphens
    normalized = re.sub(r'-+', '-', normalized)
    # Remove leading/trailing hyphens
    return normalized.strip('-')


def extract_repo_name_from_url(repo_url: str) -> str:
    """Extract repository name from GitHub URL"""
    import re
    
    # Handle various GitHub URL formats
    patterns = [
        r'github\.com/[^/]+/([^/\.]+)',  # https://github.com/user/repo
        r'github\.com/([^/]+)/?$',       # https://github.com/repo
    ]
    
    for pattern in patterns:
        match = re.search(pattern, repo_url)
        if match:
            return match.group(1)
    
    # Fallback: use the last part of the URL
    parts = repo_url.rstrip('/').split('/')
    return parts[-1] if parts else 'unknown-repo'


async def check_repomix_available() -> bool:
    """Check if repomix is available"""
    try:
        process = await asyncio.create_subprocess_exec(
            "npx", "repomix", "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await process.communicate()
        return process.returncode == 0
    except:
        return False


async def ensure_repomix() -> None:
    """Ensure repomix is available"""
    if not await check_repomix_available():
        print("📦 Installing repomix...")
        process = await asyncio.create_subprocess_exec(
            "npm", "install", "-g", "repomix",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await process.communicate()
        
        if not await check_repomix_available():
            raise Exception("Failed to install repomix. Please install it manually: npm install -g repomix")
