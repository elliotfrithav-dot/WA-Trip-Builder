import { Card } from '../components/ui/Card'

const SECTIONS = [
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

      <Card className="border-terracotta-500/30 bg-terracotta-500/5 p-4 text-sm text-terracotta-600">
        This guide is general information, not a substitute for official safety advice. Always check current DBCA,
        DFES and BOM warnings before you travel.
      </Card>

      <p className="text-xs text-ink-300">
        Background photography via Wikimedia Commons: dolphin (NASA, public domain), whale (Brigitte Werner/Pixabay,
        CC0), turtle & reef fish (US Fish &amp; Wildlife Service, public domain), Hamelin Bay beach (public domain),
        Australian sea lion photo by Brian M. Hunt (CC BY-SA 3.0). 4WD/sand-driving tyre-pressure and tide guidance
        adapted from Defender Adventure's WA beaches 4WD guide.
      </p>
    </div>
  )
}
