# Bài 7 · OO & Data Design
## Class diagram
- Sơ đồ **dùng nhiều nhất**
- Class: 3 ngăn **tên · attributes · operations**
- Kiểu dữ liệu sau **dấu hai chấm**
- Visibility: **+ public · - private · # protected**
- Interface: **hình tròn** hoặc **«interface»**
## Quan hệ
- **Dependency**: dùng tạm, nét **đứt**, lỏng nhất
- **Generalization**: superclass ↔ subclass, **tam giác rỗng**
- **Association**: nối object, có tên và role
- **Multiplicity**: 1 · 0..1 · 0..* · 1..*
- **Composition**: **mạnh**, sở hữu vòng đời, **thoi đặc**
- **Aggregation**: **yếu**, dùng không sở hữu, **thoi rỗng**
## Từ requirement đến class
- **Domain object**: thật, có trong nghiệp vụ, **có dữ liệu lưu**
- **System object**: tạo ra để **xử lý, tính toán**
- **BCE**
  - **Boundary**: màn hình, form, API
  - **Control**: điều phối **1 use case**
  - **Entity**: dữ liệu nghiệp vụ lâu dài
  - Actor chỉ gặp **boundary**
- Bước 1: **danh từ** trong use case → domain class
## Sequence & state
- Bước 2: mỗi bước kịch bản → **một object làm**
- **Lifeline · message · activation · fragment**
  - **alt** if/else · **opt** if · **loop** · **par**
- Mỗi message → **một operation**
- Bước 3a: **encapsulation · inheritance · polymorphism**
- Bước 3b: **state machine** cho object có trạng thái
  - event [guard] / action
  - Mỗi event → **một operation**
## Nguyên tắc thiết kế
- **Low coupling** · **High cohesion**
- **DRY · KISS · YAGNI**
- **SOLID**
  - **S**: một lý do để đổi
  - **O**: mở để mở rộng, đóng để sửa
  - **L**: subtype thay được base
  - **I**: nhiều interface nhỏ
  - **D**: phụ thuộc **abstraction**
## Design pattern
- **Creational**: tạo object (Factory, Singleton…)
- **Structural**: ghép class (Adapter, Facade…)
- **Behavioral**: tương tác (Observer, Strategy…)
- Giá theo loại khách → **Strategy**
- Báo nhiều kênh → **Observer**
- API bên thứ ba khác interface → **Adapter**
## Thiết kế dữ liệu
- **File**: đơn giản, nhanh · **DB**: dữ liệu lớn
- Entity class → **bảng**, identity → **PK**
- 1–n → **FK phía n** · n–n → **junction table**
- Composition → **NOT NULL + CASCADE**
- **3NF** · index · **hash mật khẩu** · migration trong Git
