# Lecture 6 · Architectural Design
## Design & architecture
- 3 levels: **Architectural** (overall) · **High-level** (sub-systems, modules) · **Detailed** (data, algorithms)
- Architectural design = **process**
- Software architecture = **document** (output)
- Links **RE and design**
- **Block diagram**: boxes + lines
- **C4**: Context → Containers → Components → Code
  - Project: at least **Context + Container** (PA3)
## Sub-systems & quality
- **Sub-system**: a system in its own right, **independent** (Google Maps)
- **Module**: serves other components (UI component)
- Benefits: **stakeholder communication · system analysis · large-scale reuse**
- Performance → **large-grain** components
- Security → **layered**, assets in **inner layers**
- Availability → **redundancy**
- Maintainability → **fine-grain, replaceable** components
- **Conflicts**: large ↑ performance ↓ maintainability
- **ASRs**: NFRs + high-priority FRs
## Design decisions
- Issue · decision · assumptions · **rationale** · alternatives · implications
- **7 questions**: generic arch · distribution · style · modules · control · evaluation · documentation
- **ADR** in docs/adr/
  - Title · **Status** · Context · Decision · Consequences
  - proposed · accepted · **superseded**
## Styles: sharing & distribution
- Style = **high-level**, whole system · Pattern = **micro**
- Described as **Problem · Context · Solution**
- **Repository**: **central** data store
  - ✔ share large data · centralized management
  - ✘ **one shared data model** · hard to distribute
- **Client-Server**: servers + clients + **network**
  - ✔ easy distribution · easy to add servers
  - ✘ **no shared data model** · no central register
- **P2P**: every node is client and server
  - ✘ hard to secure, hard to keep consistent
## Styles: structure & flow
- **Layered**: interface change → only the **adjacent layer**
  - ✘ inflexible · **slow** through many layers
- **MVC**: Model (data, logic) · View (presentation) · Controller (commands)
- **Pipes & Filters**: independent filters, data through **pipes**
  - ✘ needs a **common format** · hard for **event-based**
- **Interrupt-driven**: **real-time**, one **handler** per interrupt type
  - ✘ complex to program, **hard to validate**
## Services & events
- **SOA**: modularity · interoperability · reusability · **loose coupling**
- **Microservices**: autonomy · resilience · scalability · flexibility
  - ✘ distributed complexity · data consistency · needs **DevOps**
  - Small team → **modular monolith** first
- **Event-driven**: producer → **broker** (Kafka, RabbitMQ) → consumers
  - ✘ hard to debug · **eventual consistency**
