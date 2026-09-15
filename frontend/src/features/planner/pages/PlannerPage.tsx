import React, { useState, useEffect, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  FileText,
  Loader2,
  AlertCircle,
  Video,
} from 'lucide-react';
import {
  usePlannerStore,
  type PlannerSlot,
  type SlotLifecycleStatus,
} from '../../../stores/usePlannerStore';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_CONFIG: Record<
  SlotLifecycleStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  not_started: {
    label: 'Not Started',
    bg: 'bg-[#181818]',
    text: 'text-neutral-400',
    border: 'border-[#262626]',
    dot: 'bg-neutral-500',
  },
  scripting: {
    label: 'Scripting',
    bg: 'bg-[#16142a]',
    text: 'text-indigo-300',
    border: 'border-[#292452]',
    dot: 'bg-indigo-500',
  },
  recording: {
    label: 'Recording',
    bg: 'bg-[#241317]',
    text: 'text-rose-300',
    border: 'border-[#441d27]',
    dot: 'bg-rose-500',
  },
  editing: {
    label: 'Editing',
    bg: 'bg-[#241a0d]',
    text: 'text-amber-300',
    border: 'border-[#463116]',
    dot: 'bg-amber-500',
  },
  ready: {
    label: 'Ready',
    bg: 'bg-[#0e2114]',
    text: 'text-emerald-300',
    border: 'border-[#1b4329]',
    dot: 'bg-emerald-500',
  },
  published: {
    label: 'Published',
    bg: 'bg-[#131b2b]',
    text: 'text-blue-300',
    border: 'border-[#223352]',
    dot: 'bg-blue-500',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-[#161d2d]',
    text: 'text-blue-300',
    border: 'border-[#233554]',
    dot: 'bg-blue-400',
  },
  scripted: {
    label: 'Scripted',
    bg: 'bg-[#1b152d]',
    text: 'text-purple-300',
    border: 'border-[#332454]',
    dot: 'bg-purple-400',
  },
  skipped: {
    label: 'Skipped',
    bg: 'bg-[#141414]',
    text: 'text-neutral-500',
    border: 'border-[#222222]',
    dot: 'bg-neutral-600',
  },
};

const SELECTABLE_STATUSES: SlotLifecycleStatus[] = [
  'not_started',
  'scripting',
  'recording',
  'editing',
  'ready',
  'published',
];

function toDateTimeLocalString(date: Date): string {
  const safeDate = isNaN(date.getTime()) ? new Date() : date;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const y = safeDate.getFullYear();
  const m = pad(safeDate.getMonth() + 1);
  const d = pad(safeDate.getDate());
  const h = pad(safeDate.getHours());
  const min = pad(safeDate.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

export const PlannerPage: React.FC = () => {
  const {
    slots,
    currentDate,
    isLoading,
    error,
    fetchSlots,
    createSlot,
    updateSlot,
    deleteSlot,
    prevMonth,
    nextMonth,
    setCurrentDate,
    clearError,
  } = usePlannerStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTopic, setCreateTopic] = useState('');
  const [createScheduledAt, setCreateScheduledAt] = useState('');
  const [createStatus, setCreateStatus] = useState<SlotLifecycleStatus>('not_started');
  const [createNotes, setCreateNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<PlannerSlot | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [editStatus, setEditStatus] = useState<SlotLifecycleStatus>('not_started');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void fetchSlots();
  }, [fetchSlots]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      scripting: 0,
      recording: 0,
      editing: 0,
      ready: 0,
      published: 0,
    };
    slots.forEach((s) => {
      if (counts[s.status] !== undefined) {
        counts[s.status]++;
      }
    });
    return counts;
  }, [slots]);

  const handleOpenCreateModal = (initialDate?: Date) => {
    const targetDate = initialDate ? new Date(initialDate) : new Date();
    if (initialDate) {
      targetDate.setHours(12, 0, 0, 0);
    }
    setCreateTopic('');
    setCreateScheduledAt(toDateTimeLocalString(targetDate));
    setCreateStatus('not_started');
    setCreateNotes('');
    setIsCreateOpen(true);
  };

  const handleOpenEditModal = (slot: PlannerSlot, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedSlot(slot);
    setEditTopic(slot.topic);
    try {
      setEditScheduledAt(toDateTimeLocalString(new Date(slot.scheduled_at)));
    } catch {
      setEditScheduledAt(toDateTimeLocalString(new Date()));
    }
    setEditStatus(slot.status || 'not_started');
    setEditNotes(slot.notes || '');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTopic.trim() || !createScheduledAt) return;

    setIsCreating(true);
    try {
      const scheduledIso = new Date(createScheduledAt).toISOString();
      await createSlot({
        topic: createTopic.trim(),
        scheduled_at: scheduledIso,
        status: createStatus,
        notes: createNotes.trim() || undefined,
      });
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !editTopic.trim() || !editScheduledAt) return;

    setIsUpdating(true);
    try {
      const scheduledIso = new Date(editScheduledAt).toISOString();
      await updateSlot(selectedSlot.id, {
        topic: editTopic.trim(),
        scheduled_at: scheduledIso,
        status: editStatus,
        notes: editNotes.trim(),
      });
      setSelectedSlot(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    if (!window.confirm(`Are you sure you want to remove "${selectedSlot.topic}" from your planner?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSlot(selectedSlot.id);
      setSelectedSlot(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in text-[#ededed]">
      <PageHeader
        title="Content Planner"
        description="Schedule, coordinate and execute video production across lifecycle pipeline stages."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Navigator */}
            <div className="flex items-center rounded-lg border border-[#262626] bg-[#141414]">
              <button
                type="button"
                onClick={prevMonth}
                title="Previous Month"
                className="p-1.5 text-neutral-400 hover:bg-[#1f1f1f] hover:text-white transition-colors rounded-l-lg cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[120px] px-2 text-center text-xs font-semibold text-white select-none">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                title="Next Month"
                className="p-1.5 text-neutral-400 hover:bg-[#1f1f1f] hover:text-white transition-colors rounded-r-lg cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="text-xs h-8"
            >
              Today
            </Button>

            <Button type="button" onClick={() => handleOpenCreateModal()} size="sm" className="gap-1.5 text-xs h-8">
              <Plus className="h-3.5 w-3.5" />
              Add Slot
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-[#4a2e0e] bg-[#221405] p-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-amber-400 hover:text-white text-xs font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {(['scripting', 'recording', 'editing', 'ready', 'published'] as SlotLifecycleStatus[]).map(
          (statusKey) => {
            const config = STATUS_CONFIG[statusKey];
            const count = statusCounts[statusKey] || 0;
            return (
              <div
                key={statusKey}
                className="flex items-center justify-between rounded-lg border border-[#222222] bg-[#121212] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                  <span className="text-xs font-medium text-neutral-300">{config.label}</span>
                </div>
                <span className="text-sm font-bold text-white metric">{count}</span>
              </div>
            );
          }
        )}
      </div>

      {/* Main Calendar View */}
      <Card padding="none" className="overflow-hidden border border-[#222222] bg-[#101010]">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 bg-[#141414] py-1.5 border-b border-[#222222] text-xs text-neutral-400">
            <Loader2 className="h-3 w-3 animate-spin text-white" />
            <span>Syncing calendar slots...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-[#1f1f1f] bg-[#141414]">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="border-r border-[#1f1f1f] py-2 text-center text-xs font-semibold text-neutral-400 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 divide-y divide-[#1e1e1e] bg-[#0c0c0c]">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);
                const daySlots = slots.filter((slot) => {
                  try {
                    return isSameDay(parseISO(slot.scheduled_at), day);
                  } catch {
                    return false;
                  }
                });

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenCreateModal(day)}
                    className={`group relative min-h-[110px] p-2 transition-colors border-r border-[#1e1e1e] last:border-r-0 cursor-pointer ${
                      !isCurrentMonth
                        ? 'bg-[#0a0a0a] text-neutral-600'
                        : isDayToday
                        ? 'bg-[#151426] border-indigo-500/30'
                        : 'bg-[#111111] hover:bg-[#161616]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold inline-flex items-center justify-center ${
                          isDayToday
                            ? 'h-5 w-5 rounded-full bg-white text-black font-bold'
                            : isCurrentMonth
                            ? 'text-neutral-300'
                            : 'text-neutral-600'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateModal(day);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-white rounded transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="mt-1.5 space-y-1">
                      {daySlots.slice(0, 3).map((slot) => {
                        const config = STATUS_CONFIG[slot.status] || STATUS_CONFIG.not_started;
                        return (
                          <div
                            key={slot.id}
                            onClick={(e) => handleOpenEditModal(slot, e)}
                            title={`${slot.topic} (${config.label})`}
                            className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium border truncate transition-transform hover:scale-[1.01] cursor-pointer ${config.bg} ${config.text} ${config.border}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
                            <span className="truncate flex-1">{slot.topic}</span>
                          </div>
                        );
                      })}

                      {daySlots.length > 3 && (
                        <div className="text-[10px] font-medium text-neutral-500 pl-1">
                          +{daySlots.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in">
          <div
            className="w-full max-w-md rounded-xl bg-[#141414] p-6 shadow-2xl border border-[#2a2a2a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-white" />
                <h3 className="text-sm font-bold text-white">Schedule Video Slot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-neutral-500 hover:text-white rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Video Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 15 Full Tutorial"
                  value={createTopic}
                  onChange={(e) => setCreateTopic(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#282828] bg-[#161616] px-3 text-xs text-[#ededed] placeholder-neutral-500 focus:border-[#4f46e5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createScheduledAt}
                    onChange={(e) => setCreateScheduledAt(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#282828] bg-[#161616] px-2.5 text-xs text-[#ededed] focus:border-[#4f46e5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Status
                  </label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value as SlotLifecycleStatus)}
                    className="h-9 w-full rounded-lg border border-[#282828] bg-[#161616] px-2.5 text-xs text-[#ededed] focus:border-[#4f46e5] focus:outline-none cursor-pointer"
                  >
                    {SELECTABLE_STATUSES.map((statusKey) => (
                      <option key={statusKey} value={statusKey}>
                        {STATUS_CONFIG[statusKey].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Draft hook, angle, or SEO tags..."
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#282828] bg-[#161616] p-2.5 text-xs text-[#ededed] placeholder-neutral-500 focus:border-[#4f46e5] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isCreating || !createTopic.trim()}>
                  {isCreating ? 'Adding...' : 'Add to Planner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in">
          <div
            className="w-full max-w-lg rounded-xl bg-[#141414] p-6 shadow-2xl border border-[#2a2a2a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-white" />
                <h3 className="text-sm font-bold text-white">Slot Details & Status</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="p-1 text-neutral-500 hover:text-white rounded cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Video Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#282828] bg-[#161616] px-3 text-xs text-[#ededed] focus:border-[#4f46e5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editScheduledAt}
                    onChange={(e) => setEditScheduledAt(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#282828] bg-[#161616] px-2.5 text-xs text-[#ededed] focus:border-[#4f46e5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as SlotLifecycleStatus)}
                    className="h-9 w-full rounded-lg border border-[#282828] bg-[#161616] px-2.5 text-xs text-[#ededed] focus:border-[#4f46e5] focus:outline-none cursor-pointer"
                  >
                    {SELECTABLE_STATUSES.map((statusKey) => (
                      <option key={statusKey} value={statusKey}>
                        {STATUS_CONFIG[statusKey].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Notes / Hook / Keywords
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#282828] bg-[#161616] p-2.5 text-xs text-[#ededed] placeholder-neutral-500 focus:border-[#4f46e5] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={handleDeleteSlot}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 hover:text-rose-300 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Slot
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedSlot(null)}
                  >
                    Close
                  </Button>
                  <Button type="submit" size="sm" disabled={isUpdating || !editTopic.trim()}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
