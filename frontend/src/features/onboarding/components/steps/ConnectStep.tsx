import React from 'react';
import { Youtube, Check, Loader2 } from 'lucide-react';
import { MaturityBadge, type ProfileMaturity } from '../MaturityBadge';
import { OnboardingStepShell } from '../OnboardingStepShell';
import { Button } from '../../../../components/ui/Button';

interface ConnectStepProps {
  isLoading: boolean;
  isYoutubeConnected: boolean;
  onConnect: () => void;
  onNext: () => void;
  onBack: () => void;
  profileMaturity?: ProfileMaturity;
  connectedChannel?: {
    name?: string | null;
    handle?: string | null;
    thumbnail?: string | null;
    subscriber_count?: number | null;
    video_count?: number | null;
    profile_maturity?: ProfileMaturity;
  };
}

export const ConnectStep: React.FC<ConnectStepProps> = ({
  isLoading,
  isYoutubeConnected,
  onConnect,
  onNext,
  onBack,
  connectedChannel,
  profileMaturity = 'new',
}) => {
  const maturity = connectedChannel?.profile_maturity || profileMaturity;

  return (
    <OnboardingStepShell
      title="Connect YouTube"
      description="Link your channel so we can personalize your trend feed and strategy."
      onBack={onBack}
      cardClassName="text-center"
    >
      <div className="flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#282828] bg-[#161616] shadow-sm">
            <Youtube className="h-10 w-10 text-red-500" />
          </div>
          {isYoutubeConnected && (
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#121212] bg-brand-600 shadow-md">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-4 text-sm text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
          Syncing channel...
        </div>
      ) : !isYoutubeConnected ? (
        <Button className="w-full" size="lg" onClick={onConnect}>
          <Youtube className="h-4 w-4 text-red-500" />
          Connect YouTube channel
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-[#262626] bg-[#161616] p-4 text-left">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#282828] bg-[#121212] shadow-sm">
              {connectedChannel?.thumbnail ? (
                <img src={connectedChannel.thumbnail} alt="Channel" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-950/40">
                  <Youtube className="h-7 w-7 text-brand-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-[#ededed]">
                  {connectedChannel?.name || 'Your YouTube Channel'}
                </p>
                <MaturityBadge maturity={maturity} />
              </div>
              {connectedChannel?.handle && (
                <p className="mt-0.5 text-xs text-neutral-400">{connectedChannel.handle}</p>
              )}
              <div className="mt-3 flex gap-4 border-t border-[#222222] pt-3 text-xs">
                <div>
                  <p className="text-neutral-500">Subscribers</p>
                  <p className="font-semibold text-[#ededed] font-mono">
                    {connectedChannel?.subscriber_count?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Videos</p>
                  <p className="font-semibold text-[#ededed] font-mono">
                    {connectedChannel?.video_count?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={onNext}>
            Continue
          </Button>
        </div>
      )}
    </OnboardingStepShell>
  );
};
