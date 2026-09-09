import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calendar } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import { estateJournal } from './vintageJournal';
import { RegionLandscape } from './RegionLandscape';
import { HouseCrest } from './HouseCrest';
import { BottleView } from './WinePresentation';

function YearNote({
  year,
  note,
  dispatch,
}: {
  year: number;
  note: string;
  dispatch: Dispatch;
}) {
  const [draft, setDraft] = useState(note);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="vintage-note"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(dispatch({ type: 'vintageNote', year, note: draft }));
      }}
    >
      <label htmlFor="vintage-note">A note to remember this year</label>
      <textarea
        id="vintage-note"
        rows={3}
        maxLength={600}
        value={draft}
        placeholder="The harvest, a favorite blend, a bottle worth keeping…"
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
      />
      <div>
        <span className="subtle">{draft.length}/600</span>
        <span role="status">{saved ? 'Note saved' : ''}</span>
        <button className="button secondary" type="submit">
          Save year note
        </button>
      </div>
    </form>
  );
}

export function VintageBook({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: Dispatch;
}) {
  const journal = useMemo(() => estateJournal(state), [state]);
  const currentYear = calendar(state.week).year;
  const [selectedYear, setYear] = useState(currentYear);
  const years = [
    ...new Set([
      currentYear,
      ...journal.chapters.map((chapter) => chapter.year),
    ]),
  ].sort((a, b) => b - a);
  const chapter = journal.chapters.find(
    (chapter) => chapter.year === selectedYear,
  );
  const index = years.indexOf(selectedYear);
  return (
    <section className="vintage-book" aria-label="Vintage book">
      <div className="book-toolbar">
        <div>
          <span className="eyebrow">THE WINEMAKER’S BOOK</span>
          <h2>Years worth keeping.</h2>
        </div>
        <div className="book-paging">
          <button
            className="icon-button"
            aria-label="Previous recorded year"
            disabled={index === years.length - 1}
            onClick={() => setYear(years[index + 1])}
          >
            <ChevronLeft size={18} />
          </button>
          <label>
            <span className="sr-only">Journal year</span>
            <select
              aria-label="Journal year"
              value={selectedYear}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                  {year === currentYear ? ' · In progress' : ''}
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button"
            aria-label="Next recorded year"
            disabled={index <= 0}
            onClick={() => setYear(years[index - 1])}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="book-spread" key={selectedYear}>
        <div className="book-folio">
          <div className="book-house">
            <HouseCrest
              identity={state.houseIdentity ?? undefined}
              name={state.name}
            />
            <span>{state.name}</span>
          </div>
          <span className="eyebrow">THE YEAR’S RECORD</span>
          <h3>
            Year <em>{selectedYear}</em>
          </h3>
          <RegionLandscape region={state.region} />
          <dl className="vintage-totals">
            <div>
              <dt>Harvest recorded</dt>
              <dd>
                {chapter?.harvestKg.toLocaleString() ?? '0'} <small>kg</small>
              </dd>
            </div>
            <div>
              <dt>Bottled this year</dt>
              <dd>
                {chapter?.bottles.toLocaleString() ?? '0'}{' '}
                <small>bottles</small>
              </dd>
            </div>
            <div>
              <dt>Releases recorded</dt>
              <dd>{chapter?.releases.toLocaleString() ?? '0'}</dd>
            </div>
          </dl>
          <p className="book-footnote">
            Harvest records begin in Year {calendar(journal.startedWeek).year},
            week {calendar(journal.startedWeek).week}. Earlier totals include
            only bottle quantities still recorded in your save. Each year keeps
            its six latest release labels alongside the annual totals.
          </p>
        </div>
        <div className="book-pages">
          <div className="section-line">
            <h3>From the cellar</h3>
            <span className="subtle">
              {chapter?.keepsakes.length
                ? `${chapter.keepsakes.length} release keepsakes`
                : 'A page for your next wine'}
            </span>
          </div>
          {chapter?.keepsakes.length ? (
            <div className="vintage-keepsakes">
              {[...chapter.keepsakes].reverse().map((wine) => (
                <article key={wine.id}>
                  <BottleView
                    name={wine.name}
                    estate={wine.estate}
                    design={wine.design}
                    founded={wine.founded}
                    year={wine.vintage}
                    release={wine.release}
                    white={wine.white}
                  />
                  <h4>{wine.name}</h4>
                  <p>
                    {wine.vintage} · Release {wine.release} · {wine.quality}{' '}
                    points
                  </p>
                  {wine.aromas.length > 0 && (
                    <p className="keepsake-aromas">{wine.aromas.join(' · ')}</p>
                  )}
                  {wine.design.note && (
                    <blockquote>{wine.design.note}</blockquote>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="book-empty">
              <HouseCrest
                identity={state.houseIdentity ?? undefined}
                name={state.name}
              />
              <h4>The first page is yours.</h4>
              <p>
                Bottle a release to keep its artwork and tasting notes here,
                even after the last bottle sells.
              </p>
            </div>
          )}
          <div className="book-moments">
            <h3>In the vineyard</h3>
            {state.estates
              .slice(0, 1)
              .filter((estate) => estate.founded === selectedYear)
              .map((estate) => (
                <p key={estate.id}>
                  <b>Year {selectedYear}</b>
                  <span>{estate.name} established.</span>
                </p>
              ))}
            {chapter?.moments.map((moment, i) => (
              <p key={i}>
                <b>Week {calendar(moment.week).week}</b>
                <span>{moment.text}</span>
              </p>
            ))}
            {!chapter?.moments.length &&
              selectedYear !== state.estates[0].founded && (
                <p>Harvests and new estates will leave their mark here.</p>
              )}
          </div>
          <YearNote
            key={selectedYear}
            year={selectedYear}
            note={chapter?.note ?? ''}
            dispatch={dispatch}
          />
        </div>
      </div>
    </section>
  );
}
