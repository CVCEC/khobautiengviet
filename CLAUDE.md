# CLAUDE.md – Hệ sinh thái Trường Tiếng Việt Của Em (CVCEC)

Đọc tệp này trước khi sửa bất kỳ trang nào của trường. Trả lời và viết commit bằng tiếng Việt.

## Bối cảnh
- Chương trình "Trường Tiếng Việt Của Em" của CVCEC – Canada Vietnam Cultural & Educational Council: lớp văn hoá và tiếng Việt trên web, miễn phí, cho trẻ 5–12 tuổi (tới 14), phần lớn học trên iPad và điện thoại. CVCEC tự xây dựng và quản lý toàn bộ.
- Cổng chính: https://vietclass.cvcec.org (kho CVCEC/cong-truong-tieng-viet), nhúng từng góc học trong khung iframe.

## Các trang (GitHub Pages, DNS tại Nhân Hòa, tên miền cvcec.org đã xác minh với GitHub)
- vietnam.cvcec.org – CVCEC/khampha-vietnam
- vuihoctiengviet.cvcec.org – CVCEC/vuihoctiengviet
- venhaem.cvcec.org – CVCEC/venhaem
- baihoc.cvcec.org – CVCEC/truong-tieng-viet
- khobau.cvcec.org – CVCEC/khobautiengviet
- truyencotich.cvcec.org – CVCEC/truyencotich
- trienlam.cvcec.org – CVCEC/trien-lam-em-hoc-tieng-viet
- mau.cvcec.org – CVCEC/mau-chung (bộ mẫu chung)

## Phong cách "Làng Trâu Con"
- Làng quê Việt kiểu sách tranh phẳng; thẻ trắng bo góc lớn; nút viên thuốc; chữ tròn, đậm.
- Màu và phông chỉ lấy từ biến --ttv-* của bộ mẫu; không viết cứng mã màu thương hiệu trong trang.
- Mỗi góc học một màu (gốc / đậm / nhạt) và một ảnh Trâu Con riêng, lấy từ TTV_DANH_SACH.
- Chữ trắng CHỈ trên đỏ son, xanh mực, đỏ lá phong và màu đậm của góc học; màu gốc/nhạt chỉ làm dải màu, nền thẻ, biểu tượng.
- Màn chơi và màn đọc dùng data-ttv-nen="don-gian" (nền kem trơn, không mây/ruộng); chữ đọc nằm trên thẻ trắng.
- Màu chức năng riêng của từng trang (nhóm âm, bản đồ, nhân vật…) giữ trong trang.
- Danh sách góc học chỉ sửa ở TTV_DANH_SACH trong v1/cvcec-chung.js. v1 chỉ sửa không phá vỡ; thay đổi lớn tạo v2.

## Quy tắc bắt buộc
1. Logo góc trên-trái hoặc dưới-trái; chỉ dùng ảnh logo và ảnh Trâu Con chính thức, không vẽ lại, không kéo méo. Dòng mờ "Copyrighted by CVCEC Trường Tiếng Việt Của Em 2026" trên mọi trang.
2. Link giữa các trang cvcec.org mở cùng tab, không target="_blank". Link ra ngoài (Google Form…) được mở tab mới.
3. KHÔNG đổi, xoá hay đổi tên khoá localStorage đang có (khobau:, traucon-kc:, ttvce-b…, vhtv:… và các KEY trong mã). Mất khoá là bé mất sao.
4. Chạy tốt trong khung iframe của cổng: không chặn nhúng khung; âm thanh phát sau khi bé chạm; không phụ thuộc window.top.
5. Tiếng Việt: chuẩn hoá NFC khi so sánh chữ; đọc chữ cái theo âm (a, bờ, cờ, dờ…); không ghi cách đọc dưới chữ.
6. Trâu Con xưng "mình", gọi học sinh "các bạn"; hiền, ấm, chậm.
7. Âm thanh dùng tệp giọng chuẩn của trường; không dùng giọng máy của thiết bị (speechSynthesis).
8. Không đưa tên, logo Khai Minh Đức lên game và slide.
9. Không hiện tên trẻ, phụ huynh. Triển lãm và Về Nhà Em chỉ để xem (hạn chế tải về) và có ghi chú điều khoản sử dụng, liên hệ contact@cvcec.org.
10. Mỗi trang tối đa 1 GB; mỗi tệp dưới 25 MB. Hỏi tôi trước khi thêm video mới.
11. Dùng tốt ở iPad (1024px) và điện thoại (390px); vùng chạm tối thiểu 44px.

## Game bài học
HTML/CSS/JS thuần; dữ liệu bài trong const BAI_HOC đầu script; chạm/kéo bằng Pointer Events; phản hồi "Đúng rồi!" / "Thử lại nhé".

## Cách làm việc
- Trước khi sửa nhiều tệp, nêu kế hoạch ngắn và chờ tôi đồng ý.
- Làm từng trang một; không sửa nội dung bài học khi không được yêu cầu.
- Sau khi đẩy lên, liệt kê link để tôi kiểm tra trên iPad.
