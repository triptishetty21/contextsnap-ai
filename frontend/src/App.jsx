import React, { useState } from 'react';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [blueprintData, setBlueprintData] = useState(null);
  const [error, setError] = useState('');

  // Handle HTML5 folder picker selection
  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Core file extensions we actually care about for architectural blueprints
    const activeExtensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.txt', '.md'];

    const validFiles = files.filter(file => {
      const path = file.webkitRelativePath.toLowerCase();
      const filename = file.name.toLowerCase();
      
      // 1. Instantly skip heavy, automated dependency directories
      const isJunkDir = path.includes('node_modules/') || 
                        path.includes('.git/') || 
                        path.includes('venv/') || 
                        path.includes('__pycache__/') ||
                        path.includes('dist/') ||
                        path.includes('build/');
                        
      // 2. Only pull matching software engineering files
      const hasValidExtension = activeExtensions.some(ext => filename.endsWith(ext));

      return !isJunkDir && hasValidExtension;
    });

    setSelectedFiles(validFiles);
    setError('');
    setScanResult(null);
    setBlueprintData(null);
  };

  const handleUploadAndScan = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setError('');

    // Use FormData to stream physical file blobs over HTTP
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file, file.webkitRelativePath || file.name);
    });

    try {
      // NOTE: We will change this URL once your backend is deployed to the cloud!
      const response = await fetch('http://127.0.0.1:8000/api/v1/upload-scan', {
        method: 'POST',
        body: formData, // Browser sets the correct multipart/form-data boundary headers
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Cloud ingestion failed.');

      // The cloud server returns both structural metrics and the blueprint matching layout
      setScanResult(data.metrics);
      setBlueprintData(data.blueprint);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTokenColorClass = (tokens) => {
    if (tokens > 50000) return 'text-red-400 bg-red-950/30 border-red-800/50';
    if (tokens > 20000) return 'text-amber-400 bg-amber-950/30 border-amber-800/50';
    return 'text-emerald-400 bg-emerald-950/30 border-emerald-800/50';
  };

  const getMermaidChartUrl = (chartCode) => {
    if (!chartCode) return '';
    return `https://images.gemini.api/v1/render/mermaid?code=${encodeURIComponent(chartCode)}&theme=dark`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-white">
      <header className="border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              ContextSnap AI Cloud
            </span>
            <span className="text-xs font-mono px-2 py-0.5 bg-emerald-950/20 text-emerald-400 rounded-full border border-emerald-800/30">
              Live Cloud v2.0
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Control Column */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-900 backdrop-blur-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Upload Codebase</h2>
              <p className="text-sm text-neutral-400">Select a local repository folder to ingest and map into structural cloud context.</p>
            </div>

            <form onSubmit={handleUploadAndScan} className="space-y-4">
              <div className="group relative border-2 border-dashed border-neutral-800 hover:border-neutral-700 transition-colors rounded-xl p-6 text-center cursor-pointer bg-neutral-950/40">
                <input
                  type="file"
                  id="folder-upload"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleFolderChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="text-2xl">📁</div>
                  <div className="text-sm font-medium text-neutral-300">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : "Click to select local directory"}
                  </div>
                  <p className="text-xs text-neutral-500">System files (.git, node_modules) are filtered automatically</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || selectedFiles.length === 0}
                className="w-full bg-neutral-100 text-neutral-950 hover:bg-neutral-200 font-medium text-sm rounded-xl py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Processing Cloud Blueprint...' : 'Upload & Generate Structure'}
              </button>
            </form>

            {error && (
              <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-xs font-mono text-red-400 leading-relaxed">
                <span className="font-bold">Ingestion Error:</span> {error}
              </div>
            )}
          </div>
        </section>

        {/* Right Output Column */}
        <section className="lg:col-span-7 space-y-6">
          {scanResult ? (
            <div className="space-y-6">
              {/* Analytics Banner */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900">
                  <div className="text-xs text-neutral-400 font-medium">Repository Node</div>
                  <div className="text-base font-semibold mt-1 truncate font-mono text-neutral-200">{scanResult.root}</div>
                </div>
                <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900">
                  <div className="text-xs text-neutral-400 font-medium">Parsed Count</div>
                  <div className="text-base font-semibold mt-1 font-mono text-neutral-200">{scanResult.total_files} files</div>
                </div>
                <div className={`p-4 rounded-xl border transition-colors duration-300 ${getTokenColorClass(scanResult.estimated_tokens)}`}>
                  <div className="text-xs font-medium opacity-80">Context Footprint</div>
                  <div className="text-base font-bold mt-1 font-mono">~{scanResult.estimated_tokens.toLocaleString()} tk</div>
                </div>
              </div>

              {/* Dynamic Architecture Panel */}
              {blueprintData && (
                <div className="bg-neutral-900/40 rounded-2xl border border-neutral-900 overflow-hidden p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-300">Inferred System Architecture Blueprint</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{blueprintData.summary}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {blueprintData.frameworks.map((fw, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded">
                        ⚡ {fw}
                      </span>
                    ))}
                  </div>

                  <div className="bg-neutral-950 rounded-xl border border-neutral-900 p-4 flex items-center justify-center overflow-x-auto min-h-[220px]">
                    <img 
                      src={getMermaidChartUrl(blueprintData.mermaid_chart)} 
                      alt="Architecture Diagram" 
                      className="max-w-full h-auto object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[360px] bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="text-sm font-medium text-neutral-400">Cloud Engine Disarmed</div>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                Select a local code directory folder on the left interface module to safely stream memory binaries to the architecture compiler.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;