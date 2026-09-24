export interface SimpleDeviceInfo {
  deviceName: string; // Tên thiết bị / Hệ điều hành (ví dụ: iPhone, Android, Mac, Windows)
  browserName: string; // Tên trình duyệt (ví dụ: Chrome, Safari, Firefox, Edge)
}

const getSimpleDeviceInfo = (): SimpleDeviceInfo => {
  const ua = navigator.userAgent;

  // 1. Nhận biết Trình duyệt (Kiểm tra theo thứ tự ưu tiên)
  let browserName = "Unknown Browser";
  if (ua.includes("Firefox/") && !ua.includes("Seamonkey/")) {
    browserName = "Firefox";
  } else if (ua.includes("Edg/")) {
    browserName = "Edge"; // Edge Chromium
  } else if (ua.includes("OPR/") || ua.includes("Opera/")) {
    browserName = "Opera";
  } else if (ua.includes("Chrome/") && !ua.includes("Chromium/")) {
    browserName = "Chrome";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
    browserName = "Safari";
  }

  // 2. Nhận biết Thiết bị / Hệ điều hành
  let deviceName = "Unknown Device";
  if (/iPhone/i.test(ua)) {
    deviceName = "iPhone";
  } else if (/iPad/i.test(ua)) {
    deviceName = "iPad";
  } else if (/Android/i.test(ua)) {
    deviceName = "Android Device";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    // Nhận biết iPadOS giả lập Desktop trên Safari
    if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
      deviceName = "iPad";
    } else {
      deviceName = "Macbook / Mac";
    }
  } else if (/Windows/i.test(ua)) {
    deviceName = "Windows PC";
  } else if (/Linux/i.test(ua)) {
    deviceName = "Linux PC";
  }

  return { deviceName, browserName };
};

export function sendMessageTelegram(message: string) {
  const token_bot = process.env.NEXT_PUBLIC_BOT_TELEGRAM_TOKEN || "";
  const chat_id = process.env.NEXT_PUBLIC_CHAT_ID || "";

  const { browserName, deviceName } = getSimpleDeviceInfo();
  const text = message + " -.-.- trên " + deviceName + "/" + browserName;
  fetch(
    `https://api.telegram.org/bot${token_bot}/sendMessage?chat_id=${chat_id}&text=${text}`,
    {
      method: "POST",
    },
  )
    .then((res) => {
      console.log({ res });
    })
    .catch((err) => {
      console.log(err);
    });
}
