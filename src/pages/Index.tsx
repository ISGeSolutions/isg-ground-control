import { useState, useMemo, useCallback } from 'react';
import { Departure, ActivityStatus, FilterState } from '@/types/operations';
import { generateMockDepartures, ACTIVITY_TEMPLATES } from '@/data/mockData';
import { OperationsGrid } from '@/components/OperationsGrid';
import { FiltersPanel } from '@/components/FiltersPanel';
import { DepartureDetailDrawer } from '@/components/DepartureDetailDrawer';
import { calculateReadiness, calculateRisk } from '@/utils/operations';
import { Plane, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Index = () => {
  const [departures, setDepartures] = useState<Departure[]>(() => generateMockDepartures());
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '', dateTo: '', series: '', destination: '', search: '',
  });
  const [drawerDepartureId, setDrawerDepartureId] = useState<string | null>(null);
  const [drawerActivityCode, setDrawerActivityCode] = useState<string | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ActivityStatus>('complete');

  const destinations = useMemo(() => {
    const set = new Set(departures.map(d => d.destination));
    return Array.from(set).sort();
  }, [departures]);

  const filtered = useMemo(() => {
    return departures.filter(dep => {
      if (filters.series && dep.series !== filters.series) return false;
      if (filters.destination && dep.destination !== filters.destination) return false;
      if (filters.dateFrom && dep.date < filters.dateFrom) return false;
      if (filters.dateTo && dep.date > filters.dateTo) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!dep.destination.toLowerCase().includes(q) && !dep.destinationCode.toLowerCase().includes(q) && !dep.series.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [departures, filters]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const atRisk = filtered.filter(d => calculateRisk(d.activities) === 'red').length;
    const ready = filtered.filter(d => calculateReadiness(d.activities) === 100).length;
    const avgReadiness = total > 0 ? Math.round(filtered.reduce((sum, d) => sum + calculateReadiness(d.activities), 0) / total) : 0;
    return { total, atRisk, ready, avgReadiness };
  }, [filtered]);

  const handleCellClick = useCallback((departureId: string, activityCode: string) => {
    setDrawerDepartureId(departureId);
    setDrawerActivityCode(activityCode);
  }, []);

  const handleRowClick = useCallback((departureId: string) => {
    setDrawerDepartureId(departureId);
    setDrawerActivityCode(undefined);
  }, []);

  const handleUpdateActivity = useCallback((departureId: string, activityId: string, status: ActivityStatus) => {
    setDepartures(prev => prev.map(dep => {
      if (dep.id !== departureId) return dep;
      return {
        ...dep,
        activities: dep.activities.map(a => a.id === activityId ? { ...a, status, updatedAt: new Date().toISOString().split('T')[0] } : a),
      };
    }));
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleBulkUpdate = useCallback(() => {
    if (selectedIds.size === 0) return;
    setDepartures(prev => prev.map(dep => {
      if (!selectedIds.has(dep.id)) return dep;
      return {
        ...dep,
        activities: dep.activities.map(a => ({ ...a, status: bulkStatus, updatedAt: new Date().toISOString().split('T')[0] })),
      };
    }));
    setSelectedIds(new Set());
  }, [selectedIds, bulkStatus]);

  const drawerDeparture = drawerDepartureId ? departures.find(d => d.id === drawerDepartureId) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border px-4 py-2 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          <h1 className="text-sm font-semibold text-foreground tracking-tight">Ops-Admin</h1>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            Departure Ground Handling
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            {filtered.length} departures
          </span>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-border px-4 py-2 flex items-center gap-6 bg-card/50">
        <div className="flex items-center gap-1.5 text-xs">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Avg Readiness:</span>
          <span className="font-mono font-semibold text-foreground">{stats.avgReadiness}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-status-red" />
          <span className="text-muted-foreground">At Risk:</span>
          <span className="font-mono font-semibold risk-red">{stats.atRisk}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
          <span className="text-muted-foreground">Ready:</span>
          <span className="font-mono font-semibold risk-green">{stats.ready}</span>
        </div>
      </div>

      {/* Filters + Bulk Actions */}
      <div className="border-b border-border px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
        <FiltersPanel filters={filters} onFilterChange={setFilters} destinations={destinations} />
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{selectedIds.size} selected</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as ActivityStatus)}
              className="h-7 px-2 text-xs bg-secondary border border-border rounded-md text-foreground"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="complete">Complete</option>
            </select>
            <button
              onClick={handleBulkUpdate}
              className="h-7 px-3 text-xs bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-semibold"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <main className="flex-1 p-4 overflow-hidden">
        <OperationsGrid
          departures={filtered}
          onCellClick={handleCellClick}
          onRowClick={handleRowClick}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
      </main>

      {/* Drawer */}
      {drawerDeparture && (
        <DepartureDetailDrawer
          departure={drawerDeparture}
          selectedActivityCode={drawerActivityCode}
          onClose={() => setDrawerDepartureId(null)}
          onUpdateActivity={handleUpdateActivity}
        />
      )}
    </div>
  );
};

export default Index;
