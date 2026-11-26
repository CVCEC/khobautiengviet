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

## Giọng đọc (giọng AI Kore của trường, hoặc bản thu giọng người thật)

Nút "Nghe đọc" đi qua bộ mẫu `TTV.phat({ tep, chu })` (quy tắc 7, từ 17-11-2026): câu đã có tệp `audio/<mã>.mp3` thì phát tệp; câu chưa có tệp thì bộ mẫu tạm đọc bằng giọng máy. Trang không gọi speechSynthesis trực tiếp.

- Giọng chuẩn của Trâu Con là giọng AI **Kore** (Google Gemini, miền Bắc), do robot `giong-ai/` tạo (xem `giong-ai/README.md`). Từ 25-11-2026 mọi góc dùng chung giọng này.
- Robot tự ghi các câu đã có tệp vào dòng `AUDIO: {…}` cuối `data.js` (`tools/gan_giong.py`), không cần sửa tay.
- Thay bằng bản thu giọng người thật: đặt tệp `audio/<mã>.mp3` (ví dụ `audio/tn01.mp3`) đè lên tệp cũ. Robot không ghi đè tệp đã có.
- Một câu đọc sai: xoá `audio/<mã>.mp3`, lần chạy sau robot đọc lại. (25-11-2026: đã xoá `cd19`, `cd20` vì bị cắt lệch.)

## Học thử (khách chưa đăng nhập)

Góc học chỉ mở trong khung của cổng https://vietclass.cvcec.org (bộ mẫu chung lo phần này). Khách chưa đăng nhập được **học thử câu “Ếch ngồi đáy giếng”** (mã `tn01`, trang `#cau-tn01`): đọc, nghe đọc, 4 bài luyện tập và cất vào Sổ sưu tầm. Khách vẫn xem được trang đầu, ba kho (danh sách câu), danh sách trò chơi và Sổ sưu tầm.

- Bài học thử của góc khai ở cổng, trong `chung/gioi-thieu-goc.js` (kho CVCEC/cong-truong-tieng-viet), mục `khobau.thu` (`baiThu: "tn01"`).
- `app.js` gọi `TTV.choPhepBai(mã)` trước khi mở một câu (mã câu, ví dụ `tg04`) hoặc một trò chơi (mã `choi-…`). Trò chơi trộn nhiều câu nên khách mở trò chơi nào cũng được mời đăng nhập. Mã khác `tn01` thì bộ mẫu hiện màn “Bạn đã học thử xong một bài!” có nút Đăng nhập, Đăng ký.
- Khi biết đang học thử (sự kiện `ttv-che-do`), thẻ câu tn01 ghi “Học thử”, các câu khác và các trò chơi ghi “Đăng nhập để học”; “Câu hay hôm nay” là câu tn01. Người đã đăng nhập không thấy gì khác.

## Tiến độ của học sinh

Ghi kết quả lên cổng (từ 17-11-2026): làm xong mỗi bài luyện của một câu thì gọi `TTV.ghiKetQua` với `bai` = mã câu (`tn01`, `tg05`, `cd12`), `hoatDong` = `dien` | `xep` | `hieu` | `tranh`, `soTroChoi` = 4; chơi xong một trong 7 trò chung thì `bai` = `choi-<mã trò>`, `hoatDong` = mã trò, `soTroChoi` = 1. Không thêm khoá localStorage mới.

### Kết quả từng câu (từ 26-11-2026)

Cùng lần gọi `TTV.ghiKetQua` có thêm `cau: [{ ma, tu, dung, mang, loi }]` (tối đa 40 câu). `dung` = đúng ngay lần đầu (bấm sai hoặc dùng "Gợi ý một tiếng" là chưa đúng). `tu` luôn là chữ đích lấy từ `data.js` (tối đa 30 ký tự, dài hơn thì để trống, chỉ dùng `ma`), không bao giờ là chữ người học chọn.

| Trò | `ma` | `tu` | `mang` | `loi` khi sai |
|---|---|---|---|---|
| Điền từ | mã câu (`tn01`…) | tiếng cần điền | `viet` | `TTV.loaiLoi` (vd. `dau-thanh`), không đoán được thì `nghia` |
| Xếp chữ | mã câu | câu / dòng đầu cần xếp | `ngu-phap` | `trat-tu` |
| Nối câu | mã câu | câu (dòng đầu) | `van-hoa` | `khac` |
| Thám tử tình huống | mã câu | câu đúng | `van-hoa` | `nghia` |
| Phân loại | mã câu | câu | `van-hoa` | `khac` |
| Tìm vần | mã câu | tiếng cần tìm | `am-chu` | `am-van` |
| Lật thẻ | — (trò trí nhớ, không gửi `cau`) | | | |
| Luyện tập 4 bước của một câu | `tn01-dien`, `-xep`, `-nghia`, `-tranh` | như trên | `viet` / `ngu-phap` / `van-hoa` / `van-hoa` | như trên; Hiểu nghĩa, Chọn tranh: `nghia` |

Bộ mẫu cũ không có `TTV.loaiLoi` thì dùng mã mặc định ở bảng; bộ mẫu cũ bỏ qua `cau`. Đã thử bằng Playwright (giả lập `TTV.ghiKetQua`): số câu `dung` khớp `diem` ở mọi trò.

Câu đã sưu tầm và ngôi sao được lưu trên trình duyệt của từng máy (không cần đăng nhập).
Đổi máy hoặc xóa dữ liệu trình duyệt thì bắt đầu lại.

Copyrighted by CVCEC Trường Tiếng Việt Của Em 2026
