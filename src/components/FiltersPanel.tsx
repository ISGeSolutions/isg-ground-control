import { FilterState } from '@/types/operations';
import { SERIES, USERS } from '@/data/mockData';
import { Search, X } from 'lucide-react';

interface FiltersPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  destinations: string[];
}

export function FiltersPanel({ filters, onFilterChange, destinations }: FiltersPanelProps) {
  const update = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasFilters = filters.series || filters.destination || filters.search || filters.dateFrom || filters.dateTo || filters.opsManager || filters.opsExec;

  const clearAll = () => {
    onFilterChange({ dateFrom: '', dateTo: '', series: '', destination: '', search: '', opsManager: '', opsExec: '' });
  };

  const managers = USERS.filter(u => u.role === 'ops_manager');
  const execs = USERS.filter(u => u.role === 'ops_exec');

  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      <div className="relative flex-shrink-0">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="h-7 pl-7 pr-2 text-xs bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36"
        />
      </div>

      <select
        value={filters.series}
        onChange={(e) => update('series', e.target.value)}
        className="h-7 px-2 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
      >
        <option value="">All Series</option>
        {SERIES.map(s => (
          <option key={s.id} value={s.code}>{s.code}</option>
        ))}
      </select>



      <select
        value={filters.opsManager}
        onChange={(e) => update('opsManager', e.target.value)}
        className="h-7 px-2 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
      >
        <option value="">All Managers</option>
        {managers.map(u => (
          <option key={u.id} value={u.initials}>{u.name}</option>
        ))}
      </select>

      <select
        value={filters.opsExec}
        onChange={(e) => update('opsExec', e.target.value)}
        className="h-7 px-2 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
      >
        <option value="">All Execs</option>
        {execs.map(u => (
          <option key={u.id} value={u.initials}>{u.name}</option>
        ))}
      </select>

      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => update('dateFrom', e.target.value)}
        className="h-7 px-1 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
      />
      <span className="text-[10px] text-muted-foreground">–</span>
      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => update('dateTo', e.target.value)}
        className="h-7 px-1 text-xs bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
      />

      {hasFilters && (
        <button
          onClick={clearAll}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors flex-shrink-0"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
