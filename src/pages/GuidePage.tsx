import { Card } from '../components/ui/Card'
import { EMERGENCY_CONTACTS, EMERGENCY_APPS } from '../data/emergency'
import { heritageSites } from '../data/heritage'
import { findRegion } from '../data/regions'

const SECTIONS = [
  {
    title: 'Park passes & permits',
    points: [
      'Yanchep, Nambung (Pinnacles/Cervantes), Leeuwin-Naturaliste (Dunsborough/Yallingup/Margaret River) are DBCA national parks — entry needs a day fee or a Park Pass (exploreparks.dbca.wa.gov.au). A same-day Yanchep ticket can also cover Nambung.',
      'A Holiday Pass (~4 weeks) or Annual All Parks Pass covers unlimited entry to all WA national parks where fees apply — worth it for a multi-stop trip.',
      'Station/pastoral country and some Aboriginal land require separate permission from the owner/manager — check before entering, this app does not track those.',
      'Camping bookings (where required) are separate from park entry — check each campsite\'s own booking system.',
    ],
  },
  {
    title: 'Camp setup & fire safety',
    points: [
      'Check current fire danger ratings and any total fire ban before lighting anything.',
      'Only camp in designated/legal sites — never on private land or closed reserves.',
      'Carry more water than you think you need; many WA coastal campsites have none.',
    ],
  },
  {
    title: '4WD & sand driving',
    points: [
      'Tyre pressure: ~22–25psi for firm wet sand, ~16–20psi for soft/dry sand — check your vehicle/tyre specs, and always carry a compressor to re-inflate for sealed roads.',
      'Check DBCA (and DPIRD for station/pastoral country) access requirements before you go — some tracks need a permit or are seasonally closed.',
      'Check BOM tide times before beach driving — soft, deep sand and cut-off routes are common risks around the high-tide line.',
      'Camp below the high-tide line where permitted, not in the dunes — dune vegetation is slow to recover and often protected.',
      'Travel with at least one other vehicle in remote areas where possible, and carry recovery boards plus a shovel.',
    ],
  },
  {
    title: 'Ocean & marine safety',
    points: [
      'Check swell, wind and tide before snorkelling or diving — conditions change fast on this coast.',
      'Be aware of rip currents at ocean beaches; swim at patrolled beaches where available.',
      'Dive only within your certification level and always with a buddy.',
    ],
  },
  {
    title: 'Remote travel preparation',
    points: [
      'Mobile reception is patchy to none at many of these sites — tell someone your plan.',
      'Carry a first aid kit and know the location of the nearest town with fuel and medical care.',
      'Consider a PLB (personal locator beacon) for remote 4WD or hiking trips.',
    ],
  },
]

export function GuidePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Guide</h1>
        <p className="text-sm text-ink-500">Practical camping, 4WD and safety guidance — not exhaustive.</p>
      </div>

      <Card className="border-terracotta-500/40 bg-terracotta-500/5 p-5">
        <h3 className="font-display font-semibold text-terracotta-600">🚨 Emergency numbers</h3>
        <dl className="mt-3 space-y-2">
          {EMERGENCY_CONTACTS.map((c) => (
            <div key={c.name} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-ink-700">
                {c.name}
                <span className="block text-xs text-ink-500">{c.when}</span>
              </dt>
              <dd className="shrink-0 font-mono text-base font-semibold text-terracotta-600">{c.number}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 border-t border-terracotta-500/20 pt-3 text-xs text-ink-500">
          {EMERGENCY_APPS.map((a) => (
            <p key={a}>{a}</p>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-5">
            <h3 className="font-display font-semibold text-ink-900">{s.title}</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-700">
              {s.points.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-teal-700">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-display font-semibold text-ink-900">🤝 Respecting Country</h3>
        <p className="mt-2 text-sm text-ink-700">
          This coastline is Noongar boodja (country) — Whadjuk around Perth, Binjareb/Pinjarra around Mandurah,
          Wardandi through the southwest forests and Margaret River region, among other Noongar language groups
          along the way. Noongar people have lived here for at least 45,000 years.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
          <li className="flex gap-2">
            <span className="text-teal-700">•</span>
            <span>Respect signage and closures around registered Aboriginal sites — don't disturb or remove anything.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-700">•</span>
            <span>
              For specific site information beyond general public knowledge, use the official WA Aboriginal Heritage
              Inquiry System (Dept. of Planning, Lands and Heritage) rather than assuming — some sites are
              deliberately not publicised, to protect them.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-700">•</span>
            <span>Where you can, support Aboriginal-owned tours and cultural centres — a good, genuine way to learn more.</span>
          </li>
        </ul>
      </Card>

      {heritageSites.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {heritageSites.map((h) => (
            <Card key={h.id} className="p-5">
              <h4 className="font-display text-sm font-semibold text-ink-900">
                {h.name} <span className="font-normal text-ink-300">· {findRegion(h.regionId)?.name}</span>
              </h4>
              <p className="mt-1.5 text-sm text-ink-700">{h.description}</p>
              {h.respectNotes && <p className="mt-1.5 text-xs text-terracotta-600">⚠️ {h.respectNotes}</p>}
            </Card>
          ))}
        </div>
      )}

      <Card className="border-terracotta-500/30 bg-terracotta-500/5 p-4 text-sm text-terracotta-600">
        This guide is general information, not a substitute for official safety advice. Always check current DBCA,
        DFES and BOM warnings before you travel.
      </Card>

      <p className="text-xs text-ink-300">
        Background photography via Wikimedia Commons: dolphin (NASA, public domain), whale (Brigitte Werner/Pixabay,
        CC0), turtle & reef fish (US Fish &amp; Wildlife Service, public domain), Hamelin Bay beach (public domain),
        Australian sea lion photo by Brian M. Hunt (CC BY-SA 3.0). Destination photos on Explore cards and species
        photos in the Wildlife Calendar are also sourced from Wikimedia Commons, each credited on the image itself.
        4WD/sand-driving tyre-pressure and tide guidance adapted from Defender Adventure's WA beaches 4WD guide;
        camping spot details cross-checked against RAC WA, 4WDing Australia, We Are Explorers, Hipcamp, PerthIsOK,
        4Xploring Rentals, The Urban List, Caravan World and Club4x4 where cited on individual campsites. Dive site
        details cross-checked against Avenue Perth, RAC WA, Bucket List Diver and Scuba Down Under where cited on
        individual sites. Wildlife seasonality for the Ningaloo/Shark Bay area informed by a general WA marine-life
        sightings calendar the user shared.
      </p>
    </div>
  )
}
