import os
import asyncio
from typing import List, Optional
from abc import ABC, abstractmethod

from openai import AsyncOpenAI
from groq import Groq
from huggingface_hub import InferenceClient


class AIProvider(ABC):
    """Abstract base class for AI providers"""
    
    @abstractmethod
    async def generate_text(self, prompt: str, max_tokens: int = 2000) -> str:
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        pass
    
    @property
    @abstractmethod
    def model(self) -> str:
        pass


class OpenAIProvider(AIProvider):
    """OpenAI API provider"""
    
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        self.client = AsyncOpenAI(api_key=api_key)
        self._model = model
        self._name = "OpenAI"
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def model(self) -> str:
        return self._model
    
    async def generate_text(self, prompt: str, max_tokens: int = 2000) -> str:
        try:
            response = await self.client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")


class GroqProvider(AIProvider):
    """Groq API provider for LLaMA models"""
    
    def __init__(self, api_key: str, model: str = "llama-3.1-70b-versatile"):
        self.client = Groq(api_key=api_key)
        self._model = model
        self._name = "Groq"
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def model(self) -> str:
        return self._model
    
    async def generate_text(self, prompt: str, max_tokens: int = 2000) -> str:
        try:
            # Groq doesn't have async client yet, so we run in executor
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model=self._model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    temperature=0.7
                )
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")


class HuggingFaceProvider(AIProvider):
    """Hugging Face Inference API provider"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "microsoft/DialoGPT-large"):
        self.client = InferenceClient(token=api_key)
        self._model = model
        self._name = "Hugging Face"
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def model(self) -> str:
        return self._model
    
    async def generate_text(self, prompt: str, max_tokens: int = 2000) -> str:
        try:
            # Try with a free text generation model
            loop = asyncio.get_event_loop()
            
            # Try GPT-2 first (always available)
            try:
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.text_generation(
                        prompt=prompt[:1000],  # Limit input length
                        model="gpt2",
                        max_new_tokens=min(max_tokens, 512),
                        temperature=0.7,
                        return_full_text=False,
                        do_sample=True
                    )
                )
                return response or ""
            except:
                # Fallback to DistilGPT2
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.text_generation(
                        prompt=prompt[:500],
                        model="distilgpt2",
                        max_new_tokens=min(max_tokens, 256),
                        temperature=0.7,
                        return_full_text=False
                    )
                )
                return response or ""
                
        except Exception as e:
            raise Exception(f"Hugging Face API error: {str(e)}")


class MultiProviderAI:
    """Multi-provider AI system with automatic fallback"""
    
    def __init__(self):
        self.providers: List[AIProvider] = []
        self.current_provider_index = 0
        self._setup_providers()
    
    def _setup_providers(self):
        """Initialize available AI providers based on environment variables"""
        
        # Add Groq if API key exists (recommended - fast and free)
        if os.getenv("GROQ_API_KEY"):
            try:
                self.providers.append(GroqProvider(os.getenv("GROQ_API_KEY")))
            except Exception as e:
                print(f"Failed to initialize Groq provider: {e}")
        
        # Add OpenAI if API key exists
        if os.getenv("OPENAI_API_KEY"):
            try:
                self.providers.append(OpenAIProvider(os.getenv("OPENAI_API_KEY")))
            except Exception as e:
                print(f"Failed to initialize OpenAI provider: {e}")
        
        # Add Hugging Face (works without API key but with rate limits)
        try:
            self.providers.append(HuggingFaceProvider(os.getenv("HUGGINGFACE_API_KEY")))
        except Exception as e:
            print(f"Failed to initialize Hugging Face provider: {e}")
    
    async def generate_text(self, prompt: str, max_tokens: int = 2000) -> str:
        """Generate text using available providers with fallback"""
        if not self.providers:
            raise Exception("No AI providers available")
        
        last_error = None
        
        # Try each provider
        for attempt in range(len(self.providers)):
            provider = self.providers[self.current_provider_index]
            
            try:
                print(f"🤖 Trying {provider.name} ({provider.model})...")
                result = await provider.generate_text(prompt, max_tokens)
                
                if result and len(result.strip()) > 50:
                    print(f"✅ Successfully generated text with {provider.name}")
                    return result
                else:
                    print(f"⚠️  {provider.name} returned insufficient content")
                    
            except Exception as e:
                print(f"❌ {provider.name} failed: {str(e)}")
                last_error = e
                
            # Move to next provider
            self.current_provider_index = (self.current_provider_index + 1) % len(self.providers)
        
        raise Exception(f"All AI providers failed. Last error: {last_error}")
    
    async def generate_blog(self, repo_data: str, custom_prompt: str = "") -> str:
        """Generate a complete blog post from repository data"""
        prompt = self._build_blog_prompt(repo_data, custom_prompt)
        return await self.generate_text(prompt, max_tokens=4000)
    
    def _build_blog_prompt(self, repo_data: str, custom_prompt: str = "") -> str:
        """Build optimized prompt for blog generation"""
        base_prompt = f"""
You are a technical blog writer. Create an engaging, informative blog post about this GitHub repository.

REPOSITORY DATA:
{repo_data[:15000]}  # Limit to prevent token overflow

INSTRUCTIONS:
- Write a comprehensive blog post (1500-2000 words)
- Include clear sections: Introduction, Features, Technical Analysis, Usage Examples, Conclusion
- Use markdown formatting with proper headers
- Make it engaging for developers
- Highlight key code patterns and architecture decisions
- Include code snippets where relevant
- Keep the tone professional but approachable
- Focus on what makes this project unique and valuable

{f"ADDITIONAL REQUIREMENTS: {custom_prompt}" if custom_prompt else ""}

Generate the complete blog post in markdown format:
"""
        return base_prompt
    
    def get_available_providers(self) -> List[str]:
        """Get list of available provider names"""
        return [f"{p.name} ({p.model})" for p in self.providers]
    
    def get_current_provider(self) -> str:
        """Get current provider name"""
        if self.providers:
            provider = self.providers[self.current_provider_index]
            return f"{provider.name} ({provider.model})"
        return "None"
