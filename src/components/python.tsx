import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import type { PyodideInterface } from 'pyodide';

interface PythonEditorProps {
  initialCode?: string;
  className?: string;
}

const defaultCode = `# Write your Python code here and click "Run" to execute
print("Hello, World!")

# Try some Python examples:
for i in range(5):
    print(f"Count: {i}")

# Math operations
import math
print(f"Pi is approximately {math.pi:.4f}")

# List comprehension
squares = [x**2 for x in range(1, 6)]
print(f"Squares: {squares}")
`;

export const PythonEditor = ({ 
  initialCode = defaultCode, 
  className = "" 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Pyodide
    const initPyodide = async () => {
      try {
        setOutput('Loading Python environment...');
        const { loadPyodide } = await import('pyodide');
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/"
        });
        
        // Redirect stdout to capture print statements
        pyodideInstance.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.output = StringIO()
    
    def write(self, text):
        self.output.write(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        return self.output.getvalue()
    
    def clear(self):
        self.output = StringIO()

# Set up output capture
_output_capture = OutputCapture()
sys.stdout = _output_capture
sys.stderr = _output_capture
        `);
        
        setPyodide(pyodideInstance);
        setIsLoading(false);
        setOutput('Python environment loaded successfully! Ready to run code.');
      } catch (error) {
        console.error('Failed to load Pyodide:', error);
        setOutput(`Failed to load Python environment: ${error}`);
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        python(),
        oneDark,
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Menlo', monospace",
            backgroundColor: '#1e1e1e',
          },
          '.cm-content': {
            padding: '16px 12px',
            caretColor: '#2cbb5d',
          },
          '.cm-activeLine': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
          '.cm-gutters': {
            backgroundColor: '#1e1e1e',
            color: '#6e7681',
            border: 'none',
            paddingRight: '8px',
          },
          '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 8px 0 12px',
            minWidth: '40px',
          },
          '.cm-focused': {
            outline: 'none',
          },
          '.cm-scroller': {
            overflow: 'auto',
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Menlo', monospace",
            lineHeight: '1.6',
          },
          '.cm-line': {
            padding: '0 4px',
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [initialCode]);

  const runCode = async () => {
    if (!viewRef.current || !pyodide) return;
    
    setIsRunning(true);
    setOutput('Running...');
    
    const code = viewRef.current.state.doc.toString();
    
    try {
      // Clear previous output
      pyodide.runPython('_output_capture.clear()');
      
      // Execute the user's code
      pyodide.runPython(code);
      
      // Get the captured output
      const result = pyodide.runPython('_output_capture.get_output()');
      
      if (result.trim()) {
        setOutput(result);
      } else {
        setOutput('Code executed successfully (no output)');
      }
    } catch (error) {
      // Get error output from stderr
      const errorOutput = pyodide.runPython('_output_capture.get_output()');
      setOutput(`Error: ${error}\n${errorOutput}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  const resetCode = () => {
    if (viewRef.current) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: defaultCode
        }
      });
      viewRef.current.dispatch(transaction);
    }
  };

  return (
    <div className={`flex h-screen bg-[#1a1a1a] ${className}`}>
      {/* Left Panel - Editor */}
      <div className="flex-1 flex flex-col border-r border-[#2d2d2d]">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#2d2d2d]">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-white">Code</span>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Python 3.11</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={resetCode}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded transition-all"
              title="Reset to default code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          <div ref={editorRef} className="h-full" />
        </div>

        {/* Editor Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-t border-[#2d2d2d]">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
          </div>
          <button
            onClick={runCode}
            disabled={isRunning || isLoading || !pyodide}
            className="px-6 py-2 bg-[#2cbb5d] hover:bg-[#26a04f] disabled:bg-[#1a4d2e] disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-all flex items-center space-x-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Loading Python...</span>
              </>
            ) : isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Output */}
      <div className="w-[45%] flex flex-col bg-[#1e1e1e]">
        {/* Output Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#2d2d2d]">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">Console</span>
            {output && output !== 'Click "Run" to execute your Python code and see the output here...' && (
              <span className="px-2 py-0.5 text-xs bg-[#2d2d2d] text-gray-400 rounded">
                {output.split('\n').length} lines
              </span>
            )}
          </div>
          
          <button
            onClick={clearOutput}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded transition-all"
            title="Clear console"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Output Content */}
        <div 
          className="flex-1 p-4 bg-[#0d0d0d] text-[#d4d4d4] font-mono text-sm overflow-y-auto custom-scrollbar"
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              .custom-scrollbar::-webkit-scrollbar {
                width: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #0d0d0d;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #3d3d3d;
                border-radius: 5px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #4d4d4d;
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #3d3d3d #0d0d0d;
              }
            `
          }} />
          {output ? (
            <pre className="whitespace-pre-wrap leading-relaxed">
              {output.split('\n').map((line, i) => (
                <div key={i} className="flex hover:bg-[#1a1a1a] px-2 -mx-2 rounded">
                  <span className="text-gray-600 select-none mr-4 text-right" style={{ minWidth: '2rem' }}>
                    {i + 1}
                  </span>
                  <span className={line.toLowerCase().includes('error') ? 'text-red-400' : ''}>{line}</span>
                </div>
              ))}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Run your code to see the output</p>
              <p className="text-xs mt-2 text-gray-700">Press the "Run Code" button or use Ctrl+Enter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PythonEditor;