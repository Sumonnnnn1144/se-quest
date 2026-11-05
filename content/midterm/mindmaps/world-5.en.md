# Lecture 5 · Use Case & UI/UX
## Modeling & UML
- Model = **simplification from one perspective**
- Languages: **UML · C4 · BPMN · SysML**
- UML: **Booch, Rumbaugh, Jacobson** · **OMG 1997**
- **Structural**: class, package, object, component, deployment
- **Behavioral**: **use case**, sequence, communication, state, activity
## Use case diagram
- **Actors · Use cases · Relationships**
- Widely used to communicate **FRs**
- **Actor = role**
  - 1 person, many roles · many people, 1 role
  - Actors can have generalization
- Use case: a result **of value to the actor**
- **WHAT not HOW**, hides internals
- Spec: ID, actors, **pre/postconditions**, main + alternative + exception flows
- **Scenario = instance** of a use case
## Relationships
- **Association**: actor ↔ use case
- **Generalization**: general ↔ specific use case
- **Include**
  - Base **is aware**, calls it explicitly
  - Included **does not stand alone**
  - Checkout order → Payment
- **Extend**
  - Base **is not aware**
  - Extending **may stand alone**
  - Arrow **extending → base**
- Common → include · Variation → extend
## UI basics
- Interface: **UI** (people) · **API** (systems)
- Users judge a system by its **interface**
- **UI**: look & feel · **UX**: the whole experience
- Short-term memory **4 ± 1** (Miller 7 ± 2)
## 6 UI principles
- **User familiarity**: familiar terms
- **Consistency**: same operations, same way
- **Minimal surprise**
- **Recoverability**: undo, confirmation
- **User guidance**: feedback, help
- **User diversity**
## Accessibility (WCAG 2.2)
- **POUR**
  - Perceivable: alt text, contrast **≥ 4.5:1**
  - **Operable: keyboard**, large tap targets
  - Understandable: clear labels
  - Robust: semantic HTML, screen readers
- **Never color alone**
- Mobile-first · Lighthouse, axe
## Interaction & presentation
- 5 interaction styles
  - **Direct manipulation**: see results immediately
  - **Menu selection**
  - **Form fill-in**: data entry
  - **Command language**: learn the syntax
  - **Natural language**
- **Digital**: precise · **Analogue**: relative
- Data visualization: trends, relationships
## UI process & guidelines
- **User analysis → Prototyping → Evaluation**
  - Analysis: task analysis, interview, **ethnography**
  - Prototype: **paper → automated** (Figma)
  - Screen list (from use cases) → diagram → design → spec
  - Evaluate: learnability, speed, robustness, recoverability, adaptability
- Error message: **polite · concise · consistent · constructive**
- **Do not trust users**: natural/business constraints · early/late checking
