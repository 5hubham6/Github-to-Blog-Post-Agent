'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Sparkles, FileText, Loader, CheckCircle, Rocket, Zap, Code2, BookOpen, Stars } from 'lucide-react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, extractRepoName } from '@/lib/utils'

interface ProgressUpdate {
  sessionId: string
  step: string
  message: string
  blogContent?: string
  workflow?: Array<{ step: string; status: string; details: string }>
}

// Floating particles component for background animation
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    delay: number;
    duration: number;
    x: number;
    y: number;
  }>>([])

  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setParticles(generatedParticles)
  }, [])

  if (particles.length === 0) {
    return null // Don't render anything during SSR
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-gradient-to-r from-white/40 to-gray-400/30 rounded-full shadow-lg"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, -100, -20],
            x: [-10, 10, -10],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Geometric shapes for 3D effect
const GeometricBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-white/15 to-gray-300/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-400/10 to-white/15 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-gray-500/8 to-white/8 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [repoUrl, setRepoUrl] = useState('')
  const [repoName, setRepoName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [ignoreFiles, setIgnoreFiles] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<ProgressUpdate[]>([])
  const [blogContent, setBlogContent] = useState('')
  const [currentStep, setCurrentStep] = useState('')

  useEffect(() => {
    // Initialize socket connection to backend on port 3001
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.on('progress', (data: ProgressUpdate) => {
      setProgress((prev: ProgressUpdate[]) => [...prev, data])
      setCurrentStep(data.step)
      
      if (data.blogContent) {
        setBlogContent(data.blogContent)
      }
      
      if (data.step === 'completed') {
        setIsGenerating(false)
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (repoUrl) {
      const name = extractRepoName(repoUrl)
      if (name) {
        setRepoName(name)
      }
    }
  }, [repoUrl])

  const handleGenerate = async () => {
    if (!repoUrl || !repoName) return

    setIsGenerating(true)
    setProgress([])
    setBlogContent('')
    setCurrentStep('')

    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          repoName,
          customPrompt: customPrompt || undefined,
          ignoreFiles: ignoreFiles || undefined,
        }),
        mode: 'cors',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Generation started successfully:', result)
    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to start blog generation: ${errorMessage}`)
    }
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'repository-analysis':
        return <Code2 className="h-4 w-4" />
      case 'ai-analysis':
        return <Zap className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Loader className="h-4 w-4 animate-spin" />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Animated 3D Background */}
      <GeometricBackground />
      <FloatingParticles />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative border-b border-gray-700/50 bg-black/40 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="p-3 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-2xl border border-gray-600/50"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <BookOpen className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  AI Blog Generator
                </motion.h1>
                <p className="text-gray-300/90 text-lg">Transform GitHub repositories into professional blogs</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="relative container mx-auto px-4 py-16">
        {/* Main Content - Centered */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Create Amazing Blogs
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Powered by advanced AI models to analyze your code and generate professional blog posts in minutes
            </motion.p>
          </motion.div>

          {/* Repository Details Section - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-16"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-full max-w-2xl"
            >
              <Card className="shadow-2xl border border-gray-600/30 bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-gray-400/5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center justify-center space-x-3 text-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Github className="h-6 w-6 text-gray-300" />
                    </motion.div>
                    <span className="text-xl">Repository Details</span>
                  </CardTitle>
                  <CardDescription className="text-center text-gray-300/80 text-base">
                    Enter your GitHub repository URL to generate a professional blog post
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="text-sm font-medium text-gray-200">Repository URL</label>
                    <Input
                      placeholder="https://github.com/username/repository"
                      value={repoUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
                      className="bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-400/70 h-12 text-lg backdrop-blur-sm focus:border-gray-400 focus:ring-gray-400/20 transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="text-sm font-medium text-gray-200">Repository Name</label>
                    <Input
                      placeholder="Repository display name"
                      value={repoName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoName(e.target.value)}
                      className="bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-400/70 h-12 text-lg backdrop-blur-sm focus:border-gray-400 focus:ring-gray-400/20 transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="text-sm font-medium text-gray-200">Custom Prompt (Optional)</label>
                    <Textarea
                      placeholder="Add specific instructions for the AI..."
                      value={customPrompt}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomPrompt(e.target.value)}
                      className="bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-400/70 min-h-[100px] backdrop-blur-sm focus:border-gray-400 focus:ring-gray-400/20 transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="text-sm font-medium text-gray-200">Ignore Files (Optional)</label>
                    <Input
                      placeholder="node_modules, .env, *.log"
                      value={ignoreFiles}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIgnoreFiles(e.target.value)}
                      className="bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-400/70 h-12 text-lg backdrop-blur-sm focus:border-gray-400 focus:ring-gray-400/20 transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={handleGenerate} 
                      disabled={!repoUrl || !repoName || isGenerating}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-gray-700 via-gray-800 to-black hover:from-gray-600 hover:via-gray-700 hover:to-gray-900 transform transition-all duration-300 rounded-xl shadow-2xl border border-gray-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    >
                      <AnimatePresence mode="wait">
                        {isGenerating ? (
                          <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-3"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader className="h-5 w-5" />
                            </motion.div>
                            <span>Generating Blog...</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="generate"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-3"
                          >
                            <motion.div
                              animate={{ 
                                rotate: [0, -10, 10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Rocket className="h-5 w-5" />
                            </motion.div>
                            <span>Generate Blog Post</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Progress and Results Section */}
          {(isGenerating || progress.length > 0 || blogContent) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Progress Tracker */}
              {(isGenerating || progress.length > 0) && (
                <Card className="shadow-2xl border border-gray-600/30 bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center space-x-3 text-white">
                      <FileText className="h-6 w-6 text-gray-300" />
                      <span className="text-xl">Generation Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {progress.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-start space-x-3 p-4 rounded-lg bg-gray-800/30 border border-gray-700/30"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getStepIcon(item.step)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">
                                {item.step.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-sm text-gray-300/80 mt-1">{item.message}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blog Output */}
              {blogContent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-2xl border border-gray-600/30 bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                          <span className="text-xl">Generated Blog Post</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(blogContent)}
                          className="bg-gray-700/50 border-gray-600/30 text-white hover:bg-gray-600/50"
                        >
                          Copy
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/40 rounded-lg p-4 border border-gray-700/30 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
                          {blogContent}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                Why Choose AI Blog Generator?
              </h3>
              <p className="text-gray-300/80 text-lg max-w-2xl mx-auto">
                Professional blog posts from your GitHub repositories in minutes
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: "Lightning Fast",
                  description: "Generate comprehensive blog posts in under 2 minutes"
                },
                {
                  icon: <Stars className="h-8 w-8" />,
                  title: "AI Powered",
                  description: "Uses advanced AI models to analyze and understand your code"
                },
                {
                  icon: <Github className="h-8 w-8" />,
                  title: "GitHub Native",
                  description: "Direct integration with GitHub repositories and documentation"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="text-center p-8 border border-gray-600/30 bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-700/40 to-gray-800/40 text-gray-300 rounded-2xl mb-6 border border-gray-600/20">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold text-white text-xl mb-3">{feature.title}</h4>
                    <p className="text-gray-300/80 text-base">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
