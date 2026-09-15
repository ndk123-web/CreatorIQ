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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
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
    <div className="space-y-6 animate-in">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/trends')}>
        <ArrowLeft className="h-4 w-4" />
        Back to trends
      </Button>

      <PageHeader
        title={cleanTrendTitle(trend.topic)}
        description={trend.headline && trend.headline !== trend.topic ? trend.headline : undefined}
        badge={
          <div className="mb-2 flex flex-wrap gap-2">
            {trend.niches?.map((tag) => (
              <Badge key={tag} variant="brand">
                {tag}
              </Badge>
            ))}
            <Badge variant="neutral">{trend.archetype}</Badge>
            {trend.creator_tier && (
              <Badge variant="neutral" className="capitalize">
                {trend.creator_tier} creator
              </Badge>
            )}
            {(trend as any).vector_similarity && (
              <Badge variant="neutral" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                {Math.round((trend as any).vector_similarity * 100)}% Vector Match
              </Badge>
            )}
            {trend.is_momentum_outlier && (
              <Badge variant="warning" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
                <Flame className="h-3 w-3" />
                Breakout Spike
              </Badge>
            )}
            {trend.ai_enriched && (
              <Badge variant="neutral">
                <Sparkles className="h-3 w-3" />
                AI curated
              </Badge>
            )}
          </div>
        }
        actions={
          <Button
            variant={trend.saved ? 'primary' : 'secondary'}
            onClick={() => toggleSaveTrend(trend.id)}
          >
            <Bookmark className="h-4 w-4" />
            {trend.saved ? 'Saved' : 'Save trend'}
          </Button>
        }
      />

      {trend.is_youtube_video && trend.channel_name && (
        <p className="text-xs text-neutral-500">
          Trending via <span className="font-semibold text-neutral-800">{trend.channel_name}</span>
          {trend.video_url && (
            <a
              href={trend.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-brand-600 hover:underline"
            >
              Watch source <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </p>
      )}

      {/* TOP SECTION: "That Card / Concept Graph" (Matching Wireframe Top Container) */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-brand-200/90 bg-gradient-to-r from-brand-50/50 via-white to-indigo-50/30 p-1 shadow-sm">
          <div className="mb-2 px-4 pt-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              That Card / Concept Trajectory Graph
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Score: <span className="text-neutral-900 font-bold">{Math.round(trend.opportunity_score ?? trend.tvs_score)}/100</span>
            </span>
          </div>
          {isForecastLoading ? (
            <Card variant="elevated" className="flex items-center justify-center p-12">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                Calculating 30-day concept velocity & trajectory curve...
              </div>
            </Card>
          ) : trendForecast ? (
            <TrendForecastChart forecast={trendForecast} trend={trend} />
          ) : null}
        </div>

        {/* MIDDLE SECTION: 2 Parameter Cards Grid (Estimated Views + Other Card Parameters) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Estimated Views & Reach */}
          <Card variant="elevated" className="relative overflow-hidden border-brand-200/80 bg-gradient-to-br from-white via-neutral-50/50 to-brand-50/20 p-6 shadow-sm">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-400/10 blur-xl" />
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900">
                Estimated Views Potential
              </h2>
              <Badge variant="brand" className="text-[10px]">
                Algorithm Range
              </Badge>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-neutral-900">
                  {trend.volume || '10K - 50K'}
                </span>
                <span className="ml-2 text-xs font-semibold text-neutral-500">Estimated Reach</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl border border-neutral-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[11px] text-neutral-500 font-medium">Shorts Potential</span>
                  <p className="mt-1 text-sm font-bold text-neutral-900">15K - 75K views</p>
                </div>
                <div className="rounded-xl border border-neutral-200/80 bg-white p-3 shadow-2xs">
                  <span className="text-[11px] text-neutral-500 font-medium">Long-form Potential</span>
                  <p className="mt-1 text-sm font-bold text-neutral-900">5K - 25K views</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Other Concept Parameters & Metrics */}
          <Card variant="elevated" className="border-neutral-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                Other Card Parameters & Fit
              </h2>
              <Badge variant="neutral" className="text-[10px]">
                Concept Metrics
              </Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-neutral-500 font-medium">Opportunity Score</dt>
                <dd className="mt-1 text-xl font-bold text-neutral-900">
                  {Math.round(trend.opportunity_score ?? trend.tvs_score)}/100
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 font-medium">Search Velocity</dt>
                <dd className="mt-1 text-base font-bold text-neutral-900">{trend.velocity}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 font-medium">Vector Niche Fit</dt>
                <dd className="mt-1 font-semibold text-emerald-700">
                  {(trend as any).vector_similarity ? `${Math.round((trend as any).vector_similarity * 100)}% Match` : 'High Niche Match'}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500 font-medium">Archetype</dt>
                <dd className="mt-1 font-semibold text-neutral-800 capitalize">{trend.archetype}</dd>
              </div>
              <div className="col-span-2 pt-2 border-t border-neutral-100">
                <dt className="text-neutral-500 font-medium">Stability Score</dt>
                <dd className="mt-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500"
                      style={{ width: `${trend.stability_score ?? 65}%` }}
                    />
                  </div>
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* BOTTOM SECTION: Trend Details Cards (Matching Wireframe Bottom Stack) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900">Detailed Trend Breakdown</h2>

          {/* Trend Details Block 1: Why Predicted / Trending */}
          <Card variant="elevated" className="border-neutral-200/90 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
              Why Predicted / Why it&apos;s Trending
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {trend.why_trending || trend.why_predicted || trend.description}
            </p>
            {trend.key_indicator && (
              <p className="mt-3 text-xs text-neutral-500 border-t border-neutral-100 pt-2">
                Key Signal Indicator: <span className="font-semibold text-neutral-800">{trend.key_indicator}</span>
              </p>
            )}
          </Card>

          {/* Trend Details Block 2: Your Angle & Action Plan */}
          <Card variant="dark" className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300 mb-2">
              Your Video Angle & Action Plan
            </h3>
            <p className="text-sm font-medium leading-relaxed text-white">
              &ldquo;{resolveVideoConcept(trend)}&rdquo;
            </p>
            {(trend.growth_tip || trend.action_plan) && (
              <p className="mt-3 text-xs text-neutral-300 border-t border-white/10 pt-2">
                Action Plan: {cleanTrendTitle(trend.growth_tip || trend.action_plan || "")}
              </p>
            )}
          </Card>

          {/* Trend Details Block 3: Title Ideas & Strategy Brief Action */}
          {trend.title_ideas && trend.title_ideas.length > 0 && (
            <Card variant="elevated" className="border-neutral-200/90 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Recommended Title Ideas
                </h3>
                <Link
                  to="/app/strategy"
                  state={{ topic: cleanTrendTitle(trend.topic), autoGenerate: true }}
                >
                  <Button size="sm" className="shadow-2xs text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Full AI Brief
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {trend.title_ideas.map((title, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 transition-colors hover:border-brand-200"
                  >
                    <p className="text-xs font-medium text-neutral-800">{title}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(title, idx)}
                      className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-white hover:text-brand-600 transition-colors"
                      aria-label="Copy title"
                    >
                      {copiedIdx === idx ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
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
