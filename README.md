# MMA301 Assignment 2 - Integrated E-Commerce App

Ứng dụng React Native + Expo dùng JavaScript, theo luồng Catalog → Detail → Cart → Saved/business state. Project scaffold ban đầu trống; source và checklist này được dựng từ Student Guide. Hãy cập nhật tên sinh viên/lớp và tự chạy các test trên thiết bị trước khi nộp.

## Trạng thái triển khai

| Module | Hiện trạng |
| --- | --- |
| Catalog | DummyJSON remote API, tìm kiếm, category, pull-to-refresh, FlatList pagination, retry/empty/error states. |
| Cart | Context API, AsyncStorage restore, add/quantity/remove; item count và total được derive. |
| Saved items | AsyncStorage hoạt động ngay; Firebase anonymous Auth + Firestore được bật khi cấu hình project và rules. |
| Notification | Expo local notification khi thêm sản phẩm nếu permission đã được cấp; Settings có permission/test flow. |
| Gemini | App và Cloud Function đã có; cần Firebase, Gemini secret và proxy URL để gọi model thật. Không có API key trong client. |
| Release | EAS APK/AAB profiles đã cấu hình; artifact chưa được tạo vì workspace chưa có tài khoản/project EAS credentials. |

## Chạy app

Yêu cầu Node.js 22.13 trở lên. Core catalog/cart chạy không cần Firebase hay Gemini config.

```powershell
npm ci
npm start
```

Mở bằng Expo Go hoặc Android development build. Các lệnh có sẵn: `npm run android`, `npm run web`, `npm test`, `npm run lint`. Notification local chạy trên thiết bị; web chỉ dùng để kiểm tra UI.

Để cấu hình tích hợp local, copy `.env.example` thành `.env.local`, sau đó điền Firebase public client config và URL proxy sau khi deploy. Expo tự nạp biến `EXPO_PUBLIC_*`; khởi động lại Metro sau khi đổi env. Các giá trị Firebase client config được bundle vào app, không xem chúng là secret; bảo vệ dữ liệu bằng Auth và Firestore rules.

## Firebase và Gemini

1. Tạo Firebase project, đăng ký Android app với package `edu.mmaa2.market`, bật Anonymous sign-in và tạo Firestore database.
2. Deploy rules: `npx firebase-tools@latest deploy --only firestore:rules`.
3. Điền `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID` và `EXPO_PUBLIC_FIREBASE_APP_ID` trong `.env.local`.
4. Lưu Gemini key ở server secret, không đặt vào Expo env: `npx firebase-tools@latest functions:secrets:set GEMINI_API_KEY`.
5. Deploy function: `npx firebase-tools@latest deploy --only functions:catalogAssistant`.
6. Đặt `EXPO_PUBLIC_GEMINI_PROXY_URL=https://us-central1-<project-id>.cloudfunctions.net/catalogAssistant`, restart Metro, rồi thử tab Studio.

Cloud Function xác thực Firebase ID token, giới hạn catalog đầu vào, yêu cầu JSON schema và chỉ trả về product IDs có trong context nhận được. Trước production nên bật Firebase App Check, đặt quota/rate limit và rà soát CORS/billing. Wishlist local vẫn dùng được nếu Firebase lỗi.

## Kiến trúc

- `src/app/`: Expo Router tabs và product detail route.
- `src/context/StoreContext.js`: cart/favorites shared state, restore và persistence.
- `src/lib/cart.mjs`: phép tính giỏ hàng thuần và kiểm thử Node.
- `src/services/`: catalog API, Firebase, notification và Gemini proxy client.
- `functions/`: Firebase Cloud Function giữ Gemini credential phía server.
- `firestore.rules`: mỗi anonymous account chỉ đọc/ghi wishlist của chính mình.
- `docs/assignment-evidence.md`: RTM, design decisions, integration map, test matrix, debug log, AI usage log.

State ownership: catalog query/page nằm ở Discover screen; cart và favorites nằm ở StoreContext. Cart là nguồn sự thật cho số lượng; subtotal/item count luôn derive, không persist riêng. Cart/favorites lưu AsyncStorage. Firebase wishlist là bản đồng bộ theo anonymous UID. Notification permission thuộc OS; app chỉ kiểm tra/request khi người dùng chọn test flow.

## Kiểm thử và release

`npm test` chạy unit tests cho add cùng item, quantity, remove và derived totals. Trạng thái của 15 manual/device cases nằm trong evidence doc; chưa có Firebase/Gemini credentials nên không đánh dấu các integration tests đó là pass.

EAS profiles nằm trong `eas.json`. Sau khi đăng nhập và liên kết EAS project, thiết lập các Expo public env cần cho build rồi chạy:

```powershell
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

Profile `preview` tạo APK cài thử; `production` tạo AAB. Build artifact/install/run chưa được xác minh ở workspace này.

## Giới hạn

- DummyJSON là dữ liệu demo, không có tồn kho/giá bảo đảm; không có payment gateway.
- Notification là local notification theo sự kiện trên thiết bị, không phải push notification server-to-device.
- Gemini cần Cloud Function đã deploy và billing/quota của project.
- Cần chạy lại matrix trên Android thật/emulator, kiểm tra Firebase rules/auth, permission allow/deny và release build trước khi nộp.
- Student name/class, Firebase project, Gemini secret, EAS project và release artifact chưa được cung cấp.

## AI usage

AI hỗ trợ tạo scaffold, kiến trúc mẫu và test/doc ban đầu dựa trên Student Guide. Mã đã được điều chỉnh theo Expo SDK 57, kiểm tra bằng unit tests, web export và Android JS bundle. Sinh viên cần đọc/hiểu, cấu hình dịch vụ, chạy test thiết bị và cập nhật log/evidence của chính mình trước khi nộp; không xem generated code là bằng chứng đã hoàn tất demo hoặc release.