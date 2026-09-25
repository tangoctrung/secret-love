import type { AsteroidSpec, CelestialInfo, Planet } from "./types";

export const PLANET_MOTION_SPEED = 0.5;

export const sunInfo: CelestialInfo = {
  name: "Mặt Trời",
  subtitle: "Ngôi sao trung tâm",
  description:
    "Nguồn năng lượng của cả hệ, một quả cầu plasma khổng lồ đang liên tục phát sáng và tỏa nhiệt.",
  accent: "#ffb347",
  facts: [
    "Chiếm khoảng 99,86% khối lượng Hệ Mặt Trời",
    "Ánh sáng mất khoảng 8 phút 20 giây để tới Trái Đất",
  ],
};

export const planets: Planet[] = [
  { name: "Sao Thủy", subtitle: "Hành tinh nhanh nhất", description: "Nhỏ, gần Mặt Trời nhất và hoàn thành một vòng quỹ đạo cực nhanh.", radius: 0.2, distance: 2.2, orbitSpeed: 0.62, selfSpeed: 1.8, color: "#9b8b77", accent: "#e1c5a5", detailColor: "#51483f", atmosphere: "#d7c5ad", surface: 0, inclination: 0.02, facts: ["Quỹ đạo: 88 ngày Trái Đất", "Bề mặt đầy hố va chạm"] },
  { name: "Sao Kim", subtitle: "Viên ngọc nóng rực", description: "Một thế giới phủ mây dày với khí quyển giữ nhiệt rất mạnh.", radius: 0.5, distance: 3.1, orbitSpeed: 0.5, selfSpeed: 1.2, color: "#d7a55f", accent: "#ffe0a3", detailColor: "#8c552b", atmosphere: "#ffc56e", surface: 1, inclination: 0.06, facts: ["Nóng hơn cả Sao Thủy", "Tự quay ngược chiều đa số hành tinh"] },
  { name: "Trái Đất", subtitle: "Chấm xanh thân quen", description: "Nơi có đại dương, khí quyển cân bằng và sự sống mà ta biết.", radius: 0.53, distance: 4.05, orbitSpeed: 0.42, selfSpeed: 1.6, color: "#2f7dd8", accent: "#7ee7b7", detailColor: "#174b2c", atmosphere: "#69cfff", surface: 2, inclination: 0, facts: ["Có một vệ tinh tự nhiên", "Khoảng 71% bề mặt là nước"] },
  { name: "Sao Hỏa", subtitle: "Hành tinh đỏ", description: "Sa mạc lạnh với bụi oxit sắt, núi lửa lớn và dấu vết nước cổ xưa.", radius: 0.28, distance: 5, orbitSpeed: 0.34, selfSpeed: 1.45, color: "#c75037", accent: "#ff9a78", detailColor: "#6e251d", atmosphere: "#e76d48", surface: 3, inclination: 0.045, facts: ["Có Olympus Mons khổng lồ", "Hai vệ tinh: Phobos và Deimos"] },
  { name: "Sao Mộc", subtitle: "Người khổng lồ khí", description: "Hành tinh lớn nhất hệ, nổi bật với các dải mây và Vết Đỏ Lớn.", radius: 0.95, distance: 6.55, orbitSpeed: 0.22, selfSpeed: 2.15, color: "#d9a066", accent: "#f6d2a4", detailColor: "#8f492f", atmosphere: "#f3bd7a", surface: 4, inclination: 0.025, facts: ["Lớn nhất Hệ Mặt Trời", "Có hàng chục vệ tinh đã biết"] },
  { name: "Sao Thổ", subtitle: "Vành đai lộng lẫy", description: "Một hành tinh khí nhẹ với hệ vành đai băng đá dễ nhận ra nhất.", radius: 0.84, distance: 8.25, orbitSpeed: 0.18, selfSpeed: 1.95, color: "#d6bf83", accent: "#fff0b8", detailColor: "#8d714c", atmosphere: "#ffe0a0", surface: 5, inclination: 0.055, facts: ["Vành đai chủ yếu là băng", "Mật độ trung bình thấp hơn nước"] },
  { name: "Sao Thiên Vương", subtitle: "Gã nghiêng mình", description: "Hành tinh băng khổng lồ quay gần như nằm ngang so với quỹ đạo.", radius: 0.43, distance: 9.8, orbitSpeed: 0.13, selfSpeed: 1.55, color: "#72d2db", accent: "#bcfbff", detailColor: "#397e8c", atmosphere: "#78f2ff", surface: 6, inclination: 0.13, facts: ["Trục quay nghiêng khoảng 98 độ", "Có sắc xanh từ methane"] },
  { name: "Sao Hải Vương", subtitle: "Cơn gió xanh thẳm", description: "Thế giới băng xa xôi, lạnh giá, nổi tiếng với những luồng gió dữ dội.", radius: 0.4, distance: 11.1, orbitSpeed: 0.1, selfSpeed: 1.7, color: "#375bd8", accent: "#8fb2ff", detailColor: "#172c83", atmosphere: "#4f83ff", surface: 7, inclination: 0.08, facts: ["Xa Mặt Trời nhất trong 8 hành tinh chính", "Gió có thể rất mạnh"] },
  { name: "Diêm Vương", subtitle: "Kẻ du hành tí hon", description: "Một hành tinh lùn ở rìa ngoài, có quỹ đạo lệch và bề mặt băng giá.", radius: 0.28, distance: 12.35, orbitSpeed: 0.075, selfSpeed: 1.05, color: "#b99c82", accent: "#f1d7bf", detailColor: "#655347", atmosphere: "#d9c2ad", surface: 8, inclination: 0.28, facts: ["Được xếp là hành tinh lùn", "Có vệ tinh lớn Charon"] },
];

export const asteroids: AsteroidSpec[] = [
  { name: "Astra-1", start: [-18, 6, 5], end: [18, -2, -8], size: 0.24, duration: 34, offset: 0, seed: 1.3, color: "#70665d" },
  { name: "Astra-2", start: [16, 9, -10], end: [-17, 1, 4], size: 0.16, duration: 41, offset: 12, seed: 2.8, color: "#918376" },
  { name: "Astra-3", start: [-13, -5, -3], end: [15, 4, -12], size: 0.3, duration: 38, offset: 23, seed: 4.1, color: "#5f5955" },
  { name: "Astra-4", start: [11, -8, 2], end: [-15, 6, -16], size: 0.2, duration: 46, offset: 31, seed: 5.7, color: "#817267" },
  { name: "Astra-5", start: [-17, 11, -18], end: [17, -4, 0], size: 0.13, duration: 36, offset: 8, seed: 7.2, color: "#9a8b7d" },
];
