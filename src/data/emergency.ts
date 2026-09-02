export interface EmergencyContact {
  name: string
  number: string
  when: string
}

// Well-known, standard Australian/WA emergency service numbers — stable,
// publicly published, not expected to change. Still: always call 000 first
// for a life-threatening emergency.
export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: 'Police / Fire / Ambulance', number: '000', when: 'Any life-threatening emergency' },
  { name: 'Marine emergency', number: '000 (or VHF Channel 16)', when: 'Boating/marine life-threatening emergency' },
  { name: 'Poisons Information Centre', number: '13 11 26', when: 'Suspected poisoning, marine stings/bites' },
  { name: 'SES (State Emergency Service)', number: '132 500', when: 'Storm, flood or non-life-threatening rescue' },
  { name: 'Bushfire information line (DFES)', number: '13 33 37', when: 'Bushfire warnings and advice, not to report a fire — call 000 for that' },
  { name: 'Police Assistance (non-urgent)', number: '13 14 44', when: 'Report a non-urgent crime or incident' },
  { name: 'RAC Roadside Assistance', number: '13 11 11', when: 'Vehicle breakdown (RAC members)' },
]

export const EMERGENCY_APPS = [
  'Emergency WA (emergency.wa.gov.au) — live bushfire, flood and other hazard warnings for your location.',
  'Emergency+ app — uses your phone GPS to give 000 your exact location, useful in remote areas with patchy signage.',
]
