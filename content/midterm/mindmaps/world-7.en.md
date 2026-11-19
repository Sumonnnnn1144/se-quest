# Lecture 7 · OO & Data Design
## Class diagram
- The **most used** diagram
- Class: 3 compartments **name · attributes · operations**
- Data type after a **colon**
- Visibility: **+ public · - private · # protected**
- Interface: **circle** or **«interface»**
## Relationships
- **Dependency**: uses, **dashed**, least restrictive
- **Generalization**: superclass ↔ subclass, **hollow triangle**
- **Association**: connects objects, name and roles
- **Multiplicity**: 1 · 0..1 · 0..* · 1..*
- **Composition**: **strong**, owns the lifetime, **filled diamond**
- **Aggregation**: **weak**, uses without owning, **hollow diamond**
## From requirements to classes
- **Domain object**: real, in the business, **has stored data**
- **System object**: created to **process and calculate**
- **BCE**
  - **Boundary**: screens, forms, APIs
  - **Control**: coordinates **one use case**
  - **Entity**: long-lived business data
  - Actors meet only **boundaries**
- Step 1: **nouns** in use cases → domain classes
## Sequence & state
- Step 2: every screenplay step → **some object does it**
- **Lifeline · message · activation · fragment**
  - **alt** if/else · **opt** if · **loop** · **par**
- Every message → **an operation**
- Step 3a: **encapsulation · inheritance · polymorphism**
- Step 3b: **state machine** for objects with a status
  - event [guard] / action
  - Each event → **an operation**
## Design principles
- **Low coupling** · **High cohesion**
- **DRY · KISS · YAGNI**
- **SOLID**
  - **S**: one reason to change
  - **O**: open to extend, closed to modify
  - **L**: subtypes replace the base
  - **I**: many small interfaces
  - **D**: depend on **abstractions**
## Design patterns
- **Creational**: creating objects (Factory, Singleton…)
- **Structural**: composing classes (Adapter, Facade…)
- **Behavioral**: interaction (Observer, Strategy…)
- Price by customer type → **Strategy**
- Notify many channels → **Observer**
- Third-party API, different interface → **Adapter**
## Data design
- **File**: simple, fast · **DB**: large data
- Entity class → **table**, identity → **PK**
- 1–n → **FK on the n side** · n–n → **junction table**
- Composition → **NOT NULL + CASCADE**
- **3NF** · indexes · **hash passwords** · migrations in Git
