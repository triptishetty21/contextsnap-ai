import React, { useState } from 'react';

function App() {
  const [dirPath, setDirPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

  // New States for the Architectural Blueprint Generator
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [blueprintData, setBlueprintData] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!dirPath.trim()) return;

    setLoading(true);
    setError('');
    setScanResult(null);
    setBlueprintData(null); // Clear previous diagram state

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory_path: dirPath }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to parse directory structure.');
      setScanResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateBlueprint = async () => {
    if (!dirPath.trim()) return;
    setBlueprintLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory_path: dirPath }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to generate blueprint configuration.');
      setBlueprintData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBlueprintLoading(false);
    }
  };

  const getTokenColorClass = (tokens) => {
    if (tokens > 50000) return 'text-red-400 bg-red-950/30 border-red-800/50';
    if (tokens > 20000) return 'text-amber-400 bg-amber-950/30 border-amber-800/50';
    return 'text-emerald-400 bg-emerald-950/30 border-emerald-800/50';
  };

  // Helper to escape and encode the raw chart layout safely for the visualizer engine
  const getMermaidChartUrl = (chartCode) => {
    if (!chartCode) return '';
    return `https://images.gemini.api/v1/render/mermaid?code=${encodeURIComponent(chartCode)}&theme=dark`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-neutral-800 selection:text-white">
      {/* Structural Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              ContextSnap AI
            </span>
            <span className="text-xs font-mono px-2 py-0.5 bg-neutral-900 text-neutral-400 rounded-full border border-neutral-800">
              v1.0.0-Beta
            </span>
          </div>
        </div>
      </header>

      {/* Primary Workspace Layout */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Console Panel */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-900 backdrop-blur-sm space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Source Target</h2>
              <p className="text-sm text-neutral-400">Provide an absolute system directory path to ingest structural metadata.</p>
            </div>

            <form onSubmit={handleScan} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={dirPath}
                  onChange={(e) => setDirPath(e.target.value)}
                  placeholder="C:\Users\Username\Projects\my-app"
                  className="w-full bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neutral-700 font-mono transition-colors placeholder:text-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !dirPath.trim()}
                className="w-full bg-neutral-100 text-neutral-950 hover:bg-neutral-200 font-medium text-sm rounded-xl py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Analyzing Target Structure...' : 'Scan Repository'}
              </button>
            </form>

            {scanResult && (
              <button
                onClick={generateBlueprint}
                disabled={blueprintLoading}
                className="w-full bg-neutral-900 text-neutral-200 hover:bg-neutral-800 border border-neutral-800 font-medium text-sm rounded-xl py-3 transition-all duration-200 disabled:opacity-50"
              >
                {blueprintLoading ? 'Assembling Architecture...' : '🛠️ Generate Architecture Blueprint'}
              </button>
            )}

            {error && (
              <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-xs font-mono text-red-400 leading-relaxed">
                <span className="font-bold">Error encountered:</span> {error}
              </div>
            )}
          </div>
        </section>

        {/* Right Output Panel */}
        <section className="lg:col-span-7 space-y-6">
          {scanResult ? (
            <div className="space-y-6">
              {/* Aggregated Diagnostics Banner */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900">
                  <div className="text-xs text-neutral-400 font-medium">Root Node</div>
                  <div className="text-base font-semibold mt-1 truncate font-mono text-neutral-200">{scanResult.root}</div>
                </div>
                <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900">
                  <div className="text-xs text-neutral-400 font-medium">Index Count</div>
                  <div className="text-base font-semibold mt-1 font-mono text-neutral-200">{scanResult.total_files} files</div>
                </div>
                <div className={`p-4 rounded-xl border transition-colors duration-300 ${getTokenColorClass(scanResult.estimated_tokens)}`}>
                  <div className="text-xs font-medium opacity-80">Context Weight</div>
                  <div className="text-base font-bold mt-1 font-mono">~{scanResult.estimated_tokens.toLocaleString()} tk</div>
                </div>
              </div>

              {/* Dynamic Architecture Diagram Section */}
              {blueprintData && (
                <div className="bg-neutral-900/40 rounded-2xl border border-neutral-900 overflow-hidden p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-300">Generated Codebase Architecture</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{blueprintData.summary}</p>
                  </div>
                  
                  {/* Framework Tags */}
                  <div className="flex flex-wrap gap-2">
                    {blueprintData.frameworks.map((fw, index) => (
                      <span key={index} className="text-[10px] font-mono px-2 py-0.5 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded">
                        ⚡ {fw}
                      </span>
                    ))}
                  </div>

                  {/* Mermaid Visualizer Box */}
                  <div className="bg-neutral-950 rounded-xl border border-neutral-900 p-4 flex items-center justify-center overflow-x-auto min-h-[220px]">
                    <img 
                      src={getMermaidChartUrl(blueprintData.mermaid_chart)} 
                      alt="Architecture Diagram" 
                      className="max-w-full h-auto object-contain rounded"
                      onError={(e) => {
                        // Safe fallback layout if render api drops
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* File Allocation Tree Explorer */}
              <div className="bg-neutral-900/40 rounded-2xl border border-neutral-900 overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-900 bg-neutral-900/20 flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-300">Target File Index Mapping</h3>
                  <span className="text-xs font-mono text-neutral-500">Excluding platform rules (.git, node_modules)</span>
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-neutral-900/50 font-mono text-xs">
                  {scanResult.files.map((file, idx) => (
                    <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-neutral-900/20 transition-colors group">
                      <span className="text-neutral-300 group-hover:text-neutral-100 transition-colors truncate max-w-md">
                        {file.path}
                      </span>
                      <span className="text-neutral-500 text-[11px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900">
                        {file.size_chars.toLocaleString()} chars
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[360px] bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="text-sm font-medium text-neutral-400">Console Idle</div>
              <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                Provide a valid workspace directory path in the left interface element to parse system data.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;