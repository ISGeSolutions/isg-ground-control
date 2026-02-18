import { useState } from 'react';
import { getContractsForPage, ApiContract } from '@/lib/apiContracts';
import { ChevronDown, ChevronRight, Code2, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function ApiExpectationsPanel() {
  const location = useLocation();
  const contracts = getContractsForPage(location.pathname);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  if (contracts.length === 0) return null;

  return (
    <div className="border border-border rounded-lg bg-card text-card-foreground overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center gap-2 text-xs font-semibold hover:bg-secondary/50 transition-colors"
      >
        <Code2 className="w-3.5 h-3.5 text-primary" />
        <span>API Expectations ({contracts.length})</span>
        {isOpen ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
      </button>

      {isOpen && (
        <div className="border-t border-border divide-y divide-border">
          {contracts.map(contract => (
            <ContractRow
              key={contract.id}
              contract={contract}
              isExpanded={expanded === contract.id}
              onToggle={() => setExpanded(expanded === contract.id ? null : contract.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContractRow({ contract, isExpanded, onToggle }: { contract: ApiContract; isExpanded: boolean; onToggle: () => void }) {
  const methodColors: Record<string, string> = {
    GET: 'text-emerald-400',
    POST: 'text-blue-400',
    PUT: 'text-amber-400',
    PATCH: 'text-orange-400',
    DELETE: 'text-red-400',
  };

  return (
    <div>
      <button onClick={onToggle} className="w-full px-3 py-2 flex items-center gap-2 text-xs hover:bg-secondary/30 transition-colors">
        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span className={`font-mono font-bold text-[10px] ${methodColors[contract.method] || 'text-foreground'}`}>
          {contract.method}
        </span>
        <span className="font-mono text-muted-foreground text-[10px]">{contract.path}</span>
        <span className="text-foreground ml-1">{contract.name}</span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-[10px] text-muted-foreground">{contract.description}</p>

          {contract.sampleRequest && (
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request Body</div>
              <pre className="text-[10px] bg-secondary/50 rounded p-2 overflow-x-auto font-mono text-foreground">
                {JSON.stringify(contract.sampleRequest, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Response (200)</div>
            <pre className="text-[10px] bg-secondary/50 rounded p-2 overflow-x-auto font-mono text-foreground">
              {JSON.stringify(contract.sampleResponse, null, 2)}
            </pre>
          </div>

          {contract.errorShapes.length > 0 && (
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-status-red" /> Error Shapes
              </div>
              {contract.errorShapes.map((err, i) => (
                <pre key={i} className="text-[10px] bg-red-500/5 border border-red-500/20 rounded p-2 overflow-x-auto font-mono text-foreground mb-1">
                  {`// ${err.status}\n${JSON.stringify(err.body, null, 2)}`}
                </pre>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
