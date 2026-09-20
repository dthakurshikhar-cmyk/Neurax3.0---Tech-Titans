import React, { useState, useRef, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { 
  Search, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, 
  UserCheck, Briefcase, Award, FileText, GitBranch, Clock, 
  Layers, Lock, Database, Camera, Activity, ZoomIn, ZoomOut, RefreshCw
} from 'lucide-react';

export default function App() {
  const [targetName, setTargetName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('matrix');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const fgRef = useRef();

  // Color map inspired by Obsidian graph view tags/categories
  const getNodeColor = useCallback((type) => {
    switch (type) {
      case 'Person': return '#38bdf8';     // Obsidian Cyan / Target
      case 'Platform': return '#60a5fa';   // Soft Blue
      case 'Org': return '#34d399';        // Mint Emerald
      case 'Project': return '#c084fc';    // Vibrant Purple
      default: return '#fbbf24';           // Amber
    }
  }, []);

  // Format backend graph data for react-force-graph-2d
  const formattedGraphData = useMemo(() => {
    if (!report || !report.graph || !report.graph.nodes) {
      return { nodes: [], links: [] };
    }

    const nodes = report.graph.nodes.map((node) => ({
      id: String(node.id),
      name: node.label || node.id,
      type: node.type || 'Entity',
      color: getNodeColor(node.type),
      val: node.type === 'Person' ? 10 : 5 // Node radius multiplier
    }));

    const links = (report.graph.edges || []).map((edge) => ({
      source: String(edge.source),
      target: String(edge.target),
      label: edge.label || 'CONNECTED'
    }));

    return { nodes, links };
  }, [report?.graph, getNodeColor]);

  // Obsidian-style custom 2D Canvas rendering (Nodes + Glowing Halos + Labels)
  const drawNode = useCallback((node, ctx, globalScale) => {
    const radius = Math.sqrt(node.val || 5) * 2;
    const fontSize = Math.max(12 / globalScale, 3.5);

    // 1. Draw glowing outer halo (Obsidian node style)
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color + '33'; // 20% opacity
    ctx.fill();

    // 2. Draw core node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();

    // 3. Draw text label below node
    ctx.font = `${fontSize}px JetBrains Mono, monospace, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#e2e8f0'; // slate-200
    ctx.fillText(node.name, node.x, node.y + radius + 3);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInvestigate = async (e) => {
    e.preventDefault();
    if (!targetName || !selectedFile) {
      setError("Target Name and Seed Photo are required for verification.");
      return;
    }

    setError(null);
    setLoading(true);
    setReport(null);

    const formData = new FormData();
    formData.append('name', targetName);
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/api/investigate', {
        method: 'POST',
        body: formData,
      });

      const resData = await response.json();
      if (resData.success) {
        setReport(resData.data);
      } else {
        setError(resData.detail || "Investigation failed to execute.");
      }
    } catch (err) {
      setError("Cannot connect to backend server. Ensure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Canvas Control Actions
  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 300);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 300);
  const handleRecenter = () => fgRef.current?.zoomToFit(400, 40);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase">NEURAX :: OSINT Intelligence Console</h1>
            <p className="text-xs text-slate-400 font-mono">Facial Biometrics & Public Footprint Correlation Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 font-mono text-xs">
          <span className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SYSTEM ACTIVE</span>
          </span>
          <span className="text-slate-500">Domain 3: AI Cybersecurity</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Search & Ingestion Console */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur">
          <form onSubmit={handleInvestigate} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            
            {/* Target Name Input */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300 uppercase flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Candidate Name</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Satoshi Nakamoto"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Seed Image Upload */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300 uppercase flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Seed Image (Biometric Reference)</span>
              </label>
              <div className="flex items-center space-x-3">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden" 
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer rounded-lg px-3.5 py-2 text-xs font-mono text-slate-400 flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{selectedFile ? selectedFile.name : "Select JPEG / PNG seed photo..."}</span>
                  <span className="bg-slate-800 px-2 py-1 rounded text-slate-200">Browse</span>
                </label>
                {previewUrl && (
                  <img src={previewUrl} alt="Target Preview" className="w-9 h-9 rounded-md object-cover border border-cyan-500/40" />
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="lg:col-span-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-mono font-bold text-xs uppercase px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-900/20"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Dorking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Investigate</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2 text-rose-400 text-xs font-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Results Workspace */}
        {report && (
          <div className="space-y-6">
            
            {/* Identity Summary Header Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold font-mono text-slate-100">{report.primary_identity.name}</h2>
                  <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono px-2.5 py-0.5 rounded-full">
                    Entity ID Resolved
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{report.primary_identity.summary}</p>
                
                {/* Resolved Handles */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs font-mono text-slate-500 mr-1">Discovered Handles:</span>
                  {report.primary_identity.aliases.map((alias, idx) => (
                    <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono px-2 py-0.5 rounded">
                      @{alias}
                    </span>
                  ))}
                </div>
              </div>

              {/* Confidence Gauge */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Identity Verification Score</span>
                <div className="text-4xl font-bold font-mono text-cyan-400 mb-1">
                  {report.primary_identity.confidence_score}%
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden max-w-[180px]">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-1000"
                    style={{ width: `${report.primary_identity.confidence_score}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1.5">Derived from biometrics & source co-occurrence</span>
              </div>
            </div>

            {/* Discrepancy & Ambiguity Alerts */}
            {report.warnings_and_ambiguities?.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Ambiguity & False Match Warnings ({report.warnings_and_ambiguities.length})</span>
                </div>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono pl-1">
                  {report.warnings_and_ambiguities.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Workspace View Navigation Tabs */}
            <div className="flex space-x-2 border-b border-slate-800 pb-2">
              <button 
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'matrix' 
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Footprint Matrix</span>
              </button>

              <button 
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'timeline' 
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Roadmap Timeline</span>
              </button>

              <button 
                onClick={() => setActiveTab('graph')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                  activeTab === 'graph' 
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>2D Knowledge Graph (Obsidian Style)</span>
              </button>
            </div>

            {/* TAB CONTENT 1: FOOTPRINT MATRIX */}
            {activeTab === 'matrix' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Public Profiles Panel */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2 text-slate-200 font-mono text-xs font-bold uppercase">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span>Verified Public Profiles</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {report.verified_profiles.length} Accounts
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {report.verified_profiles.map((profile, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-mono font-bold text-slate-200">{profile.platform}</div>
                          <a href={profile.url} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center space-x-1">
                            <span className="truncate max-w-[220px]">{profile.url}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            profile.biometric_match_score >= 0.60
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            Biometric Match: {(profile.biometric_match_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professional Affiliations Panel */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2 text-slate-200 font-mono text-xs font-bold uppercase">
                      <Briefcase className="w-4 h-4 text-cyan-400" />
                      <span>Professional Affiliations & Roles</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {report.affiliations.map((aff, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-200">{aff.organization}</span>
                          <span className="text-[10px] font-mono text-slate-400">{aff.role}</span>
                        </div>
                        {aff.evidence_url && (
                          <a href={aff.evidence_url} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 flex items-center space-x-1">
                            <span>Evidence Trace URL</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events & Hackathons Panel */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2 text-slate-200 font-mono text-xs font-bold uppercase">
                      <Award className="w-4 h-4 text-cyan-400" />
                      <span>Events, Hackathons & Conferences</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {report.events_and_hackathons.map((ev, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono font-bold text-slate-200">{ev.event_name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{ev.role} ({ev.year})</div>
                        </div>
                        {ev.evidence_url && (
                          <a href={ev.evidence_url} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center space-x-1">
                            <span>Source</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects, Patents & Publications Panel */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2 text-slate-200 font-mono text-xs font-bold uppercase">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Projects, Patents & Publications</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {report.projects_and_patents.map((proj, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-mono font-bold text-slate-200">{proj.title}</div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase">{proj.type}</div>
                        </div>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center space-x-1">
                            <span>Inspect</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex items-center space-x-2 text-slate-200 font-mono text-xs font-bold uppercase border-b border-slate-800 pb-3">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Verified Chronological Digital Roadmap</span>
                </div>

                <div className="relative border-l-2 border-slate-800 pl-6 ml-3 space-y-6">
                  {report.timeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-cyan-400">{item.title}</span>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                        {item.source && (
                          <div className="pt-1">
                            <a href={item.source} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 flex items-center space-x-1">
                              <span>Traceable Source:</span>
                              <span className="truncate max-w-md">{item.source}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: OBSIDIAN-STYLE DYNAMIC 2D GRAPH */}
            {activeTab === 'graph' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-slate-200 font-mono text-xs font-bold uppercase">
                    <GitBranch className="w-4 h-4 text-cyan-400" />
                    <span>Obsidian 2D Force-Directed Graph View</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Nodes: {report.graph?.nodes?.length || 0} | Edges: {report.graph?.edges?.length || 0}
                  </span>
                </div>

                {/* 2D Canvas Graph Container */}
                <div className="w-full h-[580px] bg-[#090d16] border border-slate-800 rounded-lg relative overflow-hidden shadow-2xl">
                  
                  {/* Legend Overlay */}
                  <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-lg text-xs font-mono space-y-1.5 shadow-lg">
                    <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1">Entity Categories</p>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Person (Target)
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Platform
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Organization
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Project
                    </div>
                  </div>

                  {/* Obsidian Controls Panel */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded-lg shadow-lg">
                    <button 
                      onClick={handleZoomIn} 
                      title="Zoom In"
                      className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleZoomOut} 
                      title="Zoom Out"
                      className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleRecenter} 
                      title="Recenter View"
                      className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {formattedGraphData.nodes.length > 0 ? (
                    <ForceGraph2D
                      ref={fgRef}
                      graphData={formattedGraphData}
                      backgroundColor="#090d16"
                      nodeCanvasObject={drawNode}
                      nodePointerAreaPaint={(node, color, ctx) => {
                        const radius = Math.sqrt(node.val || 5) * 2 + 2;
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                        ctx.fill();
                      }}
                      
                      // Obsidian Edge Styling
                      linkColor={() => '#1e293b'}
                      linkWidth={1.2}
                      linkDirectionalParticles={2}
                      linkDirectionalParticleSpeed={0.005}
                      linkDirectionalParticleWidth={1.5}
                      linkDirectionalParticleColor={() => '#38bdf8'}
                      
                      // Canvas Interaction Behaviors
                      enableNodeDrag={true}
                      enableZoomPanInteraction={true}
                      cooldownTicks={100}
                      d3AlphaDecay={0.02}
                      d3VelocityDecay={0.3}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                      No relationship graph nodes available. Run an investigation to generate nodes.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
