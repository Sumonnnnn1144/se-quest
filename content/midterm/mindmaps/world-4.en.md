# Lecture 4 · Requirements Engineering
## Foundations
- Requirement = **services + constraints**
- Dual function: **bid/contract** (high level) · **dev team** (detailed)
- Stakeholder = **anyone affected**
  - End users · owners · managers · external
- Viewpoints
  - **Interactor**: direct (customers, account DB)
  - **Indirect**: management, security
  - **Domain**: inter-bank standards
- **User req**: natural language, user's view
- **System req**: structured, detailed, technical
## Requirement types
- **Functional**: what it does
  - Good: **precise · complete · consistent**
- **Non-functional**: how well
  - **Product**: performance, security, usability, reliability…
  - **Organizational**: delivery, implementation, standards
  - **External**: ethical, privacy, safety
  - Must be **verifiable**: 2h training, ≤ 2 errors/day
  - Reliability measured by **MTTF**, availability
- **Domain**: from the field (Z39.50, copyright)
  - Problems: **understandability**, **implicitness**
## Process
- Feasibility → **Gathering** → **Specification** → **Validation**
- **Management** throughout
## Gathering
- Hard: people don't know what they want, conflicts, politics, change
- Discovery → classify → **prioritize & negotiate** → document
- **MoSCoW**
  - **Must**: release fails without it
  - **Should**: important, workaround exists
  - **Could**: nice to have
  - **Won't (this time)**
- Methods
  - **Interview**: open/closed; costs **client** time
  - **Observe**: see the real process; costs **dev** time
  - JAD · **Survey** (quantitative) · Prototype · Docs · Scenarios
  - **Combine several techniques**
## Specification
- Natural · **Structured** · Formal · Modeling
- **SRS**: WHAT not HOW
- **IEEE 830 → ISO/IEC/IEEE 29148:2018**
- RUP: Vision + use-case specs · Agile: Vision + user stories
- **INVEST**: Independent, Negotiable, Valuable, Estimable, Small, Testable
- **Given / When / Then** → acceptance tests
- AI: useful but may **invent requirements**
## Validation
- Fixing req errors after delivery is **very costly**
- Checking: **Validity · Verifiability · Consistency · Completeness · Realism**
- Techniques: **Reviews** (most common) · Prototyping · Test-case generation
## Management
- Why it changes: business, better understanding, priorities, environment
- **Change request → analysis & costing → implementation**
- **Traceability matrix**: req ↔ use case ↔ design ↔ test
  - **Impact analysis** · **test coverage**
