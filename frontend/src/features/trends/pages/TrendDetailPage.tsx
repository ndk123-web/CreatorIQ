import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTrendsStore } from '../../../stores/useTrendsStore';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Alert } from '../../../components/ui/Alert';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Sparkles,
  Bookmark,
  Flame,
  GitFork,
  Target,
} from 'lucide-react';

import { cleanTrendTitle, resolveVideoConcept } from '../../../lib/cleanTrendTitle';
import { TrendForecastChart } from '../components/TrendForecastChart';

export const TrendDetailPage: React.FC = () => {
  const { trendId } = useParams<{ trendId: string }>();
  const navigate = useNavigate();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const {
    trendDetail,
    isDetailLoading,
    detailError,
    trendForecast,
    isForecastLoading,
    fetchTrendDetail,
    fetchTrendForecast,
    clearTrendDetail,
    toggleSaveTrend,
  } = useTrendsStore();

  useEffect(() => {
    if (trendId) {
      fetchTrendDetail(trendId);
      fetchTrendForecast(trendId);
    }
    return () => clearTrendDetail();
  }, [trendId]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center py-28 text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  if (detailError || !trendDetail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/trends')}>
          <ArrowLeft className="h-4 w-4" />
          Back to trends
        </Button>
        <Alert variant="error">{detailError ?? 'Trend not found'}</Alert>
      </div>
    );
  }

  const trend = trendDetail;

  return (
    <div className="space-y-6 animate-in text-[#ededed]">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/trends')} className="text-neutral-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to trends
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleSaveTrend(trend.id)}
          >
            <Bookmark className="h-3.5 w-3.5" />
            {trend.saved ? 'Saved' : 'Save'}
          </Button>
          <Link
            to="/app/strategy"
            state={{ topic: cleanTrendTitle(trend.topic), autoGenerate: true }}
          >
            <Button size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Generate Strategy
            </Button>
          </Link>
        </div>
      </div>

      <PageHeader
        title={cleanTrendTitle(trend.topic)}
        description={trend.headline && trend.headline !== trend.topic ? trend.headline : undefined}
        badge={
          <div className="mb-2 flex flex-wrap gap-1.5">
            {trend.niches?.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
            <Badge variant="brand" className="capitalize">{trend.archetype}</Badge>
            {trend.creator_tier && (
              <Badge variant="neutral" className="capitalize">
                {trend.creator_tier} creator
              </Badge>
            )}
            {(trend as any).vector_similarity && (
              <Badge variant="success">
                {Math.round((trend as any).vector_similarity * 100)}% Vector Match
              </Badge>
            )}
            {trend.is_momentum_outlier && (
              <Badge variant="warning" className="gap-1">
                <Flame className="h-3 w-3" />
                Breakout Spike
              </Badge>
            )}
          </div>
        }
      />

      {trend.is_youtube_video && trend.channel_name && (
        <p className="text-xs text-neutral-400">
          Trending via <span className="font-semibold text-neutral-200">{trend.channel_name}</span>
          {trend.video_url && (
            <a
              href={trend.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-indigo-400 hover:underline"
            >
              Watch source video <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </p>
      )}

      {/* SECTION 1: "That Card / Concept Graph" (Wireframe Top Container) */}
      <div className="space-y-6">
        <div className="rounded-xl border border-[#242424] bg-[#111111] p-4 text-[#ededed]">
          <div className="mb-3 px-1 flex items-center justify-between border-b border-[#1c1c1c] pb-2.5">
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Concept Topology & Opportunity Curve
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
              <span>Fit Score:</span>
              <span className="rounded bg-[#1a1a1a] px-2 py-0.5 font-bold text-white border border-[#2c2c2c]">
                {Math.round(trend.opportunity_score ?? trend.tvs_score)}/100
              </span>
            </div>
          </div>

          {/* Analytical Concept Relationship Graph View */}
          <div className="mb-4 rounded-lg border border-[#202020] bg-[#0c0c0c] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              Concept Semantic Cluster
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 py-3 sm:gap-4">
              <div className="rounded-lg border border-[#2c2c2c] bg-[#161616] px-3 py-2 text-center shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Niche Domain</span>
                <span className="text-xs font-semibold text-neutral-300">
                  {trend.niches?.[0] || 'Content Category'}
                </span>
              </div>
              <span className="text-neutral-600">→</span>
              <div className="rounded-lg border border-indigo-500/40 bg-[#16152b] px-3.5 py-2 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block flex items-center justify-center gap-1">
                  <Target className="h-2.5 w-2.5" /> Target Concept
                </span>
                <span className="text-xs font-bold text-white">
                  {cleanTrendTitle(trend.topic)}
                </span>
              </div>
              <span className="text-neutral-600">→</span>
              <div className="rounded-lg border border-[#2c2c2c] bg-[#161616] px-3 py-2 text-center shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Video Angle</span>
                <span className="text-xs font-semibold text-neutral-300">
                  {trend.archetype || 'Explainer'}
                </span>
              </div>
            </div>
          </div>

          {/* Trajectory Forecast Chart */}
          {isForecastLoading ? (
            <Card variant="elevated" className="flex items-center justify-center p-12 border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Calculating 30-day concept velocity & trajectory curve...
              </div>
            </Card>
          ) : trendForecast ? (
            <TrendForecastChart forecast={trendForecast} trend={trend} />
          ) : null}
        </div>

        {/* SECTION 2: 2 Parameter Cards Grid (Estimated Views + Other Card Parameters) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: Estimated Views Potential */}
          <Card variant="elevated" className="border-[#242424] bg-[#121212] p-5">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Estimated Views Potential
              </h2>
              <Badge variant="brand" className="text-[9px]">
                Algorithm Range
              </Badge>
            </div>
            <div className="mt-4 space-y-3.5">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-white metric">
                  {trend.volume || '10K - 50K'}
                </span>
                <span className="ml-2 text-xs text-neutral-400 font-medium">Estimated Reach</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="rounded-lg border border-[#242424] bg-[#161616] p-3">
                  <span className="text-[11px] text-neutral-500 font-medium">Shorts Potential</span>
                  <p className="mt-1 text-sm font-bold text-neutral-200">15K - 75K views</p>
                </div>
                <div className="rounded-lg border border-[#242424] bg-[#161616] p-3">
                  <span className="text-[11px] text-neutral-500 font-medium">Long-form Potential</span>
                  <p className="mt-1 text-sm font-bold text-neutral-200">5K - 25K views</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Other Concept Parameters & Metrics */}
          <Card variant="elevated" className="border-[#242424] bg-[#121212] p-5">
            <div className="flex items-center justify-between border-b border-[#1e1e1e] pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Other Concept Parameters & Fit
              </h2>
              <Badge variant="neutral" className="text-[9px]">
                Vector Metrics
              </Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-neutral-500 font-medium">Opportunity Score</dt>
                <dd className="mt-1 text-xl font-bold text-white metric">
                  {Math.round(trend.opportunity_score ?? trend.tvs_score)}/100
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 font-medium">Search Velocity</dt>
                <dd className="mt-1 text-base font-bold text-neutral-200">{trend.velocity}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 font-medium">Vector Niche Fit</dt>
                <dd className="mt-1 font-semibold text-emerald-400">
                  {(trend as any).vector_similarity ? `${Math.round((trend as any).vector_similarity * 100)}% Match` : 'High Niche Match'}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 font-medium">Archetype</dt>
                <dd className="mt-1 font-semibold text-neutral-200 capitalize">{trend.archetype}</dd>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#1e1e1e]">
                <dt className="text-neutral-500 font-medium">Stability Score</dt>
                <dd className="mt-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#1e1e1e]">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${trend.stability_score ?? 65}%` }}
                    />
                  </div>
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* SECTION 3: Trend Details / Evidence Breakdown */}
        <div className="space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Trend Evidence & Strategy Breakdown
          </h2>

          {/* Detail Block 1: Why Predicted */}
          <Card variant="elevated" className="border-[#242424] bg-[#121212] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
              Why Predicted / Why it&apos;s Trending
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-300">
              {trend.why_trending || trend.why_predicted || trend.description}
            </p>
            {trend.key_indicator && (
              <p className="mt-3 text-xs text-neutral-400 border-t border-[#1e1e1e] pt-2">
                Key Signal Indicator: <span className="font-semibold text-neutral-200">{trend.key_indicator}</span>
              </p>
            )}
          </Card>

          {/* Detail Block 2: Your Angle & Action Plan */}
          <Card variant="elevated" className="border-[#242424] bg-[#141414] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
              Your Video Angle & Action Plan
            </h3>
            <p className="text-sm font-medium leading-relaxed text-white">
              &ldquo;{resolveVideoConcept(trend)}&rdquo;
            </p>
            {(trend.growth_tip || trend.action_plan) && (
              <p className="mt-3 text-xs text-neutral-400 border-t border-[#222222] pt-2">
                Action Plan: {cleanTrendTitle(trend.growth_tip || trend.action_plan || "")}
              </p>
            )}
          </Card>

          {/* Detail Block 3: Title Ideas & Strategy Action */}
          {trend.title_ideas && trend.title_ideas.length > 0 && (
            <Card variant="elevated" className="border-[#242424] bg-[#121212] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Recommended Title Ideas
                </h3>
                <Link
                  to="/app/strategy"
                  state={{ topic: cleanTrendTitle(trend.topic), autoGenerate: true }}
                >
                  <Button size="sm" className="text-xs h-7 px-3">
                    <Sparkles className="h-3 w-3" />
                    Open Strategy Brief
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {trend.title_ideas.map((title, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#222222] bg-[#161616] px-3 py-2 transition-colors hover:border-[#333333]"
                  >
                    <p className="text-xs font-medium text-neutral-300">{title}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(title, idx)}
                      className="shrink-0 rounded p-1 text-neutral-500 hover:bg-[#202020] hover:text-white transition-colors cursor-pointer"
                      aria-label="Copy title"
                    >
                      {copiedIdx === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
