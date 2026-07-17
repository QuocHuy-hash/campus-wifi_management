# Solution: Captive Portal Redirect cho CNA và Browser

## 1. Mục tiêu

Tài liệu này mô tả giải pháp đề xuất cho luồng đăng ký thiết bị và điều hướng sau khi kết nối WiFi thành công.

Phạm vi hiện tại chỉ gồm phân tích và thiết kế. Chưa thực hiện thay đổi mã nguồn.

### Kết quả mong muốn

| Điểm vào | Sau khi đăng nhập/có session | Sau khi đăng ký thiết bị | Sau khi xác nhận có Internet |
|---|---|---|---|
| CNA trên iOS/macOS | Đăng ký thiết bị với portal | Mở `network-connecting` | Chuyển tới `https://captive.apple.com/hotspot-detect.html` |
| Browser trên iOS/Android từ captive redirect | Đăng ký thiết bị với portal | Mở `network-connecting` | Chuyển tới URL đích do controller truyền trong tham số `url` |
| Truy cập portal trực tiếp, không có captive context | Dùng website bình thường | Không tự đăng ký thiết bị | Không mở `network-connecting`, tiếp tục luồng landing page/session bình thường |

## 2. Luồng hiện tại

### 2.1. Nhận redirect từ controller

Controller gọi route:

```text
/guest/{clientMac}?id=...&ap=...&ssid=...&url=...&t=...
```

Middleware hoặc `src/app/guest/[...slug]/page.tsx` chuyển request sang `/login` và giữ nguyên query string.

`src/lib/captivePortal.ts` parse bốn trường bắt buộc:

- `id`
- `ap`
- `ssid`
- `url`

`saveCaptivePortalContext()` lưu:

- Toàn bộ captive context vào `localStorage.portalCaptiveContext`.
- Riêng URL đích vào `sessionStorage.captiveOriginalUrl`.

`src/app/providers.tsx` thực hiện việc lưu này trên mọi route có đủ captive parameters.

### 2.2. Đăng nhập hoặc sử dụng session có sẵn

`AuthFeature` có hai nhánh chính:

- Sau khi login thành công, gọi `redirectAfterDeviceAuthorization()`.
- Nếu đã có session và có captive context, tự gọi API đăng ký/authorize thiết bị.

Sau đó ứng dụng chuyển tới `/network-connecting`.

### 2.3. Xác nhận Internet và redirect

`NetworkConnectingScreen` tạo một `Image` tải:

```text
https://www.google.com/favicon.ico?rand=...
```

Khi ảnh load thành công:

1. Hiển thị trạng thái kết nối thành công.
2. Chờ một giây.
3. Gọi callback `onComplete()`.

`src/app/network-connecting/page.tsx` xử lý callback theo thứ tự:

1. Nếu có `sessionStorage.captiveOriginalUrl`, redirect tới URL này.
2. Nếu không có URL và user agent là Apple, redirect tới Apple captive endpoint.
3. Các trường hợp còn lại chuyển tới `/session`.

## 3. Đánh giá và lỗi trong luồng hiện tại

### 3.1. Không phân biệt CNA với browser trên thiết bị Apple

Code hiện tại chỉ kiểm tra:

```ts
/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)
```

Điều kiện này chỉ xác định thiết bị Apple, không xác định ứng dụng đang chạy trong CNA.

Do đó các trường hợp sau đang bị xếp cùng một nhóm:

- CNA trên iPhone/iPad/macOS.
- Safari trên iPhone/iPad/macOS.
- Chrome hoặc browser khác trên iOS.

Đây là sai khác trực tiếp so với yêu cầu: browser trên iOS phải về URL đích, còn CNA mới phải về Apple captive endpoint.

### 3.2. URL đích phụ thuộc vào `sessionStorage`

URL đích chỉ được đọc từ `sessionStorage.captiveOriginalUrl` ở màn hình `network-connecting`.

Điều này hoạt động khi test local bằng cách dán URL trong cùng một tab. Tuy nhiên, luồng captive trên điện thoại có thể chuyển qua các browsing context khác nhau khi:

- Hệ điều hành mở portal.
- Người dùng chuyển từ captive window sang browser.
- OAuth hoặc browser handoff tạo context mới.
- Chế độ privacy giới hạn storage.

`sessionStorage` gắn với từng tab/top-level browsing context nên không phải nguồn lưu trữ đủ bền cho luồng này.

Trong khi đó, captive context đầy đủ trong `localStorage` lại bị xóa ngay sau khi API đăng ký thiết bị trả về. Khi tới `network-connecting`, ứng dụng không còn nguồn dự phòng để lấy URL đích.

Đây là giả thuyết phù hợp nhất với khác biệt đang quan sát:

- Local, cùng tab: có `sessionStorage`, redirect thành công.
- Điện thoại, đi qua captive/browser handoff: có thể mất `sessionStorage`, không còn target chính xác.

### 3.3. Redirect target bị xóa trước khi điều hướng hoàn tất

Callback hiện tại xóa `captiveOriginalUrl` trước khi gán `window.location`.

Nếu điều hướng bị browser chặn, bị controller bắt lại, hoặc target không hợp lệ, màn hình không còn dữ liệu để retry. Ứng dụng cũng không hiển thị lỗi hay nút tiếp tục thủ công.

### 3.4. Lỗi đăng ký thiết bị vẫn có thể đi tiếp

Trong login thông thường, `authorizeDeviceInBackground()` bắt lỗi nhưng không trả trạng thái thất bại. `redirectAfterDeviceAuthorization()` vẫn chuyển sang `/network-connecting`.

Trong nhánh đã có session, cả `try` và `catch` đều chuyển tới `/network-connecting`.

Hành vi này không đáp ứng yêu cầu:

> Chỉ chuyển tới `network-connecting` sau khi API đăng ký thiết bị thành công.

Nếu controller chưa whitelist thiết bị, polling có thể chạy vô hạn hoặc cho kết quả không nhất quán.

### 3.5. Connectivity probe chưa có timeout và có race nhỏ

`Image.src` được gán trước `onload` và `onerror`. Handler nên được gắn trước khi bắt đầu request.

Promise cũng không có timeout. Nếu request không phát sinh `load` hoặc `error`, một vòng poll có thể treo. Các interval tiếp theo vẫn tiếp tục tạo thêm request.

Ngoài ra, chỉ dùng một domain Google có thể tạo false negative nếu Google bị DNS, firewall, CSP hoặc chính sách mạng chặn dù Internet đã hoạt động.

### 3.6. URL đích chưa được chuẩn hóa và kiểm tra an toàn

Tham số `url` đang được dùng trực tiếp cho `window.location`.

Cần:

- Chỉ chấp nhận `http:` và `https:`.
- Từ chối `javascript:`, `data:`, URL rỗng và URL không parse được.
- Ngăn redirect vòng về portal hoặc `/network-connecting`.
- Bảo đảm controller URL-encode toàn bộ giá trị `url`, nhất là khi URL đích có query string riêng.

Ví dụ đúng:

```text
url=https%3A%2F%2Frevispace.com%2Fblog%3Fsource%3Dwifi%26campaign%3Dhcmus
```

## 4. Nguyên nhân của hiện tượng hiện tại

Khi giao diện đã hiển thị “Kết nối mạng thành công”, connectivity probe đã resolve thành công và callback redirect đáng lẽ được gọi sau một giây.

Vì local redirect được nhưng luồng thật trên điện thoại không ổn định, nguyên nhân có khả năng cao nằm ở bước chọn và giữ redirect target:

1. URL đích được lưu trong `sessionStorage`, không bền qua captive/browser handoff.
2. Captive context trong `localStorage` đã bị xóa trước khi màn hình kết nối dùng nó.
3. Browser trên Apple bị nhận diện nhầm thành CNA khi URL đích bị mất.
4. Redirect fallback có thể bị controller bắt lại hoặc quay về portal, tạo cảm giác vẫn bị giữ tại `network-connecting`.

Hiện tại code chưa có telemetry cho `flow type`, target đã chọn và lỗi navigation nên chưa thể xác nhận một nguyên nhân duy nhất chỉ từ log phía frontend.

## 5. Giải pháp đề xuất

### 5.1. Dùng một captive flow context duy nhất

Không dùng một captive context lâu dài cho cả đăng ký thiết bị và redirect. Tách dữ liệu thành hai giai đoạn có vòng đời rõ ràng.

Context đăng ký thiết bị:

```ts
type CaptiveRegistrationContext = {
  version: 1;
  flowId: string;
  entryMode: "cna" | "browser";
  deviceMac: string;
  apMac: string;
  ssid: string;
  destinationUrl: string | null;
  createdAt: number;
  expiresAt: number;
  status: "captured" | "authorizing";
};
```

Context này chỉ được tạo khi request có đủ `id`, `ap`, `ssid`, `url`. API đăng ký thiết bị chỉ được gọi khi context này tồn tại, còn hạn và chưa được consume.

Sau khi API đăng ký thiết bị thành công, tạo completion context tối thiểu:

```ts
type CaptiveCompletionContext = {
  version: 1;
  flowId: string;
  entryMode: "cna" | "browser";
  destinationUrl: string | null;
  createdAt: number;
  expiresAt: number;
};
```

Completion context không chứa MAC thiết bị, AP, SSID hoặc dữ liệu dùng để gọi lại API đăng ký thiết bị. Nó chỉ phục vụ `/network-connecting` và quyết định hành động cuối.

Nguồn dữ liệu chuẩn nên là `localStorage` vì dữ liệu phải sống qua chuyển route và browser context của cùng origin. `sessionStorage` chỉ có thể dùng như cache phụ, không được là nguồn duy nhất.

Context phải có TTL ngắn, ví dụ 10-15 phút, để tránh dùng nhầm dữ liệu của lần kết nối cũ.

### 5.2. Phân loại entry mode, không phân loại theo thiết bị

Không dùng user agent Apple để quyết định đích cuối.

Thứ tự đề xuất:

1. Tốt nhất: controller truyền tham số rõ ràng, ví dụ `entry=cna` hoặc `entry=browser`.
2. Nếu chưa thay đổi được controller: coi là CNA khi URL gốc là một Apple connectivity endpoint đã biết.
3. Các captive redirect còn lại được coi là browser.

Ví dụ fallback:

```text
https://captive.apple.com/hotspot-detect.html
http://captive.apple.com/hotspot-detect.html
http://captive.apple.com/generate_204
```

User agent vẫn có thể dùng cho logging/device metadata, nhưng không dùng để quyết định CNA hay browser.

### 5.3. Resolver duy nhất cho trang đích

Tạo một hàm thuần dùng chung cho login thường, existing session và OAuth:

```ts
resolveCaptiveCompletionTarget(context)
```

Quy tắc:

```text
entryMode = cna
  -> https://captive.apple.com/hotspot-detect.html

entryMode = browser và destinationUrl hợp lệ
  -> destinationUrl

entryMode = browser nhưng destinationUrl không hợp lệ
  -> trang fallback của portal, ví dụ /session

không có captive context
  -> luồng website bình thường
```

Điều này bảo đảm Safari/Chrome trên iOS không bị chuyển tới Apple endpoint chỉ vì chạy trên thiết bị Apple.

### 5.4. Chuẩn hóa state machine

Luồng captive phải tuần tự:

```text
CAPTURED
  -> AUTHENTICATED
  -> AUTHORIZING_DEVICE
  -> DEVICE_AUTHORIZED_AND_REGISTRATION_CONTEXT_CONSUMED
  -> NETWORK_CONNECTING
  -> INTERNET_CONFIRMED
  -> REDIRECTING
```

Chỉ được chuyển sang `NETWORK_CONNECTING` khi API đăng ký thiết bị thành công.

Nếu API thất bại:

- Giữ nguyên captive context.
- Hiển thị lỗi.
- Cho phép retry.
- Không giả định thiết bị đã được whitelist.

### 5.5. Consume captive params sau khi đăng ký thành công

Sau khi API đăng ký thiết bị trả về thành công, thực hiện theo đúng thứ tự:

1. Copy `entryMode` và `destinationUrl` sang `CaptiveCompletionContext`.
2. Xóa `CaptiveRegistrationContext` chứa `id`, `ap`, `ssid`, `url`, `t`.
3. Xóa captive query khỏi URL hiện tại bằng `history.replaceState`.
4. Dùng `window.location.replace("/network-connecting")` để không giữ trang `/login?...captiveParams` trong browser history.
5. Tại `/network-connecting`, chỉ đọc completion context; tuyệt đối không gọi lại API đăng ký thiết bị.

Việc xóa query và registration context là bắt buộc. Nếu chỉ xóa local storage nhưng URL `/login?id=...&ap=...` vẫn còn trong history, người dùng bấm Back hoặc refresh có thể làm `Providers` parse lại query và tạo captive context mới, dẫn tới gọi API lần nữa.

Completion context được xóa:

- Browser: sau khi `/network-connecting` đã copy target vào memory và chuẩn bị redirect tới destination URL.
- CNA: sau khi Apple connectivity probe thành công và flow đã chuyển sang trạng thái hoàn tất.
- Mọi trường hợp: tự hết hạn theo TTL nếu flow bị gián đoạn.

Như vậy lần truy cập portal tiếp theo không còn registration context và không bị nhận diện nhầm là captive flow cũ, trong khi browser hiện tại vẫn giữ được destination URL để hoàn tất redirect.

### 5.6. Cứng hóa connectivity check

Giữ màn hình hiện tại nhưng sửa cơ chế polling:

- Gắn `onload`/`onerror` trước khi gán `src`.
- Mỗi probe có timeout rõ ràng.
- Không cho nhiều probe chạy chồng nhau.
- Callback completion chỉ chạy đúng một lần.
- Có tổng timeout và nút “Tiếp tục”/“Thử lại” khi vượt giới hạn.
- Ghi log flow ID, entry mode và target type; không log access token.

Có thể dùng nhiều connectivity target theo thứ tự thay vì phụ thuộc duy nhất vào Google.

### 5.7. Điều hướng top-level

Sau khi Internet được xác nhận, dùng:

```ts
window.location.replace(targetUrl);
```

`replace` phù hợp hơn `router.push` cho external URL và tránh nút Back quay lại `network-connecting`.

Nếu navigation không xảy ra sau một khoảng ngắn, hiển thị link/button fallback tới đúng target.

## 6. Luồng mục tiêu chi tiết

### 6.1. CNA trên iOS/macOS

```text
Controller redirect tới portal
  -> capture captive context với entryMode=cna
  -> login hoặc xác nhận session có sẵn
  -> gọi API đăng ký thiết bị
  -> API thành công
  -> tạo completion context
  -> xóa registration context và captive params trên URL
  -> /network-connecting
  -> Internet confirmed
  -> window.location.replace(
       "https://captive.apple.com/hotspot-detect.html"
     )
```

URL đích gốc không được ưu tiên hơn Apple endpoint trong nhánh CNA.

### 6.2. Browser trên iOS/Android từ captive redirect

```text
Controller redirect tới portal kèm url đích
  -> capture captive context với entryMode=browser
  -> login hoặc xác nhận session có sẵn
  -> gọi API đăng ký thiết bị
  -> API thành công
  -> tạo completion context chứa entryMode và destinationUrl
  -> xóa registration context và captive params trên URL
  -> /network-connecting
  -> Internet confirmed
  -> validate destinationUrl
  -> window.location.replace(destinationUrl)
```

Thiết bị iOS vẫn đi theo nhánh browser nếu entry mode là browser.

### 6.3. Truy cập portal trực tiếp

```text
User mở https://wifi.client.revispace.com
  -> không có id/ap/ssid/url
  -> không tạo captive flow context
  -> không gọi API đăng ký thiết bị tự động
  -> không mở /network-connecting
  -> hiển thị landing page/login/session theo trạng thái đăng nhập
```

## 7. Phạm vi thay đổi dự kiến khi triển khai

Các file có khả năng cần thay đổi:

| File | Thay đổi |
|---|---|
| `src/lib/captivePortal.ts` | Chuẩn hóa context, TTL, entry mode, URL validation và target resolver |
| `src/app/providers.tsx` | Capture context một lần, bỏ logic lưu trùng lặp |
| `src/features/auth/components/AuthFeature.tsx` | Không nuốt lỗi authorize; dùng state machine/redirect chung |
| `src/features/auth/hooks/useCaptiveAuthorization.ts` | Trả kết quả rõ ràng và dùng cùng completion flow |
| `src/app/auth/success/page.tsx` | Dùng cùng resolver cho OAuth |
| `src/app/network-connecting/page.tsx` | Không dùng Apple user agent; dùng target resolver |
| `src/components/NetworkConnectingScreen.tsx` | Polling có timeout, không overlap, callback một lần |
| `src/middleware.ts` | Bảo đảm `/guest/*` và `/login` có session vẫn giữ đúng captive orchestration |

Nên gom logic hoàn tất captive flow vào một service/hook dùng chung để tránh ba implementation khác nhau giữa login, existing session và OAuth.

## 8. Tiêu chí nghiệm thu

### CNA

- iOS CNA login mới: đăng ký thành công, hiện connecting, chuyển tới Apple endpoint.
- iOS CNA đã có session: tự đăng ký thiết bị, hiện connecting, chuyển tới Apple endpoint.
- macOS CNA: cùng kết quả.
- API đăng ký thất bại: không vào connecting.

### Browser captive

- Safari iOS: về đúng URL đích.
- Chrome iOS: về đúng URL đích.
- Chrome Android: về đúng URL đích.
- Browser đã có session: vẫn đăng ký thiết bị rồi về URL đích.
- URL đích có query string: giữ nguyên đầy đủ.
- Mất `sessionStorage`: vẫn về đúng URL nhờ canonical context.
- Sau khi đăng ký thành công, refresh/back không gọi lại API đăng ký thiết bị.
- `/network-connecting` không còn `id`, `ap`, `ssid`, `url`, `t` trên URL.

### Direct website

- Mở domain không có captive params: không đăng ký thiết bị.
- Không mở `network-connecting`.
- Người chưa đăng nhập thấy landing/login bình thường.
- Người đã đăng nhập vào trang ứng dụng bình thường.

### Độ bền

- Refresh tại `network-connecting` không làm mất target.
- Redirect thất bại có nút retry/fallback.
- Context cũ hết TTL không được tự động dùng lại.
- Không chấp nhận URL có scheme nguy hiểm.
- Mỗi `flowId` chỉ được đăng ký thiết bị thành công một lần.
- API đăng ký thiết bị không được gọi nếu thiếu một trong bốn tham số `id`, `ap`, `ssid`, `url`.

## 9. Kết luận

Vấn đề không nằm ở một câu lệnh redirect đơn lẻ. Luồng hiện tại thiếu khái niệm `entryMode` và đang lưu destination bằng storage không đủ bền cho captive/browser handoff.

Giải pháp trọng tâm là:

1. Phân biệt CNA và browser bằng captive flow context, không bằng Apple user agent.
2. Giữ destination trong canonical context có TTL.
3. Chỉ mở `network-connecting` sau khi đăng ký thiết bị thành công.
4. Dùng một target resolver chung cho login, existing session và OAuth.
5. Redirect top-level tới Apple endpoint cho CNA, URL gốc cho browser, và không chạy captive flow khi truy cập portal trực tiếp.
