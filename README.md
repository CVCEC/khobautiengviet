# Kho Báu Lời Ông Bà

Mini-website thành ngữ, tục ngữ, ca dao của **Trường Tiếng Việt Của Em** (CVCEC).
60 câu (20 thành ngữ, 20 tục ngữ, 20 ca dao), có nghĩa đen, nghĩa bóng, từ khó, ví dụ, gợi ý tiếng Anh, đọc to và 7 trò chơi:
Điền từ, Xếp chữ, Nối câu, Thám tử tình huống, Phân loại, Tìm vần, Lật thẻ.

## Các file

| File | Dùng để |
|---|---|
| `index.html` | Trang chính |
| `data.js` | **Nội dung 60 câu**. Sửa nghĩa, thêm câu mới ở đây |
| `art.js` | Tranh minh họa (SVG, màu thương hiệu) |
| `app.js` | Phần chạy trang và trò chơi |
| `style.css` | Màu sắc, kiểu chữ |
| `assets/` | Logo và hình Trâu Con chính thức |

## Đưa lên GitHub Pages

1. Tạo repo mới trong tổ chức CVCEC trên GitHub (ví dụ `kho-bau-loi-ong-ba`).
2. Tải **toàn bộ** các file và thư mục `assets` lên nhánh `main`.
3. Vào **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, thư mục `/ (root)`.
4. Ở mục **Custom domain**, điền tên miền phụ (ví dụ `thanhngu.cvcec.org`), bấm Save, rồi bật **Enforce HTTPS**.
5. Tại nơi quản lý tên miền cvcec.org, thêm bản ghi **CNAME**: `thanhngu` → `cvcec.github.io`.
6. Nhờ bên làm web trường thêm một nút trên trang `/hoc-tap/thanh-ngu` dẫn tới tên miền mới.

## Thêm giọng đọc thật (giọng Elio) sau này

Hiện nút "Nghe đọc" dùng giọng tiếng Việt có sẵn trên máy (nếu máy có).
Khi có file ghi âm:

1. Đặt file vào thư mục `audio/`, đặt tên theo mã câu, ví dụ `audio/tn01.mp3`, `audio/cd05.mp3`.
2. Mở `data.js`, tìm dòng cuối `return { TYPES, items, AUDIO: {} };` và ghi các câu đã có file, ví dụ:
   `AUDIO: { tn01: true, cd05: true }`

## Tiến độ của học sinh

Câu đã sưu tầm và ngôi sao được lưu trên trình duyệt của từng máy (không cần đăng nhập).
Đổi máy hoặc xóa dữ liệu trình duyệt thì bắt đầu lại.

Copyrighted by CVCEC Trường Tiếng Việt Của Em 2026
