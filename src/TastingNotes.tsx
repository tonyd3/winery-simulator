import type { TastingProfile } from './wineSensory';

export function TastingNotes({ profile }: { profile: TastingProfile }) {
  return (
    <section className="tasting-notes" aria-label="Likely tasting notes">
      <h4>Likely tasting notes</h4>
      <p className="tasting-aromas">{profile.aromas.join(' · ')}</p>
      <dl>
        <div>
          <dt>Palate</dt>
          <dd>{profile.palate}</dd>
        </div>
        <div>
          <dt>Origins</dt>
          <dd>
            {profile.origins.map((origin) => (
              <p key={origin}>{origin}</p>
            ))}
          </dd>
        </div>
        <div>
          <dt>Aging</dt>
          <dd>
            {profile.aging.map((aging) => (
              <p key={aging}>{aging}</p>
            ))}
          </dd>
        </div>
        {profile.techniques && profile.techniques.length > 0 && (
          <div>
            <dt>Cellar</dt>
            <dd>
              {profile.techniques.map((technique) => (
                <p key={technique}>{technique}</p>
              ))}
            </dd>
          </div>
        )}
      </dl>
      <p className="tasting-caption">
        A style forecast from your grapes, regions, and cellar choices.
      </p>
    </section>
  );
}
