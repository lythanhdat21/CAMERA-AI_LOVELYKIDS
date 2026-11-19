# Website mã nhãn & IP thiết bị – CAMERA-AI LovelyKids

Trang web tĩnh (HTML, CSS, JS) thay cho bộ PDF mặt bằng khi gửi đối tác. Không cần máy chủ hay cơ sở dữ liệu.

- **Xem trên máy:** mở `index.html` bằng trình duyệt.
- **Dữ liệu cập nhật:** 19/11/2026. Tổng 468 thiết bị, 426 nhãn trên 35 trang mặt bằng; dung lượng khoảng 33 MB.
- **Không sửa tay** các file trong thư mục này. Thư mục được tạo lại bằng
  `10_DOCS-SCRIPT/script/website/xuat_ban_website.py` (xem `10_DOCS-SCRIPT/docs/2026-11-16_11_…`).

## Đưa lên GitHub Pages

1. Tạo repository mới trên GitHub.
2. Đưa **toàn bộ nội dung bên trong** thư mục này lên nhánh `main`, sao cho `index.html` nằm ở gốc repository.
   - Cách 1 – trên web: *Add file → Upload files*, kéo thả tất cả file và thư mục, rồi *Commit changes*.
   - Cách 2 – dòng lệnh, chạy trong thư mục này:
     ```
     git init -b main
     git add .
     git commit -m "Website ma nhan IP"
     git remote add origin https://github.com/<tài-khoản>/<repository>.git
     git push -u origin main
     ```
3. Vào *Settings → Pages*: *Source* chọn **Deploy from a branch**, *Branch* chọn **main** và **/ (root)**, bấm *Save*.
4. Sau 1–2 phút, trang có địa chỉ `https://<tài-khoản>.github.io/<repository>/`.

Giữ file `.nojekyll`: file này báo GitHub Pages phục vụ nguyên các file, không xử lý qua Jekyll.

## Lưu ý khi chia sẻ

- Trang GitHub Pages ai có đường link cũng mở được. Gói miễn phí yêu cầu repository **công khai**.
  Trang có sơ đồ vị trí camera và địa chỉ IP nội bộ, nên cân nhắc trước khi chia sẻ link.
- Trang có thẻ `noindex` để công cụ tìm kiếm không đưa trang vào kết quả. Thẻ này không chặn người có link.

## Gửi link đến đúng chỗ

| Địa chỉ | Mở |
|---|---|
| `…/#camera`, `#control`, `#ocam`, `#tel`, `#pa`, `#tu` | Tab mặt bằng (`#tu` = Tủ Rack & Tủ KNX) |
| `…/#camera/2` | Mặt bằng thứ 2 trong danh sách của tab |
| `…/#ma=T1-CH01` | Đúng thiết bị đó, phóng to 5 giây |
| `…/#tai-ve`, `#luu-y` | Tab Tải về, Lưu ý |

## Cập nhật

Khi mã/IP hoặc bản vẽ thay đổi: chạy lại script trên. Thư mục này được tạo lại (giữ `.git`), rồi commit và push lên GitHub.
