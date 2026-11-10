# Tài liệu ôn interview MMA301 — Assignment 2

Tài liệu này bám theo rubric trong *MMA301 Assignments Interview Guide* và code hiện có trong repository. Đây là bộ khung để luyện nói, không phải kịch bản cần học thuộc. Hãy sửa các câu về phần việc cá nhân theo đúng những gì bạn đã tự làm, kiểm thử và có thể giải thích.

## 1. Rubric và chiến lược trả lời

| Tiêu chí | Điểm | Cách thể hiện |
| --- | ---: | --- |
| C1 — Hiểu bài toán và cách thực hiện | 1.5 | Nêu đúng mục tiêu, chức năng, dữ liệu, ràng buộc và lý do chọn giải pháp. |
| C2 — Tiến trình cá nhân và Git | 2.0 | Mở repository thuộc tài khoản của bạn; giải thích các commit thật và quá trình phát triển. |
| C3 — Functional implementation | 1.5 | Chạy app, demo luồng chính, cho thấy các phần tích hợp đúng mức đã xác minh. |
| C4 — Code understanding, explanation & adaptation | 5.0 | Mở đúng file, trace input → xử lý/state → output; giải thích lựa chọn, lỗi và ảnh hưởng khi đổi yêu cầu. |

Trình tự nên tập: **Run → Personal Git → Explain → Code Interview → Adaptation nếu được yêu cầu**.

Khung trả lời cho mỗi câu hỏi kỹ thuật:

> **Mục đích** → **Input** → **Trigger / điểm bắt đầu** → **Processing / data / state** → **Output** → **Failure path** → **Vì sao chọn cách này** → **Nếu yêu cầu đổi thì ảnh hưởng ở đâu**

Không chỉ nêu tên thư viện. Hãy mở file và lần theo luồng bằng một ví dụ cụ thể.

## 2. Bài giới thiệu mẫu (khoảng 45–60 giây)

> “Assignment của em là một ứng dụng mua sắm mobile viết bằng React Native và Expo. Người dùng có thể duyệt catalog, tìm kiếm/lọc sản phẩm, xem chi tiết, quản lý giỏ hàng và danh sách đã lưu. App dùng Expo Router cho navigation; catalog lấy từ DummyJSON; cart và favorites được lưu local bằng AsyncStorage. Wishlist có đường tích hợp Firebase anonymous Auth/Firestore, còn trợ lý catalog gọi Cloud Function để giữ Gemini key ở server. Notification hiện là local notification, không phải push notification. Em muốn trình bày rõ phần nào đã chạy được và phần nào mới có code nhưng còn chờ cấu hình hoặc kiểm thử.”

Chỉ nói “em đã tự làm/đã kiểm thử” nếu điều đó đúng với đóng góp và bằng chứng của bạn. Nếu scaffold hoặc một phần code được AI hỗ trợ, hãy nói rõ phần nào được hỗ trợ và phần nào bạn đã tự đọc, chỉnh sửa, kiểm tra.

## 3. Mô tả kiến trúc trong 1–2 phút

> “Các màn hình nằm trong `src/app/` và dùng Expo Router. Discover gọi service để lấy sản phẩm; phần query, category và pagination thuộc màn hình Discover. Chi tiết sản phẩm là dynamic route. Cart và favorites là state dùng chung trong `StoreContext`, còn các phép tính giỏ hàng thuần nằm riêng trong `src/lib/cart.mjs`. Context lưu cart/favorites bằng AsyncStorage. Nếu Firebase được cấu hình, favorites được đồng bộ dưới UID của anonymous user. Studio gửi nhu cầu và một phần catalog lên client service, lấy Firebase ID token rồi gọi Cloud Function; function gọi Gemini bằng secret phía server và chỉ trả về product ID thuộc catalog được gửi lên.”

Điểm cần nhấn mạnh: **catalog state** thuộc Discover; **cart/favorites** thuộc StoreContext; **item count/subtotal** được tính từ cart, không phải một state được lưu riêng.

## 4. Luồng demo nên luyện

### A. Catalog → tìm kiếm → chi tiết

1. Mở Discover và chỉ vào [`src/app/(tabs)/index.js`](../src/app/(tabs)/index.js).
2. Nói rõ ô tìm kiếm đợi 300 ms rồi mới cập nhật query; category/query thay đổi sẽ tải lại từ đầu.
3. Chỉ vào [`src/services/products.js`](../src/services/products.js): service dựng URL DummyJSON, xử lý search/category và trả `{ products, total }`.
4. Giải thích `FlatList` dùng `onEndReached` để tải thêm; `skipRef`, cờ loading và `AbortController` hạn chế request trùng hoặc request cũ; danh sách append có lọc ID trùng.
5. Mở một sản phẩm và nêu detail route tải dữ liệu theo ID, có trạng thái loading và error.

**Câu trả lời mẫu — “Nếu API lỗi thì sao?”**

> “Service ném lỗi khi HTTP response không thành công. Discover bỏ qua lỗi abort, còn lỗi request thì hiện thông báo và nút retry; khi tải lại từ đầu thất bại, màn hình không giữ danh sách cũ như thể đó là kết quả query mới. Em sẽ kiểm tra cả mạng offline, retry và empty search trên thiết bị trước khi kết luận runtime flow đạt.”

### B. Chi tiết → giỏ hàng → tổng tiền

1. Mở [`src/app/product/[id].js`](../src/app/product/[id].js), tìm `addProduct`.
2. Trigger là người dùng nhấn **Add to bag**. Màn hình gọi `addToCart(product)` trong context.
3. Mở [`src/lib/cart.mjs`](../src/lib/cart.mjs): `addItem` tăng quantity nếu ID đã có, nếu chưa thì thêm sản phẩm với quantity 1; `updateQuantity` xóa khi quantity bằng 0.
4. [`src/context/StoreContext.js`](../src/context/StoreContext.js) lưu state; effect ghi cart/favorites xuống AsyncStorage sau khi khôi phục xong. `getCartSummary` derive item count và total.
5. Cart hiển thị dữ liệu từ context; badge tab dùng item count đã derive.

**Câu trả lời mẫu — “Vì sao không lưu total riêng?”**

> “Total là dữ liệu dẫn xuất từ `price × quantity`. Nếu lưu thêm một bản total riêng, quantity có thể đổi mà total không được cập nhật, tạo hai nguồn sự thật. Em tính summary từ danh sách cart mỗi lần state đổi.”

### C. Favorites và Firebase

> “Favorite cập nhật local state và AsyncStorage để luồng chính vẫn dùng được khi chưa cấu hình mạng. Nếu Firebase đã cấu hình, app tạo/khôi phục anonymous user và đọc/ghi wishlist theo đường dẫn `users/{uid}/wishlist/{productId}`. Firestore rules chỉ cho user đã xác thực đọc/ghi document có `userId` trùng UID của họ. UI có trạng thái local, connected hoặc error.”

Mở [`src/services/firebase.js`](../src/services/firebase.js), [`firestore.rules`](../firestore.rules) và khu vực Saved trong `StoreContext` khi được hỏi. Nói đúng trạng thái: Firebase project/credentials và runtime sync hiện **chưa được xác minh** trong evidence hiện có.

### D. Gemini và bảo vệ secret

> “Client gửi intent, catalog giới hạn và Firebase ID token tới proxy. Cloud Function xác thực token, giới hạn số lượng/độ dài dữ liệu, gọi Gemini bằng secret ở server và kiểm tra product ID kết quả có nằm trong catalog đầu vào không. Client cũng map ID trả về vào catalog local, không render sản phẩm lạ. Request có timeout 20 giây. API key của Gemini không nằm trong app.”

Mở [`src/services/assistant.js`](../src/services/assistant.js), tab Studio và [`functions/index.js`](../functions/index.js). Cần phân biệt **code path đã triển khai** với **dịch vụ chạy thật**: thiếu proxy URL, Firebase/Gemini secret hoặc deploy thì chưa thể khẳng định tích hợp hoạt động end-to-end.

### E. Notification

> “Đây là local notification khi thêm sản phẩm, không phải push notification từ server. Settings có thao tác chủ động xin quyền và gửi test; trên Android service tạo notification channel. Nếu không được cấp quyền hoặc chạy trên web, app trả trạng thái tương ứng.”

Mở [`src/services/notifications.js`](../src/services/notifications.js). Permission và hiển thị notification trên Android thật/emulator hiện cần được kiểm tra trực tiếp.

## 5. Câu hỏi thường gặp và gợi ý trả lời

### “Yêu cầu chính và giới hạn của assignment là gì?”

> “Mục tiêu là một luồng e-commerce demo có catalog, detail, cart, saved items và các tích hợp liên quan. DummyJSON chỉ cung cấp dữ liệu demo nên giá/tồn kho không được bảo đảm; app không có payment gateway. Firebase/Gemini cần cấu hình dịch vụ; notification là local. Em không xem các phần chưa có credential hoặc chưa chạy trên thiết bị là đã được xác minh.”

### “Vì sao chọn Context API?”

> “Cart/favorites cần dùng ở một số tab nhưng phạm vi state còn vừa phải, nên Context đơn giản và ít hạ tầng hơn một state-management library khác. Nếu ứng dụng có nhiều workflow, nhiều nguồn cập nhật hoặc cần selector/debugging phức tạp, em sẽ đánh giá lại; hiện tại em giữ phép tính giỏ hàng thuần trong helper để dễ kiểm thử.”

### “Nếu đổi pagination sang cursor thì sửa ở đâu?”

> “Em sẽ bắt đầu từ `getProducts` và contract giữa service với Discover. Thay `skip/limit` bằng cursor và cập nhật điều kiện `hasMore`/next cursor ở màn hình. Em sẽ cố giữ shape `{ products, total }` nếu backend mới hỗ trợ; nếu không thì đổi contract có chủ đích. Sau đó kiểm tra reset khi search/category đổi, request abort, duplicate guard và end-of-list.”

### “Nếu cùng sản phẩm được thêm hai lần?”

> “`addItem` tìm theo product ID. Nếu đã có thì trả về mảng mới với quantity tăng một; nếu chưa có thì append bản sao sản phẩm kèm quantity 1. Summary sau đó tính lại từ cart.”

### “Điều gì xảy ra nếu Gemini trả ID giả?”

> “Function lọc ID với tập ID catalog đã nhận; client tiếp tục map ID vào catalog local và loại giá trị không tìm thấy. Nếu không còn kết quả hợp lệ thì hiển thị lỗi thay vì tạo product card giả.”

### “Bạn sẽ cải thiện điều gì tiếp theo?”

> “Ưu tiên đầu tiên là hoàn tất kiểm thử thiết bị và integrations còn pending, đồng thời bổ sung bằng chứng lỗi/retest thực tế. Về code, em sẽ xem xét hiển thị rõ lỗi khi gửi local notification thất bại: hiện call tại product detail có catch nhưng không đưa lỗi ra UI. Em cũng sẽ bổ sung kiểm thử cho khôi phục AsyncStorage và các tình huống API/Firebase/Gemini khi đã có môi trường kiểm thử.”

### “Bạn đã dùng AI như thế nào?”

Hãy trả lời theo đúng AI usage log và thực tế của bạn, ví dụ:

> “AI có hỗ trợ scaffold/đề xuất một phần code và test/doc. Em chịu trách nhiệm đọc và giải thích phần em trình bày, kiểm tra lại với yêu cầu, và nêu rõ phần nào chưa tự xác minh. Em không dùng việc code tồn tại như bằng chứng rằng em đã chạy integration hoặc device test.”

## 6. Checklist trước buổi interview

### Code và chạy app

- [ ] Tự chạy app và thử trên Android device/emulator, không chỉ dựa vào build bundle.
- [ ] Luyện demo: catalog → search/category → detail → add item hai lần → đổi quantity → remove → restart để kiểm tra restore.
- [ ] Chuẩn bị một đường đi khi offline, một query không có kết quả và một ví dụ lỗi/retry.
- [ ] Mở trước các file: `src/app/(tabs)/index.js`, `src/services/products.js`, `src/app/product/[id].js`, `src/context/StoreContext.js`, `src/lib/cart.mjs`, `src/services/assistant.js`, `functions/index.js`.
- [ ] Điền student name/class và cập nhật evidence/test status đúng với kết quả thực tế.
- [ ] Ghi ít nhất hai lỗi app thật bạn quan sát được: triệu chứng/log, giả thuyết, cách kiểm tra, nguyên nhân, fix và retest. Không biến debug integration trong quá trình dựng project thành lỗi runtime trên thiết bị nếu bạn chưa quan sát lỗi đó.

### Git và tính cá nhân

- [ ] Đăng nhập đúng tài khoản Git cá nhân; mở repository và commit history thật.
- [ ] Hiện repository trong workspace có một commit ban đầu (`a13cab3`) và chưa thấy remote trong cấu hình Git. Hãy xác nhận tài khoản/repository mà giảng viên yêu cầu; đừng trình bày commit hiện tại như một quá trình phát triển nhiều bước.
- [ ] Rà soát code, tạo các commit có nội dung và tiến trình thật cho phần bạn thực sự kiểm tra/chỉnh sửa; không bịa lịch sử, không backdate commit, không nhận phần AI tạo hoàn toàn là đóng góp cá nhân.
- [ ] Kiểm tra `git status` và tránh đưa `.env.local`, API key, credential hoặc secret lên Git.
- [ ] Chọn 2–3 commit thật để giải thích: mục tiêu thay đổi, file chính, cách kiểm chứng và điều học được.

### Trạng thái cần nói thật

| Hạng mục | Bằng chứng hiện có | Cách trình bày |
| --- | --- | --- |
| Cart helper | Evidence ghi nhận 4 unit tests pass | Có thể trình bày logic/test này; chạy lại trước interview nếu có thể. |
| Web/Android export và function syntax check | Evidence ghi nhận pass | Đây là kiểm tra build/export/syntax, không thay thế test runtime trên thiết bị. |
| Firebase / Gemini | Chưa có cấu hình/deploy được xác minh | Nói code path đã chuẩn bị; không khẳng định end-to-end đã hoạt động. |
| Notification | Chưa xác minh permission/device runtime | Nói local notification; cần demo quyền và event trên thiết bị. |
| EAS release | Chưa có project/credentials hoặc APK/AAB được xác minh | Không nói đã phát hành/build thành công. |
| Git | Một commit ban đầu, không có remote được hiển thị | Chuẩn bị repository/tài khoản cá nhân theo yêu cầu môn học. |

## 7. Bài tập trả lời nhanh

Tự trả lời thành tiếng, mỗi câu trong 30–60 giây:

1. Dữ liệu bắt đầu từ đâu và đến UI bằng cách nào?
2. `onEndReached` tránh tải trùng hoặc lặp vô hạn ra sao?
3. Điều gì xảy ra từ lúc bấm **Add to bag** đến lúc badge tab đổi?
4. Vì sao cart total không được lưu riêng?
5. App hoạt động ra sao khi Firebase chưa cấu hình?
6. Firebase rules ngăn user khác đọc wishlist bằng cách nào?
7. Gemini key nằm ở đâu và ID sản phẩm được kiểm tra ở những lớp nào?
8. Local notification khác push notification thế nào?
9. Nêu một test đã chạy thật và một test còn pending.
10. Nếu giảng viên yêu cầu thêm validation/field, bạn sẽ sửa file nào trước và kiểm tra ảnh hưởng gì?
