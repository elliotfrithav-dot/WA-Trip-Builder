import type { ActivityTag, BudgetLevel, CampingType, ComfortLevel } from '../../data/types'
import type { SiteConditionsResult } from '../../services/siteConditions'
import type { ChecklistItem } from '../packing/types'

export type DriveLimitHours = 1 | 2 | 3 | 4 | 5 | 6 | 8
export type TripLength = 'day-trip' | 'multi-day' | 'road-trip'

export interface TripCriteria {
  tripLength: TripLength
  startDate: string // ISO date
  endDate: string // ISO date — equal to startDate for a day trip
  maxDriveHours: DriveLimitHours
  groupSize: number
  bringingDog: boolean
  activities: ActivityTag[] // empty = "anything, surprise me"
  campingPreference: CampingType | 'dont-care' | 'no-camping'
  comfortLevel?: ComfortLevel
  budget?: BudgetLevel
  /** Day-trip only: scan nearby days and surface the best one instead of just scoring startDate. */
  findBestDay?: boolean
  /** Road-trip only: how many stops to plan for (2-4). */
  roadTripStops?: number
}

/** One stop on a multi-location road trip. */
export interface RoadTripStop {
  regionId: string
  nights: number
  campsiteIds: string[]
  activitySiteIds: string[]
  /** Approximate drive from the previous stop (or Perth, for the first stop), in minutes. */
  legDriveTimeMin: number
  legDriveDistanceKm: number
}

export interface ScoreBreakdown {
  label: string
  points: number
  maxPoints: number
  reason: string
}

export interface TripOption {
  id: string
  regionId: string
  title: string
  nights: number
  driveTimeMin: number
  driveDistanceKm: number
  score: number
  scoreBreakdown: ScoreBreakdown[]
  whySummary: string
  campsiteIds: string[]
  activitySiteIds: string[]
  wildlifeIds: string[]
  dogFriendly: boolean
  estimatedBudget: BudgetLevel
  warnings: string[]
  /** Criteria this option couldn't fully satisfy (e.g. no matching campsite type, no confirmed dog access) — shown transparently instead of excluding the option outright. */
  concessions: string[]
  /** Present for day-trip snorkel/swim options — the live Excellent..Unsafe grade for the primary site. */
  conditionsGrade?: SiteConditionsResult
  /** Present when the user asked to find the best nearby day — the top-ranked day within the scan window. */
  bestDayRecommendation?: { date: string; result: SiteConditionsResult }
  /** Present for road-trip options — the ordered list of stops. When set, regionId/driveTimeMin/driveDistanceKm above describe the FIRST stop and the total trip respectively is derived from this list. */
  stops?: RoadTripStop[]
}

export interface ItineraryStop {
  time: string
  title: string
  description?: string
  costAud?: string
  bookingUrl?: string
}

export interface ItineraryDay {
  dayNumber: number
  date: string
  label: string
  stops: ItineraryStop[]
}

export interface SavedTrip {
  id: string
  createdAt: string
  criteria: TripCriteria
  option: TripOption
  itinerary: ItineraryDay[]
  packingList: ChecklistItem[]
}
