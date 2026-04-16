import { useState, useCallback, useRef } from 'react';
import Editor from './components/Editor';
import './App.css';

// Piston API configuration
const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  cpp: "10.2.0"
};

function App() {
  const [roomId] = useState('syncspace-demo-room');
  const [activeUsers, setActiveUsers] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState("");
  const [errorOutput, setErrorOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  const editorRef = useRef(null);

  const handleUsersChange = useCallback((users) => {
    setActiveUsers(users);
  }, []);

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
  }, []);

  const executeCode = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    
    setIsRunning(true);
    setOutput("Executing code, please wait...");
    setErrorOutput("");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language === 'cpp' ? 'c++' : language,
          version: LANGUAGE_VERSIONS[language] || "*",
          files: [{ content: code }]
        })
      });

      const result = await response.json();
      
      if (result.run) {
          setOutput(result.run.stdout || (result.run.stderr ? "" : "Execution completed successfully with no output."));
          setErrorOutput(result.run.stderr || "");
      } else {
          setOutput("");
          setErrorOutput("Execution failed: " + result.message);
      }
    } catch (error) {
      setOutput("");
      setErrorOutput("Network Error connecting to Piston API: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e' }}>
      
      {/* Header Area */}
      <header style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'sans-serif' }}>SyncSpace | {roomId}</h2>
        
        <div className="users-container">
          {activeUsers.map((user, idx) => (
            <div 
              key={idx} 
              className="user-badge" 
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
          ))}
        </div>
      </header>

      {/* Toolbar Area */}
      <div style={{ padding: '0.5rem 1rem', backgroundColor: '#252526', borderBottom: '1px solid #333', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select 
          value={language} 
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{ 
            padding: '0.4rem 0.8rem', 
            borderRadius: '4px', 
            backgroundColor: '#3c3c3c', 
            color: 'white', 
            border: '1px solid #555', 
            fontSize: '0.9rem',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
        
        <button 
          onClick={executeCode} 
          disabled={isRunning}
          style={{ 
            padding: '0.4rem 1.2rem', 
            borderRadius: '4px', 
            backgroundColor: isRunning ? '#333' : '#0e639c', 
            color: 'white', 
            border: '1px solid #0e639c', 
            cursor: isRunning ? 'wait' : 'pointer', 
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s'
          }}
        >
          {isRunning ? 'Running...' : '▶ Run Code'}
        </button>
      </div>
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor 
            ref={editorRef}
            roomId={roomId} 
            language={language}
            onLanguageChange={handleLanguageChange}
            onUsersChange={handleUsersChange} 
          />
        </div>

        {/* Output Terminal */}
        <div style={{ 
          height: '30%', 
          backgroundColor: '#000000', 
          borderTop: '1px solid #333', 
          overflow: 'auto', 
          padding: '1rem', 
          fontFamily: "'Courier New', Courier, monospace", 
          fontSize: '0.9rem', 
          whiteSpace: 'pre-wrap' 
        }}>
          <div style={{ color: '#888', marginBottom: '0.8rem', userSelect: 'none', borderBottom: '1px dashed #333', paddingBottom: '0.4rem' }}>
            Terminal Output
          </div>
          
          {output && <div style={{ color: '#4CAF50' }}>{output}</div>}
          {errorOutput && <div style={{ color: '#f44336' }}>{errorOutput}</div>}
          
        </div>
        
      </main>
    </div>
  );
}

export default App;
