// Core structured entities. Kept as plain TS objects/arrays for the local-only
// prototype, but shaped so they map cleanly onto relational tables later
// (each entity has a stable `id`, and relations reference other ids rather
// than nesting/duplicating data).

export type DataConfidence = 'verified' | 'community-reported' | 'needs-verification'

export interface Sourced {
  source: string
  lastVerified: string // ISO date
  confidence: DataConfidence
}

export type ActivityTag =
  | 'scuba-diving'
  | 'shore-diving'
  | 'snorkelling'
  | 'swimming'
  | 'marine-wildlife'
  | 'dolphins'
  | 'sharks'
  | 'whales'
  | 'reef'
  | 'seals'
  | 'turtles'
  | 'birdlife'
  | 'hiking'
  | 'camping'
  | 'four-wd'
  | 'photography'
  | 'scenic'
  | 'food'
  | 'flora'
  | 'beaches'

export type DogPolicy = 'allowed-off-leash' | 'allowed-on-leash' | 'seasonal-restrictions' | 'prohibited'

export type CampingType =
  | 'caravan-campground'
  | 'basic-campground'
  | 'remote-camping'
  | 'legal-secluded-camping'
  | 'beach-camping'
  | 'four-wd-access-camping'

export type ComfortLevel = 'easy' | 'moderate' | 'remote' | 'hardcore'
export type BudgetLevel = 'free' | 'budget' | 'moderate' | 'flexible'

export interface Region {
  id: string
  name: string
  lat: number
  lng: number
  /** Straight-line-adjusted approximate driving distance from Perth CBD, in km. */
  driveDistanceFromPerthKm: number
  /** Approximate driving time from Perth CBD, in minutes, at realistic regional-road speeds. */
  driveTimeFromPerthMin: number
  blurb: string
  activities: ActivityTag[]
  heroImage?: string
}

export interface Campsite extends Sourced {
  id: string
  regionId: string
  name: string
  lat: number
  lng: number
  landManager: string
  campingType: CampingType
  bookingRequired: boolean
  bookingUrl?: string
  feesAud: string
  facilities: string[]
  dogPolicy: DogPolicy
  accessType: '2wd' | 'high-clearance-2wd' | '4wd-only'
  maxStayNights?: number
  mobileReception: 'good' | 'patchy' | 'none'
  notes?: string
}

export type ActivitySiteType = 'dive' | 'snorkel' | 'hike' | 'beach'

export interface ActivitySite extends Sourced {
  id: string
  regionId: string
  name: string
  type: ActivitySiteType
  lat: number
  lng: number
  entry: 'shore' | 'boat' | 'n/a'
  difficulty: 'easy' | 'moderate' | 'hard'
  bestWindDirection?: string
  bestTide?: 'low' | 'high' | 'mid' | 'any'
  marineLife?: string[]
  hazards?: string[]
  dogPolicy: DogPolicy
  distanceFromParkingM?: number
  notes?: string
}

export interface WildlifeSeasonWindow {
  /** 1-12 */
  monthsPeak: number[]
  monthsPossible: number[]
}

export interface WildlifeSpecies {
  id: string
  commonName: string
  scientificName: string
  emoji: string
  bestRegionIds: string[]
  season: WildlifeSeasonWindow
  habitat: string
  behaviour: string
  likelihood: 'common' | 'likely-in-season' | 'occasional' | 'rare'
  snorkelSuitable: boolean
  diveSuitable: boolean
  boatOnly: boolean
  safety?: string
  conservationStatus?: string
}
