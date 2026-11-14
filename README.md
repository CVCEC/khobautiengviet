# Kho Báu Lời Ông Bà

Mini-website thành ngữ, tục ngữ, ca dao của **Trường Tiếng Việt Của Em** (CVCEC) · https://khobau.cvcec.org
60 câu (20 thành ngữ, 20 tục ngữ, 20 ca dao), có nghĩa đen, nghĩa bóng, từ khó, ví dụ, gợi ý tiếng Anh, đọc to,
4 bài luyện tập sau mỗi câu (Điền từ, Xếp câu, Hiểu nghĩa, Chọn tranh) và 7 trò chơi chung:
Điền từ, Xếp chữ, Nối câu, Thám tử tình huống, Phân loại, Tìm vần, Lật thẻ.

## Các file

| File | Dùng để |
|---|---|
| `index.html` | Trang chính |
| `data.js` | **Nội dung 60 câu**. Sửa nghĩa, thêm câu mới ở đây |
| `art.js` | Tranh minh họa (SVG, màu thương hiệu, có chữ chìm) |
| `app.js` | Phần chạy trang, bài luyện tập và trò chơi |
| `style.css` | Màu sắc, kiểu chữ |
| `robots.txt` | Không cho Google lấy ảnh, chặn các công cụ AI thu thập dữ liệu |
| `assets/` | Logo và hình Trâu Con chính thức |

## Bảo vệ nội dung (chỉ xem, không sao chép)

- Mọi tranh minh họa có dòng chữ chìm "© CVCEC · Trường Tiếng Việt Của Em · Chỉ xem, không sao chép".
- Chặn nhấn chuột phải, nhấn giữ để lưu ảnh, kéo thả ảnh, phím Ctrl/Cmd+S và Ctrl/Cmd+P. Nếu in, trang chỉ ra một dòng báo "chỉ để xem trực tuyến".
- Không có nút tải về.
- `robots.txt` và thẻ `noimageindex` yêu cầu Google không đưa ảnh lên kết quả tìm kiếm; chặn các công cụ AI thu thập dữ liệu.
- Chân trang có mục "Lưu ý về sử dụng tài liệu · Terms of use" (song ngữ).

## Thêm giọng đọc thật (giọng Elio) sau này

Trang không dùng giọng máy của thiết bị. Nút "Nghe đọc" chỉ hiện ở câu đã có tệp ghi âm giọng chuẩn của trường; câu chưa có tệp thì ẩn nút. Khi có file ghi âm:

1. Đặt file vào thư mục `audio/`, đặt tên theo mã câu, ví dụ `audio/tn01.mp3`, `audio/cd05.mp3`.
2. Mở `data.js`, tìm dòng cuối `return { TYPES, items, AUDIO: {} };` và ghi các câu đã có file, ví dụ:
   `AUDIO: { tn01: true, cd05: true }`

## Tiến độ của học sinh

Câu đã sưu tầm và ngôi sao được lưu trên trình duyệt của từng máy (không cần đăng nhập).
Đổi máy hoặc xóa dữ liệu trình duyệt thì bắt đầu lại.

Copyrighted by CVCEC Trường Tiếng Việt Của Em 2026
