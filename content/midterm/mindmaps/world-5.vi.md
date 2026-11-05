# Bài 5 · Use Case & UI/UX
## Modeling & UML
- Model = **đơn giản hoá từ 1 góc nhìn**
- Languages: **UML · C4 · BPMN · SysML**
- UML: **Booch, Rumbaugh, Jacobson** · **OMG 1997**
- **Structural**: class, package, object, component, deployment
- **Behavioral**: **use case**, sequence, communication, state, activity
## Use case diagram
- **Actors · Use cases · Relationships**
- Dùng rộng rãi để truyền đạt **FR**
- **Actor = role**
  - 1 người nhiều role · nhiều người 1 role
  - Actor có generalization
- Use case: kết quả **có giá trị với actor**
- **WHAT không HOW**, che giấu bên trong
- Spec: ID, actors, **pre/postconditions**, main + alternative + exception flow
- **Scenario = instance** của use case
## Relationships
- **Association**: actor ↔ use case
- **Generalization**: use case chung ↔ cụ thể
- **Include**
  - Base **biết**, gọi tường minh
  - Included **không đứng một mình**
  - Checkout order → Payment
- **Extend**
  - Base **không biết**
  - Extending **có thể đứng một mình**
  - Mũi tên **extending → base**
- Chung → include · Biến thể → extend
## UI cơ bản
- Interface: **UI** (người) · **API** (hệ thống)
- User đánh giá hệ thống qua **giao diện**
- **UI**: look & feel · **UX**: toàn bộ trải nghiệm
- Trí nhớ ngắn hạn **4 ± 1** (Miller 7 ± 2)
## 6 nguyên tắc UI
- **User familiarity**: thuật ngữ quen thuộc
- **Consistency**: thao tác giống nhau
- **Minimal surprise**
- **Recoverability**: undo, xác nhận
- **User guidance**: feedback, help
- **User diversity**
## Accessibility (WCAG 2.2)
- **POUR**
  - Perceivable: alt text, tương phản **≥ 4.5:1**
  - **Operable: bàn phím**, vùng bấm lớn
  - Understandable: nhãn rõ
  - Robust: semantic HTML, screen reader
- **Không dùng mỗi màu sắc**
- Mobile-first · Lighthouse, axe
## Tương tác & trình bày
- 5 interaction styles
  - **Direct manipulation**: thấy kết quả ngay
  - **Menu selection**
  - **Form fill-in**: nhập dữ liệu
  - **Command language**: phải học cú pháp
  - **Natural language**
- **Digital**: chính xác · **Analogue**: tương đối
- Data visualization: xu hướng, quan hệ
## UI process & guidelines
- **User analysis → Prototyping → Evaluation**
  - Analysis: task analysis, interview, **ethnography**
  - Prototype: **paper → automated** (Figma)
  - Screen list (từ use cases) → diagram → design → spec
  - Evaluate: learnability, speed, robustness, recoverability, adaptability
- Error message: **polite · concise · consistent · constructive**
- **Do not trust users**: natural/business constraints · early/late checking
