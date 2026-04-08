/**
 * Format ngày tháng theo chuẩn Việt Nam (DD/MM/YYYY)
 */
export const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput); // Trả lại chuỗi gốc nếu không parse được
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  } catch (e) {
    return String(dateInput);
  }
};

/**
 * Format ngày giờ theo chuẩn Việt Nam (HH:mm:ss DD/MM/YYYY)
 */
export const formatDateTime = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    // vi-VN format thường là "HH:mm:ss, DD/MM/YYYY", ta có thể bỏ dấu phẩy đi nếu muốn
    return formatter.format(date).replace(',', '');
  } catch (e) {
    return String(dateInput);
  }
};
