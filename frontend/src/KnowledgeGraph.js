import React, { useRef, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

const KnowledgeGraph3D = ({ graphData }) => {
  const fgRef = useRef();

  // Transform backend nodes and edges into the format react-force-graph-3d expects
  const formattedData = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], links: [] };

    const nodes = graphData.nodes.map(node => ({
      id: String(node.id),
      name: node.label || node.id,
      type: node.type || 'Entity',
      // Obsidian-style color coding by node category
      color: node.type === 'Person' ? '#f43f5e' :      // Red / Pink
             node.type === 'Platform' ? '#3b82f6' :    // Blue
             node.type === 'Org' ? '#10b981' :         // Emerald Green
             node.type === 'Project' ? '#a855f7' :     // Purple
             '#f59e0b',                                // Amber
      val: node.type === 'Person' ? 12 : 6
    }));

    const links = (graphData.edges || []).map(edge => ({
      source: String(edge.source),
      target: String(edge.target),
      label: edge.label || 'CONNECTED'
    }));

    return { nodes, links };
  }, [graphData]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="w-full h-[500px] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500">
        No relationship graph available yet. Run an investigation to generate nodes.
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
      {/* Controls Overlay Legend */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-800 p-3 rounded-lg text-xs space-y-1">
        <p className="font-semibold text-slate-300 border-b border-slate-800 pb-1 mb-2">3D Knowledge Graph</p>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Person</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Platform</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Organization</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Project</div>
        <p className="text-[10px] text-slate-500 pt-2">Rotate: Left-Click + Drag | Zoom: Scroll | Pan: Right-Click + Drag</p>
      </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={formattedData}
        backgroundColor="#020617"
        
        // Node Customization
        nodeLabel={node => `${node.name} (${node.type})`}
        nodeColor={node => node.color}
        nodeRelSize={4}
        
        // Link Customization
        linkWidth={1.5}
        linkColor={() => '#334155'}
        linkLabel={link => link.label}
        
        // Animated pulses flowing through connections (Obsidian style)
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#60a5fa'}
        
        // Interaction settings
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={false}
      />
    </div>
  );
};

export default KnowledgeGraph3D;
