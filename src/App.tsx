import type { ResearchId } from './catalog';
import { HouseCrest } from './HouseCrest';
import { IdentityEditor } from './IdentityEditor';
import { EstateToolbar } from './Holdings';
import { plotId, estateIdForPlot } from './estates';
import './holdings.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  ExternalLink,
  HardDrive,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Save,
  Settings2,
  Sparkles,
  X,
} from 'lucide-react';
import EstateMap from './EstateMap';
import { EstateFieldwork } from './EstateFieldwork';
import RegionSetup from './Regions';
import Research from './Research';
import type { ResearchTab } from './Research';
import { ResearchNotices, DiscoveryParcelChoice } from './ResearchNotices';
import type { ResearchDestination } from './researchPlanning';
import type { Upgrade } from './investments';
import { ReleaseReveal } from './WinePresentation';
import { liters, volume } from './winemaking';
import { Cellar, Improvements, Journal, Market, PlotInspector } from './Panels';
import type { View } from './Panels';
import { Icon, Modal } from './components';
import { PrestigeDetails, PrestigeResource } from './EstatePrestige';
import {
  act,
  bottlePriceLimit,
  getEstate,
  REGIONS,
  BACKUP_KEY,
  calendar,
  deserialize,
  money,
  newGame,
  readyToHarvest,
  SAVE_KEY,
  serialize,
  tankCount,
  occupiedTankCount,
  upkeep,
  weather,
} from './game';
import type { Action, GameState, Wine } from './game';

const NAV: {
  id: View;
  name: string;
  icon: 'map' | 'barrel' | 'shop' | 'sprout' | 'book' | 'flask';
}[] = [
  { id: 'estate', name: 'Estate', icon: 'map' },
  { id: 'cellar', name: 'Cellar', icon: 'barrel' },
  { id: 'market', name: 'Wine shop', icon: 'shop' },
  { id: 'improvements', name: 'Build', icon: 'sprout' },
  { id: 'research', name: 'Research', icon: 'flask' },
  { id: 'journal', name: 'Journal', icon: 'book' },
];
function loadInitial() {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
    return {
      state: raw ? deserialize(raw) : newGame(),
      warning: '',
      hasSave: Boolean(raw),
    };
  } catch {
    if (raw) {
      try {
        localStorage.setItem(BACKUP_KEY, raw);
      } catch {
        /* Keep the original save if backup storage is unavailable. */
      }
      return {
        state: newGame(),
        hasSave: true,
        warning:
          'Your previous save could not be read. Download its recovery copy in Save & settings before starting a new estate.',
      };
    }
    return {
      state: newGame(),
      hasSave: false,
      warning:
        'Browser storage is unavailable. Use Export save to keep your progress.',
    };
  }
}
function download(raw: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([raw], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default function App() {
  const [initial] = useState(loadInitial);
  const [setup, setSetup] = useState<'fresh' | 'replace' | null>(
    initial.hasSave ? null : 'fresh',
  );
  const [state, setState] = useState(initial.state);
  const current = useRef(state);
  const [view, setView] = useState<View>('estate');
  const [researchFocus, setResearchFocus] = useState<ResearchId | undefined>();
  const [researchTab, setResearchTab] = useState<ResearchTab>('projects');
  const [navigationRevision, setNavigationRevision] = useState(0);
  const [cellarTab, setCellarTab] = useState<'reserves' | 'fermentation'>(
    'fermentation',
  );
  const [investmentFocus, setInvestmentFocus] = useState<Upgrade | undefined>();
  const [grapeDestination, setGrapeDestination] = useState<string | null>(null);
  const [selection, setSelected] = useState(1);
  const selected = state.plots.some(
    (p) => p.id === selection && estateIdForPlot(p.id) === state.activeEstate,
  )
    ? selection
    : plotId(state.activeEstate);
  const [plantingTarget, setPlantingTarget] = useState<{
    plot: number;
    variety: string;
  } | null>(null);
  const [buildLand, setBuildLand] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [modal, setModal] = useState<
    'help' | 'settings' | 'prestige' | 'identity' | null
  >(null);
  const modalTrigger = useRef<HTMLButtonElement | null>(null);
  const identityTrigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // Opening makes the page inert before the modal can capture focus.
    // Restore the trigger after closing has made the page interactive again.
    if (modal === null && modalTrigger.current) {
      modalTrigger.current.focus();
      modalTrigger.current = null;
    }
  }, [modal]);
  const [reveal, setReveal] = useState<{
    wine: Wine;
    unlockedPricing: boolean;
  } | null>(null);
  const closeReveal = useCallback(() => setReveal(null), []);
  const [notice, setNotice] = useState(initial.warning);
  const [saved, setSaved] = useState(!initial.warning);
  const [toast, setToast] = useState<{
    text: string;
    error: boolean;
    id: number;
  } | null>(null);
  const toastId = useRef(0);
  const [rename, setRename] = useState(false);
  const [estateName, setEstateName] = useState(state.name);
  const [pendingImport, setPendingImport] = useState<GameState | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const corrupt = useRef(
    Boolean(initial.warning && initial.warning.includes('previous save')),
  );
  const notify = useCallback(
    (text: string, error = false) =>
      setToast({ text, error, id: ++toastId.current }),
    [],
  );
  const persist = useCallback((next: GameState) => {
    try {
      if (corrupt.current) {
        const old = localStorage.getItem(SAVE_KEY);
        if (old) localStorage.setItem(BACKUP_KEY, old);
        corrupt.current = false;
      }
      localStorage.setItem(SAVE_KEY, serialize(next));
      setSaved(true);
      return true;
    } catch {
      setSaved(false);
      setNotice(
        'Autosave is unavailable. Export a save file to keep your progress.',
      );
      return false;
    }
  }, []);
  const replace = useCallback(
    (next: GameState) => {
      current.current = next;
      setState(next);
      persist(next);
    },
    [persist],
  );
  const dispatch = useCallback(
    (action: Action) => {
      try {
        const previousPriceLimit = bottlePriceLimit(current.current);
        const next = act(current.current, action);
        replace(next);
        if (action.type === 'expandEstate')
          setSelected(plotId(next.activeEstate, getEstate(next).districts - 1));
        if (action.type === 'visitEstate' || action.type === 'acquireEstate')
          setSelected(plotId(next.activeEstate));
        if (action.type === 'bottle') {
          setSpeed(0);
          setToast(null);
          setReveal({
            wine: next.wines.at(-1)!,
            unlockedPricing: bottlePriceLimit(next) > previousPriceLimit,
          });
        }
        if (['advance', 'collectWine', 'returnWine'].includes(action.type))
          setToast(null);
        if (next.bankruptcy || next.pendingEvents > 0) setSpeed(0);
        if (
          action.type !== 'acknowledgeEvents' &&
          action.type !== 'bottle' &&
          action.type !== 'advance' &&
          action.type !== 'price' &&
          action.type !== 'shelfSpace' &&
          action.type !== 'rename' &&
          action.type !== 'label' &&
          action.type !== 'visitEstate' &&
          ![
            'planResearch',
            'shortlistResearch',
            'moveShortlist',
            'dismissDiscovery',
            'houseIdentity',
            'vintageNote',
            'collectWine',
            'returnWine',
          ].includes(action.type)
        )
          notify(next.log[0].text);
        return true;
      } catch (error) {
        notify(
          error instanceof Error
            ? error.message
            : 'That action could not be completed.',
          true,
        );
        return false;
      }
    },
    [notify, replace],
  );
  const closeModal = useCallback(() => {
    setModal(null);
    setPendingImport(null);
  }, []);
  const selectParcel = (id: number) => {
    setSelected(id);
    if (window.matchMedia('(max-width: 620px)').matches)
      requestAnimationFrame(() =>
        document.getElementById('parcel-inspector')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
          block: 'start',
        }),
      );
  };
  const navigate = useCallback((next: View, study?: ResearchId) => {
    setResearchFocus(study);
    setPlantingTarget(null);
    setResearchTab('projects');
    setCellarTab('fermentation');
    setInvestmentFocus(undefined);
    setNavigationRevision((n) => n + 1);
    setView(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  const openResearchDestination = (destination: ResearchDestination) => {
    if (destination.grape) {
      setSpeed(0);
      setGrapeDestination(destination.grape);
      return;
    }
    navigate(destination.view, destination.study);
    if (destination.nursery) setResearchTab('nursery');
    if (destination.library) setResearchTab('library');
    if (destination.reserves) setCellarTab('reserves');
    if (destination.investment) {
      setBuildLand(false);
      setInvestmentFocus(destination.investment);
    }
  };
  useEffect(() => {
    if (view === 'improvements' && investmentFocus) {
      const row = document.getElementById(`investment-${investmentFocus}`);
      row?.scrollIntoView({ block: 'center', behavior: 'instant' });
      row?.focus({ preventScroll: true });
    }
  }, [view, investmentFocus, navigationRevision]);
  useEffect(() => {
    if (!initial.warning && initial.hasSave) persist(current.current);
  }, [initial, persist]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  useEffect(() => {
    if (
      !speed ||
      modal ||
      setup ||
      reveal ||
      grapeDestination ||
      state.bankruptcy
    )
      return;
    const timer = setInterval(() => {
      if (!dispatch({ type: 'advance' })) setSpeed(0);
    }, 6000 / speed);
    return () => clearInterval(timer);
  }, [
    speed,
    dispatch,
    modal,
    setup,
    reveal,
    grapeDestination,
    state.bankruptcy,
  ]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) setSpeed(0);
    };
    const storage = (event: StorageEvent) => {
      if (event.key !== SAVE_KEY || !event.newValue) return;
      try {
        const incoming = deserialize(event.newValue);
        setSpeed(0);
        current.current = incoming;
        setState(incoming);
        setReveal(null);
        setModal(null);
        setPlantingTarget(null);
        setGrapeDestination(null);
        setSetup(null);
        setSaved(true);
        notify('Loaded the latest estate changes from your other tab.');
      } catch {
        setNotice(
          'Another tab wrote an unreadable save. Your current estate is still open; export it to keep a copy.',
        );
      }
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('storage', storage);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('storage', storage);
    };
  }, [notify]);
  const date = calendar(state.week);
  const sky = weather(state.week, getEstate(state).region);
  const harvests = state.plots.filter((p) => readyToHarvest(p, state.week));
  const bottled = state.wines.reduce((n, w) => n + w.bottles, 0);
  const getNextStep = (): { title: string; text: string; view: View } => {
    if (date.week === 9 && harvests.length)
      return {
        title: 'Harvest before winter.',
        text: `${harvests.length} ripe parcel${harvests.length === 1 ? '' : 's'} will lose unpicked fruit next week. Pick now.`,
        view: 'estate',
      };
    if (state.grapes.length)
      return {
        title: 'Your grapes are waiting.',
        text: 'Start fermentation while the harvest is fresh.',
        view: 'cellar',
      };
    if (state.batches.some((b) => b.stage !== 'fermenting'))
      return {
        title: 'Something good is ready.',
        text: 'Move your finished wine into reserves, or let it age.',
        view: 'cellar',
      };
    if (state.reserves.some((r) => volume(r.components) >= 750))
      return {
        title: 'Your reserves are waiting.',
        text: 'Blend stored wines or bottle a new release for your wine line.',
        view: 'cellar',
      };
    if (state.wines.some((w) => !w.listed && w.bottles > 0))
      return {
        title: 'Time to share your wine.',
        text: 'Set a price and put your first bottles on the shelf.',
        view: 'market',
      };
    if (harvests.length)
      return {
        title: 'A good day to pick.',
        text: `${harvests.length} parcel${harvests.length > 1 ? 's are' : ' is'} ready. Your next vintage starts here.`,
        view: 'estate',
      };
    if (state.batches.length)
      return {
        title: 'Let time do its thing.',
        text: 'Advance the week while your wine develops in the cellar.',
        view: 'cellar',
      };
    return {
      title: 'Make yourself at home.',
      text: 'Plant new varieties, care for your vines, and watch the seasons turn.',
      view: 'estate',
    };
  };
  const nextStep = getNextStep();
  const settings = () => {
    setSpeed(0);
    setModal('settings');
  };
  if (setup)
    return (
      <RegionSetup
        onCancel={setup === 'replace' ? () => setSetup(null) : undefined}
        onStart={(next) => {
          setNotice('');
          replace(next);
          setSetup(null);
          setSelected(1);
          setView('estate');
          setRename(false);
          setSpeed(0);
          setToast(null);
          window.scrollTo(0, 0);
        }}
      />
    );
  if (state.bankruptcy)
    return (
      <main className="estate-closure">
        <span className="eyebrow">ESTATE CLOSED · YEAR {date.year}</span>
        <h1>{state.name} has gone bankrupt.</h1>
        <p>
          The estate could not cover {money(state.bankruptcy.unpaid)} of its{' '}
          {money(state.bankruptcy.bill)} weekly upkeep. This game has ended.
        </p>
        <dl>
          <dt>Bottles sold</dt>
          <dd>{state.stats.sold.toLocaleString()}</dd>
          <dt>Best wine</dt>
          <dd>{state.stats.best}/100</dd>
          <dt>Total revenue</dt>
          <dd>{money(state.stats.revenue)}</dd>
        </dl>
        {!saved && (
          <p role="alert">
            The final record could not be saved. Export it to keep a copy.
          </p>
        )}
        <div className="closure-actions">
          <button
            className="button primary"
            onClick={() => setSetup('replace')}
          >
            Start a new game <ArrowRight size={16} />
          </button>
          <button
            className="button secondary"
            onClick={() =>
              download(serialize(state), 'terroir-final-estate.json')
            }
          >
            Export final record
          </button>
        </div>
      </main>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar" inert={modal !== null || reveal !== null}>
        <a
          className="brand-mark"
          href="#estate"
          aria-label="Terroir estate"
          onClick={(e) => {
            e.preventDefault();
            setView('estate');
          }}
        >
          <Icon name="grape" size={31} />
        </a>
        <div className="sidebar-rule" />
        <nav aria-label="Main navigation">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${view === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <span className="nav-icon">
                <Icon name={item.icon} size={23} />
                {item.id === 'cellar' && state.grapes.length > 0 && <i />}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="nav-button"
            onClick={() => {
              setSpeed(0);
              setModal('help');
            }}
          >
            <Icon name="help" size={23} />
            <span>Guide</span>
          </button>
          <button
            className="nav-button"
            onClick={settings}
            aria-label="Save and settings"
          >
            <Settings2 size={21} strokeWidth={1.7} />
          </button>
          <span className="version">v0.7</span>
        </div>
      </aside>
      <div className="app-body" inert={modal !== null || reveal !== null}>
        <header className="topbar">
          <div className="wordmark">
            terroir<span>WINERY TYCOON</span>
          </div>
          <div className="topbar-rule" />
          <div className="estate-name">
            {rename ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (dispatch({ type: 'rename', name: estateName }))
                    setRename(false);
                }}
              >
                <input
                  aria-label="Estate name"
                  maxLength={32}
                  value={estateName}
                  onChange={(e) => setEstateName(e.target.value)}
                  autoFocus
                />
                <button className="icon-button" aria-label="Save estate name">
                  <Check size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setEstateName(state.name);
                  setRename(true);
                }}
                title="Rename estate"
              >
                {state.name}
                <Pencil size={12} />
              </button>
            )}
            <span>
              {REGIONS[state.region].name} · {REGIONS[state.region].country}
            </span>
          </div>
          <button
            className="house-identity-trigger"
            ref={identityTrigger}
            aria-label="Design your house identity"
            onClick={() => {
              modalTrigger.current = identityTrigger.current;
              setSpeed(0);
              setModal('identity');
            }}
          >
            <HouseCrest
              identity={state.houseIdentity ?? undefined}
              name={state.name}
            />
          </button>
          <div className="topbar-actions">
            <span className={`save-status ${!saved ? 'warning-text' : ''}`}>
              <span className="tiny-dot" />
              {saved ? 'Saved locally' : 'Save needed'}
            </span>
            <button
              className="save-button"
              aria-label="Save & settings"
              onClick={settings}
            >
              <Save size={16} />
              <span>Save & settings</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        {notice && (
          <div className="notice" role="alert">
            <Icon name="help" size={17} />
            <span>{notice}</span>
            <button className="text-button" onClick={settings}>
              Manage save
            </button>
            <button
              className="icon-button"
              aria-label="Dismiss notice"
              onClick={() => setNotice('')}
            >
              <X size={15} />
            </button>
          </div>
        )}
        <div className="resource-bar">
          <div className="resource">
            <span className="resource-icon">
              <Icon name="wallet" size={20} />
            </span>
            <div>
              <small>ESTATE FUNDS</small>
              <strong data-testid="cash">{money(state.cash)}</strong>
            </div>
            <span className="resource-secondary">
              −{money(upkeep(state))} / week
            </span>
          </div>
          <PrestigeResource
            value={state.reputation}
            onOpen={(trigger) => {
              modalTrigger.current = trigger;
              setSpeed(0);
              setModal('prestige');
            }}
          />
          <div className="resource">
            <span className="resource-icon">
              <Icon name="barrel" size={20} />
            </span>
            <div>
              <small>IN THE CELLAR</small>
              <strong>
                {liters(
                  state.batches.reduce((n, b) => n + b.liters * 1000, 0) +
                    state.reserves.reduce(
                      (n, r) => n + volume(r.components),
                      0,
                    ),
                )}
                <span> L</span>
              </strong>
            </div>
            <span className="resource-secondary">
              {tankCount(state) - occupiedTankCount(state)} free tanks
            </span>
          </div>
          <div className="resource">
            <span className="resource-icon">
              <Icon name="glass" size={20} />
            </span>
            <div>
              <small>BOTTLED WINE</small>
              <strong>
                {bottled}
                <span> bottles</span>
              </strong>
            </div>
          </div>
        </div>
        <main className={view === 'research' ? 'research-main' : undefined}>
          <div className="page-title-row">
            <div>
              <div className="breadcrumb">
                YOUR WINEMAKING JOURNEY <ChevronRight size={12} /> YEAR{' '}
                {date.year}
              </div>
              <h1>
                {view === 'estate'
                  ? 'Life on the vineyard'
                  : view === 'cellar'
                    ? 'The wine cellar'
                    : view === 'market'
                      ? 'Your wine shop'
                      : view === 'improvements'
                        ? 'Grow your estate'
                        : view === 'research'
                          ? 'Research & discovery'
                          : 'The estate journal'}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {view === 'estate'
                  ? 'Tend your vines. Follow the seasons. Make something worth waiting for.'
                  : view === 'cellar'
                    ? 'Follow each harvest from fermentation to its next release.'
                    : view === 'market'
                      ? 'Every bottle has a story. This one is yours.'
                      : view === 'improvements'
                        ? 'Thoughtful additions for the vintages ahead.'
                        : view === 'research'
                          ? 'Study new grapes. Master your craft. Shape the estate’s future.'
                          : 'Your vintages, memories, and estate accounts.'}
              </p>
            </div>
            <div className="season-weather">
              <div className="weather-icon">
                <Icon
                  name={
                    sky.name === 'Light rain'
                      ? 'rain'
                      : sky.name === 'Frosty'
                        ? 'snow'
                        : sky.name === 'Overcast'
                          ? 'cloud'
                          : 'sun'
                  }
                  size={28}
                />
              </div>
              <div>
                <b>
                  {sky.temp}°C <span>{sky.name}</span>
                </b>
                <p>
                  {date.season} · Year {date.year}
                </p>
              </div>
            </div>
          </div>
          <div className="season-toolbar">
            <div className="season-tabs">
              {['Spring', 'Summer', 'Autumn', 'Winter'].map((s, i) => (
                <span className={s === date.season ? 'current' : ''} key={s}>
                  <Icon
                    name={(['sprout', 'sun', 'leaf', 'snow'] as const)[i]}
                    size={14}
                  />
                  {s}
                  {s === date.season && <i />}
                </span>
              ))}
            </div>
            <div className="time-controls">
              <span className="week-label">
                Week <b data-testid="week">{date.week}</b>
                <span> / 12</span>
              </span>
              <div className="speed-controls">
                <button
                  className={speed === 0 ? 'selected' : ''}
                  aria-label="Pause time"
                  aria-pressed={speed === 0}
                  onClick={() => setSpeed(0)}
                >
                  <Pause size={13} fill="currentColor" />
                </button>
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    aria-label={`Play at ${s}x speed`}
                    aria-pressed={speed === s}
                    className={speed === s ? 'selected' : ''}
                    disabled={state.pendingEvents > 0}
                    title={
                      state.pendingEvents > 0
                        ? 'Acknowledge estate updates to resume time'
                        : undefined
                    }
                    onClick={() => setSpeed(s)}
                  >
                    {s}×
                  </button>
                ))}
              </div>
              <button
                className="next-week"
                onClick={() => dispatch({ type: 'advance' })}
              >
                Next week <ArrowRight size={15} />
              </button>
            </div>
          </div>
          {state.pendingEvents > 0 && (
            <section
              className="estate-updates"
              aria-label="Estate updates"
              role="status"
            >
              <h2>Estate updates</h2>
              <p>
                Time is paused for these events. Their history stays in your
                Journal.
              </p>
              <ul>
                {state.events.slice(0, state.pendingEvents).map((event, i) => (
                  <li key={i}>{event.text}</li>
                ))}
              </ul>
              <button
                className="button secondary"
                onClick={() => dispatch({ type: 'acknowledgeEvents' })}
              >
                Acknowledge updates
              </button>
            </section>
          )}
          <div key={view} className="view-content">
            <ResearchNotices
              state={state}
              dispatch={dispatch}
              onDestination={openResearchDestination}
            />
            {view === 'estate' ? (
              <>
                <EstateToolbar
                  state={state}
                  dispatch={dispatch}
                  selected={selected}
                  onSelect={setSelected}
                  onExpand={() => {
                    setBuildLand(true);
                    navigate('improvements');
                  }}
                />
                <EstateFieldwork
                  state={state}
                  dispatch={dispatch}
                  selected={selected}
                  onSelect={selectParcel}
                />
                <div className="estate-workspace">
                  <EstateMap
                    key={`${state.activeEstate}-${Math.floor((selected - 1) / 6)}`}
                    state={state}
                    selected={selected}
                    onSelect={selectParcel}
                    onCellar={() => navigate('cellar')}
                  />
                  <PlotInspector
                    key={`${selected}-${state.region}-${state.hybrids.map((h) => h.id).join()}-${plantingTarget?.variety ?? ''}`}
                    initialVariety={
                      plantingTarget?.plot === selected
                        ? plantingTarget.variety
                        : undefined
                    }
                    state={state}
                    dispatch={dispatch}
                    selected={selected}
                    navigate={navigate}
                  />
                </div>
                <div className="estate-bottom">
                  <div className="advisor">
                    <div className="advisor-avatar">
                      <Icon name="sprout" size={25} />
                    </div>
                    <div>
                      <small>A NOTE FROM YOUR WINEMAKER</small>
                      <h3>{nextStep.title}</h3>
                      <p>{nextStep.text}</p>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Go to suggested next step"
                      onClick={() => {
                        navigate(nextStep.view);
                        if (nextStep.view === 'estate' && harvests.length) {
                          dispatch({
                            type: 'visitEstate',
                            id: estateIdForPlot(harvests[0].id),
                          });
                          setSelected(harvests[0].id);
                        }
                      }}
                    >
                      <ArrowRight size={21} />
                    </button>
                  </div>
                </div>
              </>
            ) : view === 'cellar' ? (
              <Cellar
                key={navigationRevision}
                state={state}
                dispatch={dispatch}
                navigate={navigate}
                initialTab={cellarTab}
              />
            ) : view === 'market' ? (
              <Market state={state} dispatch={dispatch} navigate={navigate} />
            ) : view === 'improvements' ? (
              <Improvements
                key={navigationRevision}
                focusUpgrade={investmentFocus}
                landOpen={buildLand}
                onTabChange={setBuildLand}
                state={state}
                dispatch={dispatch}
                navigate={navigate}
              />
            ) : view === 'research' ? (
              <Research
                key={navigationRevision}
                state={state}
                dispatch={dispatch}
                onDestination={openResearchDestination}
                focusId={researchFocus}
                initialTab={researchTab}
              />
            ) : (
              <Journal state={state} dispatch={dispatch} navigate={navigate} />
            )}
          </div>
          <footer className="game-footer">
            <div>
              <span className="tiny-dot" />
              {state.log[0].text}
            </div>
            <span>
              {speed ? (
                <>
                  <Play size={11} />
                  {speed}× speed
                </>
              ) : (
                <>
                  <Pause size={11} />
                  Time is paused. Take your time.
                </>
              )}
            </span>
          </footer>
        </main>
      </div>
      {grapeDestination && (
        <DiscoveryParcelChoice
          state={state}
          grape={grapeDestination}
          onClose={() => setGrapeDestination(null)}
          onChoose={(id) => {
            const regionEstate = estateIdForPlot(id);
            if (
              state.activeEstate !== regionEstate &&
              !dispatch({ type: 'visitEstate', id: regionEstate })
            )
              return;
            setGrapeDestination(null);
            navigate('estate');
            setSelected(id);
            setPlantingTarget({ plot: id, variety: grapeDestination });
          }}
        />
      )}
      {toast && (
        <div
          className={`toast ${toast.error ? 'error' : ''}`}
          role={toast.error ? 'alert' : 'status'}
        >
          <span>
            {toast.error ? (
              <Icon name="help" size={20} />
            ) : (
              <CircleCheck size={20} />
            )}
          </span>
          <p>{toast.text}</p>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {reveal && (
        <ReleaseReveal
          wine={reveal.wine}
          unlockedPricing={reveal.unlockedPricing}
          state={state}
          onClose={closeReveal}
          onShop={() => {
            setReveal(null);
            navigate('market');
          }}
        />
      )}
      {modal === 'identity' && (
        <Modal title="A mark of your own." onClose={closeModal}>
          <IdentityEditor
            state={state}
            dispatch={dispatch}
            onClose={closeModal}
          />
        </Modal>
      )}
      {modal === 'settings' && (
        <Modal title="Make yourself at home." onClose={closeModal}>
          <p className="modal-intro">
            All your estates, safely kept. Progress saves after every action in
            this browser.
          </p>
          <div className="save-summary">
            <div className="save-estate-icon">
              <HouseCrest
                identity={state.houseIdentity ?? undefined}
                name={state.name}
              />
            </div>
            <div>
              <h3>{state.name}</h3>
              <p>
                Year {date.year} · {date.season} · Week {date.week} ·{' '}
                {money(state.cash)} · {state.estates.length}{' '}
                {state.estates.length === 1 ? 'estate' : 'estates'}
              </p>
              <span>
                <HardDrive size={12} />
                {saved
                  ? 'Saved on this device'
                  : 'Export a file to save your progress'}
              </span>
            </div>
          </div>
          <div className="save-actions">
            <button
              className="button secondary wide"
              onClick={() => {
                modalTrigger.current = identityTrigger.current;
                setModal('identity');
              }}
            >
              Design your house identity
            </button>
            <button
              className="button primary wide"
              onClick={() => {
                if (persist(current.current))
                  notify('Your estate is saved in this browser.');
              }}
            >
              <Save size={17} />
              Save now
              <Check size={16} />
            </button>
            <button
              className="button secondary wide"
              onClick={() => {
                download(
                  serialize(current.current),
                  `terroir-year-${date.year}-week-${date.week}.json`,
                );
                notify(
                  'Save exported. Keep the file to continue on another device.',
                );
              }}
            >
              <ArrowDownToLine size={17} />
              Export save<span className="subtle">.json</span>
            </button>
            <button
              className="button secondary wide"
              onClick={() => fileInput.current?.click()}
            >
              <ArrowUpFromLine size={17} />
              Import save
              <ChevronRight size={16} />
            </button>
            <input
              ref={fileInput}
              className="visually-hidden"
              type="file"
              accept=".json,application/json"
              aria-label="Import estate save file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                try {
                  if (file.size > 2_000_000)
                    throw new Error('Please choose a save smaller than 2 MB.');
                  setPendingImport(deserialize(await file.text()));
                } catch (error) {
                  notify(
                    error instanceof Error
                      ? error.message
                      : 'Unable to read this save file.',
                    true,
                  );
                }
              }}
            />
          </div>
          {pendingImport && (
            <div className="confirmation">
              <h3>Continue at {pendingImport.name}?</h3>
              <p>
                This replaces the estate currently open. Export your current
                save first if you want to keep both.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  replace(pendingImport);
                  setSelected(1);
                  setView('estate');
                  closeModal();
                  notify('Welcome back. Your estate has been restored.');
                }}
              >
                Load this estate
              </button>
              <button
                className="text-button"
                onClick={() => setPendingImport(null)}
              >
                Cancel
              </button>
            </div>
          )}
          <p className="save-footnote">
            <Icon name="help" size={16} />
            Saves belong to this browser and address. Export a file before
            clearing browser data or moving to a different device. The game
            pauses when you leave the tab.
          </p>
          <button
            className="text-button"
            onClick={() => {
              try {
                const raw = localStorage.getItem(BACKUP_KEY);
                if (raw) download(raw, 'terroir-recovery.json');
                else
                  notify(
                    'No recovery copy is needed. Your current save is available above.',
                  );
              } catch {
                notify('Recovery storage is unavailable.', true);
              }
            }}
          >
            Download recovery copy
          </button>
          <button
            className="text-button mobile-guide"
            onClick={() => setModal('help')}
          >
            <Icon name="help" size={15} />
            Read the winemaker’s field guide
          </button>
          <div className="reset-section">
            <button
              className="text-button muted"
              onClick={() => {
                closeModal();
                setSpeed(0);
                setSetup('replace');
                window.scrollTo(0, 0);
              }}
            >
              <RotateCcw size={14} />
              Start a new game
            </button>
          </div>
        </Modal>
      )}
      {modal === 'prestige' && (
        <PrestigeDetails value={state.reputation} onClose={closeModal} />
      )}
      {modal === 'help' && (
        <Modal
          title="A field guide to your first vintage."
          onClose={closeModal}
        >
          <p className="modal-intro">
            Welcome to Terroir. A small vineyard, twelve weeks in a year, and
            all the time you need to make your next decision.
          </p>
          <div className="guide-steps">
            {[
              [
                'sprout',
                '01',
                'Tend & harvest',
                'Harvest at 80% ripeness or above, before winter in week 10. Full ripeness, healthy vines, a suitable site, and grape finesse all matter. A 90+ wine takes exceptional fruit and careful cellar work. Each parcel yields once a year. Expand an owned plot to grow more of its grape; new rows on planted plots start producing next spring.',
              ],
              [
                'barrel',
                '02',
                'Ferment & age',
                'Ferment fresh grapes within 3 weeks, or 5 with refrigerated storage. Process what fits; remaining grapes keep their spoilage deadline. Buy 150 L tanks and floor space under Cellar → Space & tanks. Fermentation costs $140 per steel tank or $320 in oak and takes 2 weeks, plus any techniques. Then choose steel, neutral oak, or French oak maturation for each batch. Follow its suggested release window and optionally schedule a transfer. Maturation adds at most 6 points; too much oak can lower balance. Temperature control adds 3 points. Transfer to reserves frees every assigned tank. Older batches keep their original aging curve.',
              ],
              [
                'glass',
                '03',
                'Blend, bottle & share',
                'Blend reserves across grapes and vintages, then bottle into a new or existing wine line. Each 750 mL bottle uses one kit; orders arrive next week. Above 90 points, each extra point earns a larger price premium. Prestige amplifies it; judging medals add value. Set your price and list the wine.',
              ],
              [
                'trend',
                '04',
                'Grow at your own pace',
                'Advance one week at a time, or press 1×, 2×, or 4×. Build offers facilities and teams with substantial weekly costs. Visitor income depends on Prestige and season. Suspending stops benefits immediately; this week’s full bill remains, then maintenance falls to 25%. Check your journal to track revenue and estate expenses.',
              ],
            ].map(([icon, number, title, text]) => (
              <div className="guide-step" key={number}>
                <div>
                  <Icon name={icon as 'sprout'} size={23} />
                </div>
                <section>
                  <small>CHAPTER {number}</small>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </section>
              </div>
            ))}
          </div>
          <div className="guide-note">
            <Clock3 size={18} />
            <p>
              Seasons are compressed for play: 3 weeks each. No offline
              progress, deadlines in real time, or account required. This is a
              simplified tycoon game, not a real winemaking guide.
            </p>
          </div>
          <details className="inspiration">
            <summary>
              Behind the game <Sparkles size={13} />
            </summary>
            <p>
              An original browser game inspired by vineyard restoration,
              production choices, and fair pricing in Winery Simulator’s
              published description, plus community ideas about tank logistics,
              supplies, aging, terrain, and tasting rooms.
            </p>
            <a
              href="https://store.steampowered.com/app/1533060/Winery_Simulator/"
              target="_blank"
              rel="noreferrer"
            >
              Winery Simulator on Steam <ExternalLink size={12} />
            </a>
            <a
              href="https://www.reddit.com/r/winemaking/comments/lt3f8h/winery_simulator_game_about_managing_your_own/"
              target="_blank"
              rel="noreferrer"
            >
              The winemaking community discussion <ExternalLink size={12} />
            </a>
          </details>
          <button className="button primary wide" onClick={closeModal}>
            Let’s make some wine
            <ArrowRight size={17} />
          </button>
        </Modal>
      )}
    </div>
  );
}
