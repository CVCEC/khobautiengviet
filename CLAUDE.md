# CLAUDE.md – Hệ sinh thái Trường Tiếng Việt Của Em (CVCEC)

Đọc tệp này trước khi sửa bất kỳ trang nào của trường. Trả lời và viết commit bằng tiếng Việt.

## Bối cảnh
- Chương trình "Trường Tiếng Việt Của Em" của CVCEC – Canada Vietnam Cultural & Educational Council: nền tảng học tiếng Việt và văn hoá trên web, miễn phí, cho mọi lứa tuổi từ trẻ 5 tuổi tới người lớn. Người học chủ yếu là người nước ngoài và trẻ Việt kiều chưa nói được tiếng Việt (bắt đầu từ số 0). Phần lớn học trên iPad và điện thoại. CVCEC tự xây dựng và quản lý toàn bộ.
- Cổng chính: https://vietclass.cvcec.org (kho CVCEC/cong-truong-tieng-viet), nhúng từng góc học trong khung iframe.

## Các trang (GitHub Pages, DNS tại Nhân Hòa, tên miền cvcec.org đã xác minh với GitHub)
- vietnam.cvcec.org – CVCEC/khampha-vietnam
- vuihoctiengviet.cvcec.org – CVCEC/vuihoctiengviet
- venhaem.cvcec.org – CVCEC/venhaem
- baihoc.cvcec.org – CVCEC/truong-tieng-viet
- khobau.cvcec.org – CVCEC/khobautiengviet
- truyencotich.cvcec.org – CVCEC/truyencotich
- cuocsong.cvcec.org – CVCEC/baihoccuocsong
- nguphap.cvcec.org – CVCEC/nguphap
- hatca.cvcec.org – CVCEC/hatca
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
7. Âm thanh: ưu tiên tệp giọng chuẩn của trường. Từ 17-11-2026, khi chưa có tệp thì TẠM dùng giọng máy của thiết bị, nhưng chỉ qua bộ mẫu: `TTV.phat({tep, chu})` (có tệp thì phát tệp, không có thì đọc `chu`) hoặc `TTV.giong.doc(chu)`. Không gọi speechSynthesis trực tiếp trong trang. Tên chữ cái đưa cho giọng máy theo âm (`TTV.giong.tenChuCai("b")` → "bờ"). Câu cần thu âm ghi vào kịch bản thu âm (am-thanh/ của kho mau-chung).
8. Không đưa tên, logo Khai Minh Đức lên game và slide.
9. Không hiện tên trẻ, phụ huynh. Triển lãm và Về Nhà Em chỉ để xem (hạn chế tải về) và có ghi chú điều khoản sử dụng, liên hệ contact@cvcec.org.
10. Mỗi trang tối đa 1 GB; mỗi tệp dưới 25 MB. Hỏi tôi trước khi thêm video mới.
11. Dùng tốt ở iPad (1024px) và điện thoại (390px); vùng chạm tối thiểu 44px.

## Lộ trình học (cập nhật 17-11-2026)
- Hai hướng học tách bạch:
  - "Làng học tập Trâu Con" cho trẻ dưới 15 tuổi: giữ nguyên các góc, học theo hứng thú; không hiện số thứ tự hay nhãn bậc. Thứ tự góc: Luyện nói – Luyện thanh, Tiếng Việt cơ bản, Văn hoá truyền thống, Ngữ pháp tiếng Việt, Khám phá Việt Nam, Hát cùng Trâu Con, Kho báu ca dao tục ngữ, Truyện cổ tích, Bài học cuộc sống.
  - "Lộ trình theo khung năng lực" cho người học từ 15 tuổi: tab riêng của cổng (/lo-trinh/), xương sống là sách "Vui học tiếng Việt" Quyển 1–2, cùng với Về Nhà Em. Hai góc này có nhom: "lo-trinh" trong TTV_DANH_SACH. Sẽ mở rộng luyện nghe hội thoại, viết văn xuôi, chính tả, ngữ pháp nâng cao theo sườn Quyển 1–2 (soạn mẫu, duyệt rồi mới làm tiếp).
  - Triển lãm xem công khai, đứng cuối, ngoài hai nhóm.
- Lộ trình đối chiếu Khung năng lực tiếng Việt dùng cho người nước ngoài (TT 17/2015/TT-BGDĐT): Bậc 0 Làm quen (chặng riêng của trường), Sơ cấp Bậc 1–2, Trung cấp Bậc 3–4. Ghi "tham chiếu", không gọi là chứng chỉ hay "đạt chuẩn".
- Nguồn: v1/ttv-lo-trinh.js trong kho mau-chung (`TTV_LO_TRINH`): các bậc, câu "Mình làm được…" cho Nghe, Nói, Đọc, Viết. Tab Lộ trình chỉ dùng nhãn bài của vuihoc và venhaem; nhãn của các góc trong Làng giữ lại trong tệp nhưng không hiện cho trẻ.
- "Góc học tập của em" có hai loại: dưới 15 tuổi xem sao theo góc của Làng; 15+ xem tiến độ theo bậc và 4 kỹ năng của Lộ trình. Chọn theo nhóm tuổi trong hồ sơ; nhóm 13–17 tự chọn trên trang (lưu trên máy).
- Nhóm người học dùng chung mã: "5-8", "9-14", "nguoi-lon".
- Bậc 0–2 có lời hướng dẫn tiếng Anh (nút VI/EN), Bậc 3 trở đi giảm dần.
- Không đổi nội dung bài khi sắp xếp lại.

## Tài khoản và dữ liệu học
- Chỉ người học có tài khoản và xem thành tích của mình (Góc học tập của em). Không làm chế độ, bảng theo dõi hay tài khoản riêng cho giáo viên, phụ huynh. Người dưới 13 tuổi do cha mẹ đăng ký và đồng ý (đã có ở cổng), nhưng không có trang theo dõi riêng cho cha mẹ.
- Giáo viên chỉ có tab "Hoạt động" (gợi ý hoạt động trên lớp) của cổng; không làm thêm hướng dẫn giáo viên.
- Góc học không tự ghi vào Firebase. Khi người học chơi xong một trò, góc học gọi `TTV.ghiKetQua({bai, hoatDong, soTroChoi, diem, diemToiDa, sao, thoiGianGiay})`; cổng ghi vào tài khoản.
- Không thu ngày sinh, địa chỉ, số điện thoại, ảnh, giọng nói, vị trí. Luyện nói chỉ chạy trên máy. Không hiện tên thật.
- Chỉ dùng dữ liệu cho nghiên cứu khi Chính sách bảo mật đã ghi mục đích này và người học (hoặc cha mẹ) đã đồng ý.

## Game bài học
HTML/CSS/JS thuần; dữ liệu bài trong const BAI_HOC đầu script; chạm/kéo bằng Pointer Events; phản hồi "Đúng rồi!" / "Thử lại nhé"; xong một trò thì gọi `TTV.ghiKetQua(...)`.

## Cách làm việc
- Trước khi sửa nhiều tệp, nêu kế hoạch ngắn và chờ tôi đồng ý.
- Làm từng trang một; không sửa nội dung bài học khi không được yêu cầu.
- Sau khi đẩy lên, liệt kê link để tôi kiểm tra trên iPad.
- Khi chép CLAUDE.md vào một kho đã có CLAUDE.md, giữ lại các dòng NGOẠI LỆ RIÊNG của kho đó.
