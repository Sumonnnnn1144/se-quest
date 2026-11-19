# Bài 6 · Architectural Design
## Thiết kế & kiến trúc
- 3 mức: **Architectural** (tổng thể) · **High-level** (sub-system, module) · **Detailed** (dữ liệu, thuật toán)
- Architectural design = **quá trình**
- Software architecture = **tài liệu** (kết quả)
- Nối **RE với design**
- **Block diagram**: hộp + đường
- **C4**: Context → Containers → Components → Code
  - Đồ án: ít nhất **Context + Container** (PA3)
## Sub-system & chất lượng
- **Sub-system**: hệ thống riêng, chạy **độc lập** (Google Maps)
- **Module**: phục vụ component khác (UI component)
- Lợi ích: **stakeholder communication · system analysis · large-scale reuse**
- Performance → component **lớn**
- Security → **layered**, tài sản ở **lớp trong**
- Availability → **dự phòng**
- Maintainability → component **nhỏ, thay được**
- **Conflicts**: lớn ↑ performance ↓ maintainability
- **ASR**: NFR + FR ưu tiên cao
## Quyết định thiết kế
- Issue · decision · assumptions · **rationale** · alternatives · implications
- **7 câu hỏi**: generic arch · phân tán · style · module · control · đánh giá · tài liệu
- **ADR** trong docs/adr/
  - Title · **Status** · Context · Decision · Consequences
  - proposed · accepted · **superseded**
## Style: chia sẻ & phân tán
- Style = **high-level**, cả hệ thống · Pattern = **micro**
- Mô tả: **Problem · Context · Solution**
- **Repository**: kho dữ liệu **trung tâm**
  - ✔ chia sẻ dữ liệu lớn · quản lý tập trung
  - ✘ **một data model chung** · khó phân tán
- **Client-Server**: server + client + **mạng**
  - ✔ dễ phân tán · dễ thêm server
  - ✘ **không có data model chung** · không có registry
- **P2P**: node vừa client vừa server
  - ✘ khó bảo mật, khó nhất quán
## Style: cấu trúc & luồng
- **Layered**: đổi interface → chỉ **lớp kề bên**
  - ✘ cứng nhắc · **chậm** qua nhiều lớp
- **MVC**: Model (dữ liệu, logic) · View (trình bày) · Controller (nhận lệnh)
- **Pipes & Filters**: filter xử lý độc lập, dữ liệu qua **pipe**
  - ✘ cần **định dạng chung** · khó **event-based**
- **Interrupt-driven**: **real-time**, mỗi interrupt một **handler**
  - ✘ khó lập trình, **khó validate**
## Service & event
- **SOA**: modularity · interoperability · reusability · **loose coupling**
- **Microservices**: autonomy · resilience · scalability · flexibility
  - ✘ phân tán phức tạp · nhất quán dữ liệu · cần **DevOps**
  - Nhóm nhỏ → **modular monolith** trước
- **Event-driven**: producer → **broker** (Kafka, RabbitMQ) → consumers
  - ✘ khó debug · **eventual consistency**
