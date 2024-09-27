"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const csvData = [
  { Op: "assign", ExampleSource: "a := b", ExampleIR: "assign, a, b" },
  { Op: "add", ExampleSource: "a + b", ExampleIR: "add, t, a, b" },
  { Op: "sub", ExampleSource: "a - b", ExampleIR: "sub, t, a, b" },
  { Op: "mult", ExampleSource: "a * b", ExampleIR: "mult, t, a, b" },
  { Op: "div", ExampleSource: "a / b", ExampleIR: "div, t, a, b" },
  { Op: "and", ExampleSource: "a & b", ExampleIR: "and, t, a, b" },
  { Op: "or", ExampleSource: "a | b", ExampleIR: "or, t, a, b" },
  { Op: "goto", ExampleSource: "break;", ExampleIR: "goto, after loop" },
  { Op: "breq", ExampleSource: "if(a <> b) then", ExampleIR: "breq, after if part, a, b" },
  { Op: "brneq", ExampleSource: "if(a = b) then", ExampleIR: "brneq, after if part, a, b" },
  { Op: "brlt", ExampleSource: "if(a >= b) then", ExampleIR: "brlt, after if part, a, b" },
  { Op: "brgt", ExampleSource: "if(a <= b) then", ExampleIR: "brgt, after if part, a, b" },
  { Op: "brgeq", ExampleSource: "if(a < b) then", ExampleIR: "brgeq, after if part, a, b" },
  { Op: "brleq", ExampleSource: "if(a > b) then", ExampleIR: "brleq, after if part, a, b" },
  { Op: "return", ExampleSource: "return a;", ExampleIR: "return, a" },
  { Op: "call", ExampleSource: "foo(x);", ExampleIR: "call, foo, x" },
  { Op: "callr", ExampleSource: "a := foo(x, y, z);", ExampleIR: "callr, a, foo, x, y, z" },
  { Op: "array store", ExampleSource: "arr[0] := a", ExampleIR: "array store, a, arr, 0" },
  { Op: "array load", ExampleSource: "a := arr[0]", ExampleIR: "array load, a, arr, 0" },
  { Op: "assign (array)", ExampleSource: "assign type ArrayInt = array [100] of int;", ExampleIR: "assign, X, 100, 10" },
  { Op: "geti", ExampleSource: "int geti()", ExampleIR: "Reads an integer from standard input." },
  { Op: "getf", ExampleSource: "float getf()", ExampleIR: "Reads a float from standard input." },
  { Op: "getc", ExampleSource: "int getc()", ExampleIR: "Reads a character as its ASCII value." },
  { Op: "puti", ExampleSource: "void puti(int i)", ExampleIR: "Prints an integer to standard output." },
  { Op: "putf", ExampleSource: "void putf(float f)", ExampleIR: "Prints a float to standard output." },
  { Op: "putc", ExampleSource: "void putc(int c)", ExampleIR: "Prints a character encoded as an ASCII value." },
]

const initialCode = `#start_function
void main():
int-list: a,b,c
float-list:
callr, a, geti
callr, b, geti
add, c, a, b
call, puti, c
#end_function`

export default function CodeCompiler() {
  const [code, setCode] = useState(initialCode)
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
    <>
    <head>
      <title>Compiler</title>
    </head>
    <div className="flex flex-col h-screen">
      <div className="flex-grow flex overflow-hidden">
        <div className="w-1/3 p-2 overflow-auto bg-gray-50 border-r">
          <h2 className="text-lg font-semibold mb-2">Instruction Reference</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/5">Op</TableHead>
                  <TableHead className="w-2/5">Example Source</TableHead>
                  <TableHead className="w-2/5">Example IR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.Op}</TableCell>
                    <TableCell>{row.ExampleSource}</TableCell>
                    <TableCell>{row.ExampleIR}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="w-2/3 p-2 flex flex-col">
          <h1 className="text-xl font-bold text-center mb-2">Code Compiler</h1>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-grow font-mono mb-2 resize-none"
            aria-label="Code input"
          />
          <Button 
            onClick={handleCompile} 
            className="w-full mb-2"
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
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm" role="alert">
              {error}
            </div>
          )}
          <div className="flex-grow overflow-auto">
            {output && (
              <div className="space-y-2">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Run Code:</h2>
                  <Input
                    type="text"
                    placeholder="Enter input for your code..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="mb-1"
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
                    <h2 className="text-lg font-semibold mb-1">Run Output:</h2>
                    <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">
                      {runOutput}
                    </pre>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold mb-1">Compilation Output:</h2>
                  <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto whitespace-pre-wrap text-sm">
                    {output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}