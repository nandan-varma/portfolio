import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import styles from './python.module.css';



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
            fontSize: '14px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          },
          '.cm-content': {
            padding: '16px',
            minHeight: '300px',
          },
          '.cm-focused': {
            outline: 'none',
          },
          '.cm-editor': {
            borderRadius: '8px',
          },
          '.cm-scroller': {
            borderRadius: '8px',
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
    <div className={`python-editor bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
            Python Code Runner
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={resetCode}
            className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={clearOutput}
            className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={runCode}
            disabled={isRunning || isLoading || !pyodide}
            className="px-4 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div ref={editorRef} className="min-h-[300px]" />
      </div>

      {/* Output Panel */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output:</h3>
        </div>
        <div
          className={`p-4 bg-gray-900 text-green-400 font-mono text-sm h-80 overflow-y-scroll ${styles.outputPanel}`}>
          <pre className="whitespace-pre-wrap">
            {output || 'Click "Run" to execute your Python code and see the output here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PythonEditor;