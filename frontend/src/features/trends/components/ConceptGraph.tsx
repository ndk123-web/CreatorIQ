import React, { useState } from 'react';
import { cleanTrendTitle } from '../../../lib/cleanTrendTitle';
import {
  Target,
  TrendingUp,
  Users,
  Layers,
  BarChart3,
  DollarSign,
  Info,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ConceptGraphProps {
  trend: {
    topic: string;
    archetype?: string;
    niches?: string[];
    velocity?: string;
    opportunity_score?: number;
    tvs_score?: number;
    volume?: string;
    stability_score?: number;
    vector_similarity?: number;
  };
  className?: string;
}

interface GraphNode {
  id: string;
  label: string;
  category: string;
  value: string;
  status: 'high' | 'medium' | 'optimal';
  x: number;
  y: number;
  icon: React.ElementType;
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({ trend, className }) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const conceptTitle = cleanTrendTitle(trend.topic);
  const oppScore = Math.round(trend.opportunity_score ?? trend.tvs_score ?? 78);
  const vectorMatch = (trend as any).vector_similarity
    ? Math.round((trend as any).vector_similarity * 100)
    : 92;

  // Radial positioning around center (cx=400, cy=200 on 800x400 viewBox)
  const nodes: GraphNode[] = [
    {
      id: 'velocity',
      label: 'Search Velocity',
      category: 'Momentum',
      value: trend.velocity || '245K/hr',
      status: 'high',
      x: 180,
      y: 90,
      icon: TrendingUp,
    },
    {
      id: 'audience',
      label: 'Audience Retention',
      category: 'Engagement',
      value: '72% at 0:30',
      status: 'optimal',
      x: 620,
      y: 90,
      icon: Users,
    },
    {
      id: 'niche',
      label: 'Category Cluster',
      category: 'Semantic Niche',
      value: trend.niches?.[0] || 'Tech / AI',
      status: 'optimal',
      x: 140,
      y: 280,
      icon: Layers,
    },
    {
      id: 'saturation',
      label: 'Market Density',
      category: 'Competition',
      value: 'Low (Early Window)',
      status: 'medium',
      x: 660,
      y: 280,
      icon: BarChart3,
    },
    {
      id: 'monetization',
      label: 'Monetization Depth',
      category: 'Commercial Fit',
      value: 'High RPM ($14-22)',
      status: 'optimal',
      x: 400,
      y: 340,
      icon: DollarSign,
    },
  ];

  const activeNode = nodes.find((n) => n.id === activeNodeId);

  return (
    <div className={cn('rounded-xl border border-[#242424] bg-[#0c0c0c] overflow-hidden', className)}>
      {/* Topology Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e1e1e] bg-[#111111] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-950/60 border border-indigo-700/40 text-indigo-400">
            <Target className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Concept Topology & Vector Graph
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] text-neutral-500 font-normal">
              Interactive relationship cluster mapping
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[11px] font-medium border transition-colors cursor-pointer',
              showGrid
                ? 'bg-[#181818] border-[#303030] text-neutral-300'
                : 'bg-transparent border-[#222222] text-neutral-500 hover:text-neutral-300'
            )}
          >
            Grid: {showGrid ? 'ON' : 'OFF'}
          </button>
          <div className="flex items-center gap-1.5 rounded-md bg-[#161616] border border-[#282828] px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{vectorMatch}% Vector Fit</span>
          </div>
        </div>
      </div>

      {/* SVG Visualization Canvas */}
      <div className="relative w-full aspect-[2/1] min-h-[300px] max-h-[420px] bg-[#090909] select-none">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="graph-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#161616" strokeWidth="0.75" />
            </pattern>

            {/* Radial glow around center */}
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>

            {/* Link Gradients */}
            <linearGradient id="linkGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e2e2e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#222222" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          {showGrid && <rect width="100%" height="100%" fill="url(#graph-grid)" />}

          {/* Ambient center pulse circle */}
          <circle cx="400" cy="200" r="140" fill="url(#centerGlow)" />
          <circle cx="400" cy="200" r="180" fill="none" stroke="#1c1c1c" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="400" cy="200" r="100" fill="none" stroke="#242424" strokeWidth="1" strokeDasharray="2 3" />

          {/* Connecting Links from Center to Nodes */}
          {nodes.map((node) => {
            const isHovered = activeNodeId === node.id;
            return (
              <g key={`link-${node.id}`}>
                <line
                  x1="400"
                  y1="200"
                  x2={node.x}
                  y2={node.y}
                  stroke={isHovered ? 'url(#linkGradActive)' : 'url(#linkGrad)'}
                  strokeWidth={isHovered ? 2.5 : 1.2}
                  strokeDasharray={isHovered ? 'none' : '4 3'}
                  className="transition-all duration-200"
                />
                {/* Mid-point signal particle */}
                <circle
                  cx={(400 + node.x) / 2}
                  cy={(200 + node.y) / 2}
                  r={isHovered ? 3 : 1.5}
                  fill={isHovered ? '#818cf8' : '#333333'}
                />
              </g>
            );
          })}

          {/* Peripheral Nodes */}
          {nodes.map((node) => {
            const isHovered = activeNodeId === node.id;
            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setActiveNodeId(node.id)}
                onMouseLeave={() => setActiveNodeId(null)}
                className="cursor-pointer group"
              >
                {/* Node Outer Ring */}
                <circle
                  r={isHovered ? 34 : 26}
                  fill="#141414"
                  stroke={isHovered ? '#6366f1' : '#282828'}
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-all duration-200"
                />
                {/* Node Inner Ring */}
                <circle
                  r={isHovered ? 28 : 22}
                  fill="#111111"
                  stroke={isHovered ? '#818cf8' : '#1f1f1f'}
                  strokeWidth={1}
                />
                {/* Node Status Dot */}
                <circle
                  cx="14"
                  cy="-14"
                  r="3.5"
                  fill={node.status === 'high' ? '#f59e0b' : '#10b981'}
                />

                {/* Node Label (Text below) */}
                <text
                  y="40"
                  textAnchor="middle"
                  fill={isHovered ? '#ffffff' : '#a1a1aa'}
                  fontSize="10"
                  fontWeight="600"
                  className="font-sora tracking-tight transition-colors"
                >
                  {node.label}
                </text>
                {/* Node Metric Value */}
                <text
                  y="52"
                  textAnchor="middle"
                  fill={isHovered ? '#818cf8' : '#71717a'}
                  fontSize="9"
                  fontWeight="500"
                  className="font-mono"
                >
                  {node.value}
                </text>
              </g>
            );
          })}

          {/* Central Target Concept Node */}
          <g transform="translate(400, 200)" className="cursor-pointer">
            {/* Pulsing ring */}
            <circle r="48" fill="#141329" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle r="40" fill="#100e24" stroke="#6366f1" strokeWidth="2" />
            <circle r="34" fill="#0d0c1e" />

            <text
              y="-6"
              textAnchor="middle"
              fill="#818cf8"
              fontSize="8"
              fontWeight="800"
              className="font-sora uppercase tracking-widest"
            >
              CORE CONCEPT
            </text>
            <text
              y="10"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="700"
              className="font-sora"
            >
              {oppScore}/100 Fit
            </text>
            <text
              y="22"
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize="8"
              fontWeight="500"
            >
              Qdrant Vector
            </text>
          </g>
        </svg>

        {/* Floating Node Details Card on Hover / Active */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs rounded-lg border border-[#282828] bg-[#121212]/95 backdrop-blur-md p-3 shadow-2xl transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-white">
                {activeNode ? activeNode.label : 'Active Concept Cluster'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {activeNode ? activeNode.category : 'System Topology'}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-neutral-300">
            {activeNode ? (
              <>
                Signals evaluate <span className="font-semibold text-white">{activeNode.value}</span>. Strong alignment with creator niche archetype.
              </>
            ) : (
              <>
                Target: <span className="font-semibold text-white">&ldquo;{conceptTitle}&rdquo;</span>. Hover over any node to inspect relationship telemetry.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
