# SE Quest

Ôn môn **Nhập môn Công nghệ Phần mềm** (Software Engineering) như đang chơi game. Mỗi bài học là một hòn đảo voxel, mỗi lượt trắc nghiệm là một trận đấu với quái.

*A game-style study site for an introductory Software Engineering course, in Vietnamese and English.*

## Có gì trong web

- **Bản đồ đảo 3D:** mỗi bài là một đảo (W1–W7), cùng một đảo Thi.
- **Trận đấu trắc nghiệm:** trả lời đúng thì bắn quái, đúng liên tiếp thì sát thương tăng. Quái gục khi bạn đúng đủ 80% số câu, cũng là lúc qua màn.
- **Trang ôn giữa kỳ** (`/se-quest-on-giua-ky.html`):
  - Bài học W1–W7 có sơ đồ minh hoạ.
  - Mindmap và flashcard.
  - Kiểm tra nhanh sau mỗi mục.
  - Quiz theo bài và kho câu sai để ôn lại ("Diệt bug").
  - Exam Mode: 30 câu trong 30 phút.
- **Song ngữ Việt / Anh:** thuật ngữ in đậm, chạm vào để xem nghĩa.

Phạm vi hiện tại là bài 01–07: SE Introduction, Software Processes, Project Management, Requirements Engineering, Use Case & UI/UX, Architectural Design, Object-Oriented & Data Design. Exam Mode vẫn là đề giữa kỳ (bài 01–05).

## Về nội dung

- Nội dung do người làm dự án tự biên soạn để ôn thi. Đây **không phải tài liệu chính thức** của môn học. Repo không chứa slide hay ảnh chụp slide; mọi sơ đồ đều được vẽ lại.
- Mỗi ý trong bài học và mỗi đáp án đều ghi số slide nguồn, dạng `02#54` (bài 02, slide 54), để bạn đối chiếu với slide của lớp.
- Phần kiến thức ngoài slide được gắn nhãn **[Thực tế]**. Phần này không thuộc nội dung thi.

## Chạy trên máy

Cần **Node.js 22** trở lên.

```bash
npm install
npm run dev          # mở http://localhost:5173
```

| Lệnh | Việc |
|---|---|
| `npm run build` | Kiểm tra kiểu và build vào `dist/` |
| `npm test` | Test logic game (Vitest) |
| `npm run test:e2e` | Test trên trình duyệt (Playwright). Lần đầu chạy `npx playwright install chromium` |
| `npm run build:review` | Build lại trang ôn giữa kỳ từ `content/midterm/` |

## Cấu trúc

```
src/              Web chính (React + TypeScript)
  scene/          Cảnh voxel 3D (Three.js)
  screens/        Bản đồ, trận đấu, màn kết quả
  game/           Luật chơi: điểm, XP, cấp bậc
content/midterm/  Nội dung: bài học, quiz, flashcard, glossary, mindmap, sơ đồ
tools/            Script build trang ôn
review/           Trang ôn đã build, được phục vụ cùng web
tests/            Test Playwright
```

Muốn sửa hay thêm câu hỏi thì sửa trong `content/midterm/`, không cần sửa code. Sau đó chạy `npm run build:review`.

Dự án được làm với sự hỗ trợ của Claude Code.

## License

Dự án phát hành theo giấy phép [MIT](LICENSE).
