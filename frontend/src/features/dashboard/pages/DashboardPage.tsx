import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useDashboardStore } from "../../../stores/useDashboardStore";
import { useTrendsStore } from "../../../stores/useTrendsStore";
import { useAuthStore } from "../../../stores/useAuthStore";
import { renderStatIcon } from "../../../lib/stat-icons";
import { sanitizeStrategyTopic } from "../../../lib/strategyTopic";
import {
  cleanTrendTitle,
  cleanTrendText,
  resolveVideoConcept,
  resolveVideoConceptBadge,
} from "../../../lib/cleanTrendTitle";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { StatCard } from "../../../components/ui/StatCard";
import { AIScannerLoader } from "../../../components/ui/AIScannerLoader";
import { MiniBarChart } from "../../../components/ui/MiniBarChart";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Zap,
  BarChart2,
  ChevronRight,
  Film,
} from "lucide-react";

type ForecastPeriod = '28d' | '90d' | 'ALL';

interface ForecastData {
  bars: number[];
  projectedGrowth: string;
  comparisonLabel: string;
  highlightIndex: number;
}

const FORECAST_PERIOD_DATA: Record<ForecastPeriod, ForecastData> = {
  '28d': {
    bars: [42, 56, 68, 72, 85, 94, 108],
    projectedGrowth: '+12.4%',
    comparisonLabel: 'vs last period',
    highlightIndex: 5,
  },
  '90d': {
    bars: [120, 135, 150, 142, 168, 190, 215],
    projectedGrowth: '+18.7%',
    comparisonLabel: 'vs last period',
    highlightIndex: 5,
  },
  'ALL': {
    bars: [310, 380, 420, 490, 560, 640, 750],
    projectedGrowth: '+34.2%',
    comparisonLabel: 'all-time projected',
    highlightIndex: 6,
  },
};

function formatSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, insights = [], fetchDashboard } = useDashboardStore();
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('28d');
  const {
    trends,
    isLoading: isTrendsLoading,
    channelContext,
    fetchTrends,
  } = useTrendsStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchDashboard();
    fetchTrends();
  }, [fetchDashboard, fetchTrends]);

  const handleQuickStrategy = (
    trend: (typeof trends)[number],
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const topic = sanitizeStrategyTopic(trend.raw_topic || trend.topic);
    navigate("/app/strategy", {
      state: { topic, autoGenerate: true },
    });
  };

  const [chatQuery, setChatQuery] = useState("");

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    navigate("/app/strategy", {
      state: { topic: chatQuery, autoGenerate: true },
    });
  };

  const handleQuickPrompt = (promptText: string) => {
    navigate("/app/strategy", {
      state: { topic: promptText, autoGenerate: true },
    });
  };

  const topTrends = trends.slice(0, 3);
  const currentForecast =
    FORECAST_PERIOD_DATA[forecastPeriod] ?? FORECAST_PERIOD_DATA['28d'];

  return (
    <div className="space-y-7 animate-in text-[#ededed]">
      {/* Workspace Header Greeting */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1c1c1c] pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          {channelContext?.thumbnail_url ? (
            <img
              src={channelContext.thumbnail_url}
              alt=""
              className="h-12 w-12 rounded-xl border border-[#2a2a2a] object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-base font-bold text-white">
              {user?.full_name?.charAt(0) || "C"}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#ededed] sm:text-xl">
                Welcome back, {user?.full_name?.split(" ")[0] || "Creator"}
              </h1>
              <Badge variant="brand" className="text-[10px]">
                <Zap className="h-3 w-3 text-indigo-400" />
                Qdrant Vector AI
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-neutral-400">
              {channelContext?.name ? (
                <>
                  Channel: <span className="font-semibold text-neutral-200">{channelContext.name}</span>
                  {channelContext.subscriber_count > 0 && ` (${formatSubs(channelContext.subscriber_count)} subs)`}
                  {" • "}Live signals scanned across your niche
                </>
              ) : (
                "Here's what is changing in your content space."
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/app/trends">
            <Button variant="secondary" size="sm">
              <TrendingUp className="h-3.5 w-3.5" />
              All 15 Trends
            </Button>
          </Link>
          <Link to="/app/strategy">
            <Button size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI Briefs
            </Button>
          </Link>
        </div>
      </div>

      {/* Intelligence Chat Bar (Wireframe Layout Component) */}
      <div className="rounded-xl border border-[#242424] bg-[#111111] p-4 text-[#ededed]">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Ask CreatorIQ
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">
              Ask about trends, your channel, or what to create next
            </span>
          </div>

          <form onSubmit={handleChatSubmit} className="relative">
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="Ask about trends, your channel, or what to create next..."
              className="w-full rounded-lg border border-[#282828] bg-[#161616] px-3.5 py-2.5 pr-10 text-xs text-[#ededed] placeholder-neutral-500 focus:border-neutral-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-white p-1.5 text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              title="Submit prompt to Strategy AI"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-neutral-500 font-medium">Suggestions:</span>
            {[
              "What should I create this week?",
              "Why is this trend growing?",
              "Top 3 viral hooks for my niche",
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="rounded-md border border-[#242424] bg-[#161616] px-2.5 py-1 text-[11px] text-neutral-400 hover:border-[#383838] hover:text-white transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Metric Stat Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            icon={renderStatIcon(stat.icon)}
          />
        ))}
      </div>

      {/* Top Predicted Trend Cards Grid (Directly matching wireframe) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Top Predicted Opportunities
            </h2>
            <p className="text-xs text-neutral-500">
              Click any concept card to inspect trajectory forecast, audience demand and evidence.
            </p>
          </div>
          <Link
            to="/app/trends"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Explore all 15 trends
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isTrendsLoading && topTrends.length === 0 ? (
          <AIScannerLoader message="Analyzing signals and vector-matching concepts..." />
        ) : topTrends.length === 0 ? (
          <Card className="py-12 text-center" variant="elevated">
            <TrendingUp className="mx-auto h-7 w-7 text-neutral-600" />
            <h3 className="mt-2 text-sm font-semibold text-neutral-300">
              No trend predictions yet
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Run trend collector or complete onboarding to populate your feed.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {topTrends.map((trend: any) => (
              <Card
                key={trend.id}
                variant="elevated"
                hover
                className="group flex cursor-pointer flex-col justify-between gap-3.5 p-5 border-[#222222] hover:border-[#3a3a3a] transition-all duration-150"
                onClick={() => navigate(`/app/trends/detail/${trend.id}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {trend.niches?.slice(0, 1).map((tag: string) => (
                        <Badge key={tag} variant="neutral" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                      <Badge variant="brand" className="text-[10px] capitalize">
                        {trend.archetype}
                      </Badge>
                    </div>
                    {trend.opportunity_score != null && (
                      <span className="shrink-0 rounded bg-[#1f1f1f] border border-[#2c2c2c] px-2 py-0.5 text-[10px] font-bold text-white">
                        {Math.round(trend.opportunity_score ?? trend.tvs_score)} Fit
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {cleanTrendTitle(trend.topic)}
                  </h3>

                  {/* Video Concept Highlight */}
                  <div className="rounded-lg border border-[#282828] bg-[#141414] p-3 transition-colors group-hover:border-[#383838]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        Video Concept
                      </span>
                      <span className="text-[9px] font-medium text-neutral-500 flex items-center gap-1">
                        <Film className="h-2.5 w-2.5" />
                        {resolveVideoConceptBadge(trend)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-neutral-200 leading-snug line-clamp-2">
                      &ldquo;{resolveVideoConcept(trend)}&rdquo;
                    </p>
                  </div>

                  {trend.why_predicted && (
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      <span className="font-semibold text-neutral-300">Why Predicted: </span>
                      {cleanTrendText(trend.why_predicted)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#1e1e1e] pt-3">
                  <div className="flex items-center gap-1 text-xs font-medium text-neutral-400 group-hover:text-white transition-colors">
                    <span>View Concept Graph</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleQuickStrategy(trend, e)}
                    className="text-xs px-2.5 py-1 h-7"
                  >
                    <Lightbulb className="h-3 w-3 text-neutral-400" />
                    Brief
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Performance Forecast Chart & Priority Insights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card variant="elevated" className="lg:col-span-8 p-5 border-[#222222]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Performance Forecast
              </h2>
              <p className="text-xs text-neutral-500">Projected view velocity over time</p>
            </div>
            <div className="flex gap-1 rounded-lg border border-[#242424] bg-[#121212] p-1">
              {(['28d', '90d', 'ALL'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setForecastPeriod(tab)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                    forecastPeriod === tab
                      ? 'bg-[#222222] text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <MiniBarChart
            data={currentForecast.bars}
            highlightIndex={currentForecast.highlightIndex}
            formatValue={(v) => `${v}K views`}
          />
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[#222222] bg-[#141414] px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <BarChart2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-semibold text-white">{currentForecast.projectedGrowth} projected</span>
              <span className="text-neutral-500">{currentForecast.comparisonLabel}</span>
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="lg:col-span-4 p-5 border-[#222222]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#181818] text-neutral-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                AI Priority Insights
              </h2>
              <p className="text-[11px] text-neutral-500">{insights.length} actions available</p>
            </div>
          </div>
          {insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs font-medium text-neutral-400">No pending insights</p>
              <p className="mt-1 text-[11px] text-neutral-600">Your channel strategy is running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {insights.map((item, j) => (
                <div
                  key={j}
                  className="group rounded-lg border border-[#222222] bg-[#141414] p-3 transition-colors hover:border-[#333333]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="neutral" className="text-[9px]">
                      Priority {j + 1}
                    </Badge>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-neutral-200">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">{item.impact}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/app/strategy">
            <Button variant="secondary" className="mt-4 w-full text-xs">
              Explore All Insights
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};
