# WA Adventure & Marine-Life Explorer — Claude Code Build Prompt

## ROLE

You are an expert full-stack developer, UX/UI designer, cartographer, data architect and outdoor-adventure product designer.

Build a polished, premium **personal Western Australia Adventure & Marine-Life Explorer** — essentially a personal "WA Adventure Operating System" for planning camping, diving, snorkelling, swimming, hiking, wildlife encounters, 4WD trips and weekend adventures.

This should feel like a beautifully designed modern adventure-planning application rather than a generic travel website.

The application should initially focus on:

**Perth → north to Jurien Bay → south to Margaret River**

but the architecture must make it straightforward to expand across all of Western Australia later.

---

# CORE PRODUCT CONCEPT

The application should answer questions such as:

- "Where should I go this weekend?"
- "Where can I see dolphins in March?"
- "I have Friday–Monday free. Where could I go?"
- "I only want to drive 3 hours."
- "I'm going solo."
- "I'm taking the dog."
- "I want somewhere secluded."
- "I want to snorkel and camp."
- "I want good diving and hiking."
- "I want to see interesting wildlife."
- "Where can I legally camp?"
- "Where will conditions be best this weekend?"
- "What's the best trip I can do with the weather and tides?"
- "What do I need to pack?"
- "What wildlife might I see?"
- "Where can I eat along the way?"

The application should combine **location, dates, weather, ocean conditions, wildlife seasonality, camping, activities, travel distance, personal preferences and trip constraints** to generate useful recommendations.

---

# PRIMARY NAVIGATION

Use four primary areas:

### EXPLORE
Interactive map and discovery.

### PLAN
Trip Builder, wildlife calendar, conditions and itinerary planning.

### MY ADVENTURES
Saved trips, packing lists, gear, sightings and personal history.

### GUIDE
Camping, diving, 4WD, survival, wildlife, flora/fauna and safety information.

---

# FEATURE 1 — INTELLIGENT TRIP BUILDER

This should be one of the **central features of the entire application**.

Create a dedicated **Trip Builder** that allows the user to enter their available dates and constraints, then generates several suitable adventure ideas.

## Trip Builder Input

The user should be able to enter:

### Dates

- Start date
- End date

Examples:

> Friday 18 September → Monday 21 September

The system should calculate:

- Number of nights
- Number of days
- Approximate usable adventure time

---

### Driving Distance

Provide an intuitive control:

**How far are you willing to drive?**

Options could include:

- 1 hour
- 2 hours
- 3 hours
- 4 hours
- 5 hours
- 6 hours
- 8+ hours
- Custom maximum distance in kilometres

Calculate driving distance/time from the user's starting location.

Default starting location should be configurable, initially **Perth**.

---

### Group Size

Allow:

- Solo
- 2 people
- 3 people
- 4 people
- 5+
- Custom number

Display:

**Who's coming?**

👤 Solo  
👥 2  
👥 3  
👥 4  
👥 5+

---

### Dog Friendly

Include a prominent toggle:

**🐕 Bringing a dog?**

- Yes
- No

When enabled, **dog-friendliness becomes a hard filtering criterion wherever appropriate.**

The recommendation engine should consider:

- Dog-friendly campsites
- Dog restrictions in national parks
- Dog access to beaches
- Dog access to trails
- Dog access to swimming areas
- Seasonal restrictions
- On-leash/off-leash requirements
- Whether dogs are prohibited entirely

Never recommend a location as dog-friendly without reliable supporting data.

---

### Adventure Style

Allow users to select one or more:

- 🤿 Scuba diving
- 🤿 Shore diving
- 🤿 Snorkelling
- 🏊 Swimming
- 🐋 Marine wildlife
- 🐬 Dolphins
- 🦈 Sharks
- 🐳 Whales
- 🐠 Reef / marine life
- 🦭 Seals / sea lions
- 🐢 Turtles
- 🦅 Wildlife / birdlife
- 🥾 Hiking
- 🏕 Camping
- 🚙 4WD / off-road
- 📸 Photography
- 🌅 Scenic / relaxing
- 🍴 Food & restaurants
- 🌿 Nature / flora
- 🏖 Beaches

Allow **"Anything — surprise me"**.

---

### Camping Preference

Options:

- Caravan/campground
- Basic campground
- Remote camping
- Legal secluded camping
- Beach camping where legal
- 4WD-access camping
- Don't care
- No camping / accommodation

The system must distinguish between:

**Official camping**

and

**Legal remote/secluded camping**

Never recommend illegal camping simply because it is secluded.

---

### Comfort Level

Optional:

- Easy / comfortable
- Moderate adventure
- Remote / basic
- Hardcore adventure

This can influence recommendations involving:

- Road conditions
- Facilities
- Hiking difficulty
- Recovery requirements
- Camping infrastructure
- Remoteness
- Communications

---

### Budget

Optional:

- Free / very cheap
- Budget
- Moderate
- Don't care

Consider:

- Camping fees
- Accommodation
- Fuel
- National park fees
- Tours
- Diving operators
- Activities
- Food

---

# TRIP GENERATION ENGINE

After entering the criteria, display:

## "YOUR ADVENTURE OPTIONS"

Generate approximately **3–8 trip ideas**, depending on the available data.

Each recommendation should be meaningfully different.

For example:

### OPTION 1
**Jurien Bay — Reef, Snorkelling & Coastal Camping**

**3 days / 2 nights**

🚙 2h 45m drive  
🏕 Legal campground  
🤿 Excellent snorkelling  
🦭 Wildlife potential  
🐕 Dog friendly  
💰 Budget: $  
⭐ Adventure Score: 91

---

### OPTION 2
**Moore River — Easy Coastal Escape**

**2 nights**

🚙 1h 20m drive  
🏕 Camping  
🥾 Hiking  
🏖 Beaches  
🐕 Dog friendly  
⭐ Adventure Score: 84

---

### OPTION 3
**Margaret River — Caves, Coast & Forest**

**3 nights**

🚙 3h  
🏕 Camping  
🥾 Hiking  
🌿 Forest  
🏖 Beaches  
🍴 Excellent food  
⭐ Adventure Score: 88

---

# ADVENTURE SCORE

Create a calculated score based on the user's requirements.

Potential factors:

- Distance suitability
- Weather
- Rain
- Wind
- Swell
- Tide
- Water temperature
- Wildlife season
- Activity suitability
- Camping availability
- Dog suitability
- Road conditions
- Number of activities
- Scenic value
- User preferences
- Cost
- Remoteness

The score should be transparent.

Allow the user to click:

**"Why this score?"**

and see something like:

> Excellent weather forecast, low wind, good swell for snorkelling, peak dolphin sightings and a legal dog-friendly campground within your driving limit.

---

# TRIP COMPARISON

Allow generated trips to be compared side-by-side.

Columns could include:

| | Trip A | Trip B | Trip C |
|---|---|---|---|
| Drive | 2h 20m | 3h 10m | 1h 40m |
| Nights | 2 | 3 | 2 |
| Camping | ✓ | ✓ | ✓ |
| Dog friendly | ✓ | ✕ | ✓ |
| Snorkelling | Excellent | Good | Moderate |
| Wildlife | Excellent | Excellent | Good |
| Hiking | Good | Excellent | Good |
| Cost | $ | $$ | $ |
| Adventure Score | 92 | 89 | 84 |

Include:

**"Build this trip"**

buttons.

---

# TRIP ITINERARY GENERATOR

Once the user chooses a recommendation, generate a detailed itinerary.

Example:

## DAY 1 — FRIDAY

**15:30 — Leave Perth**

Estimated drive: 2h 40m

**18:15 — Arrive at campsite**

Set up camp.

**19:00 — Sunset beach walk**

**20:00 — Dinner**

Suggested nearby food option.

---

## DAY 2 — SATURDAY

**07:00 — Sunrise**

**08:00 — Snorkelling**

Conditions:

Wind: 8 knots  
Swell: 0.6m  
Tide: 09:42  
Water: 21°C

**12:00 — Lunch**

**14:00 — Coastal hike**

**17:30 — Wildlife viewing**

---

## DAY 3 — SUNDAY

etc.

The itinerary should dynamically adapt to:

- Tide times
- Weather
- Swell
- Wind
- Sunrise/sunset
- Wildlife activity
- Opening hours
- Driving time
- User-selected activities

---

# TRIP BUILDER — FLEXIBLE DATES

The system should also support:

### "I have some flexibility"

Example:

> I want to go away for 3 nights sometime between 10–20 October.

The application should evaluate the possible dates and recommend the **best date + destination combinations**.

Example:

> **Best option: 14–17 October**
>
> Wind is forecast to be significantly lighter and marine conditions are substantially better than the surrounding dates.

This should make the Trip Builder an actual **decision engine**, rather than simply an itinerary generator.

---

# TRIP BUILDER — WEATHER-AWARE RECOMMENDATIONS

The system must not blindly recommend places based only on historical averages.

Where live/current forecast data is available, incorporate:

- Temperature
- Rain
- Wind direction
- Wind speed
- Gusts
- Swell
- Wave period
- Tide
- Water temperature
- Visibility where available
- Sunrise
- Sunset
- Fire danger
- Warnings
- Road closures

For marine activities, calculate an approximate:

### Marine Conditions Score

For example:

**Snorkelling: 91/100**

🟢 Wind: Excellent  
🟢 Swell: Excellent  
🟢 Tide: Good  
🟢 Visibility: Good  
🟡 Water temperature: Moderate

---

# FEATURE 2 — INTERACTIVE EXPLORATION MAP

Create a beautiful interactive map using:

- MapLibre or Leaflet
- OpenStreetMap-compatible mapping
- Clustering
- Custom icons
- Filters
- Search
- Layers

Map categories:

🏕 Campsites  
🤿 Dive sites  
🤿 Snorkel sites  
🏖 Beaches  
🥾 Hikes  
🐋 Wildlife  
🍴 Food  
⛽ Fuel  
🚙 4WD routes  
📸 Scenic locations  
⚠️ Hazards / warnings

Allow users to toggle layers.

---

# FEATURE 3 — GLOBAL SEARCH

Create a natural-language search bar.

Examples:

> "Best place to see dolphins in October"

> "Where can I camp with my dog within 3 hours?"

> "Good snorkelling this weekend"

> "Where can I see whales and camp?"

> "I want a secluded beach trip"

> "Best diving north of Perth"

Search should understand:

- Dates
- Distance
- Activities
- Wildlife
- Weather
- Camping
- Dog requirements
- Group size
- Preferences

---

# FEATURE 4 — MARINE LIFE DATABASE

Create a structured wildlife database.

Include:

- Species
- Common name
- Scientific name
- Best locations
- Best months
- Typical habitat
- Behaviour
- Likelihood of encounter
- Snorkelling suitability
- Diving suitability
- Boat-only encounters
- Safety considerations
- Identification information
- Images where legally sourced
- Conservation information

Examples:

- Whale sharks
- Humpback whales
- Southern right whales
- Manta rays
- Dolphins
- Dugongs
- Sea lions
- Seals
- Turtles
- Rays
- Reef sharks
- Wobbegongs
- Eagle rays
- Pelagic fish
- Seabirds

---

# FEATURE 5 — "WHEN SHOULD I GO?"

Create a wildlife calendar.

Allow the user to select a species:

**Whale Sharks**

Show:

- Best months
- Best locations
- Typical encounter method
- Water temperature
- Recommended trip length
- Nearby camping
- Diving/snorkelling options
- Relevant tours

Also allow:

**"What wildlife can I see in July?"**

Return a seasonal wildlife overview.

---

# FEATURE 6 — CAMPSITE DATABASE

Create a structured campsite database covering:

- Official campgrounds
- National park camping
- State forest camping
- Council camping
- Station/private camping
- Legal remote camping
- Legal off-road camping

Each location should contain:

- Name
- Coordinates
- Land manager
- Legal status
- Booking requirements
- Fees
- Facilities
- Toilets
- Water
- Fire rules
- Dog rules
- 2WD/4WD access
- Road conditions
- Maximum stay
- Seasonal closures
- Mobile reception
- Nearby activities
- Nearby wildlife
- Last verified date
- Source

### DATA INTEGRITY IS CRITICAL

Never fabricate campsites.

Never turn an unverified "secret camping spot" into a confirmed location.

Clearly distinguish:

**Verified**

**Community reported**

**Needs verification**

Never encourage illegal camping.

---

# FEATURE 7 — DIVE & SNORKEL DATABASE

For each site:

- Location
- Entry type
- Shore/boat
- Difficulty
- Depth
- Typical visibility
- Water temperature
- Best conditions
- Best tide
- Best wind direction
- Best season
- Marine life
- Hazards
- Access
- Parking
- Facilities
- Dog restrictions
- Nearby camping

Include a:

### "Is it worth diving today?"

calculation using current conditions.

---

# FEATURE 8 — CONDITIONS ENGINE

Aggregate relevant data:

### WEATHER

- Temperature
- Rain
- Wind
- Gusts
- Cloud
- UV

### OCEAN

- Swell
- Wave height
- Wave period
- Wind
- Water temperature
- Visibility where available

### TIDES

- High tide
- Low tide
- Tide height
- Current tide phase

### OTHER

- Sunrise
- Sunset
- Fire danger
- Bushfire warnings
- Road closures
- Park closures

Present conditions visually and simply.

---

# FEATURE 9 — ACTIVITY SUITABILITY

For every location calculate:

### 🤿 Diving
### 🤿 Snorkelling
### 🏊 Swimming
### 🥾 Hiking
### 🚙 4WD
### 🏕 Camping
### 📸 Photography
### 🐋 Wildlife viewing

Use:

**Excellent / Good / Fair / Poor / Unsafe**

with explanations.

---

# FEATURE 10 — LONG WEEKEND GENERATOR

Create a dedicated mode:

## "I HAVE A LONG WEEKEND"

Ask:

- Dates
- Maximum drive
- Solo/group
- Dog?
- Activities
- Camping style
- Budget

Then automatically produce:

**Best 5 long-weekend adventures**

with:

- Route
- Distances
- Campsites
- Activities
- Wildlife opportunities
- Food
- Conditions
- Suggested itinerary
- Estimated costs

---

# FEATURE 11 — FOOD DISCOVERY

Integrate food options into trips.

Show:

- Cafes
- Restaurants
- Bakeries
- Fish & chips
- Pubs
- Local producers
- Markets
- Takeaway

Prioritise places that naturally fit the route.

Example:

**"Good breakfast stop 20 minutes from your route."**

---

# FEATURE 12 — MY GEAR

Create a personal gear inventory.

Categories:

### DIVING

- BCD
- Regulator
- Octopus
- SPG
- Computer
- Tank POD
- Mask
- Fins
- Wetsuit
- Hood
- Gloves
- SMB
- Reel
- Torch

### CAMPING

- Tent
- Sleeping bag
- Mattress
- Stove
- Gas
- Water
- Lighting
- Power
- Cooking equipment

### 4WD

- Recovery gear
- Compressor
- Tyre repair
- Recovery boards
- Shovel
- First aid
- Navigation
- Communications

Allow:

- Owned
- Need to buy
- Packed
- Missing
- Weight
- Cost
- Notes

---

# FEATURE 13 — PACKING LIST GENERATOR

When a trip is created, automatically generate a packing list based on:

- Number of people
- Number of nights
- Weather
- Activities
- Camping type
- Dog
- Diving
- 4WD
- Food requirements

Example:

**3 nights / 2 people / dog / diving**

Automatically calculate suggested:

- Water
- Food
- Fuel
- Clothing
- Camping equipment
- Diving equipment
- Dog supplies
- Safety equipment

Allow users to tick items off.

---

# FEATURE 14 — WILDLIFE SIGHTING LOG

Allow the user to record:

- Species
- Date
- Location
- Photos
- Notes
- Number seen
- Activity
- Conditions

Display sightings on the personal map.

Create:

**My Wildlife**

with statistics such as:

- Species seen
- Locations visited
- Most common encounters
- First sightings
- Seasonal patterns

---

# FEATURE 15 — FLORA & FAUNA GUIDE

Create an identification/reference section for WA wildlife and plants.

Include:

- Identification
- Habitat
- Range
- Seasonality
- Interesting facts
- Safety
- Conservation status

---

# FEATURE 16 — CAMPING / SURVIVAL / 4WD GUIDE

Create practical guides covering:

- Camp setup
- Water
- Food storage
- Fire safety
- Bushfire preparation
- Weather awareness
- Navigation
- First aid
- Emergency communications
- Heat management
- Sun protection
- Snake awareness
- Marine hazards
- Rip currents
- Diving safety
- Snorkelling safety
- 4WD sand driving
- Tyre pressures
- Vehicle recovery
- Remote travel preparation

Keep this practical rather than overly encyclopaedic.

---

# PERSONAL DASHBOARD

The homepage should eventually become:

## "YOUR NEXT ADVENTURE"

Show:

- Upcoming trip
- Current weather
- Nearby conditions
- Recommended weekend trips
- Wildlife currently in season
- Saved places
- Packing progress
- Recent sightings

Example:

> **You have a long weekend coming up.**
>
> Based on your preferences, weather and current conditions, here are your best options.

---

# DATA ARCHITECTURE

Design proper structured entities for:

- Locations
- Campsites
- Dive sites
- Snorkel sites
- Hiking trails
- Wildlife species
- Wildlife seasons
- Restaurants
- Trips
- Itineraries
- Gear
- Packing lists
- Sightings
- Weather observations
- Forecasts
- Tides
- Ocean conditions
- Roads
- Warnings

Use relational structures rather than hardcoded JSON wherever practical.

---

# DATA SOURCES

Prioritise authoritative Australian/WA sources.

Potential sources include:

- Parks and Wildlife Service WA
- Department of Biodiversity, Conservation and Attractions
- Department of Transport WA
- Bureau of Meteorology
- Geoscience Australia
- Australian Maritime Safety Authority
- WA emergency services
- Local councils
- Relevant marine/environmental organisations

For third-party/community information, clearly label the source and confidence.

Every important data record should ideally include:

**Source**

**Last updated**

**Confidence**

---

# TECHNOLOGY

Use a modern maintainable stack such as:

- TypeScript
- React
- Next.js or Vite
- Tailwind CSS
- MapLibre or Leaflet
- PostgreSQL
- Supabase if appropriate
- PWA support

Build the application so APIs can be swapped without rewriting the core application.

Create clear service abstractions for:

- Weather
- Tides
- Ocean conditions
- Maps
- Places
- Camping
- Wildlife
- Emergency information

---

# UI / UX

The interface should feel:

**Premium + outdoorsy + technical + calm.**

Avoid generic SaaS styling.

Use:

- Large maps
- Beautiful photography
- Clear typography
- Excellent spacing
- Subtle animations
- Cards
- Bottom sheets on mobile
- Responsive layouts
- Dark/light considerations
- Clear icons
- Strong hierarchy

The application should work extremely well on a phone while travelling.

---

# MOBILE / PWA

Build it as a PWA.

Support:

- Install to phone
- Offline access to saved trips
- Offline maps where practical
- Saved campsites
- Packing lists
- Emergency information
- Previously loaded trip data

The user should be able to use the application while travelling with limited reception.

---

# SEARCH / FILTER EXPERIENCE

Every major database should support filtering.

Examples:

### Campsites

Distance  
Dog friendly  
4WD  
Free  
Secluded  
Beach  
Toilets  
Water  
Fire allowed

### Dive Sites

Difficulty  
Depth  
Shore/boat  
Marine life  
Current conditions  
Best season

### Trips

Distance  
Dates  
Activities  
Dog friendly  
Budget  
Camping type  
Adventure level

---

# IMPORTANT SAFETY / DATA RULES

Never fabricate:

- Campsites
- Road access
- Legal camping status
- Wildlife locations
- Weather
- Tide information
- Park closures
- Safety information

If data is unavailable, say:

**"Data unavailable — verify before travelling."**

For remote locations, clearly show:

- Nearest fuel
- Nearest medical facility
- Mobile coverage where known
- Emergency considerations
- Recovery difficulty

Do not encourage dangerous behaviour or illegal access.

---

# INITIAL GEOGRAPHIC SCOPE

Initially prioritise:

### Perth

### North

- Two Rocks
- Yanchep
- Lancelin
- Cervantes
- Jurien Bay

### South

- Fremantle
- Rockingham
- Mandurah
- Bunbury
- Busselton
- Dunsborough
- Yallingup
- Margaret River

Build the database architecture so WA-wide expansion is straightforward.

---

# EXAMPLE USER JOURNEY

The ideal experience should look like this:

User opens the app.

### "Plan an Adventure"

They select:

**Dates:** Friday → Monday  
**Drive:** Maximum 3 hours  
**People:** 2  
**Dog:** Yes  
**Activities:** Snorkelling + camping + wildlife  
**Camping:** Secluded/legal remote preferred  
**Budget:** Budget

Press:

## FIND MY ADVENTURE

The application analyses:

- Available destinations
- Driving distances
- Legal campsites
- Dog restrictions
- Weather
- Wind
- Swell
- Tides
- Wildlife season
- Activity suitability
- Road conditions
- Food
- Budget

Then produces:

### YOUR BEST OPTIONS

**1. Jurien Bay**
Adventure Score 94

**2. Cervantes**
Adventure Score 89

**3. Lancelin**
Adventure Score 84

The user selects Jurien Bay.

The app generates:

**3-day itinerary**

including:

- Route
- Fuel stops
- Campsite
- Snorkelling locations
- Best tide
- Best weather window
- Wildlife opportunities
- Food stops
- Hiking
- Sunset locations
- Packing list

Then the user presses:

## SAVE TRIP

The trip appears under:

**MY ADVENTURES**

with:

- Countdown
- Forecast
- Packing checklist
- Map
- Itinerary
- Bookings
- Notes

---

# DEVELOPMENT APPROACH

Do not attempt to build the entire system simultaneously.

Develop in stages.

## PHASE 1 — FOUNDATION

- Project setup
- Database
- Design system
- Navigation
- Responsive layout
- Map
- Core location model

## PHASE 2 — EXPLORE

- Map
- Search
- Campsites
- Dive sites
- Snorkel sites
- Beaches
- Hiking
- Wildlife

## PHASE 3 — TRIP BUILDER

Build this as a major milestone.

Implement:

- Date selection
- Trip duration
- Maximum drive
- Group size
- Dog-friendly filter
- Activities
- Camping preferences
- Budget
- Adventure level
- Destination scoring
- Trip recommendations
- Trip comparison
- Itinerary generation

## PHASE 4 — CONDITIONS

Integrate:

- Weather
- Wind
- Swell
- Tides
- Water temperature
- Warnings
- Fire conditions
- Road conditions

Connect these to the Trip Builder scoring engine.

## PHASE 5 — MY ADVENTURES

- Saved trips
- Gear
- Packing lists
- Wildlife sightings
- Personal dashboard

## PHASE 6 — PWA / OFFLINE

- Installation
- Offline data
- Saved maps
- Offline trip information

## PHASE 7 — POLISH

- Animations
- Transitions
- Micro-interactions
- Performance
- Accessibility
- Mobile optimisation

---

# CRITICAL PRODUCT PRINCIPLE

Do not build this as a generic travel directory.

Build it as:

> **"A personal operating system for exploring Western Australia."**

The most important feature is not simply showing places.

It is answering:

> **"Given the time I have, how far I want to travel, who's coming, whether I have the dog, what I want to do, and what the conditions are — where should I go?"**

The **Trip Builder should therefore be deeply integrated with the map, weather, marine conditions, wildlife seasonality, camping database and personal preferences.**

The application should progressively learn the user's preferences through saved trips, completed trips, ratings and behaviour, while keeping the user in control.

Prioritise **accuracy, usefulness, safety and beautiful UX** over simply adding more features.