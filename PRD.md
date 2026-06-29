# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD) - ỨNG DỤNG GHI CHÚ CÔNG VIỆC CÁ NHÂN (LOCAL TASK MANAGER)

## 1. Mục tiêu sản phẩm (Goals)
Xây dựng một ứng dụng ghi chú và quản lý công việc (To-Do List) tối giản, hiệu quả, hoạt động hoàn toàn ngoại tuyến (offline-first) trên máy tính cá nhân. Ứng dụng giúp người dùng theo dõi công việc hàng ngày, thời gian bắt đầu/kết thúc, ghi chú chi tiết, phân loại độ ưu tiên trực quan và dễ dàng sao lưu/khôi phục dữ liệu qua định dạng JSON.

## 2. Phạm vi chức năng (Scope of Features)
Ứng dụng sẽ hoạt động trên một màn hình duy nhất (Single-screen) với thiết kế tối giản, tinh tế để tối ưu hóa trải nghiệm tập trung.

- **Quản lý công việc (Task Management)**:
  - Thêm, sửa, xóa công việc.
  - Mỗi công việc bao gồm: Tên công việc, Ngày bắt đầu, Ngày kết thúc, Ghi chú chi tiết, Độ ưu tiên (Thấp, Trung bình, Cao), và Trạng thái hoàn thành (Đã xong / Chưa xong).
- **Tìm kiếm & Lọc dữ liệu (Search & Filtering)**:
  - Thanh tìm kiếm nhanh theo tiêu đề hoặc ghi chú.
  - Bộ lọc theo trạng thái hoàn thành: "Tất cả", "Chưa hoàn thành", "Đã hoàn thành".
  - Bộ lọc theo mức độ ưu tiên.
- **Tùy biến màu sắc theo mức độ ưu tiên (Priority Customization)**:
  - Cho phép người dùng tùy chọn màu nền/màu chữ đại diện cho từng độ ưu tiên (Thấp, Trung bình, Cao) trực tiếp trên giao diện để cá nhân hóa trực quan.
- **Lưu trữ ngoại tuyến & Sao lưu JSON (Local Storage & Backup)**:
  - Tự động lưu trữ dữ liệu an toàn vào `localStorage` của trình duyệt hoặc bộ nhớ local.
  - Tính năng **Xuất dữ liệu (Export)** thành tệp `.json` để sao lưu thủ công.
  - Tính năng **Nhập dữ liệu (Import)** từ tệp `.json` đã sao lưu để khôi phục hoặc đồng bộ giữa các máy tính.
- **Chế độ Giao diện tối/sáng (Dark Mode / Light Mode)**:
  - Hỗ trợ chuyển đổi giao diện Sáng/Tối nhanh chóng để phù hợp với môi trường làm việc ban đêm.
- **Giao diện tối giản (Minimalist UI)**:
  - Thiết kế tinh gọn, sử dụng font chữ Inter thanh lịch, các khoảng trắng (negative space) rộng rãi và hiệu ứng chuyển động mượt mà (sử dụng thư viện `motion`).

## 3. Lộ trình phát triển & Thiết kế Kỹ thuật (Tech Stack & Architecture)
- **Giao diện (Frontend)**: React 19 kết hợp với Vite để có tốc độ phản hồi cực nhanh.
- **Tạo kiểu giao diện (Styling)**: Tailwind CSS v4 cung cấp các lớp tiện ích giúp tùy biến giao diện tối giản, hiện đại và hỗ trợ Dark Mode mượt mà.
- **Chuyển động (Animations)**: `motion/react` cho các hiệu ứng thêm mới, hoàn thành, xóa và chuyển tab sinh động.
- **Biểu tượng (Icons)**: Thư viện `lucide-react` cho các icon sắc nét và đồng bộ.
- **Đóng gói Desktop (Desktop Packaging - Sẵn sàng cho Electron)**:
  - Trong môi trường phát triển trực tuyến của AI Studio, ứng dụng sẽ chạy trực tiếp dưới dạng Web SPA hiệu năng cao.
  - Toàn bộ trạng thái và cài đặt được lưu an toàn trong `localStorage` để hoạt động hoàn toàn offline.
  - Cấu trúc thư mục được thiết kế chuẩn chỉ để người dùng có thể dễ dàng cài đặt `electron` và đóng gói thành ứng dụng `.exe` hoặc `.app` chạy độc lập chỉ với một tệp cấu hình Electron đơn giản.

## 4. Yêu cầu chi tiết về giao diện người dùng
- **Trình bày**:
  - Giao diện gồm 1 khu vực trung tâm rộng rãi, chia làm hai phần: thanh công cụ điều khiển bên trái/trên (lọc, tìm kiếm, cấu hình màu sắc, sao lưu) và danh sách công việc ở phần chính.
  - Sử dụng các hiệu ứng Hover tinh tế.
  - Thiết kế thích ứng (Responsive) tốt từ màn hình lớn của máy tính để bàn cho đến màn hình nhỏ.
