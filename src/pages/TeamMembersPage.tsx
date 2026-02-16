import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User } from '@/types/operations';
import { USERS } from '@/data/mockData';
import { ExternalLink, Users, Link2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function TeamMembersPage() {
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState<User[]>([...USERS]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Handle deep link: ?userId=u1
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      const exists = members.some(m => m.id === userId);
      if (exists) {
        setHighlightedId(userId);
        toast({ title: 'Deep link', description: `Navigated to user ${userId} from travel system.` });
        // Scroll to element
        setTimeout(() => {
          document.getElementById(`team-member-${userId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        toast({ title: 'User not found', description: `User ID "${userId}" not found in team.`, variant: 'destructive' });
      }
    }
  }, [searchParams, members]);

  return (
    <div className="p-6 max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
          <p className="text-xs text-muted-foreground">Ops Managers & Execs. Deep link from travel system with <code className="font-mono bg-secondary px-1 rounded">?userId=</code> param.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {members.length} members
        </div>
      </div>

      {/* Deep link info */}
      <div className="p-3 rounded-md bg-secondary/50 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          <Link2 className="w-3 h-3" /> Deep link format
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">
          /definitions/team?userId=<span className="text-primary">u1</span>
        </p>
        <p className="text-[10px] text-muted-foreground">
          The travel system can link directly to a team member using their user ID as a query parameter.
        </p>
      </div>

      <div className="grid gap-3">
        {members.map(m => (
          <div
            key={m.id}
            id={`team-member-${m.id}`}
            className={`border rounded-lg p-4 flex items-center gap-4 transition-all ${
              highlightedId === m.id
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-card hover:bg-grid-hover'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold font-mono text-foreground shrink-0">
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{m.name}</span>
                <span className={`text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded ${
                  m.role === 'ops_manager'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {m.role === 'ops_manager' ? 'Manager' : 'Exec'}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                ID: {m.id}
              </div>
            </div>
            <a
              href={`https://travel-system.example.com/users/${m.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Open in travel system"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
