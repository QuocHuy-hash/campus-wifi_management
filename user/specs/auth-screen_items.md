# BẢNG MÔ TẢ CÁC THÀNH PHẦN MÀN HÌNH AUTH (Đăng nhập / Đăng ký)

## 1. Màn hình Đăng nhập Chính (`AuthFeature.tsx`)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Logo HCMUS | `hcmusLogo` | O | Image (img) | PNG `/logo_hcmus.png` | 56x56px | AL001 | Hiển thị thương hiệu trường |
| 2 | Tiêu đề "Trường Đại học KHTN - ĐHQG HCM" | - | O | Text (p) | Static string | - | AL002 | Tên trường đầy đủ |
| 3 | Tab "Cán bộ / Sinh viên" | `activeTab === 'internal'` | I | Button (tab) | onClick -> setActiveTab('internal') | - | AL003 | Chuyển sang tab SSO nội bộ |
| 4 | Tab "Khách" | `activeTab === 'guest'` | I | Button (tab) | onClick -> setActiveTab('guest') | - | AL004 | Chuyển sang tab đăng nhập khách |
| 5 | Checkbox "Tôi đồng ý" | `agreeTerms` / id=`terms` | I | Checkbox | boolean | - | AL005 | Bắt buộc check trước khi SSO |
| 6 | Label "Tôi đồng ý với" | - | O | Text (Label) | Static string | - | AL006 | Mô tả checkbox |
| 7 | Link "Điều khoản sử dụng WiFi" | `setTermsModalOpen(true)` | I | Button (link) | Text + onClick | - | AL007 | Mở TermsDialog |
| 8 | Error "Vui lòng đồng ý với Điều khoản..." | `setError(...)` | O | Error text | Vietnamese string | - | AL008 | Hiển thị khi chưa đồng ý |
| 9 | Footer "© 2026 HCMUS - ĐHKHTN" | - | O | Text (p) | Static copyright | - | AL009 | Footer bản quyền |

## 2. Tab Đăng nhập Khách (`GuestLoginTab.tsx`)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Label "Tài khoản (Email / Zalo)" | htmlFor=`guest-login-username` | O | Label text | Static string | - | AL010 | Mô tả trường nhập |
| 2 | Input tài khoản | `guest-login-username` | I | Input (text) | Free text string | - | AL011 | Nhập email hoặc số ĐT Zalo |
| 3 | Icon User (trong input) | `User` (lucide) | O | Icon (SVG) | 16px | 16px | AL012 | Icon tiền tố trái |
| 4 | Placeholder "Nhập email hoặc số ĐT Zalo" | placeholder attr | O | Placeholder | String | - | AL013 | Gợi ý nhập liệu |
| 5 | Label "Mật khẩu" | htmlFor=`guest-login-password` | O | Label text | Static string | - | AL014 | Mô tả trường nhập |
| 6 | Input mật khẩu | `guest-login-password` | I | Input (password/text toggle) | Free text | - | AL015 | Nhập mật khẩu |
| 7 | Icon Lock (trong input) | `Lock` (lucide) | O | Icon (SVG) | 16px | 16px | AL016 | Icon tiền tố trái |
| 8 | Placeholder "••••••••" | placeholder attr | O | Placeholder | String | - | AL017 | Gợi ý nhập mật khẩu |
| 9 | Nút Eye/EyeOff (toggle hiện/ẩn) | `onTogglePassword` | I | Button (icon) | SVG 16px | 16px | AL018 | Chuyển đổi hiển thị password |
| 10 | Error login (khung đỏ) | `loginError` | O | Alert div | Vietnamese string | - | AL019 | Hiển thị lỗi từ API |
| 11 | Link "Quên mật khẩu?" | `onOpenForgotModal` | I | Button (link) | Text, blue, underline | - | AL020 | Mở ForgotPasswordDialog |
| 12 | Nút "Đăng nhập" | `onLogin` | I | Button (submit) | `<button type="submit">` | h-11, full width | AL021 | **Disabled** khi `isLoading \|\| !username \|\| !password`; hiển thị spinner khi loading |
| 13 | Text "Chưa có tài khoản?" | - | O | Text | Static string | - | AL022 | Giới thiệu link đăng ký |
| 14 | Link "Đăng ký" | `onOpenGuestModal` | I | Button (link) | Text, blue, semibold | - | AL023 | Mở GuestRegistrationDialog |
| 15 | Nút SSO Google (compact) | `onSSOLogin('google')` | I | Button (social icon) | Image `/google.png` | 6.5x6.5 | AL024 | Đăng nhập Google OAuth2 |
| 16 | Nút SSO Microsoft (compact) | `onSSOLogin('azure')` | I | Button (social icon) | Image `/microsoft.png` | 6.5x6.5 | AL025 | Đăng nhập Azure OAuth2 |
| 17 | Nút SSO Facebook (compact) | `onSSOLogin('facebook')` | I | Button (social icon) | Image `/facebook.png` | 6.5x6.5 | AL026 | Đăng nhập Facebook (mock) |

## 3. Tab Đăng nhập Nội bộ (`InternalLoginTab.tsx`)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Text "Sử dụng tài khoản email trường để đăng nhập" | - | O | Text (p) | Static string | - | AL027 | Hướng dẫn đăng nhập |
| 2 | Dấu "*" (đỏ nhấp nháy) | `setHelpModalOpen(true)` | I | Button (link) | Red `*` char | - | AL028 | Mở dialog hướng dẫn |
| 3 | Nút SSO Google (large) | `onSSOLogin('google')` | I | Button (social, large) | Image `/google.png` 24x24 | p-4, rounded-xl | AL029 | **Disabled** khi `isLoading` |
| 4 | Nút SSO Microsoft (large) | `onSSOLogin('azure')` | I | Button (social, large) | Image `/microsoft.png` 24x24 | p-4, rounded-xl | AL030 | **Disabled** khi `isLoading` |

## 4. Dialog Đăng ký Khách (`GuestRegistrationDialog.tsx`)

### 4.1 Cấu trúc Dialog chung

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Nút Back (ArrowLeft) (step 2-3) | `onBackStep` | I | Icon button | `<ArrowLeft size={16} />` | 16px | AR001 | Quay lại bước trước |
| 2 | Icon UserPlus (18px, blue) | `UserPlus` (lucide) | O | Icon (SVG) | 18px | 18px | AR002 | Tiền tố tiêu đề |
| 3 | Tiêu đề động (theo bước) | `guestStep` | O | Text | String | - | AR003 | form="Đăng ký tài khoản", otp="Xác thực OTP", newpass="Tạo mật khẩu", success="Đăng ký thành công" |
| 4 | Mô tả động (theo bước) | `guestStep` | O | Text | String | - | AR004 | Thay đổi theo từng bước |

### 4.2 Bước 1: Form Đăng ký

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Label "Phương thức xác thực" | - | O | Text | Static string | - | AR005 | Header chọn phương thức |
| 2 | Nút "Email" (icon /mail.png) | `onSetGuestAuthMethod('email')` | I | Toggle button | border highlight on select | - | AR006 | Chọn xác thực bằng email |
| 3 | Nút "Zalo" (icon /zalo.png) | `onSetGuestAuthMethod('phone')` | I | Toggle button | border highlight on select | - | AR007 | Chọn xác thực bằng Zalo |
| 4 | Label "Email *" | htmlFor=`guest-email` | O | Label | Static (red asterisk) | - | AR008 | Bắt buộc khi chọn email |
| 5 | Input Email | `guest-email` | I | Input (email) | `guestForm.email` string | - | AR009 | **Bắt buộc** khi chọn email |
| 6 | Icon Mail (16px, gray) | trong input email | O | Icon (SVG) | 16px | 16px | AR010 | Tiền tố trái |
| 7 | Placeholder "email@example.com" | placeholder | O | Placeholder | String | - | AR011 | Gợi ý định dạng email |
| 8 | Label "Số điện thoại (Zalo) *" | htmlFor=`guest-phone` | O | Label | Static (red asterisk) | - | AR012 | Bắt buộc khi chọn phone |
| 9 | Input Số điện thoại | `guest-phone` | I | Input (tel) | `guestForm.phone` string | - | AR013 | **Bắt buộc** khi chọn phone |
| 10 | Icon Phone (16px, gray) | trong input phone | O | Icon (SVG) | 16px | 16px | AR014 | Tiền tố trái |
| 11 | Placeholder "0901234567" | placeholder | O | Placeholder | String | - | AR015 | Gợi ý số điện thoại |
| 12 | Helper "Mã OTP sẽ được gửi qua Zalo" | - | O | Text (p) | Static, text-xs | - | AR016 | Giải thích phương thức gửi |
| 13 | Label "Mật khẩu *" | htmlFor=`guest-password` | O | Label | Static (red asterisk) | - | AR017 | Mô tả trường mật khẩu |
| 14 | Input Mật khẩu | `guest-password` | I | Input (password/text toggle) | `guestForm.password` | Tối thiểu 8 ký tự | AR018 | **Bắt buộc**, tối thiểu 8 ký tự |
| 15 | Icon Lock (16px, gray) | trong input password | O | Icon (SVG) | 16px | 16px | AR019 | Tiền tố trái |
| 16 | Nút Eye/EyeOff | `onSetShowGuestPassword` | I | Icon button | SVG 16px | 16px | AR020 | Toggle hiển thị password |
| 17 | Placeholder "Tối thiểu 8 ký tự" | placeholder | O | Placeholder | String | - | AR021 | Gợi ý độ dài tối thiểu |
| 18 | Label "Xác nhận mật khẩu *" | htmlFor=`guest-confirm-password` | O | Label | Static (red asterisk) | - | AR022 | Mô tả trường xác nhận |
| 19 | Input Xác nhận mật khẩu | `guest-confirm-password` | I | Input (password/text toggle) | `guestForm.confirmPassword` | - | AR023 | Phải trùng với mật khẩu |
| 20 | Placeholder "Nhập lại mật khẩu" | placeholder | O | Placeholder | String | - | AR024 | Gợi ý nhập lại |
| 21 | Error box (đỏ) + AlertCircle | `otpError` | O | Error alert | Vietnamese string | - | AR025 | Hiển thị lỗi validation / API |
| 22 | Nút "Hủy" | `onOpenChange(false)` | I | Button (outline) | - | - | AR026 | Đóng dialog, hủy thao tác |
| 23 | Nút "Gửi mã OTP" + ChevronRight | `onSendOtp` | I | Button (primary, blue) | - | - | AR027 | **Disabled** khi `!password \|\| !confirmPassword \|\| (!email && !phone) \|\| isSendingOtp \|\| registerLoading` |
| 24 | Spinner + "Đang gửi OTP..." | (loading state) | O | Loading indicator | - | - | AR028 | Thay thế text nút khi đang gửi |

### 4.3 Bước 2: Xác thực OTP

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Icon circle (Mail / MessageCircle) | - | O | Icon (SVG) | 28px | 28px | AR029 | Biểu tượng phương thức gửi |
| 2 | Text "Mã OTP 6 số đã được gửi đến" | - | O | Text | Static string | - | AR030 | Thông báo trạng thái |
| 3 | Thông tin liên hệ (email/phone) | `guestForm.email` / `guestForm.phone` | O | Display text | String | - | AR031 | Hiển thị nơi OTP được gửi |
| 4 | 6 ô nhập mã OTP | `otp-0` đến `otp-5` | I | Input (text, numeric) | `otpCode` string[6] | maxLength=1 | AR032 | Mỗi ô 1 số; auto-advance; backspace về ô trước |
| 5 | Error box (đỏ) + AlertCircle | `otpError` | O | Error alert | Vietnamese string | - | AR033 | Lỗi xác thực OTP |
| 6 | Nút "Xác nhận OTP" | `onVerifyOtp` | I | Button (primary, full-width) | - | h-11, w-full | AR034 | **Disabled** khi có ô OTP trống hoặc đang verify |
| 7 | Spinner + "Đang xác thực..." | (loading state) | O | Loading indicator | - | - | AR035 | Thay thế text nút khi đang xác thực |
| 8 | Link "Gửi lại mã OTP" / "Gửi lại sau Xs" | `onResendOtp` | I | Button (link) | Text, blue, underline | - | AR036 | **Disabled** khi `isSendingOtp \|\| resendLoading \|\| resendCooldown > 0`; countdown 60s |

### 4.4 Bước 3: Tạo Mật khẩu

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Error box (đỏ) + AlertCircle | `otpError` | O | Error alert | string | - | AR037 | Lỗi validation / API |
| 2 | Label "Mật khẩu" | - | O | Label | Static | - | AR038 | Mô tả trường |
| 3 | Input Mật khẩu mới | `guestNewPassword` | I | Input (password/text) | string | Tối thiểu 8 ký tự | AR039 | Phải có A-Z, a-z, 0-9, ký tự đặc biệt |
| 4 | Placeholder "Nhập mật khẩu" | placeholder | O | Placeholder | String | - | AR040 | Gợi ý nhập liệu |
| 5 | Label "Xác nhận mật khẩu" | - | O | Label | Static | - | AR041 | Mô tả trường |
| 6 | Input Xác nhận mật khẩu | `guestConfirmPassword` | I | Input (password/text) | string | - | AR042 | Phải trùng `guestNewPassword` |
| 7 | Placeholder "Nhập lại mật khẩu" | placeholder | O | Placeholder | String | - | AR043 | Gợi ý nhập lại |
| 8 | Error inline "Mật khẩu không khớp" + AlertCircle | (computed) | O | Error text | Red, text-xs | - | AR044 | Chỉ hiện khi confirmPassword != newPassword |
| 9 | Checklist: "Tối thiểu 8 ký tự" | - | O | Indicator text | CheckCircle (green) / empty circle | - | AR045 | ✅ nếu length >= 8 |
| 10 | Checklist: "Chữ hoa (A-Z)" | - | O | Indicator text | CheckCircle (green) / empty circle | - | AR046 | ✅ nếu có A-Z |
| 11 | Checklist: "Chữ thường (a-z)" | - | O | Indicator text | CheckCircle (green) / empty circle | - | AR047 | ✅ nếu có a-z |
| 12 | Checklist: "Số (0-9)" | - | O | Indicator text | CheckCircle (green) / empty circle | - | AR048 | ✅ nếu có 0-9 |
| 13 | Checklist: "Ký tự đặc biệt (!@#$...)" | - | O | Indicator text | CheckCircle (green) / empty circle | - | AR049 | ✅ nếu có ký tự đặc biệt |
| 14 | Nút "Hoàn tất đăng ký" / "Đang xử lý..." | `onSetGuestPassword` | I | Button (primary, full-width) | - | - | AR050 | **Disabled** khi validation fail hoặc đang xử lý |

### 4.5 Bước 4: Thành công

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Circle xanh + CheckCircle (32px) | - | O | Icon (SVG) | green-600 | 32px | AR051 | Biểu tượng thành công |
| 2 | "Đăng ký thành công!" | - | O | Heading (h3) | text-lg font-semibold | - | AR052 | Tiêu đề thành công |
| 3 | "Tài khoản WiFi tạm thời đã sẵn sàng" | - | O | Text (p) | text-sm text-gray-500 | - | AR053 | Mô tả |
| 4 | Box xám + "Tên đăng nhập" + giá trị | - | O | Display | bg-gray-50, rounded-xl, p-4 | - | AR054 | Hiển thị email/phone đã đăng ký |
| 5 | Helper "(Sử dụng email/số điện thoại để đăng nhập)" | - | O | Helper text | text-xs text-gray-400 | - | AR055 | Hướng dẫn đăng nhập |
| 6 | Nút "Đăng nhập ngay" | `onUseGuestCredentials` | I | Button (primary, full-width) | - | - | AR056 | Đóng dialog + tự động đăng nhập |

## 5. Dialog Quên Mật khẩu (`ForgotPasswordDialog.tsx`)

### 5.1 Bước 1: Form Quên Mật khẩu

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Icon Lock (18px, blue) | `Lock` (lucide) | O | Icon (SVG) | 18px | 18px | AF001 | Tiền tố tiêu đề |
| 2 | Nút Back (ArrowLeft) (step 2-3) | `onBackStep` | I | Icon button | `<ArrowLeft size={16} />` | 16px | AF002 | Quay lại bước trước |
| 3 | Tiêu đề "Quên mật khẩu" | `step === 'form'` | O | Text | String | - | AF003 | Tiêu đề dialog |
| 4 | Mô tả "Nhập email hoặc số điện thoại..." | `step === 'form'` | O | Text | String | - | AF004 | Hướng dẫn nhập liệu |
| 5 | Label "Phương thức xác thực" | - | O | Text | Static | - | AF005 | Header chọn phương thức |
| 6 | Nút "Email" (icon Mail 18px) | `onSetMethod('email')` | I | Toggle button | border highlight on select | - | AF006 | Chọn phương thức email |
| 7 | Nút "Zalo" (icon MessageCircle 18px) | `onSetMethod('phone')` | I | Toggle button | border highlight on select | - | AF007 | Chọn phương thức Zalo |
| 8 | Label "Email *" / "Số điện thoại *" | - | O | Label | Static (red asterisk) | - | AF008 | Dynamic theo phương thức |
| 9 | Input liên hệ (email/phone) | `contact` | I | Input (email or tel) | `forgotContact` string | - | AF009 | **Bắt buộc**; disabled nút gửi nếu trống |
| 10 | Icon Mail / Phone (16px, gray) | (conditional) | O | Icon (SVG) | 16px | 16px | AF010 | Icon theo phương thức |
| 11 | Placeholder "email@example.com" / "0901234567" | placeholder | O | Placeholder | String | - | AF011 | Dynamic theo phương thức |
| 12 | Nút "Hủy" | `onOpenChange(false)` | I | Button (outline) | - | - | AF012 | Đóng dialog |
| 13 | Nút "Gửi mã OTP" + ChevronRight | `onSendOtp` | I | Button (primary, blue) | - | - | AF013 | **Disabled** khi `!contact \|\| isSendingOtp` |
| 14 | Spinner + "Đang gửi..." | (loading) | O | Loading indicator | - | - | AF014 | Khi `isSendingOtp` |

### 5.2 Bước 2: Xác thực OTP (Quên MK)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Icon circle (Mail / MessageCircle) | - | O | Icon (SVG) | 28px | 28px | AF015 | Biểu tượng phương thức |
| 2 | "Mã OTP 6 số đã được gửi đến" | - | O | Text | Static | - | AF016 | Thông báo |
| 3 | Thông tin liên hệ | `contact` | O | Display text | String | - | AF017 | Nơi OTP được gửi |
| 4 | 6 ô nhập mã OTP | `forgot-otp-0` đến `forgot-otp-5` | I | Input (text, numeric) | `forgotOtp` string[6] | maxLength=1 | AF018 | Mỗi ô 1 số; auto-advance; backspace |
| 5 | Error box (đỏ) + AlertCircle | `forgotOtpError` | O | Error alert | string | - | AF019 | Lỗi xác thực |
| 6 | Nút "Tiếp tục" | `onVerifyOtp` | I | Button (primary, full-width) | - | h-11 | AF020 | **Disabled** khi OTP trống hoặc đang verify |
| 7 | Spinner + "Đang xác thực..." | (loading) | O | Loading indicator | - | - | AF021 | Khi `isVerifyingOtp` |
| 8 | Link "Gửi lại mã OTP" / "Gửi lại sau Xs" | `onResendOtp` | I | Button (link) | Text, blue | - | AF022 | Countdown 120s |

### 5.3 Bước 3: Đặt Mật khẩu Mới

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Error box (đỏ) + AlertCircle | `forgotOtpError` | O | Error alert | string | - | AF023 | Lỗi validation / API |
| 2 | Label "Mật khẩu mới" | - | O | Label | Static | - | AF024 | Mô tả trường |
| 3 | Input Mật khẩu mới | `newPassword` | I | Input (password/text) | string | Tối thiểu 8 ký tự | AF025 | Phải có A-Z, a-z, 0-9, ký tự đặc biệt |
| 4 | Placeholder "Nhập mật khẩu mới" | placeholder | O | Placeholder | String | - | AF026 | Gợi ý nhập liệu |
| 5 | Label "Xác nhận mật khẩu mới" | - | O | Label | Static | - | AF027 | Mô tả trường |
| 6 | Input Xác nhận mật khẩu mới | `confirmNewPassword` | I | Input (password/text) | string | - | AF028 | Phải trùng `newPassword` |
| 7 | Placeholder "Nhập lại mật khẩu mới" | placeholder | O | Placeholder | String | - | AF029 | Gợi ý nhập lại |
| 8 | Error inline "Mật khẩu không khớp" + AlertCircle | (computed) | O | Error text | Red, text-xs | - | AF030 | Chỉ hiện khi không khớp |
| 9 | Checklist password (5 items) | - | O | Indicator | CheckCircle / empty circle | - | AF031 | Giống Guest Reg. Bước 3 |
| 10 | Nút "Đặt mật khẩu mới" / "Đang xử lý..." | `onResetPassword` | I | Button (primary, full-width) | - | h-11 | AF032 | **Disabled** khi validation fail hoặc đang xử lý |

### 5.4 Bước 4: Thành công (Quên MK)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Circle xanh + CheckCircle (32px) | - | O | Icon (SVG) | green-600 | 32px | AF033 | Biểu tượng thành công |
| 2 | "Đặt lại mật khẩu thành công!" | - | O | Heading (h3) | text-lg font-semibold | - | AF034 | Tiêu đề thành công |
| 3 | "Bạn có thể đăng nhập với mật khẩu mới" | - | O | Text | text-sm text-gray-500 | - | AF035 | Mô tả |
| 4 | Box xám + "Tên đăng nhập" + giá trị | - | O | Display | bg-gray-50, rounded-xl, p-4 | - | AF036 | Hiển thị email/phone đã reset |
| 5 | Nút "Đăng nhập ngay" | `onUseForgotCredentials` | I | Button (primary, full-width) | - | - | AF037 | Đóng dialog, chuyển về đăng nhập |

## 6. Dialog Điều khoản (`TermsDialog.tsx`)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Icon FileText (18px, blue) | `FileText` (lucide) | O | Icon (SVG) | 18px | 18px | AT001 | Tiền tố tiêu đề |
| 2 | "Điều khoản sử dụng WiFi" | - | O | DialogTitle | Bold, gap-2 flex | - | AT002 | Tiêu đề dialog |
| 3 | "Campus WiFi - Trường ĐHKHTN" | - | O | DialogDescription | Gray text | - | AT003 | Mô tả dialog |
| 4 | Mục 1: Quy định chung (3 bullet) | - | O | `<ul>` list | Bullet points | - | AT004 | WiFi miễn phí, không chia sẻ, 1 tk/người |
| 5 | Mục 2: Giới hạn sử dụng | - | O | `<div>` với flex-between | Thời lượng, băng thông, hạn ngạch | - | AT005 | Box xanh với thông số |
| 6 | Mục 3: Hành vi bị cấm (4 bullet) | - | O | `<ul>` list | Bullet points | - | AT006 | Nội dung bất hợp pháp, tấn công, P2P, spam |
| 7 | Mục 4: Xử lý vi phạm (3 bước) | - | O | `<div>` numbered circles | Box đỏ | - | AT007 | Cảnh cáo -> Khóa 24h -> Khóa vĩnh viễn |
| 8 | Nút "Đồng ý và tiếp tục" | `onAccept` | I | Button (primary, blue) | - | - | AT008 | Đóng dialog + set `agreeTerms = true` |

## 7. Dialog Captive Portal Info (`CaptiveInfoPopup.tsx`)

| STT | Item Name | Field Name | I/O | Type | Data Format | Size | Function ID | Notes |
|-----|-----------|------------|-----|------|-------------|------|-------------|-------|
| 1 | Overlay nền đen 40% | `fixed inset-0 z-50` | O | Overlay | bg-black/40 | full screen | AC001 | Lớp phủ dialog |
| 2 | Header gradient xanh | - | O | Display | bg-gradient-to-r from-blue-500 to-blue-600 | - | AC002 | Thanh màu trên cùng |
| 3 | Icon Wifi (20px, trắng) | `Wifi` (lucide) | O | Icon (SVG) | 20px | 20px | AC003 | Header trái |
| 4 | "Captive Portal Info" | - | O | Title (h2) | text-lg font-semibold | - | AC004 | Tiêu đề |
| 5 | Nút Close (X, 20px, trắng) | `onClose` | I | Icon button | SVG 20px | 20px | AC005 | Đóng popup |
| 6 | Row: Device ID + icon Hash | `id` | O | Display | text-sm font-mono | - | AC006 | Hiển thị device identifier |
| 7 | Row: AP MAC + icon Wifi | `ap` | O | Display | text-sm font-mono | - | AC007 | Hiển thị AP MAC |
| 8 | Row: SSID + icon Globe | `ssid` | O | Display | text-sm font-mono | - | AC008 | Hiển thị tên SSID |
| 9 | Row: Redirect URL + icon Monitor | `url` | O | Display | text-sm font-mono | - | AC009 | Hiển thị redirect URL |
| 10 | Row: Timestamp + icon Clock | `t` | O | Display | text-sm font-mono | - | AC010 | Hiển thị timestamp |
| 11 | Footer "These parameters used to authorize device..." | - | O | Text | bg-gray-50, text-xs | - | AC011 | Ghi chú cuối trang |

## 8. Danh sách Function ID

| Function ID | Mô tả |
|-------------|-------|
| AL001-AL030 | Màn hình Đăng nhập (Auth Login) |
| AR001-AR056 | Dialog Đăng ký (Auth Register) |
| AF001-AF037 | Dialog Quên mật khẩu (Auth Forgot) |
| AT001-AT008 | Dialog Điều khoản (Auth Terms) |
| AC001-AC011 | Popup Captive Portal (Auth Captive) |




https://YOUR_CONSOLE_IP/proxy/network/integration/v1/sites/{siteId}/networks/{networkId}