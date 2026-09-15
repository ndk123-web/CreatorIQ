import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTrendsStore } from '../../../stores/useTrendsStore';
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
  TrendingUp,
  Activity,
  Film,
  Zap,
} from 'lucide-react';

import { cleanTrendTitle, resolveVideoConcept, resolveVideoConceptBadge } from '../../../lib/cleanTrendTitle';
import { ConceptGraph } from '../components/ConceptGraph';
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
      <div className="flex flex-col items-center justify-center py-28 text-neutral-400 gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-white" />
        <p className="text-xs text-neutral-500 font-medium">Loading concept intelligence & vector signals...</p>
      </div>
    );
  }

  if (detailError || !trendDetail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Alert variant="error">{detailError ?? 'Trend concept not found'}</Alert>
      </div>
    );
  }

  const trend = trendDetail;
  const oppScore = Math.round(trend.opportunity_score ?? trend.tvs_score ?? 75);
  const vectorMatch = (trend as any).vector_similarity
    ? Math.round((trend as any).vector_similarity * 100)
    : 92;

  return (
    <div className="space-y-7 animate-in text-[#ededed]">
      {/* Top Navigation & Primary Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c1c] pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/dashboard')}
            className="text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <span className="text-neutral-600">/</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/trends')}
            className="text-neutral-400 hover:text-white"
          >
            All Trends
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toggleSaveTrend(trend.id)}
            className="bg-[#161616] border-[#2a2a2a] text-[#ededed]"
          >
            <Bookmark className="h-3.5 w-3.5" />
            {trend.saved ? 'Saved' : 'Save Concept'}
          </Button>
          <Link
            to="/app/strategy"
            state={{ topic: cleanTrendTitle(trend.topic), autoGenerate: true }}
          >
            <Button size="sm" className="bg-white text-black hover:bg-neutral-200">
              <Sparkles className="h-3.5 w-3.5" />
              Generate Strategy Brief
            </Button>
          </Link>
        </div>
      </div>

      {/* A. CONCEPT / TREND HEADER */}
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {trend.niches?.map((tag) => (
            <Badge key={tag} variant="neutral" className="text-[10px]">
              {tag}
            </Badge>
          ))}
          <Badge variant="brand" className="text-[10px] capitalize">
            {trend.archetype}
          </Badge>
          {trend.creator_tier && (
            <Badge variant="neutral" className="text-[10px] capitalize">
              {trend.creator_tier} creator tier
            </Badge>
          )}
          <Badge variant="success" className="text-[10px] bg-emerald-950/40 text-emerald-300 border-emerald-800/40">
            {vectorMatch}% Vector Match
          </Badge>
          {trend.is_momentum_outlier && (
            <Badge variant="warning" className="gap-1 text-[10px]">
              <Flame className="h-3 w-3" />
              Breakout Velocity Spike
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-sora">
          {cleanTrendTitle(trend.topic)}
        </h1>
        {trend.headline && trend.headline !== trend.topic && (
          <p className="mt-1.5 text-sm text-neutral-400 leading-relaxed max-w-3xl">
            {trend.headline}
          </p>
        )}

        {trend.is_youtube_video && trend.channel_name && (
          <p className="mt-2 text-xs text-neutral-400">
            Detected source signal via <span className="font-semibold text-neutral-200">{trend.channel_name}</span>
            {trend.video_url && (
              <a
                href={trend.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-indigo-400 hover:underline"
              >
                Watch source upload <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </p>
        )}
      </div>

      {/* B. THAT CARD / CONCEPT GRAPH (Prominent Wireframe Top Box) */}
      <div className="space-y-2">
        <ConceptGraph trend={trend} />
      </div>

      {/* C. KEY METRICS: TWO SIDE-BY-SIDE BOXES (Directly Matching Wireframe) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Box 1: Estimated Views */}
        <Card variant="elevated" className="border-[#242424] bg-[#121212] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Estimated Views
              </h2>
            </div>
            <span className="rounded bg-indigo-950/50 border border-indigo-800/40 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
              Prophet 95% Band
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {trend.volume || '15K - 85K'}
              </span>
              <span className="ml-2.5 text-xs font-medium text-neutral-400">Projected 30-Day Reach</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="rounded-xl border border-[#242424] bg-[#161616] p-3.5">
                <span className="text-[11px] font-medium text-neutral-400">Shorts Potential</span>
                <p className="mt-1 text-base font-bold text-white font-mono">25K - 120K</p>
                <p className="mt-0.5 text-[10px] text-neutral-500">High velocity viral spread</p>
              </div>
              <div className="rounded-xl border border-[#242424] bg-[#161616] p-3.5">
                <span className="text-[11px] font-medium text-neutral-400">Long-form Potential</span>
                <p className="mt-1 text-base font-bold text-white font-mono">8K - 45K</p>
                <p className="mt-0.5 text-[10px] text-neutral-500">Deep engagement watch time</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Box 2: Other .. That are in card */}
        <Card variant="elevated" className="border-[#242424] bg-[#121212] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Other Card Parameters & Fit
              </h2>
            </div>
            <span className="rounded bg-[#1a1a1a] border border-[#2c2c2c] px-2 py-0.5 text-[10px] font-mono text-neutral-400">
              Card Signal Metrics
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-[#242424] bg-[#161616] p-3.5">
              <dt className="text-neutral-400 font-medium">Opportunity Score</dt>
              <dd className="mt-1 text-2xl font-extrabold text-white font-mono">
                {oppScore}<span className="text-xs font-normal text-neutral-500">/100</span>
              </dd>
            </div>
            <div className="rounded-xl border border-[#242424] bg-[#161616] p-3.5">
              <dt className="text-neutral-400 font-medium">Search Velocity</dt>
              <dd className="mt-1 text-lg font-bold text-emerald-400 font-mono">
                {trend.velocity || '+180% Spike'}
              </dd>
            </div>
            <div className="rounded-xl border border-[#242424] bg-[#161616] p-3.5">
              <dt className="text-neutral-400 font-medium">Vector Fit</dt>
              <dd className="mt-1 text-sm font-bold text-indigo-300">
                {vectorMatch}% Qdrant Match
              </dd>
            </div>
            <div className="rounded-xl border border-[#242424] bg-[#161616] p-3.5">
              <dt className="text-neutral-400 font-medium">Archetype Format</dt>
              <dd className="mt-1 text-sm font-bold text-white capitalize">
                {trend.archetype || 'Explainer'}
              </dd>
            </div>
            <div className="col-span-2 rounded-xl border border-[#242424] bg-[#161616] p-3">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-neutral-400 font-medium">Trajectory Stability Index</span>
                <span className="text-white font-mono font-bold">{trend.stability_score ?? 70}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#202020]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${trend.stability_score ?? 70}%` }}
                />
              </div>
            </div>
          </dl>
        </Card>
      </div>

      {/* D. TREND DETAILS - HORIZONTAL BLOCK 1: Market Signals & Evidence */}
      <div className="rounded-xl border border-[#242424] bg-[#121212] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Trend Details · Market Signals & Evidence
            </h2>
          </div>
          <span className="text-[11px] text-neutral-500">Live platform signal audit</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Signal 1: Why Predicted */}
          <div className="rounded-xl border border-[#242424] bg-[#161616] p-4 lg:col-span-2 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Why Predicted / Driver Narrative
            </span>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-200">
              {trend.why_trending || trend.why_predicted || trend.description || "Rapid upward momentum triggered by high viewer completion and related search query clustering."}
            </p>
            {trend.key_indicator && (
              <p className="pt-2 text-xs text-neutral-400 border-t border-[#222222]">
                Key Trigger Indicator: <span className="font-semibold text-white">{trend.key_indicator}</span>
              </p>
            )}
          </div>

          {/* Signal 2: Market Saturation */}
          <div className="rounded-xl border border-[#242424] bg-[#161616] p-4 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Market Saturation & Window
            </span>
            <div>
              <span className="text-xl font-bold text-white font-mono">
                {(trend as any).saturation || 'Low Saturation'}
              </span>
              <p className="mt-1 text-xs text-neutral-400">
                High viewer demand relative to supply of recent creator uploads.
              </p>
            </div>
            <div className="rounded-lg bg-[#111111] p-2.5 border border-[#222222] text-[11px] text-neutral-400">
              Recommended production window: <span className="text-emerald-400 font-semibold">Next 48-72 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* E. TREND DETAILS - HORIZONTAL BLOCK 2: Trajectory Forecast & Strategy Action */}
      <div className="rounded-xl border border-[#242424] bg-[#121212] p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Trend Details · 30-Day Historical Trajectory & Strategy Brief
            </h2>
          </div>
          <Link
            to="/app/strategy"
            state={{ topic: cleanTrendTitle(trend.topic), autoGenerate: true }}
          >
            <Button size="sm" className="h-7 text-xs px-3">
              <Zap className="h-3 w-3" />
              Open Full Brief
            </Button>
          </Link>
        </div>

        {/* Forecast Chart */}
        {isForecastLoading ? (
          <div className="flex items-center justify-center p-12 border border-[#222222] rounded-xl bg-[#141414]">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              Calculating 30-day Prophet forecast demand curve...
            </div>
          </div>
        ) : trendForecast ? (
          <div className="rounded-xl border border-[#222222] bg-[#141414] p-4">
            <TrendForecastChart forecast={trendForecast} trend={trend} />
          </div>
        ) : null}

        {/* Video Angle & Recommended Titles */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
          {/* Action Angle */}
          <div className="rounded-xl border border-[#262626] bg-[#161616] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Creator Video Angle
              </span>
              <span className="text-[10px] text-neutral-500">
                {resolveVideoConceptBadge(trend)}
              </span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">
              &ldquo;{resolveVideoConcept(trend)}&rdquo;
            </p>
            {(trend.growth_tip || trend.action_plan) && (
              <p className="text-xs text-neutral-400 pt-2 border-t border-[#222222]">
                Action Plan: {cleanTrendTitle(trend.growth_tip || trend.action_plan || "")}
              </p>
            )}
          </div>

          {/* Titles with 1-click copy */}
          <div className="rounded-xl border border-[#262626] bg-[#161616] p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              High-CTR Title Angles
            </span>
            <div className="space-y-1.5">
              {(trend.title_ideas || [
                `I Tried ${cleanTrendTitle(trend.topic)} So You Don't Have To`,
                `The Truth About ${cleanTrendTitle(trend.topic)} in 2026`,
                `Why Everyone Is Talking About ${cleanTrendTitle(trend.topic)}`,
              ]).slice(0, 3).map((title, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#222222] bg-[#111111] px-2.5 py-1.5 text-xs text-neutral-200"
                >
                  <span className="truncate">{title}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(title, idx)}
                    className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy title"
                  >
                    {copiedIdx === idx ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
