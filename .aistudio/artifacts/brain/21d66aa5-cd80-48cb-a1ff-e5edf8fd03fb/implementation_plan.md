# Kế hoạch tối ưu hiển thị toàn màn hình iPhone 13 (Tràn viền & Native App)

Khắc phục triệt để khoảng trống đen ở phần dưới màn hình iPhone 13 khi chạy ở chế độ Màn hình chính (Add to Home Screen / Standalone PWA). Căn chỉnh thanh điều hướng và mini-player tràn viền sát đáy tuyệt đối không có đệm thừa, khóa cuộn trang tổng thể giống ứng dụng iOS gốc.

## User Review & Critical Decisions

> [!IMPORTANT]
> Căn cứ vào các lựa chọn bạn vừa xác nhận:
> - **Căn chỉnh thanh đáy**: Tràn viền sát đáy tuyệt đối không có đệm thừa (loại bỏ padding đệm dư gây hở khoảng trống đen).
> - **Trải nghiệm toàn màn hình**: Khóa cuộn trang tổng thể (`overscroll-behavior: none`, `touch-action: pan-y`), định vị `100dvh` / `fixed inset-0` chuẩn Native App, chỉ cho phép cuộn nội dung bên trong từng màn hình chức năng.

- **Quyết định 1 (Đã xác nhận)**: Bỏ khoảng đệm dư ở chân trang (`safe-area-inset-bottom`), đặt thanh điều hướng `MobileBottomNav` tràn viền sát cạnh đáy màn hình và mini-player gắn khít ngay phía trên.
- **Quyết định 2 (Đã xác nhận)**: Khóa cuộn toàn khung ứng dụng (app frame), tính toán chiều cao chính xác theo `100dvh` / `window.innerHeight` để giao diện phủ kín 100% diện tích màn hình iPhone 13 (từ đỉnh tai thỏ đến đáy màn hình).

---

## 1. Overview & Core Concept

- **Mục tiêu**: Khi người dùng thêm ứng dụng vào Màn hình chính (Add to Home Screen) trên iPhone 13 và mở ra sử dụng, ứng dụng sẽ khởi chạy như một ứng dụng iOS gốc thực thụ (Edge-to-Edge display). Không còn bất kỳ dải đen hay khoảng trống không dùng ở cạnh đáy.
- **Đối tượng & Thiết bị**: Người dùng iPhone (đặc biệt là iPhone 13, 14, 15 với tai thỏ notch hoặc Dynamic Island) chạy Web App ở chế độ Standalone PWA.
- **Giá trị mang lại**: Trải nghiệm nghe nhạc liền mạch, tối ưu từng pixel không gian hiển thị, thanh điều hướng và thanh phát nhạc luôn ở vị trí chuẩn tầm với của ngón tay cái (Thumb-zone), thao tác vuốt cuộn mượt mà không bị nảy hay lộ nền đen.

---

## 2. User Experience & Visual Design

### Key User Flows & Visual Layout
- **Giao diện tổng thể**: Khung ứng dụng neo cứng theo các cạnh màn hình (`fixed inset-0`, chiều cao `100dvh` và `100%`), màu nền đồng nhất `#030303`.
- **Thanh phát nhạc thu nhỏ (Mobile Mini-Player)**:
  - Nằm ngay phía trên thanh điều hướng dưới cùng, hiển thị ảnh bìa, tên bài hát, nghệ sĩ, thanh tiến trình siêu mỏng và các nút điều khiển (Play/Pause, Like, Next).
  - Kết nối mượt mà vào thanh điều hướng bên dưới, không có khe hở hay khoảng trống trung gian.
- **Thanh điều hướng dưới cùng (Mobile Bottom Nav)**:
  - Cố định sát đáy màn hình (`bottom: 0`), chiều cao chuẩn 52px (hoặc 56px), tràn viền edge-to-edge.
  - 4 tab chức năng: Trang chủ, Khám phá, Thư viện, Tìm kiếm với biểu tượng sắc nét, nhãn chữ rõ ràng và hiệu ứng phản hồi xúc giác nhẹ (`touch-press`).
- **Khu vực nội dung cuộn (Content Area)**:
  - Mỗi màn hình (`HomeView`, `ExploreView`, `LibraryView`, `PlaylistDetailView`, `SearchView`) có vùng cuộn độc lập mượt mà (`overflow-y: auto`, `-webkit-overflow-scrolling: touch`).
  - Đáy của vùng cuộn có khoảng đệm an toàn nội bộ (`pb-28` hoặc `pb-32`) để bài hát cuối danh sách không bị che khuất bởi mini-player và thanh điều hướng.

---

## 3. Key Product Decisions & Trade-Offs

- **Xử lý cơ chế tính chiều cao (Viewport Height)**:
  - *Phương án chọn*: Kết hợp `100dvh`, `-webkit-fill-available` và fallback `window.innerHeight` (thay vì phụ thuộc vào `visualViewport.height` vốn có thể trả về chiều cao thu hẹp khi khởi tạo PWA trên iOS).
  - *Lý do*: Trên iOS PWA, `window.visualViewport.height` có thể tính loại trừ thanh ảo hoặc trả về giá trị lệch trước khi layout hoàn tất, khiến container bị giới hạn ngắn hơn chiều cao thật của màn hình iPhone 13, để lại khoảng đen ở đáy.
- **Xóa bỏ đệm đáy `safe-area-inset-bottom` theo yêu cầu người dùng**:
  - *Phương án chọn*: Đặt thanh điều hướng trực tiếp ở `bottom: 0` với chiều cao tối ưu, loại bỏ lớp padding `pb-[env(safe-area-inset-bottom)]` dư thừa gây hở khoảng trống đen lớn.
  - *Lý do*: Đáp ứng đúng lựa chọn "Tràn viền sát đáy tuyệt đối không có đệm" của bạn, giúp giao diện khít hoàn toàn vào cạnh đáy màn hình.
- **Khóa cuộn khung ngoài (Overscroll Prevention)**:
  - *Phương án chọn*: Áp dụng `overscroll-behavior: none` cho `html`, `body` và `#root`, vô hiệu hóa hiện tượng kéo nảy (rubber-banding) của toàn bộ trang web trên Safari/iOS PWA.
  - *Lý do*: Mang lại cảm giác chắc chắn, chuyên nghiệp như ứng dụng Swift native trên iOS.

---

## 4. Technical Architecture & Data Strategy

### Layout & Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ iPhone 13 Screen (100dvh / 844px) - Edge-to-Edge            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Top Header (Logo, Search, User Avatar, Cloud Sync)      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Main Content Area (Independent Scroll Container)        │ │
│ │  - HomeView / ExploreView / LibraryView / SearchView    │ │
│ │  - -webkit-overflow-scrolling: touch                    │ │
│ │  - Bottom scroll padding (pb-28) to avoid overlap       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Mobile Mini-Player (PlayerBar.tsx)                      │ │
│ │  - Fixed directly above bottom nav bar (bottom: 52px)   │ │
│ │  - Edge-to-edge flush border                            │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Mobile Bottom Navigation (MobileBottomNav.tsx)          │ │
│ │  - Fixed at absolute bottom (bottom: 0)                 │ │
│ │  - 4 tabs: Home, Explore, Library, Search               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Chi tiết các tệp sẽ điều chỉnh:
1. `index.html`:
   - Kiểm tra và tinh chỉnh thẻ viewport: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`.
   - Giữ nguyên các meta tag cho iOS PWA: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`.
2. `src/index.css`:
   - Chuẩn hóa quy tắc CSS cho `html`, `body`, `#root` với `height: 100dvh; min-height: 100dvh; max-height: 100dvh; height: -webkit-fill-available;`.
   - Thiết lập `overscroll-behavior: none` và `touch-action: pan-y` để khóa cuộn khung ngoài.
3. `src/App.tsx`:
   - Cập nhật hàm tính toán chiều cao: Sử dụng `window.innerHeight` và đồng bộ `100dvh`, tránh việc `visualViewport.height` làm thu hẹp kích thước `#root` trên iOS PWA.
   - Loại bỏ các inline style hạn chế chiều cao cứng nhắc trên container chính.
4. `src/components/MobileBottomNav.tsx`:
   - Đặt sát viền đáy `bottom-0`, loại bỏ lớp đệm đáy `pb-[env(safe-area-inset-bottom)]` dư thừa.
   - Thiết kế chiều cao cân đối (h-13 hoặc h-14) với các icon và text cân chỉnh thẩm mỹ.
5. `src/components/PlayerBar.tsx`:
   - Căn chỉnh vị trí mobile mini-player gắn khít trực tiếp ngay phía trên `MobileBottomNav` (ví dụ `bottom-[3.25rem]`).
6. Kiểm tra và xác minh biên dịch qua `compile_applet`.
