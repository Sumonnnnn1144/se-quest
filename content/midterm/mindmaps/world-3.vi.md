# Bài 3 · Project Management
## Overview
- Project = tasks + mục tiêu rõ + **giới hạn time, budget**
- Tam giác: **Scope · Time · Budget**
- Loại: Production → product · Investment → benefit · Research → knowledge
- PM phần mềm khó hơn
  - **Intangible** · flexible · process flexible
  - Phụ thuộc **human factors**
- Lý do thất bại: req mơ hồ, ước lượng thấp, giao tiếp kém, **thiếu risk mgmt**
## Roles
- **Project Manager**: scope, schedule, cost, **risks**, stakeholders
- **Engineering Manager**: **chất lượng kỹ thuật**, năng lực team
- **Team Lead**: điều phối kỹ thuật **hằng ngày**
- Program manager · Test manager
## 4 hoạt động quản lý
- **Initiation**: why? khả thi? → feasibility report, proposal
- **Planning**: what/who/when/how much → **scope, WBS, estimate, schedule**
- **Executing**: đúng plan? → weekly plan, tasks
- **Tracking & Control**: ở đâu? đổi gì? → progress report, issue log, **change request**
## Planning & Scope
- Planning **liên tục**, sửa theo thực tế
- Agile: plan theo release · sprint · day
- SDP: budget, schedule, staffing, training, **risk plan**
- Scope: giao gì **và không giao gì**
- **WBS**: phase → deliverable → task
  - Item phải **assigned · estimated · tracked**
## Estimation
- Experience-based · **Algorithmic**
- **LOC**: phụ thuộc ngôn ngữ
- **FP**: góc nhìn user, độc lập ngôn ngữ
- $\text{Effort} = a \times \text{KLOC}^{b}$ (COCOMO)
- $\text{Duration} = c \times \text{Effort}^{d}$
- $\text{Cost} = \text{Effort} \times$ giá/man-month
- **Effort ≠ Duration**: $24\,\text{h} \div 3\,\text{h/ngày} = 8$ ngày
- Agile
  - **Story points** = effort + complexity + uncertainty
  - Planning Poker (Fibonacci)
  - $\text{Sprints} \approx \dfrac{\text{points còn lại}}{\text{velocity}}$
  - Không so velocity giữa team
## Scheduling
- Đúng người · đúng việc · đúng lúc
- **Brooks' law**: thêm người → trễ hơn
- **Milestone**: điểm kết thúc giai đoạn
- **Deliverable**: giao cho khách (alpha, beta, GA)
- **CPM**
  - Critical path = **đường dài nhất**
  - **Slack = 0**, trễ là trễ cả dự án
  - $\text{Slack} = \text{latest start} - \text{earliest start}$
  - Ví dụ slide: **14 ngày**
- Gantt chart · board (Jira, Trello)
## Risk management
- Risk = **xác suất** sự cố bất lợi
- **Identify → Analyze → Plan → Monitor**
- 5 loại: Technology · People · Organizational · Requirements · Estimation
- $\text{RE} = \text{Probability} \times \text{Loss}$
  - Thang 10 · 25 · 50 · 75 · 90
  - Likely × Catastrophic = **6,750**
- Chiến lược
  - **Avoidance** · **Minimization** · **Contingency**
  - Transfer · Buying information
- Monitor: **top-10 risks**, báo cáo hằng tuần
