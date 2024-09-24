"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const exampleCode = `#start_function
void quicksort(int[100] A, int lo, int hi):
int-list: mid, pivot, i, j, ti, tj, x, j1
float-list:
    assign, i, 0
    assign, j, 0
    brgeq, end, lo, hi
    add, mid, lo, hi
    div, mid, mid, 2
    array_load, pivot, A, mid
    sub, i, lo, 1
    add, j, hi, 1
loop0:
loop1:
    add, i, i, 1
    array_load, x, A, i
    assign, ti, x
    brlt, loop1, ti, pivot
loop2:
    sub, j, j, 1
    array_load, x, A, j
    assign, tj, x
    brgt, loop2, tj, pivot
    brgeq, exit0, i, j
    array_store, ti, A, j
    array_store, tj, A, i
    goto, loop0
exit0:
    add, j1, j, 1
    call, quicksort, A, lo, j
    add, j, j, 1
    call, quicksort, A, j, hi
end:
#end_function

#start_function
void main():
int-list: A[100], n, i, t
float-list:
    assign, t, 0
    callr, n, geti
    brgt, return, n, 100
    sub, n, n, 1
    assign, i, 0
loop0:
    brgt, exit0, i, n
    callr, t, geti
    array_store, t, A, i
    add, i, i, 1
    goto, loop0
exit0:
    call, quicksort, A, 0, n
    assign, i, 0
loop1:
    brgt, exit1, i, n
    array_load, t, A, i
    call, puti, t
    call, putc, 10
    add, i, i, 1
    goto, loop1
exit1:
return:
#end_function`

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
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      <div className="w-full lg:w-2/5 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-center mb-4">Code Compiler</h1>
        <Textarea
          placeholder="Enter your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="min-h-[300px] font-mono mb-4"
          aria-label="Code input"
        />
        <Button 
          onClick={handleCompile} 
          className="w-full mb-4"
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
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}
        {output && (
          <div className="space-y-4">
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
      <div className="w-full lg:w-3/5 p-4 bg-gray-50 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">Example Code:</h2>
        <pre className="bg-white p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-sm border border-gray-200 shadow-inner">
          {exampleCode}
        </pre>
      </div>
    </div>
  )
}