/* ============================================================
   js/widescreen.js — V31: ADAPTIVE WIDESCREEN (ADD-ONLY)
   Nạp CUỐI cùng (sau critters.js) để wrapper của nó đứng ngoài
   toàn bộ chuỗi render() của các lớp trước.

   VẤN ĐỀ: #app là khung DOM 960×600 được fitApp() scale ĐỒNG NHẤT,
   nên mọi màn 16:9 đều thừa hai dải nền trời xanh ở trái/phải.

   CÁCH LÀM (giữ nguyên hệ tọa độ 960×600 — không đụng hitbox nào):
     1) VIRTUAL_W = 600 × tỉ lệ cửa sổ (chặn trong [960, 2000]) rồi gán
        thẳng vào backing store: cv.width = VIRTUAL_W, cv.height = 600.
     2) #app rộng đúng VIRTUAL_W px → HUD trái (#player-card, #quest-panel)
        và phải (#dock-tr, #minimap-box, #area-panel) tự bám sát mép màn
        hình vì CSS của chúng đã neo left/right theo #app; modal đã
        left:50% + translate(-50%) nên tự căn giữa trên VIRTUAL_W/2.
     3) Trước mỗi frame: ctx.setTransform(kx, 0, 0, 1, 0, 0) với
        kx = VIRTUAL_W / 960. Toàn bộ lệnh vẽ đang viết trong không gian
        960 (fillRect(0,0,960,600), drawImage(bg,0,0,960,600)…) tự phủ khít
        VIRTUAL_W×600 mà không phải sửa một hằng số nào.
        Đây KHÔNG phải "kéo béo": ảnh nền AI gốc là 1024×572 (≈1.79:1) còn
        khung cũ 960×600 là 1.6:1 — tức từ trước tới nay ảnh bị ÉP ngang
        10.6%. Ở 16:9, kx = 1.111 trả ảnh về đúng tỉ lệ tác giả vẽ.

   TRÀN 100%: VIRTUAL_W đi theo đúng tỉ lệ cửa sổ (sàn 960, trần 2000) và
   fitApp() scale hai trục ĐỘC LẬP (sx, sy) — không dùng Math.min nữa nên
   không bao giờ sót vệt đen bên hông. Ở 16:9/16:10 sx ≈ sy nên hình không
   béo; tỉ lệ cực đoan mới phải giãn, thà giãn còn hơn đen.

   POINTER: mọi phép đổi chuột→canvas đều đổi TỪNG TRỤC theo
   (clientX - rect.left) × LOGIC_W / rect.width và (clientY - rect.top) × 600 /
   rect.height. Vẽ bằng transform (cảnh tĩnh) thì LOGIC_W vẫn là 960; vẽ thật
   theo VIRTUAL_W (STREET, INPEACE) thì LOGIC_W = VIRTUAL_W. Chỉ cần gọi
   vsLogicalW() là click bắt thỏ, nhặt đồ rơi và phím [E] vẫn đúng từng pixel
   kể cả khi sx ≠ sy.
   ============================================================ */

const VS_H = 600;        // chiều cao logic CỐ ĐỊNH: dải đi bộ, hitbox, modal đều theo 600
const VS_MIN_W = 960;    // sàn khung nhìn — .mg-modal rộng 900px, HUD cần đủ chỗ
const VS_MAX_W = 2000;   // trần khung nhìn (đến tỉ lệ 3,33:1); dư nữa thì CSS giăng tiếp
let vsBackW = VS_MIN_W;  // VIRTUAL_W đang gắn thật trên #cv

/* Bề rộng KHÔNG GIAN LOGIC của cảnh đang vẽ, tính bằng pixel backing.
   - Mọi cảnh nền tĩnh (WORLD, HEAVEN, các khu vẽ 960): trả 960 → vsKx() =
     VIRTUAL_W/960, hình vẫn GIÃN BẰNG TRANSFORM, không số nào đổi chỗ.
   - Hai cảnh CUỘN NGANG thật (STREET 2880px, INPEACE 2400px): nền dài hơn
     khung nhìn nên mở khung tới VIRTUAL_W là thấy THÊM cảnh thật, không béo
     hình → vsKx() = 1. Camera, mép phải và mặt trời/mây đã theo hàm này.
   S được kiểm tra typeof vì widescreen.js chạy ngay lúc parse. */
function vsLogicalW() {
  const sc = (typeof S !== 'undefined' && S && S.scene) || '';
  return sc === 'STREET' || sc === 'INPEACE' ? vsBackW : VS_MIN_W;
}
function vsKx() { return vsBackW / vsLogicalW(); }

function vsVp() {
  if (typeof fitVp === 'function') return fitVp();
  const w = Math.max(1, window.innerWidth), h = Math.max(1, window.innerHeight);
  return { w: w, h: h, portrait: h > w };
}

function vsLayout() {
  const v = vsVp();
  const w = v.w, h = v.h;
  /* 600 × tỉ lệ thật, làm tròn LÊN để không sót dải 1px ở mép phải. */
  const target = Math.min(VS_MAX_W, Math.max(VS_MIN_W, Math.ceil(VS_H * w / h)));
  const app = document.getElementById('app');
  if (target !== vsBackW) {
    vsBackW = target;
    /* Gán width CHO XÓA toàn bộ state của ctx (transform, font, smoothing)
       → render() dựng lại từ đầu mỗi frame nên không sao, nhưng chỉ gán
       khi thực sự đổi để khỏi trắng màn hình giữa chừng. */
    cv.width = vsBackW; cv.height = VS_H;
    /* Khu 5 vẽ thật theo bề ngang khung nhìn (cache 2400px + vignette),
       phải báo nó dựng lại và kẹp lại _camX. Guard typeof: lúc parse thì
       inpeace.js đã nạp xong, nhưng chèn script sai thứ tự không được sập. */
    if (typeof ipSetView === 'function') ipSetView(vsBackW);
  }
  /* V33: rộng khung DOM ghi lại MỖI LẦN layout, không chỉ khi đổi.
       Hệ số co giãn tính bằng v.w / vsBackW, nên chỉ cần #app còn mang
       bề rộng 960px của CSS trong khi vsBackW đã là 1236px là ra ngay
       triệu chứng người chơi báo: 960 × 0.484 = 465px, hai bên lề đen
       ~360px. Gán vô điều kiện = bất biến "bề rộng khung == số chia"
       luôn đúng, không phụ thuộc thứ tự sự kiện resize nữa. */
  if (app) app.style.width = vsBackW + 'px';
  fitApp();
}

/* fitApp() cũ vẫn chạy (nó đặt --shop-h cho modal + class portrait-mode);
   wrapper ghi lại hai trục ĐỘC LẬP cho màn ngang — không dùng Math.min nữa
   nên không bao giờ sót vệt đen bên hông.
   V32: hệ số không còn viết vào chuỗi transform mà vào hai biến CSS
   --scale-x / --scale-y; công thức căn tâm translate(-50%,-50%) nằm ở
   css/mobile.css (và chính #app đã là position:fixed, nên left/top 50%
   tính theo khung nhìn THẬT, không theo thân trang). */
const _vsFit = fitApp;
function vsScale() {
  const v = vsVp();
  return { sx: v.w / vsBackW, sy: v.h / VS_H };
}
fitApp = function () {
  _vsFit();
  if (vsVp().portrait) return;   // màn dọc: khung nhỏ + phím dưới, giữ nguyên
  const app = document.getElementById('app'); if (!app) return;
  const k = vsScale();
  app.style.left = '50%';
  app.style.top = '50%';
  app.style.setProperty('--scale-x', k.sx);
  app.style.setProperty('--scale-y', k.sy);
};

/* Giãn toàn cảnh ngay trước khi mọi lớp khác vẽ. */
const _vsRender = render;
render = function () {
  try {
    const kx = vsKx();
    ctx.setTransform(kx, 0, 0, 1, 0, 0);
  } catch (e) {}
  _vsRender();
};

window.addEventListener('resize', vsLayout);
window.addEventListener('orientationchange', () => setTimeout(vsLayout, 220));
document.addEventListener('fullscreenchange', () => setTimeout(vsLayout, 80));
/* V32: thanh URL mobile đóng/mở chỉ đổi visualViewport → phải dựng lại
   khung nhìn theo số đo thật, nếu không VIRTUAL_W tính theo chiều cao
   "ẩn" và để lại hai dải đen đúng bằng phần thanh URL. */
if (window.visualViewport && window.visualViewport.addEventListener)
  window.visualViewport.addEventListener('resize', vsLayout);
vsLayout();

/* Mỏ neo cho các lớp sau + cho test: bề rộng backing, logic và hệ số giãn. */
window.VS = {
  backW: () => vsBackW,
  logicalW: vsLogicalW,
  kx: vsKx,
  scale: vsScale,
  vp: vsVp,
  layout: vsLayout,
  maxW: VS_MAX_W, minW: VS_MIN_W, h: VS_H
};
