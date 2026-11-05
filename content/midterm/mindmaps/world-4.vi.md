# Bài 4 · Requirements Engineering
## Nền tảng
- Requirement = **services + constraints**
- Chức năng kép: **bid/contract** (high) · **dev team** (detailed)
- Stakeholder = **ai bị ảnh hưởng**
  - End users · owners · managers · external
- Viewpoints
  - **Interactor**: trực tiếp (khách, account DB)
  - **Indirect**: quản lý, bảo mật
  - **Domain**: chuẩn liên ngân hàng
- **User req**: ngôn ngữ tự nhiên, góc nhìn user
- **System req**: có cấu trúc, chi tiết, kỹ thuật
## Loại requirement
- **Functional**: làm gì
  - Tốt: **precise · complete · consistent**
- **Non-functional**: làm tốt đến đâu
  - **Product**: performance, security, usability, reliability…
  - **Organizational**: delivery, implementation, standards
  - **External**: ethical, privacy, safety
  - Phải **verifiable**: 2h training, ≤ 2 lỗi/ngày
  - Reliability đo bằng **MTTF**, availability
- **Domain**: từ lĩnh vực (Z39.50, bản quyền)
  - Vấn đề: **understandability**, **implicitness**
## Process
- Feasibility → **Gathering** → **Specification** → **Validation**
- **Management** xuyên suốt
## Gathering
- Khó: không biết mình muốn gì, mâu thuẫn, chính trị, thay đổi
- Discovery → classify → **prioritize & negotiate** → document
- **MoSCoW**
  - **Must**: thiếu là release fail
  - **Should**: quan trọng, có cách lách
  - **Could**: có thì tốt
  - **Won't (this time)**
- Phương pháp
  - **Interview**: open/closed; tốn thời gian **khách**
  - **Observe**: thấy quy trình; tốn thời gian **dev**
  - JAD · **Survey** (định lượng) · Prototype · Docs · Scenarios
  - **Kết hợp nhiều kỹ thuật**
## Specification
- Natural · **Structured** · Formal · Modeling
- **SRS**: WHAT không phải HOW
- **IEEE 830 → ISO/IEC/IEEE 29148:2018**
- RUP: Vision + use-case specs · Agile: Vision + user stories
- **INVEST**: Independent, Negotiable, Valuable, Estimable, Small, Testable
- **Given / When / Then** → acceptance tests
- AI: hữu ích nhưng có thể **bịa requirement**
## Validation
- Sửa lỗi req sau bàn giao **rất đắt**
- Checking: **Validity · Verifiability · Consistency · Completeness · Realism**
- Kỹ thuật: **Reviews** (phổ biến nhất) · Prototyping · Test-case generation
## Management
- Lý do đổi: business, hiểu rõ hơn, ưu tiên, môi trường
- **Change request → analysis & costing → implementation**
- **Traceability matrix**: req ↔ use case ↔ design ↔ test
  - **Impact analysis** · **test coverage**
