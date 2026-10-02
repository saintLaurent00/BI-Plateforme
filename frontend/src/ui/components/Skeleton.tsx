import React from 'react';
import { cn } from '../../core/utils/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base animated skeleton element with shimmer effect
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200/80 rounded-lg relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        className
      )}
      {...props}
    />
  );
};

export interface ChartSkeletonProps {
  type?: string;
  className?: string;
  showHeader?: boolean;
}

/**
 * Realistic chart skeleton loader adapted to chart types (Bar, Line, Area, Pie, Table, KPI, etc.)
 */
export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  type = 'bar',
  className,
  showHeader = true,
}) => {
  const normType = (type || 'bar').toLowerCase();

  return (
    <div className={cn("w-full h-full flex flex-col p-4 bg-white/60 rounded-xl overflow-hidden", className)}>
      {showHeader && (
        <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-8 rounded-lg" />
          </div>
        </div>
      )}

      {/* Center Chart Content Mockup */}
      <div className="flex-1 min-h-[160px] flex flex-col justify-end relative overflow-hidden">
        {normType.includes('pie') || normType.includes('donut') ? (
          /* Pie / Donut Chart Skeleton */
          <div className="w-full h-full flex items-center justify-center gap-6">
            <div className="relative w-32 h-32 rounded-full border-[18px] border-slate-200/80 animate-pulse flex items-center justify-center">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
            <div className="space-y-2.5 hidden sm:block">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </div>
        ) : normType.includes('line') || normType.includes('area') ? (
          /* Line / Area Chart Skeleton */
          <div className="w-full h-full flex flex-col justify-between py-2">
            {/* Horizontal Grid lines */}
            <div className="space-y-6 w-full">
              <div className="h-px bg-slate-100 w-full" />
              <div className="h-px bg-slate-100 w-full" />
              <div className="h-px bg-slate-100 w-full" />
            </div>

            {/* SVG Wave Line & Area */}
            <div className="relative w-full h-24 my-auto">
              <svg className="w-full h-full text-slate-200/70" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path
                  d="M0,35 Q20,10 40,25 T70,12 T100,20 L100,40 L0,40 Z"
                  fill="currentColor"
                  opacity="0.4"
                  className="animate-pulse"
                />
                <path
                  d="M0,35 Q20,10 40,25 T70,12 T100,20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
              </svg>
            </div>

            {/* Bottom X-Axis mock labels */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <Skeleton className="h-2 w-8" />
              <Skeleton className="h-2 w-8" />
              <Skeleton className="h-2 w-8" />
              <Skeleton className="h-2 w-8" />
              <Skeleton className="h-2 w-8" />
            </div>
          </div>
        ) : normType.includes('table') || normType.includes('pivot') ? (
          /* Table Chart Skeleton */
          <div className="w-full h-full flex flex-col gap-2 pt-1">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-3 pb-2 border-b border-slate-200">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
            </div>
            {/* Table Rows */}
            {[1, 2, 3, 4, 5].map(idx => (
              <div key={idx} className="grid grid-cols-4 gap-3 py-1.5 border-b border-slate-100/80">
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : normType.includes('kpi') || normType.includes('metric') || normType.includes('big_number') ? (
          /* KPI Big Number Skeleton */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Skeleton className="h-12 w-36 rounded-xl" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ) : (
          /* Default: Bar Chart Skeleton */
          <div className="w-full h-full flex flex-col justify-end">
            {/* Subtle background gridlines */}
            <div className="absolute inset-x-0 top-3 flex flex-col justify-between h-28 pointer-events-none opacity-40">
              <div className="h-px bg-slate-200 w-full" />
              <div className="h-px bg-slate-200 w-full" />
              <div className="h-px bg-slate-200 w-full" />
            </div>

            {/* Vertical Bar Columns */}
            <div className="flex items-end justify-between gap-2 sm:gap-3 h-32 px-2 z-10">
              {[55, 85, 40, 95, 65, 75, 45, 90].map((heightPct, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full bg-slate-200/90 rounded-t-md animate-pulse"
                    style={{
                      height: `${heightPct}%`,
                      animationDelay: `${idx * 120}ms`,
                    }}
                  />
                  <Skeleton className="h-2 w-4 sm:w-6" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Skeleton for the full Dashboard Detail view
 */
export const DashboardDetailSkeleton: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Top Header & Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* AI Briefing Skeleton Section */}
      <div className="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>

      {/* Dashboard Charts Grid Skeleton */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Row 1: Two charts (50/50) */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 h-80 shadow-xs">
          <ChartSkeleton type="bar" />
        </div>
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 h-80 shadow-xs">
          <ChartSkeleton type="line" />
        </div>

        {/* Row 2: Three charts (33/33/33) */}
        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 h-72 shadow-xs">
          <ChartSkeleton type="pie" />
        </div>
        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 h-72 shadow-xs">
          <ChartSkeleton type="bar" />
        </div>
        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 h-72 shadow-xs">
          <ChartSkeleton type="area" />
        </div>

        {/* Row 3: Full Width Table (100%) */}
        <div className="col-span-12 bg-white border border-slate-200/90 rounded-2xl p-5 h-96 shadow-xs">
          <ChartSkeleton type="table" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Dashboard Card in Dashboard List
 */
export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between h-56">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded-lg" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-48" />
      </div>

      {/* Mini Mockup Visual */}
      <div className="h-20 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-end justify-between gap-1.5">
        <div className="w-1/4 h-12 bg-slate-200 rounded-t" />
        <div className="w-1/4 h-16 bg-slate-200 rounded-t" />
        <div className="w-1/4 h-8 bg-slate-200 rounded-t" />
        <div className="w-1/4 h-14 bg-slate-200 rounded-t" />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Chart Card in Chart List
 */
export const ChartCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xs flex flex-col justify-between h-64">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-14 rounded-full" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
      </div>

      {/* Chart Miniature Preview Skeleton */}
      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-8 rounded-md" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Dashboard Editor
 */
export const DashboardEditorCanvasSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-[1400px] space-y-6 animate-in fade-in duration-300">
      {/* Grid Item Skeletons */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 h-72">
          <ChartSkeleton type="bar" />
        </div>
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 h-72">
          <ChartSkeleton type="line" />
        </div>
      </div>
    </div>
  );
};
