export interface HeritageSite {
  id: string
  regionId: string
  name: string
  type: 'aboriginal-cultural-centre' | 'historic' | 'geological-cultural'
  description: string
  respectNotes?: string
  source: string
}

// Deliberately conservative: this lists well-documented, publicly celebrated
// sites only — it does NOT attempt to catalogue specific sacred or
// ceremonial Aboriginal sites, which are often intentionally not publicised
// to protect them. For anything more specific than what's here, the right
// channel is the WA Aboriginal Heritage Inquiry System (Dept. of Planning,
// Lands and Heritage), not a general trip-planning app.
export const heritageSites: HeritageSite[] = [
  {
    id: 'wardan-cultural-centre',
    regionId: 'yallingup',
    name: 'Wardan Aboriginal Cultural Centre',
    type: 'aboriginal-cultural-centre',
    description:
      'An Aboriginal-owned cultural centre developed by the Wardandi people, 6km south of Yallingup. Art gallery, bush-tucker trails and guided walks led by Wardandi guides.',
    source: '55 Injidup Spring Rd, Yallingup — verify current opening hours/tour times before visiting.',
  },
  {
    id: 'fremantle-heritage',
    regionId: 'fremantle',
    name: 'Fremantle Heritage Precinct',
    type: 'historic',
    description:
      'Fremantle Prison (UNESCO World Heritage listed as part of the Australian Convict Sites) and the surrounding 19th-century port streetscape.',
    source: 'General public knowledge — well documented, widely available heritage listing.',
  },
  {
    id: 'nambung-pinnacles',
    regionId: 'cervantes',
    name: 'Pinnacles Desert (Nambung National Park)',
    type: 'geological-cultural',
    description:
      'A striking limestone pillar landscape, and part of Noongar boodja (country) with cultural significance to Traditional Owners. This app does not have verified detail on specific stories or sites here — treat the landscape with respect and stay on marked paths.',
    respectNotes: 'Stay on the boardwalk/marked vehicle track; do not remove or disturb the limestone formations.',
    source: 'General public knowledge — verify deeper cultural context via DBCA or a licensed Aboriginal-guided tour.',
  },
]

export function heritageForRegion(regionId: string): HeritageSite[] {
  return heritageSites.filter((h) => h.regionId === regionId)
}
