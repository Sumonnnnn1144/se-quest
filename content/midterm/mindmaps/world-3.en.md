# Lecture 3 · Project Management
## Overview
- Project = tasks + clear goal + **limited time, budget**
- Triangle: **Scope · Time · Budget**
- Types: Production → product · Investment → benefit · Research → knowledge
- Software PM is harder
  - **Intangible** · flexible · flexible process
  - Depends on **human factors**
- Failure reasons: unclear req, underestimation, poor communication, **no risk management**
## Roles
- **Project Manager**: scope, schedule, cost, **risks**, stakeholders
- **Engineering Manager**: **technical quality**, team capability
- **Team Lead**: **daily** technical coordination
- Program manager · Test manager
## 4 management activities
- **Initiation**: why? feasible? → feasibility report, proposal
- **Planning**: what/who/when/how much → **scope, WBS, estimates, schedule**
- **Executing**: on plan? → weekly plan, tasks
- **Tracking & Control**: where are we? what to change? → progress report, issue log, **change request**
## Planning & Scope
- Planning is **continuous**, revised to reality
- Agile: plan per release · sprint · day
- SDP: budget, schedule, staffing, training, **risk plan**
- Scope: what will **and will not** be delivered
- **WBS**: phase → deliverable → task
  - Each item must be **assigned · estimated · tracked**
## Estimation
- Experience-based · **Algorithmic**
- **LOC**: language-dependent
- **FP**: user's view, language-independent
- $\text{Effort} = a \times \text{KLOC}^{b}$ (COCOMO)
- $\text{Duration} = c \times \text{Effort}^{d}$
- $\text{Cost} = \text{Effort} \times \text{cost per man-month}$
- **Effort ≠ Duration**: $24\,\text{h} \div 3\,\text{h/day} = 8$ days
- Agile
  - **Story points** = effort + complexity + uncertainty
  - Planning Poker (Fibonacci)
  - $\text{Sprints} \approx \dfrac{\text{remaining points}}{\text{velocity}}$
  - Don't compare velocity across teams
## Scheduling
- Right people · right tasks · right time
- **Brooks' law**: adding people → later
- **Milestone**: end-point of a period
- **Deliverable**: delivered to customers (alpha, beta, GA)
- **CPM**
  - Critical path = **longest path**
  - **Slack = 0**; a delay delays the whole project
  - $\text{Slack} = \text{latest start} - \text{earliest start}$
  - Slide example: **14 days**
- Gantt chart · board (Jira, Trello)
## Risk management
- Risk = **probability** of an adverse event
- **Identify → Analyze → Plan → Monitor**
- 5 types: Technology · People · Organizational · Requirements · Estimation
- $\text{RE} = \text{Probability} \times \text{Loss}$
  - Scale 10 · 25 · 50 · 75 · 90
  - Likely × Catastrophic = **6,750**
- Strategies
  - **Avoidance** · **Minimization** · **Contingency**
  - Transfer · Buying information
- Monitor: **top-10 risks**, weekly reports
