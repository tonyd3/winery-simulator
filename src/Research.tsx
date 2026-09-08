import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import type { ResearchId } from './catalog';
import { availableVarieties, weeklyKnowledge } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import { ResearchProjects, CurrentStudies } from './ResearchProjects';
import { OutcomePlanner, StudyShortlist } from './ResearchDecisions';
import type { ResearchDestination } from './researchPlanning';
import { GrapeLibrary } from './GrapeLibrary';
import { BreedingNursery } from './BreedingNursery';

export type ResearchTab = 'projects' | 'library' | 'nursery';
export default function Research({
  state,
  dispatch,
  onDestination,
  focusId,
  initialTab = 'projects',
}: {
  state: GameState;
  dispatch: Dispatch;
  onDestination: (destination: ResearchDestination) => void;
  focusId?: ResearchId;
  initialTab?: ResearchTab;
}) {
  const [tab, setTab] = useState<ResearchTab>(initialTab);
  const [focus, setFocus] = useState({ id: focusId, revision: 0 });
  const onFocus = (id: ResearchId) => {
    setFocus((f) => ({ id, revision: f.revision + 1 }));
    setTab('projects');
    requestAnimationFrame(() =>
      document
        .getElementById('research-browse')
        ?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
  };
  const props = { state, dispatch, onFocus, onDestination };
  return (
    <div className="research-page">
      <div className="research-summary">
        <FlaskConical size={19} />
        <strong data-testid="knowledge">{state.knowledge} knowledge</strong>
        <span>
          +{weeklyKnowledge(state)}/week · +12/harvest · +1/40 bottles
        </span>
        <span>
          {availableVarieties(state).length} plantable varieties · 12 weeks/year
        </span>
      </div>
      <nav className="research-tabs" aria-label="Research departments">
        {(
          [
            ['projects', 'Studies'],
            ['library', 'Grape library'],
            ['nursery', 'Breeding nursery'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? 'page' : undefined}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
            {id === 'nursery' && state.hybrids.length > 0 && (
              <small>{state.hybrids.length}</small>
            )}
          </button>
        ))}
      </nav>
      <CurrentStudies state={state} dispatch={dispatch} />
      <OutcomePlanner {...props} />
      <StudyShortlist state={state} dispatch={dispatch} onFocus={onFocus} />
      <div id="research-browse">
        {tab === 'projects' && (
          <ResearchProjects
            key={focus.revision}
            {...props}
            focusId={focus.id}
          />
        )}
        {tab === 'library' && <GrapeLibrary {...props} />}
        {tab === 'nursery' && <BreedingNursery {...props} />}
      </div>
    </div>
  );
}
