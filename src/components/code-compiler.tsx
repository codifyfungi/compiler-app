"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function CodeCompiler() {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isCompiling, setIsCompiling] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState("")
  const [userInput, setUserInput] = useState("")
  const [runOutput, setRunOutput] = useState("")

  const handleCompile = async () => {
    setIsCompiling(true)
    setError("")
    setOutput("")
    setRunOutput("")

    try {
      const file = new File([code], "code.txt", { type: "text/plain" })
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch('https://compilerrestapi.onrender.com/execute', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.text()
      setOutput(data || 'No output received from the compiler.')
    } catch (e) {
      setError(`An error occurred: ${(e as Error).message}`)
    } finally {
      setIsCompiling(false)
    }
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setError("")
    setRunOutput("")

    try {
      // First, save the input
      const saveInputResponse = await fetch('https://compilerrestapi.onrender.com/saveInput', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: userInput,
      })

      if (!saveInputResponse.ok) {
        throw new Error(`HTTP error! status: ${saveInputResponse.status}`)
      }

      // Then, execute the MIPS code
      const executeResponse = await fetch('https://compilerrestapi.onrender.com/mipsExecute', {
        method: 'GET',
      })

      if (!executeResponse.ok) {
        throw new Error(`HTTP error! status: ${executeResponse.status}`)
      }

      const data = await executeResponse.text()
      setRunOutput(data || 'No output received from running the code.')
    } catch (e) {
      setError(`An error occurred while running the code: ${(e as Error).message}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Code Compiler</h1>
      <Textarea
        placeholder="Enter your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="min-h-[200px] font-mono"
        aria-label="Code input"
      />
      <Button 
        onClick={handleCompile} 
        className="w-full"
        disabled={!code.trim() || isCompiling}
      >
        {isCompiling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Compiling...
          </>
        ) : (
          'Compile Code'
        )}
      </Button>
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}
      {output && (
        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Run Code:</h2>
            <Input
              type="text"
              placeholder="Enter input for your code..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="mb-2"
              aria-label="User input for code execution"
            />
            <Button 
              onClick={handleRunCode} 
              className="w-full"
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Code'
              )}
            </Button>
          </div>
          {runOutput && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Run Output:</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {runOutput}
              </pre>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold mb-2">Compilation Output:</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}