const MISSIONS = [
  { id: 'nat', icon: '🌐', name: '#001 - NAT Overload VP Kế Toán', giver: 'Chị Lan', loc: 'VP Kế Toán', reward: '+300 XP, +2,000 Coin', skill: 'networking',
    desc: 'Máy chị Lan ping gateway OK nhưng không vào được mạng. Cần cấu hình NAT Overload trên Router R1.',
    steps: ['Nói chuyện với Chị Lan', 'Vào Network Room', 'Cấu hình NAT Overload trên R1', 'Test Ping 8.8.8.8 OK', 'Báo cáo Chị Lan'] },
  { id: 'pcBuild', icon: '🛠️', name: '#002 - Lắp ráp Workstation', giver: 'Chị Hương', loc: 'Lab Phần Cứng', reward: '+450 XP, +1,500 Coin, +1 Hardware Skill', skill: 'hardware',
    desc: 'Lắp ráp 1 máy trạm từ 8 linh kiện theo đúng thứ tự kỹ thuật. Bắt đầu từ PSU.',
    steps: ['Đến Lab Phần Cứng', 'Bấm [E] vào bàn Lắp Ráp', 'Đặt 8 linh kiện đúng thứ tự', 'Nhấn HOÀN THÀNH'] },
  { id: 'crimp', icon: '🔨', name: '#003 - Bấm cáp mạng T568B', giver: 'Chị Hương', loc: 'Lab Phần Cứng', reward: '+360 XP, +800 Coin, +1 Crimping Skill', skill: 'crimping',
    desc: 'Bấm 1 sợi cáp mạng chuẩn T568B: đưa 8 màu dây vào đúng vị trí PIN RJ45.',
    steps: ['Đến Lab Phần Cứng', 'Bấm [E] vào trạm Bấm Cáp', 'Chọn màu dây → chọn PIN đúng', 'Nhấn HOÀN THÀNH'] },
  { id: 'diag', icon: '🩺', name: '#004 - Sửa PC không lên nguồn', giver: 'Chị Hương', loc: 'Lab Phần Cứng', reward: '+540 XP, +1,200 Coin, +1 Troubleshooting Skill', skill: 'troubleshooting',
    desc: 'PC của anh Hùng không lên nguồn. Chẩn đoán theo thứ tự từ đơn giản đến phức tạp.',
    steps: ['Đến Lab Phần Cứng', 'Bấm [E] vào trạm Chẩn Đoán', 'Chọn 6 bước đúng thứ tự', 'Nhấn HOÀN THÀNH'] },
  { id: 'quiz', icon: '🎓', name: '#005 - Thi thử chứng chỉ CCNA', giver: 'Thầy Đức', loc: 'Học viện CCNA', reward: '+600 XP, +1,800 Coin, +1 Networking Skill', skill: 'networking',
    desc: 'Học viện CCNA mở kỳ thi thử. Trả lời 8 câu trắc nghiệm, đúng từ 6 câu để nhận chứng chỉ 200-301.',
    steps: ['Đến Học viện CCNA', 'Bấm [E] vào bàn thi', 'Trả lời 8 câu trắc nghiệm', 'Đúng ≥ 6 câu và nhận chứng chỉ'] },
  { id: 'helpdesk', icon: '🎫', name: '#006 - Phân loại ticket Helpdesk', giver: 'Chị Linh', loc: 'Trụ sở IT', reward: '+480 XP, +1,400 Coin, +1 Troubleshooting Skill', skill: 'troubleshooting',
    desc: 'Hàng đợi Helpdesk đang đầy. Phân loại 6 ticket vào đúng nhóm: Network / Hardware / Software / Account.',
    steps: ['Đến Trụ sở IT', 'Bấm [E] vào bàn Helpdesk', 'Phân loại 6 ticket', 'Đúng ≥ 5 ticket và HOÀN THÀNH'] },
  { id: 'patch', icon: '🔌', name: '#007 - Đấu cáp Patch Panel', giver: 'Anh Khoa', loc: 'Data Center', reward: '+510 XP, +1,600 Coin, +1 Data Center Skill', skill: 'datacenter',
    desc: '5 server trong Data Center chưa được đấu cáp. Nối đúng từng cổng server với cổng switch theo sơ đồ.',
    steps: ['Đến Data Center', 'Bấm [E] vào Patch Panel', 'Đấu đúng 5 cặp cổng theo sơ đồ', 'Nhấn HOÀN THÀNH'] },
  { id: 'wifi', icon: '📶', name: '#008 - Chống nhiễu sóng Wifi', giver: 'Chị Mai', loc: 'VP Kinh doanh', reward: '+420 XP, +1,200 Coin, +1 Wireless Skill', skill: 'wireless',
    desc: 'Wifi sàn kinh doanh chập chờn do 3 AP chồng kênh. Quy hoạch lại kênh 1 – 6 – 11 cho 3 Access Point.',
    steps: ['Đến VP Kinh doanh', 'Bấm [E] vào bàn quy hoạch', 'Chọn kênh cho 3 AP', 'Không còn AP chồng kênh'] },
  { id: 'trace', icon: '🛰️', name: '#009 - Phân tích Traceroute', giver: 'Anh Sơn', loc: 'Trạm mạng ISP', reward: '+450 XP, +1,300 Coin, +1 Networking Skill', skill: 'networking',
    desc: 'Khách báo mạng chậm. Xác định đúng thứ tự 5 hop mà gói tin đi qua từ máy khách ra tới Internet.',
    steps: ['Đến Trạm mạng ISP', 'Bấm [E] vào bàn phân tích', 'Sắp xếp 5 hop đúng thứ tự', 'Nhấn HOÀN THÀNH'] },
  { id: 'boss', icon: '🔥', name: '#010 - ĐẠI SỰ CỐ (Ải cuối)', giver: 'Chị Lan', loc: 'Data Center', reward: '+900 XP, +3,000 Coin, TẤT CẢ kỹ năng +1', skill: null,
    desc: 'Báo động đỏ: Broadcast Storm & loop layer-2 đánh sập Data Center. 3 phút (180 giây) cho 3 pha liên hoàn — cô lập cổng loop bằng CLI, bấm lại cáp dự phòng T568B, dựng lại bảng định tuyến khẩn cấp.',
    steps: ['Hoàn thành Ải 1 → Ải 9', 'Bấm [M] mở bảng nhiệm vụ', 'Chọn "#010 - ĐẠI SỰ CỐ"', 'Bấm "BẮT ĐẦU ĐẠI SỰ CỐ"', 'Pha 1: shutdown đúng cổng loop (CLI)', 'Pha 2: bấm 8 lõi theo T568B', 'Pha 3: gán 4 next-hop cho bảng route', 'Bấm KẾT THÚC ĐẠI SỰ CỐ'] }
];

function renderMissions() {
  const listEl = document.getElementById('mission-list');
  const head = document.getElementById('mis-head');
  if (head) head.innerHTML = '📋 MISSION BOARD — ẢI ' + (stagesDone() + (currentStage() ? 1 : 0)) + '/' + STAGES.length + ' · Đã xong ' + stagesDone() + ' ải';
  listEl.innerHTML = '';
  MISSIONS.forEach(m => {
    const done = S.missionsDone[m.id];
    const lk = lockedBy(m.id);
    const no = stageIndexOf(m.id) + 1;
    const div = document.createElement('div');
    div.className = 'mission-item' + (done ? ' done' : '') + (lk ? ' locked' : '');
    div.innerHTML = `<b style="color:${done?'#22c55e':(lk?'#64748b':'#38bdf8')}; font-size:11px;">${lk?'🔒':m.icon} ${m.name.split(' - ')[0]}</b>
      <div style="font-size:10px; color:#94a3b8; margin-top:2px;">Ải ${no}/${STAGES.length} · ${m.giver}</div>
      <div style="font-size:10px; color:${done?'#22c55e':(lk?'#94a3b8':'#facc15')}; margin-top:4px;">${done?'✅ Hoàn thành':(lk?'🔒 Cần xong Ải '+stageIndexOf(m.id):'🔄 Chưa xong')}</div>`;
    div.onclick = () => {
      document.querySelectorAll('.mission-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      renderMissionDetail(m);
      beep(550, 'sine', 0.04);
    };
    listEl.appendChild(div);
  });
  listEl.firstChild.classList.add('active');
  const cur = currentStage();
  const first = cur ? MISSIONS.filter(m => m.id === cur.s.id)[0] : null;
  const activeItem = first ? listEl.children[MISSIONS.indexOf(first)] : listEl.firstChild;
  document.querySelectorAll('.mission-item').forEach(el => el.classList.remove('active'));
  activeItem.classList.add('active');
  renderMissionDetail(first || MISSIONS[0]);
}

function renderMissionDetail(m) {
  const done = S.missionsDone[m.id];
  const lk = lockedBy(m.id);
  const no = stageIndexOf(m.id) + 1;
  const stepsHtml = m.steps.map((s, i) => {
    const done_ = done ? true : (m.id === 'nat' && i < S.qStep - 1) || (m.id === 'pcBuild' && S.missionsDone.pcBuild) || false;
    return `<div style="margin:3px 0;">${done_ ? '✔' : '▫'} ${i+1}. ${s}</div>`;
  }).join('');
  document.getElementById('mission-detail').innerHTML = `
    <h3 style="color:var(--cyan); font-size:14px;">${m.name}</h3>
    <p style="color:#94a3b8; font-size:11px; margin:4px 0 10px 0;">Ải <b style="color:#fde047">${no}/${STAGES.length}</b> · Người giao: <b>${m.giver}</b> | Địa điểm: <b>${m.loc}</b></p>
    <div style="background:#090f1d; border-left:3px solid var(--yellow); padding:8px 12px; margin-bottom:12px; line-height:1.5; font-size:12px;">"${m.desc}"</div>
    ${lk ? `<div style="background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.45); border-radius:8px; padding:9px 12px; margin-bottom:12px; font-size:11.5px; color:#fca5a5;">
      🔒 <b>ẢI CHƯA MỞ</b> — cần hoàn thành <b>Ải ${stageIndexOf(m.id)} · ${lk.name}</b> trước.</div>` : ''}
    <b>MỤC TIÊU:</b>
    <div style="margin:6px 0;">${stepsHtml}</div>
    <p style="margin-top:14px; color:var(--yellow);">🎁 Phần thưởng: ${m.reward}</p>
    <p style="margin-top:10px; color:${done?'var(--green)':(lk?'#64748b':'var(--red)')}; font-weight:bold; font-size:13px;">
      ${done ? '✅ ĐÃ HOÀN THÀNH' : (lk ? '🔒 CHƯA MỞ KHOÁ' : '🔄 ĐANG THỰC HIỆN')}
    </p>
    ${m.id === 'boss' ? `<button class="hud-btn ${lk ? '' : 'success'}" style="width:100%; justify-content:center; padding:12px; margin-top:14px; font-size:12.5px;"
        onclick="${lk ? `showToast('🔒 Cần hoàn thành Ải ${stageIndexOf(m.id)} — ${lk.name} trước!')` : 'openBoss()'}">
        ${lk ? '🔒 CHƯA MỞ ẢI CUỐI' : '🔥 BẮT ĐẦU ĐẠI SỰ CỐ'}</button>` : ''}`;
}

/* ============ INVENTORY ============ */
const items = [
  { i: '📟', n: 'Cable Tester', d: 'Kiểm tra 8 sợi dây mạng chuẩn T568A / T568B.' },
  { i: '🔌', n: 'Console Cable', d: 'Cáp Cisco RJ45 sang USB kết nối cổng quản trị Console.' },
  { i: '💻', n: 'ThinkPad Laptop', d: 'Cài sẵn PuTTY, Wireshark và Packet Tracer.' },
  { i: '✂️', n: 'Kìm Bấm Mạng', d: 'Kìm bấm hạt mạng RJ45 Cat6.' },
  { i: '📦', n: 'Hộp Hạt RJ45', d: 'Hạt mạng Cat6 bọc kim chống nhiễu.' },
  { i: '🖲️', n: 'Module SFP+', d: 'Transceiver quang 10Gbps kết nối Uplink.' },
  { i: '📜', n: 'Cheatsheet', d: 'Bảng chia IP Subnet VLSM & CIDR.' },
  { i: '💾', n: 'USB IOS Boot', d: 'USB chứa file IOS khôi phục khi lỗi rommon.' }
];
function invDetail(it) {
  const ic = document.getElementById('item-ic'), t = document.getElementById('item-title');
  const q = document.getElementById('item-qty'), d = document.getElementById('item-desc');
  const e = document.getElementById('item-eff');
  if (!ic || !t || !q || !d || !e) return;
  ic.innerText = it.i;
  t.innerText = it.n;
  q.innerText = it.qty ? '×' + it.qty : '';
  q.style.display = it.qty ? '' : 'none';
  d.innerText = it.d;
  e.innerText = it.eff ? '✔ ĐANG KÍCH HOẠT: ' + it.eff : (it.src || '');
  e.className = 'inv-eff' + (it.eff ? ' on' : '');
  e.style.display = (it.eff || it.src) ? '' : 'none';
}
function fillInventoryGrid() {
  const b = document.getElementById('inv-box');
  if (!b) return;
  b.innerHTML = '';
  const kit = items.map(it => ({ i: it.i, n: it.n, d: it.d, src: 'Đồ nghề được công ty cấp — không mua, không mất.' }));
  const bought = SHOP_ITEMS.filter(it => invHas(it.k)).map(it => ({
    i: it.ic, n: it.n, d: it.d, eff: it.e, qty: it.use ? invNum(it.k) : 0
  }));
  const list = kit.concat(bought);
  list.forEach((it, idx) => {
    const sl = document.createElement('div');
    sl.className = `slot ${idx === 0 ? 'active' : ''}`;
    sl.innerHTML = `<span class="inv-ic">${it.i}</span><span class="inv-nm">${it.n}</span>` +
      (it.qty ? `<span class="inv-badge">×${it.qty}</span>` : '');
    sl.onclick = () => {
      document.querySelectorAll('#inv-box .slot').forEach(s => s.classList.remove('active'));
      sl.classList.add('active');
      invDetail(it);
      beep(550, 'sine', 0.04);
    };
    b.appendChild(sl);
  });
  invDetail(list[0]);
}
const PROF_HEAD = { inv: '🎒 HỒ SƠ KỸ SƯ & TÚI ĐỒ', skills: '✨ KỸ NĂNG IT SUPPORT', ach: '🏆 THÀNH TỰU & DANH HIỆU' };
function openProfileModal(tab) {
  const modal = document.getElementById('inv-modal');
  if (!modal) return;
  const alreadyOpen = modal.style.display === 'flex';
  if (!alreadyOpen) {
    closeAll();
    fillInventoryGrid();
  }
  modal.style.display = 'flex';
  modal.classList.toggle('tab-skills', tab === 'skills');
  modal.classList.toggle('tab-ach', tab === 'ach');
  const head = document.getElementById('inv-head');
  if (head) head.textContent = PROF_HEAD[tab] || PROF_HEAD.inv;
  ['inv', 'skills', 'ach'].forEach(t => {
    const b = document.getElementById('tab-' + t);
    if (b) b.classList.toggle('active', t === tab);
  });
  if (tab === 'ach') { achTabLabel(); renderAchGrid(); }
  syncHUD();
  beep(500);
}
function openInventory() { openProfileModal('inv'); }
function openSkills() { openProfileModal('skills'); }
function openAchievements() { openProfileModal('ach'); }

/* ============ CLI ============ */
const tIn = document.getElementById('term-in'), tScr = document.getElementById('term-screen');
const T_ESC = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T_KW = 'interface|ip|address|access-list|permit|nat|inside|outside|source|list|overload|show|running-config|translations|ping|exit|help|logging|hostname|gateway|GigabitEthernet\\d\\/\\d(?:\\/\\d)?';
const T_RE = new RegExp(`(%\\S*|Success rate|Request timed out|\\b(?:${T_KW})\\b|\\d{1,3}(?:\\.\\d{1,3}){3}(?:/\\d{1,2})?|\\b(?:OK|FAIL|SUCCESS|Timeout|ACTIVE|LINK UP|DOWN)\\b|\\[[^\\]]*\\]|!|\\d+ms)`, 'g');
function termCls(m) {
  if (m === '!') return 't-cmt';
  if (m[0] === '%') return 't-err';
  if (m[0] === '[') return /SUCCESS|ACTIVE|OK/i.test(m) ? 't-ok' : 't-warn';
  if (/^\d+(\.\d+)+/.test(m)) return 't-ip';
  if (/^\d/.test(m)) return 't-num';
  if (/^(OK|SUCCESS|LINK UP|ACTIVE|up)$/.test(m)) return 't-ok';
  if (/^(FAIL|Timeout|DOWN)$/.test(m)) return 't-err';
  if (/^(Success rate|Request timed out)$/.test(m)) return /Success/.test(m) ? 't-ok' : 't-err';
  return 't-key';
}
function termHtml(line) {
  const esc = T_ESC(line);
  if (!esc.trim()) return '<span class="t-blank"> </span>';
  if (/^\s*(R1[>#]|➜|>)\s?/.test(esc)) return `<span class="t-cmd">${esc}</span>`;
  return esc.replace(T_RE, m => `<i class="${termCls(m)}">${m}</i>`);
}
function syncTermStatus() {
  const el = document.getElementById('term-status'); if (!el) return;
  el.innerHTML = `<span class="ts brand">R1</span><span class="ts">Cisco IOS 15.9(3)M4</span>` +
    `<span class="ts">g0/0 · 192.168.10.1 · up</span><span class="ts">g0/1 · 203.0.113.2 · up</span>` +
    `<span class="ts ${S.isFixed ? 'ok' : 'bad'}">NAT ${S.isFixed ? 'overload ✓' : 'MISSING ✗'}</span>` +
    `<span class="ts ${S.missionsDone.nat ? 'ok' : 'idle'}">${S.missionsDone.nat ? 'LINK UP' : 'PROVISIONING'}</span>` +
    `<span class="ts right">${typeof clockLabel === 'function' ? clockLabel() : ''}</span>`;
}
function logCLI(t, silent) {
  const div = document.createElement('div');
  div.className = 'tl';
  div.innerHTML = String(t).split('\n').map(termHtml).join('<br>');
  tScr.appendChild(div);
  tScr.scrollTop = tScr.scrollHeight;
  syncTermStatus();
  if (!silent) beep(520, 'sine', 0.025, 0.02);
}

logCLI('R1# show ip nat translations\n% No active translations', true);
logCLI('R1# show running-config\n!\ninterface GigabitEthernet0/0\n ip address 192.168.10.1 255.255.255.0\n ip nat inside\n!\ninterface GigabitEthernet0/1\n ip address 203.0.113.2 255.255.255.252\n ip nat outside\n!\naccess-list 1 permit 192.168.10.0 0.0.0.255\n! [NAT Missing]: Chưa có câu lệnh NAT Overload!', true);
syncTermStatus();

tIn.onkeydown = e => {
  if (e.key === 'Enter') {
    const c = tIn.value.trim(); tIn.value = '';
    logCLI("R1# " + c);
    const low = c.toLowerCase();
    if (low === '/dev' || low === 'dev') { logCLI('Mở DEV MENU — chọn ải 1 → 10 để kiểm tra nhanh.', true); openDevMenu(); }
    else if (low === 'help') logCLI("Lệnh: show run | ping 8.8.8.8 | exit\nSửa: ip nat inside source list 1 interface g0/1 overload");
    else if (low === 'show run') logCLI(
`interface g0/0
 ip address 192.168.10.1 255.255.255.0
 ip nat inside
!
interface g0/1
 ip address 203.0.113.2 255.255.255.252
 ip nat outside
!
access-list 1 permit 192.168.10.0 0.0.0.255
${S.isFixed ? 'ip nat inside source list 1 interface g0/1 overload' : '! [LỖI]: Chưa nạp NAT Overload!'}`);
    else if (low.includes('overload') || low === 'fix nat') quickFixNAT();
    else if (low === 'ping 8.8.8.8') runPingTest();
    else if (low === 'exit') closeAll();
    else logCLI("% Lệnh không nhận diện. Gõ 'help'.");
  }
};

function quickFixNAT() {
  S.isFixed = true; S.qStep = Math.max(S.qStep, 3);
  const c3 = document.getElementById('chk3'); if (c3) c3.innerHTML = '✔ 3. Đã nạp NAT Overload';
  document.getElementById('w-wan').className = 'wire green';
  document.getElementById('flow-status').innerText = 'ĐÃ SỬA XONG (READY)';
  document.getElementById('flow-status').style.color = '#22c55e';
  logCLI("[SUCCESS] Đã nạp: ip nat inside source list 1 interface g0/1 overload");
  logCLI("NAT Table đã kích hoạt. Chạy test Ping!");
  beep(700, 'triangle', 0.15, 0.04);
}

function runPingTest() {
  logCLI("Sending 5, 100-byte ICMP Echos to 8.8.8.8:");
  const d1 = document.getElementById('d1'), d2 = document.getElementById('d2'), d3 = document.getElementById('d3');
  d1.style.display = 'block'; d1.style.left = '0%';
  let step = 0;
  const a = setInterval(() => {
    step++;
    if (step <= 10) d1.style.left = (step * 10) + '%';
    else if (step <= 20) { d1.style.display = 'none'; d2.style.display = 'block'; d2.style.left = ((step - 10) * 10) + '%'; }
    else if (step <= 30) { d2.style.display = 'none'; d3.style.display = 'block'; d3.style.left = ((step - 20) * 10) + '%'; }
    else {
      clearInterval(a); d3.style.display = 'none';
      if (S.isFixed) {
        logCLI("!!!!!\nSuccess rate is 100 percent (5/5), RTT min/avg/max = 12/22/35 ms");
        document.getElementById('ping-res').innerText = '✔ Ping 8.8.8.8 ... OK (22ms)';
        document.getElementById('ping-res').style.color = '#22c55e';
        document.getElementById('ping-note').innerText = '👉 Đã thông mạng! Quay lại báo cáo Chị Lan.';
        const c4 = document.getElementById('chk4'); if (c4) c4.innerHTML = '✔ 4. Ping Internet OK';
        S.qStep = Math.max(S.qStep, 4);
        beep(880, 'triangle', 0.2, 0.045);
      } else {
        logCLI(".....\nSuccess rate is 0 percent (0/5)\nLỗi: Request timed out do thiếu NAT Overload!");
        beep(160, 'sawtooth', 0.25, 0.04);
      }
    }
  }, 40);
}

/* ====================================================
   🛠️ MINI-GAME 1: PC BUILD
   ==================================================== */
const PC_PARTS = [
  { id: 'psu',       icon: '🔌', name: 'Bộ nguồn PSU',       hint: 'Nguồn cấp điện cho toàn bộ hệ thống - phải lắp đầu tiên vào case.' },
  { id: 'mobo',      icon: '🟩', name: 'Bo mạch chủ',        hint: 'Nền tảng gắn mọi linh kiện khác lên trên.' },
  { id: 'cpu',       icon: '🧠', name: 'CPU',                hint: 'Bộ xử lý - cắm vào socket trên mainboard.' },
  { id: 'paste',     icon: '🧴', name: 'Keo tản nhiệt',      hint: 'Bôi 1 hạt đậu lên mặt CPU trước khi gắn tản nhiệt.' },
  { id: 'cooler',    icon: '❄️', name: 'Tản nhiệt CPU',      hint: 'Gắn lên CPU sau khi bôi keo.' },
  { id: 'ram',       icon: '🎞️', name: 'RAM (2 thanh)',     hint: 'Cắm vào khe DIMM A2 + B2 để chạy dual-channel.' },
  { id: 'gpu',       icon: '🎮', name: 'Card đồ họa GPU',    hint: 'Cắm vào khe PCIe x16, khóa chốt lại.' },
  { id: 'storage',   icon: '💾', name: 'SSD NVMe',           hint: 'Cắm vào khe M.2, vít chặt lại.' }
];

let pcState = { placed: [], step: 0 };

function openPCBuild() {
  closeAll();
  resetPCBuild();
  document.getElementById('pc-modal').style.display = 'flex';
  beep(600);
}

function resetPCBuild() {
  pcState = { placed: [], step: 0 };
  renderPCBuild();
}

function renderPCBuild() {
  const slotsEl = document.getElementById('pc-slots');
  slotsEl.innerHTML = '';
  PC_PARTS.forEach((p, i) => {
    const placed = pcState.placed[i];
    const isTarget = (i === pcState.step) && !placed;
    const div = document.createElement('div');
    div.className = 'pc-slot' + (placed ? ' filled' : '') + (isTarget ? ' target' : '');
    div.innerHTML = `<span class="num">${i + 1}</span>
      ${placed ? `<canvas class="part-cv" data-part="${p.id}" width="104" height="62"></canvas><span class="name">${p.name}</span>`
               : `<span class="ghost">${isTarget ? '▸' : '?'}</span><span class="name">${isTarget ? 'Đến lượt lắp' : 'Trống'}</span>`}`;
    slotsEl.appendChild(div);
  });

  const partsEl = document.getElementById('pc-parts');
  partsEl.innerHTML = '';
  const shuffled = [...PC_PARTS].map((p, i) => ({ p, i })).sort(() => Math.random() - 0.5);
  shuffled.forEach(({ p, i }) => {
    const used = pcState.placed[i];
    const div = document.createElement('div');
    div.className = 'pc-part' + (used ? ' used' : '');
    div.dataset.hue = p.id;
    div.innerHTML = `<canvas class="part-cv" data-part="${p.id}" data-dim="${used ? 1 : 0}" width="104" height="62"></canvas><span class="name">${p.name}</span>`;
    div.onclick = () => clickPCPart(i);
    partsEl.appendChild(div);
  });
  document.querySelectorAll('.part-cv').forEach(drawPartIcon);

  const pct = (pcState.placed.filter(Boolean).length / 8) * 100;
  document.getElementById('pc-bar').style.width = pct + '%';
  document.getElementById('pc-count').innerText = `${pcState.placed.filter(Boolean).length}/8`;

  const hintEl = document.getElementById('pc-hint');
  if (pcState.step < 8) hintEl.innerHTML = `💡 <b>Bước ${pcState.step+1}/8:</b> ${PC_PARTS[pcState.step].hint}`;
  else hintEl.innerHTML = '✅ Đã lắp xong! Nhấn HOÀN THÀNH để kết thúc.';

  document.getElementById('pc-finish-btn').disabled = pcState.placed.filter(Boolean).length !== 8;
}

function clickPCPart(idx) {
  if (pcState.placed[idx]) { beep(200, 'square', 0.1, 0.03); return; }
  if (idx === pcState.step) {
    // correct
    pcState.placed[idx] = true;
    pcState.step++;
    beep(660, 'sine', 0.1, 0.05);
    chord([660, 880]);
    renderPCBuild();
    if (pcState.step === 8) {
      setTimeout(() => { chord([660, 880, 1100, 1320]); showToast('🎉 Lắp ráp hoàn tất!'); }, 200);
    }
  } else {
    // wrong
    const slot = document.querySelectorAll('.pc-slot')[pcState.step];
    if (slot) { slot.classList.add('error'); setTimeout(() => slot.classList.remove('error'), 400); }
    beep(160, 'sawtooth', 0.2, 0.04);
    showToast(`❌ Sai thứ tự! Cần lắp "${PC_PARTS[pcState.step].name}" trước.`);
  }
}

function pcBuildFinish() {
  if (pcState.placed.filter(Boolean).length !== 8) return;
  if (S.missionsDone.pcBuild) {
    showToast('Bạn đã hoàn thành nhiệm vụ này rồi!');
    closeAll(); return;
  }
  S.missionsDone.pcBuild = true;
  S.skills.hardware = Math.min(5, S.skills.hardware + 1);
  addXP(450); addCoin(1500);
  closeAll();
  setTimeout(() => showDlg("Chị Hương", "IT Support Lead",
    `🎉 Xuất sắc! Em đã lắp ráp hoàn chỉnh 1 workstation đúng chuẩn kỹ thuật!\n🎁 Nhận: <b>+450 EXP | +1,500 Coin | Hardware Skill +1</b>`), 200);
}

/* ====================================================
   🔨 MINI-GAME 2: CABLE CRIMPING T568B
   ==================================================== */
const T568B = [
  { name: 'Trắng-Cam',      main: '#f59e0b', stripe: '#ffffff' },
  { name: 'Cam',            main: '#f59e0b', stripe: null },
  { name: 'Trắng-Xanh lá',  main: '#16a34a', stripe: '#ffffff' },
  { name: 'Xanh dương',     main: '#0284c7', stripe: null },
  { name: 'Trắng-Xanh dương', main: '#0284c7', stripe: '#ffffff' },
  { name: 'Xanh lá',        main: '#16a34a', stripe: null },
  { name: 'Trắng-Nâu',      main: '#78350f', stripe: '#ffffff' },
  { name: 'Nâu',            main: '#78350f', stripe: null }
];

let crimpState = { pins: Array(8).fill(null), nextPin: 0, selectedWire: null, selIdx: -1, err: -99, bad: 0 };

function openCrimp() {
  closeAll();
  resetCrimp();
  document.getElementById('crimp-modal').style.display = 'flex';
  beep(600);
}

function resetCrimp() {
  crimpState = { pins: Array(8).fill(null), nextPin: 0, selectedWire: null, selIdx: -1, err: -99, bad: 0 };
  renderCrimp();
}

// Dữ liệu để mg-art.js vẽ lại mỗi khung hình
function crimpScene() {
  return {
    pins: crimpState.pins,
    nextPin: crimpState.nextPin,
    order: T568B,
    selected: crimpState.selIdx,
    used: T568B.map(w => crimpState.pins.some(p => p && p.name === w.name)),
    selFlash: Math.max(0, 1 - (MGX.t - crimpState.err) * 1.8)
  };
}

function wireBG(w) {
  if (w.stripe) return `repeating-linear-gradient(90deg, ${w.main} 0 6px, ${w.stripe} 6px 12px)`;
  return w.main;
}

function renderCrimp() {
  const n = crimpState.pins.filter(Boolean).length;
  document.getElementById('crimp-bar').style.width = (n / 8 * 100) + '%';
  document.getElementById('crimp-count').innerText = `${n}/8`;
  document.getElementById('crimp-finish-btn').disabled = n !== 8;

  const rl = document.getElementById('crimp-ref-list');
  if (rl) rl.innerHTML = T568B.map((w, i) =>
    `<div class="rr${crimpState.pins[i] ? ' on' : ''}"><i class="rd" style="background:${wireBG(w)}"></i><b>${i + 1}</b>${w.name}</div>`).join('');

  const hintEl = document.getElementById('crimp-hint');
  if (crimpState.selectedWire) hintEl.innerHTML = `🎯 Đang giữ <b>${crimpState.selectedWire.name}</b> — bấm vào rãnh <b>PIN ${crimpState.nextPin + 1}</b> trên đầu RJ45.`;
  else if (crimpState.nextPin < 8) hintEl.innerHTML = `💡 Bước ${crimpState.nextPin + 1}/8: chọn dây <b>${T568B[crimpState.nextPin].name}</b> ở kho dây, rồi bấm vào PIN ${crimpState.nextPin + 1}.`;
  else hintEl.innerHTML = '✅ 8 lõi đã vào đúng vị trí — đèn cổng SW01 sáng hết. Nhấn HOÀN THÀNH.';
}

function selectWire(w) {
  if (crimpState.pins.some(p => p && p.name === w.name)) return;
  crimpState.selectedWire = w;
  crimpState.selIdx = T568B.indexOf(w);
  beep(660, 'sine', 0.06, 0.03);
  renderCrimp();
}

function clickPin(i) {
  if (crimpState.pins[i]) return;
  const cy = CR.cy(i);
  if (i !== crimpState.nextPin) {
    crimpState.err = MGX.t;
    crimpState.bad++;
    mgBurst('crimp-cv', CR.bodyX1 - 10, cy, '#ef4444', 6);
    beep(160, 'sawtooth', 0.15, 0.03);
    showToast(`⚠️ Bấm theo thứ tự — đang tới lượt <b>PIN ${crimpState.nextPin + 1}</b>.`);
    return;
  }
  if (!crimpState.selectedWire) {
    showToast('⚠️ Hãy chọn 1 màu dây ở kho dây bên phải trước!');
    beep(300, 'square', 0.1, 0.03);
    return;
  }
  const expected = T568B[crimpState.nextPin];
  if (crimpState.selectedWire.name !== expected.name) {
    crimpState.err = MGX.t;
    crimpState.bad++;
    mgBurst('crimp-cv', CR.bodyX1 - 10, cy, '#ef4444', 6);
    showToast(`❌ Sai! PIN ${i + 1} phải là "${expected.name}".`);
    beep(160, 'sawtooth', 0.2, 0.04);
    return;
  }
  crimpState.pins[i] = crimpState.selectedWire;
  crimpState.nextPin++;
  crimpState.selectedWire = null;
  crimpState.selIdx = -1;
  mgBurst('crimp-cv', CR.bodyX1 - 8, cy, '#ffd76a', 12);
  beep(880, 'sine', 0.08, 0.04);
  renderCrimp();
  if (crimpState.nextPin === 8) {
    setTimeout(() => mgBurst('crimp-cv', 250, CR.swY + 40, '#22c55e', 16), 120);
    setTimeout(() => chord([660, 880, 1100]), 150);
  }
}

function crimpFinish() {
  if (crimpState.pins.filter(Boolean).length !== 8) return;
  if (S.missionsDone.crimp) { showToast('Bạn đã hoàn thành nhiệm vụ này rồi!'); closeAll(); return; }
  S.missionsDone.crimp = true;
  S.skills.crimping = Math.min(5, S.skills.crimping + 1);
  addXP(360); addCoin(800);
  if (crimpState.bad === 0) achUnlock('hands');
  closeAll();
  setTimeout(() => showDlg("Chị Hương", "IT Support Lead",
    `🎉 Chuẩn luôn! Sợi cáp T568B của em đã đạt chuẩn quốc tế!\n🎁 Nhận: <b>+360 EXP | +800 Coin | Crimping Skill +1</b>`), 200);
}

/* ====================================================
   🩺 MINI-GAME 3: HARDWARE DIAGNOSTICS
   ==================================================== */
const DIAG_STEPS = [
  { id: 0, text: 'Kiểm tra dây nguồn có cắm chặt vào ổ điện và case không?', log: '> [OK] Dây nguồn đã cắm chặt.' },
  { id: 1, text: 'Kiểm tra công tắc I/O trên PSU đang ở vị trí I (ON)?', log: '> [OK] Công tắc PSU đang ở vị trí I (ON).' },
  { id: 2, text: 'Kiểm tra dây 24-pin đã cắm vào mainboard chưa?', log: '> [!!] Dây 24-pin bị lỏng! Đã cắm lại.' },
  { id: 3, text: 'Kiểm tra dây 8-pin CPU đã cắm vào mainboard chưa?', log: '> [OK] Dây 8-pin CPU đã cắm đúng.' },
  { id: 4, text: 'Kiểm tra nút nguồn trên case có bị kẹt không?', log: '> [OK] Nút nguồn hoạt động bình thường.' },
  { id: 5, text: 'Test PSU bằng Paperclip Test (kẹp giấy) để xác minh PSU sống.', log: '> [OK] PSU quạt quay → PSU còn hoạt động.' }
];

let diagState = { done: [], nextStep: 0 };

function openDiag() {
  closeAll();
  resetDiag();
  document.getElementById('diag-modal').style.display = 'flex';
  beep(600);
}

function resetDiag() {
  diagState = { done: [], nextStep: 0 };
  renderDiag();
}

function renderDiag() {
  const el = document.getElementById('diag-steps');
  el.innerHTML = '';
  const shuffled = [...DIAG_STEPS].sort(() => Math.random() - 0.5);
  shuffled.forEach(s => {
    const done = diagState.done.includes(s.id);
    const div = document.createElement('div');
    div.className = 'diag-step' + (done ? ' done' : '');
    div.innerHTML = `<div class="step-num">${done ? '✓' : '?'}</div><div>${s.text}</div>`;
    div.onclick = () => clickDiagStep(s.id, div);
    el.appendChild(div);
  });
  const pct = (diagState.done.length / 6) * 100;
  document.getElementById('diag-bar').style.width = pct + '%';
  document.getElementById('diag-count').innerText = `${diagState.done.length}/6`;
  document.getElementById('diag-finish-btn').disabled = diagState.done.length !== 6;
}

function clickDiagStep(id, div) {
  if (diagState.done.includes(id)) return;
  const expectedNext = diagState.nextStep;
  if (id !== expectedNext) {
    div.classList.add('wrong');
    setTimeout(() => div.classList.remove('wrong'), 400);
    document.getElementById('diag-log').innerText += `\n> [X] Sai thứ tự! Bước ${expectedNext+1} mới đúng.`;
    document.getElementById('diag-log').scrollTop = 9999;
    beep(160, 'sawtooth', 0.15, 0.03);
    return;
  }
  diagState.done.push(id);
  diagState.nextStep++;
  document.getElementById('diag-log').innerText += `\n${DIAG_STEPS[id].log}`;
  document.getElementById('diag-log').scrollTop = 9999;
  beep(660, 'sine', 0.08, 0.04);
  renderDiag();
  if (diagState.done.length === 6) {
    document.getElementById('diag-log').innerText += `\n> ✅ [DONE] Dây 24-pin lỏng là nguyên nhân chính → đã fix!`;
    setTimeout(() => chord([660, 880, 1100, 1320]), 300);
  }
}

function diagFinish() {
  if (diagState.done.length !== 6) return;
  if (S.missionsDone.diag) { showToast('Bạn đã hoàn thành nhiệm vụ này rồi!'); closeAll(); return; }
  S.missionsDone.diag = true;
  S.skills.troubleshooting = Math.min(5, S.skills.troubleshooting + 1);
  addXP(540); addCoin(1200);
  closeAll();
  setTimeout(() => showDlg("Chị Hương", "IT Support Lead",
    `🎉 Giỏi lắm! Em đã chẩn đoán đúng nguyên nhân (dây 24-pin lỏng) và sửa xong!\n🎁 Nhận: <b>+540 EXP | +1,200 Coin | Troubleshooting Skill +1</b>`), 200);
}

/* ====================================================
   🏁 HỆ THỐNG ẢI (STAGE) — MỞ KHOÁ DẦN THEO TIẾN TRÌNH
   ==================================================== */
const DEV = { on: false };          // chế độ dev: bỏ điều kiện mở khoá ải (F2 / /dev)
const STAGES = [
  { id: 'nat',      icon: '🌐', name: 'Sự cố mạng VP Kế toán',    bld: 'OFFICE' },
  { id: 'pcBuild',  icon: '🛠️', name: 'Lắp ráp Workstation',       bld: 'HARDWARE' },
  { id: 'crimp',    icon: '🔨', name: 'Bấm cáp mạng T568B',        bld: 'HARDWARE' },
  { id: 'diag',     icon: '🩺', name: 'Sửa PC không lên nguồn',    bld: 'HARDWARE' },
  { id: 'quiz',     icon: '🎓', name: 'Thi thử chứng chỉ CCNA',    bld: 'ACADEMY' },
  { id: 'helpdesk', icon: '🎫', name: 'Phân loại ticket Helpdesk', bld: 'IT' },
  { id: 'patch',    icon: '🔌', name: 'Đấu cáp Patch Panel',       bld: 'DC' },
  { id: 'wifi',     icon: '📶', name: 'Chống nhiễu sóng Wifi',     bld: 'SALES' },
  { id: 'trace',    icon: '🛰️', name: 'Phân tích Traceroute',      bld: 'ISP' },
  { id: 'socfw',    icon: '🛡️', name: 'Chặn IP tấn công & đóng cổng (SOC)', bld: 'NOC_SOC' },
  { id: 'nocload',  icon: '⚖️', name: 'Cân bằng tải Server (NOC)', bld: 'NOC_SOC' },
  { id: 'boss',     icon: '🔥', name: 'ĐẠI SỰ CỐ — Đêm trực chiến', bld: 'OFFICE', boss: true }
];
const BLD_NAME = {
  OFFICE: 'VP Kế toán', HARDWARE: 'Lab Phần cứng', ACADEMY: 'Học viện CCNA',
  IT: 'Trụ sở IT', DC: 'Data Center', SALES: 'VP Kinh doanh', ISP: 'Trạm mạng ISP',
  NOC_SOC: 'Trung tâm NOC/SOC'
};
const RANKS = [
  { lv: 1,  title: 'IT Support Intern' },
  { lv: 3,  title: 'Helpdesk Staff' },
  { lv: 5,  title: 'Junior Network Engineer' },
  { lv: 7,  title: 'Network Engineer' },
  { lv: 9,  title: 'Senior Network Engineer' },
  { lv: 12, title: 'Network Architect' },
  { lv: 15, title: 'CCIE — Network Expert' }
];
function rankFor(lv) { let t = RANKS[0].title; RANKS.forEach(r => { if (lv >= r.lv) t = r.title; }); return t; }

function stageIndexOf(mid) {
  for (let i = 0; i < STAGES.length; i++) if (STAGES[i].id === mid) return i;
  return -1;
}
function stageUnlocked(i) { return DEV.on || i <= 0 || !!S.missionsDone[STAGES[i - 1].id]; }
// Trả về ải đang chặn (nếu có) của 1 nhiệm vụ
function lockedBy(mid) {
  if (DEV.on) return null;
  const i = stageIndexOf(mid);
  if (i <= 0) return null;
  return S.missionsDone[STAGES[i - 1].id] ? null : STAGES[i - 1];
}
function stagesOfBuilding(bld) {
  const out = [];
  STAGES.forEach((s, i) => { if (s.bld === bld) out.push(i); });
  return out;
}
function buildingOpen(bld) {
  const idx = stagesOfBuilding(bld);
  return idx.length === 0 || idx.some(i => stageUnlocked(i));
}
function buildingLock(bld) {
  if (buildingOpen(bld)) return null;   // chỉ cần 1 ải của toà đã mở là vào được
  const idx = stagesOfBuilding(bld);
  for (const i of idx) {
    if (!stageUnlocked(i)) return { no: i + 1, stage: STAGES[i], need: STAGES[i - 1] };
  }
  return null;
}
function currentStage() {
  for (let i = 0; i < STAGES.length; i++) if (!S.missionsDone[STAGES[i].id]) return { i, s: STAGES[i] };
  return null;
}
function stagesDone() { return STAGES.filter(s => S.missionsDone[s.id]).length; }
function gateMission(mid, fn) {
  const lk = lockedBy(mid);
  if (lk) {
    showToast('🔒 Cần hoàn thành Ải ' + (stageIndexOf(mid)) + ' — ' + lk.name + ' trước!');
    beep(200, 'square', 0.16, 0.035);
    return false;
  }
  fn();
  return true;
}

/* ====================================================
   🛠️ DEV MENU — F2 hoặc lệnh /dev: nhảy cóc vào từng ải
   ==================================================== */
const DEV_STAGE = {
  nat: 'openCLI', pcBuild: 'openPCBuild', crimp: 'openCrimp', diag: 'openDiag',
  quiz: 'openQuiz', helpdesk: 'openTk', patch: 'openPt', wifi: 'openWf',
  trace: 'openTr', socfw: 'openFw', nocload: 'openNc', boss: 'openBoss'
};
function devJumpTo(i) {
  const s = STAGES[i]; if (!s) return;
  DEV.on = true;
  closeDevMenu();
  const fn = window[DEV_STAGE[s.id]];
  if (fn) fn(); else showToast('⚠️ ải ' + s.id + ' chưa có hàm mở');
}
function toggleDevMenu(force) {
  const el = document.getElementById('dev-menu'); if (!el) return;
  const show = force === undefined ? el.style.display !== 'flex' : force;
  el.style.display = show ? 'flex' : 'none';
  if (show) renderDevMenu();
  beep(show ? 720 : 420, 'triangle', 0.07, 0.03);
}
function openDevMenu() { toggleDevMenu(true); }
function closeDevMenu() { toggleDevMenu(false); }
function renderDevMenu() {
  const cb = document.getElementById('dm-unlock'); if (cb) cb.checked = DEV.on;
  const cur = currentStage();
  document.getElementById('dm-body').innerHTML = STAGES.map((s, i) => {
    const done = !!S.missionsDone[s.id];
    const open = DEV.on || i === 0 || !!S.missionsDone[STAGES[i - 1].id];
    return `<div class="dm-row${done ? ' done' : ''}${cur && cur.i === i ? ' cur' : ''}">
      <span class="dm-no">${i + 1}</span><span class="dm-ic">${s.icon}</span>
      <span class="dm-nm"><b>${s.name}</b><small>${BLD_NAME[s.bld] || 'Toàn thành phố'} · ${done ? '✅ đã xong' : (open ? '🔓 đang mở' : '🔒 cần Ải ' + i)}</small></span>
      <button class="hud-btn" onclick="devJumpTo(${i})">▶ VÀO ẢI</button>
    </div>`;
  }).join('');
}
function devUnlock(on) { DEV.on = !!on; updateQuestHUD(); renderDevMenu(); }
function devUnlockAll() {
  DEV.on = true;
  STAGES.forEach(s => { if (!s.boss) S.missionsDone[s.id] = true; });
  updateQuestHUD(); renderDevMenu(); showToast('🔓 Đã mở toàn bộ 10 ải.'); saveGame();
}
function devClearDone() {
  STAGES.forEach(s => S.missionsDone[s.id] = false);
  S.qStep = 1; S.isFixed = false;
  updateQuestHUD(); renderDevMenu(); showToast('♻️ Đã bỏ dấu hoàn thành cả 10 ải.'); saveGame();
}
function devResetProgress() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
  location.reload();
}

/* ==================== BANNER ==================== */
var bannerTimer = null;
function showBanner(top, main, sub, cls) {
  const el = document.getElementById('banner');
  if (!el) return;
  document.getElementById('b-top').innerText = top;
  document.getElementById('b-main').innerHTML = main;
  document.getElementById('b-sub').innerHTML = sub || '';
  el.className = 'show' + (cls ? ' ' + cls : '');
  el.onclick = () => { el.className = ''; }; // Click thẳng vào banner là tắt ngay
  beep(880, 'triangle', 0.14, 0.045);
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { el.className = ''; }, 3200);
}
function announceStage(mid) {
  const i = stageIndexOf(mid);
  const nx = STAGES[i + 1];
  const done = stagesDone();
  updateQuestHUD();
  if (nx) {
    const sub = nx.boss
      ? '🔓 <b>MỞ KHOÁ ẢI CUỐI</b> · Bấm <b>M</b> để bắt đầu Đại Sự Cố'
      : '🔓 <b>MỞ KHOÁ ẢI ' + (i + 2) + '</b> · 📍 ' + (BLD_NAME[nx.bld] || '');
    showBanner('ẢI ' + (i + 1) + '/' + STAGES.length + ' HOÀN THÀNH', nx.icon + ' ' + nx.name, sub + '  ·  (' + done + '/' + STAGES.length + ' ải)', 'green');
  } else {
    showBanner('HOÀN THÀNH TOÀN BỘ', '🏆 ' + STAGES.length + '/' + STAGES.length + ' ẢI', 'Bạn đã cứu cả Network City — ' + S.title + '!', 'violet');
  }
}
function updateQuestHUD() {
  const qn = document.getElementById('q-num');
  if (!qn) return;
  document.getElementById('q-total').innerText = STAGES.length;
  const cur = currentStage();
  const qnm = document.getElementById('q-name');
  const ql = document.getElementById('q-loc');
  if (!cur) {
    qn.innerText = STAGES.length;
    qnm.innerHTML = '🏆 Đã vượt toàn bộ ải';
    ql.innerText = 'Network City';
    return;
  }
  qn.innerText = cur.i + 1;
  qnm.innerHTML = cur.s.icon + ' ' + cur.s.name;
  ql.innerText = cur.s.boss ? 'Bấm M để bắt đầu' : (BLD_NAME[cur.s.bld] || 'Thành phố');
}

/* ==================== 🏆 THÀNH TỰU ==================== */
const ACH_COIN = 200;
const ACH_DEFS = [
  { k: 'hands', ic: '🎖️', n: 'Bàn tay vàng', at: '🔨 Ải Bấm Cáp Mạng',
    hint: 'Bấm chuẩn 8/8 lõi cáp T568B, không sai sợi nào.', how: 'Vào ải bấm cáp, chọn đúng màu dây cho cả 8 pin — sai 1 lần là mất danh hiệu.' },
  { k: 'cli', ic: '🎖️', n: 'Chiến thần CLI', at: '🔥 Đại Sự Cố · Pha 1',
    hint: 'Vượt Pha 1 Boss Ải 10 mà không gõ sai lệnh.', how: 'Cô lập cổng loop bằng CLI: đánh sai cú pháp hoặc tắt nhầm cổng là mất.' },
  { k: 'miner', ic: '🎖️', n: 'Diệt sạch Miner', at: '🔌 Quán Net Anh Ba',
    hint: 'Tắt đúng 3 tiến trình mã độc.', how: 'Việc phụ Quán Net Anh Ba: end 3 tiến trình lạ ngốn CPU (svch0st / xmrig64 / WUpdate-Assist).' },
  { k: 'spooler', ic: '🎖️', n: 'Thợ cứu Spooler', at: '🏢 Văn phòng Cô Mai',
    hint: 'Khởi động lại Print Spooler cho Cô Mai.', how: 'Việc phụ Cô Mai: mở services.msc, Restart đúng dịch vụ Print Spooler.' },
  { k: 'storage', ic: '🎖️', n: 'Bậc thầy Lưu trữ', at: '💾 Server Mini',
    hint: 'Mount thành công ổ đĩa mạng \\\\192.168.1.200\\Data.', how: 'Việc phụ Chú Hải: Run → gõ đúng đường dẫn UNC \\\\192.168.1.200\\Data.' },
  { k: 'disk', ic: '🎖️', n: 'Chuyên gia Phần cứng', at: '🔧 Tiệm Sửa Máy',
    hint: 'Nhận định chính xác cảnh báo Caution trên CrystalDiskInfo.', how: 'Việc phụ Tiệm Sửa Máy: soi đúng ổ vàng, đúng chỉ số SMART, tư vấn chuẩn nghề.' },
  { k: 'tycoon', ic: '🎖️', n: 'Đại gia IT', at: '🛒 Cửa Hàng IT',
    hint: 'Mua đủ 5 món đồ trong Cửa Hàng IT.', how: 'Sở hữu cùng lúc 5 món: USB Cứu Hộ, Cà Phê, Giày, Kìm xịn, ThinkPad.' },
  { k: 'legend', ic: '🏆', n: 'Huyền thoại CCNA', at: '🎓 Chứng chỉ CCNA',
    hint: 'Phá đảo Boss Ải 10 và mở khóa Chứng chỉ.', how: 'Khống chế Đại Sự Cố đủ 3 pha rồi nhận thưởng + Chứng chỉ CCNA.' },
  { k: 'hotline_hero', ic: '🚨', n: 'Hiệp Sĩ On-Call', at: '🚨 Hotline Khẩn Cấp',
    hint: 'Xử lý thành công sự cố khẩn cấp từ Sếp.', how: 'Nghe máy khi Sếp gọi khẩn (cảnh Phố/Quảng trường), chạy đến đúng căn nhà trong thời gian hẹn và xử lý xong sự cố.' }
];
S.achievements = S.achievements || {};
const achHas = k => !!S.achievements[k];
const achCount = () => ACH_DEFS.filter(a => achHas(a.k)).length;
const achDay = ts => {
  const d = new Date(ts);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
};

function achUnlock(k, silent) {
  if (!ACH_DEFS.some(a => a.k === k) || achHas(k)) return false;
  S.achievements[k] = Date.now();
  addCoin(ACH_COIN);
  saveGame();
  const a = ACH_DEFS.filter(x => x.k === k)[0];
  if (silent) showToast(a.ic + ' Thành tựu cũ đã đồng bộ: ' + a.n);
  else achPop(a);
  achTabLabel();
  renderAchGrid();
  return true;
}
/* save cũ (hoặc file nạp vào) đã làm xong việc nhưng chưa có field achievements */
function achAutoCheck() {
  if (SHOP_ITEMS.filter(it => invHas(it.k)).length >= 5) achUnlock('tycoon', true);
  if (S.missionsDone.boss) achUnlock('legend', true);
}

let achPopTimer = null;
function achPop(a) {
  const el = document.getElementById('ach-pop');
  if (!el) return;
  document.getElementById('ap-ic').innerText = a.ic;
  document.getElementById('ap-nm').innerText = a.n;
  document.getElementById('ap-hint').innerHTML = a.hint + ' · <b>+' + ACH_COIN + ' Coin</b>';
  el.classList.remove('show');
  void el.offsetWidth;                 // reflow để animation chạy lại nếu nổ liên tiếp
  el.classList.add('show');
  chord([784, 988, 1319, 1568]);
  clearTimeout(achPopTimer);
  achPopTimer = setTimeout(() => el.classList.remove('show'), 4200);
}

function achTabLabel() {
  const b = document.getElementById('tab-ach');
  if (b) b.textContent = '🏆 Thành tựu ' + achCount() + '/' + ACH_DEFS.length;
}
function renderAchGrid() {
  const box = document.getElementById('ach-box');
  if (!box) return;
  const n = achCount(), total = ACH_DEFS.length;
  document.getElementById('ach-num').innerText = n;
  document.getElementById('ach-total').innerText = total;
  document.getElementById('ach-bar').style.width = (n / total * 100) + '%';
  document.getElementById('ach-coin').innerText = '+' + (n * ACH_COIN).toLocaleString() + ' Coin';
  box.innerHTML = ACH_DEFS.map(a => {
    const on = achHas(a.k);
    return '<div class="ach-card' + (on ? ' on' : ' off') + '">' +
      '<span class="ach-ic">' + (on ? a.ic : '🔒') + '</span>' +
      '<b class="ach-nm">' + a.n + '</b>' +
      '<small class="ach-at">' + a.at + '</small>' +
      '<p class="ach-tx">' + (on ? a.hint : a.how) + '</p>' +
      '<span class="ach-rw">' + COIN_IC + ' ' + ACH_COIN + '</span>' +
      (on ? '<span class="ach-date">📅 ' + achDay(S.achievements[a.k]) + '</span>'
          : '<span class="ach-lock">Chưa mở khoá</span>') +
      '</div>';
  }).join('');
}

/* ====================================================
   LƯU / TẢI TIẾN TRÌNH
   ==================================================== */
const SAVE_KEY = 'network_city_it_support_rpg_v1';
const saveData = () => ({
  v: 1, level: S.level, xp: S.xp, xpMax: S.xpMax, coin: S.coin, gem: S.gem, name: S.name, title: S.title,
  skills: S.skills, missionsDone: S.missionsDone, qStep: S.qStep, isFixed: S.isFixed, hd: S.hd, inv: S.inv,
  skin: S.skin, ship: S.ship, achievements: S.achievements
});
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData()));
  } catch (e) { /* trình duyệt chặn localStorage (file://) → bỏ qua */ }
}
/* chỉ nhận giá trị số — cooldown helpdesk + túi đồ, save cũ chưa có trường nào trả về {} */
const numMap = o => {
  const r = {};
  if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (typeof o[k] === 'number') r[k] = o[k]; });
  return r;
};
const STAGE_IDS = {}; STAGES.forEach(s => { STAGE_IDS[s.id] = 1; });
function applySave(d) {
  ['level', 'xp', 'xpMax', 'coin', 'gem', 'name', 'title', 'qStep', 'isFixed', 'skin', 'ship'].forEach(k => {
    if (d[k] !== undefined && d[k] !== null) S[k] = d[k];
  });
  /* Cân bằng lại nhịp lên cấp: mốc phẳng 300 EXP/cấp. Ép xpMax về 300 cho save cũ
     (đường cong 500·1.35^n trước đây) và lên cấp bù nếu EXP đang vượt ngưỡng mới. */
  S.xpMax = 300;
  while (S.xp >= S.xpMax) { S.xp -= S.xpMax; S.level++; }
  if (d.skills) Object.keys(S.skills).forEach(k => { if (typeof d.skills[k] === 'number') S.skills[k] = d.skills[k]; });
  /* missionsDone không chỉ chứa cờ 10 ải: game còn ghi tiến trình động vào đây — gmin (số km
     Tiệm Sửa Máy), win0..win2 (số sao job), rp (trạng thái sửa máy). Phải sao y các key động,
     chỉ chuẩn hoá cờ ải thành boolean; ải chưa có trong save -> false, key động lạ -> xoá để
     game tự tính lại mặc định. */
  if (d.missionsDone && typeof d.missionsDone === 'object') {
    const md = d.missionsDone;
    Object.keys(md).forEach(k => { S.missionsDone[k] = STAGE_IDS[k] ? !!md[k] : md[k]; });
    Object.keys(S.missionsDone).forEach(k => {
      if (k in md) return;
      if (STAGE_IDS[k]) S.missionsDone[k] = false; else delete S.missionsDone[k];
    });
  }
  S.hd = numMap(d.hd);
  S.inv = numMap(d.inv);
  S.achievements = numMap(d.achievements);
  if (!S.title) S.title = rankFor(S.level);
}
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return false;
    applySave(d);
    return true;
  } catch (e) { return false; }
}

/* ---------- XUẤT / NẠP FILE SAVE (backup & restore) ---------- */
function exportSave() {
  try {
    saveGame();
    const url = URL.createObjectURL(new Blob([JSON.stringify(saveData(), null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'it_rpg_save.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast('📤 Đã xuất it_rpg_save.json · Lv.' + S.level + ' · ' + stagesDone() + '/' + STAGES.length +
      ' ải · ' + S.coin.toLocaleString() + ' Coin');
    chord([560, 700]);
  } catch (e) { showToast('📤 Trình duyệt chặn tải file — mở game bằng Chrome để backup nhé!'); }
}
function pickSaveFile() {
  const i = document.getElementById('save-file');
  if (!i) return;
  i.value = '';
  i.click();
}
function importSave(inp) {
  const f = inp && inp.files && inp.files[0];
  if (!f) return;
  const reset = () => { inp.value = ''; };
  if (f.size > 2000000) {
    showToast('📥 File to bất thường (' + Math.round(f.size / 1048576) + ' MB) — save thật chỉ vài KB thôi.');
    reset(); return;
  }
  const rd = new FileReader();
  rd.onerror = () => { showToast('📥 Đọc file không được — thử lại nhé.'); reset(); };
  rd.onload = () => {
    let d = null;
    try { d = JSON.parse(rd.result); } catch (e) { }
    if (!d || typeof d !== 'object' || (typeof d.coin !== 'number' && !d.missionsDone)) {
      showToast('❌ Không nhận ra file save của Network City IT (thiếu coin / missionsDone).');
      reset(); return;
    }
    const n = STAGES.filter(s => d.missionsDone && d.missionsDone[s.id]).length;
    const ok = confirm('⚠️ NẠP FILE SAVE?\n\n' + f.name + '\nLv.' + (d.level || 1) + ' · ' +
      ((typeof d.coin === 'number' ? d.coin : 0).toLocaleString()) + ' Coin · ' + n + '/' + STAGES.length + ' ải\n\n' +
      'Toàn bộ tiến trình ĐANG CHƠI sẽ bị ghi đè. Nên bấm "Xuất File Save" trước để giữ bản hiện tại.');
    if (!ok) { reset(); return; }
    applySave(d);
    reset();
    syncHUD();
    fillInventoryGrid();
    showToast('📥 Đã nạp ' + f.name + ' · Lv.' + S.level + ' · ' + n + '/' + STAGES.length + ' ải · ' + S.coin.toLocaleString() + ' Coin');
    chord([620, 780, 920]);
  };
  rd.readAsText(f, 'utf-8');
}
window.addEventListener('beforeunload', saveGame);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });

/* ====================================================
   🔥 ẢI CUỐI: ĐẠI SỰ CỐ — BÁO ĐỘNG ĐỎ DATA CENTER (3 PHA)
   ==================================================== */
const BOSS_Q = [
  { tag: 'NETWORK', q: 'Máy kế toán ping được gateway nhưng KHÔNG ra được Internet. Lỗi nằm ở đâu?',
    a: ['Đứt cáp mạng LAN', 'Thiếu NAT Overload trên router', 'Hỏng card mạng', 'Sai mật khẩu wifi'], c: 1 },
  { tag: 'HELPDESK', q: 'Khách báo máy in không in được, đèn báo lỗi nháy đỏ liên tục. Xếp vào nhóm nào?',
    a: ['Network', 'Hardware', 'Software', 'Account'], c: 1 },
  { tag: 'DATA CENTER', q: 'Theo sơ đồ đấu cáp, SRV-DB01 phải nối vào cổng switch nào?',
    a: ['Gi0/1', 'Gi0/2', 'Gi0/4', 'Gi0/9'], c: 2 },
  { tag: 'WIRELESS', q: 'AP-01 đang phát ở kênh 1. Chọn kênh nào cho AP-02 để KHÔNG chồng lấn?',
    a: ['Kênh 2', 'Kênh 4', 'Kênh 6', 'Kênh 1'], c: 2 },
  { tag: 'ISP', q: 'Trong kết quả traceroute, hop nào đi NGAY SAU "ISP BRAS"?',
    a: ['PC của bạn', 'Router nhà', 'Core Router ISP', 'DNS Google'], c: 2 },
  { tag: 'CCNA', q: 'Subnet /27 có bao nhiêu địa chỉ host sử dụng được?',
    a: ['30', '32', '14', '62'], c: 0 },
  { tag: 'NETWORK', q: 'Lệnh nào dùng để kiểm tra bảng NAT đang hoạt động trên Cisco IOS?',
    a: ['show ip nat translations', 'show arp', 'show vlan brief', 'show version'], c: 0 },
  { tag: 'HARDWARE', q: 'Ổ cứng kêu lạch cạch, máy khởi động rất chậm. Xử lý đúng nhất là gì?',
    a: ['Cài lại Windows ngay', 'Sao lưu dữ liệu rồi thay ổ cứng', 'Tăng thêm RAM', 'Đổi mật khẩu user'], c: 1 },
  { tag: 'CCNA', q: 'Thiết bị nào nối 2 mạng IP khác nhau và chọn đường đi cho gói tin?',
    a: ['Switch Layer 2', 'Hub', 'Router', 'Access Point'], c: 2 },
  { tag: 'WIRELESS', q: 'Wifi yếu ở phòng họp trong khi AP đặt tận sảnh. Cách xử lý hợp lý nhất?',
    a: ['Đổi mật khẩu wifi', 'Thêm AP hoặc chỉnh lại vị trí/kênh', 'Đổi tên SSID', 'Tắt băng tần 5GHz'], c: 1 },
  { tag: 'CCNA', q: 'Cổng (port) mặc định của SSH là bao nhiêu?',
    a: ['21', '22', '23', '443'], c: 1 },
  { tag: 'WIRELESS', q: 'Hai Access Point cùng phát trên kênh 6 sẽ gây ra hiện tượng gì?',
    a: ['Không ảnh hưởng gì', 'Nhiễu sóng, mạng chập chờn', 'Tăng gấp đôi tốc độ', 'AP tự đổi kênh'], c: 1 }
];
const BOSS_SECS = 180;
const BOSS_TITLE = 'Chuyên gia Mạng CCNA · Vua Cứu Mạng City';
const BOSS_PHASES = [
  { short: '1 · CÔ LẬP CỔNG LOOP' },
  { short: '2 · BẤM CÁP DỰ PHÒNG' },
  { short: '3 · ĐỊNH TUYẾN KHẨN CẤP' }
];
/* 4 cổng nghi ngờ trên SW-CORE-01 — 1 cổng loop, 2 cổng lưu lượng cao hợp lệ */
const SW_POOL = [
  { p: 6, d: 'PC-KETOAN-03', v: 'VLAN 20' },
  { p: 12, d: 'SRV-UPLINK', v: 'TRUNK' },
  { p: 17, d: 'CAM-POE-04', v: 'VLAN 30' },
  { p: 22, d: 'AP-SALE-F2', v: 'VLAN 40' }
];
const BOSS_ROUTES = [
  { dest: '0.0.0.0', len: 0, note: 'default route ra Internet', want: 0 },
  { dest: '10.10.20.0', len: 24, note: 'VLAN 20 · Kế toán', want: 1 },
  { dest: '10.10.30.0', len: 24, note: 'VLAN 30 · Kinh doanh', want: 2 },
  { dest: '172.16.5.0', len: 29, note: 'DMZ · khối server', want: 3 }
];
const BOSS_CANDS = [
  '203.0.113.1 · ISP', '10.0.0.1 · R1-CORE', '10.0.0.14 · WAN-BKP',
  '10.0.0.26 · SRV-DB01', '169.254.0.1 · APIPA', '224.0.0.5 · OSPF'
];
const BOSS_TAGS = [['NETWORK', 'CCNA', 'HELPDESK'], ['HARDWARE', 'DATA CENTER'], ['ISP', 'WIRELESS', 'NETWORK', 'CCNA']];
var bossState = null;

function bossShuf(a) { return a.slice().sort(() => Math.random() - .5); }
function bossFresh() {
  const cand = bossShuf(SW_POOL);
  const pick = k => bossShuf(BOSS_Q.filter(q => BOSS_TAGS[k].indexOf(q.tag) >= 0));
  const secs = BOSS_SECS + shopTime();   // 🗜️ Kìm bấm xịn: +20 giây
  return {
    phase: 1, mode: 'act', done: false, lost: false, miss: 0, cmdErr: 0, hp: 3, logs: [], secs,
    deadline: performance.now() + secs * 1000, left: secs, t0: performance.now(),
    solved: [false, false, false], checked: [false, false, false], q: null, qi: 0, qPick: -1, qs: [pick(0), pick(1), pick(2)],
    ios: 'priv', selIf: -1, down: [], loop: cand[0].p - 1, busy: [cand[1].p - 1, cand[2].p - 1],
    pins: Array(8).fill(null), disp2: bossShuf([0, 1, 2, 3, 4, 5, 6, 7]), errPin: -1, errT: -9,
    disp3: bossShuf([0, 1, 2, 3, 4, 5]), filled: BOSS_ROUTES.map(() => null), selRow: -1, errRow: -1, errT3: -9
  };
}
function bossEsc(s) { return String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function bossPrompt() {
  const i = bossState.ios;
  return i === 'config' ? 'Switch(config)#' : i === 'if' ? 'Switch(config-if)#' : 'Switch#';
}
function bossLog(html) {
  bossState.logs.push(html);
  if (bossState.logs.length > 9) bossState.logs.shift();
}
function bossBusy() { return !!bossState && !bossState.done && !bossState.lost && bossState.mode === 'act'; }
function bossPortName(i) {
  const c = SW_POOL.find(p => p.p === i + 1);
  return c ? c.d + ' · ' + c.v : 'access port';
}

function openBoss() {
  const cur = currentStage();
  if (!DEV.on && cur && cur.s.id !== 'boss') {
    showToast('🔒 Cần hoàn thành Ải ' + (cur.i + 1) + ' — ' + cur.s.name + ' trước!');
    beep(200, 'square', 0.16, 0.035);
    return;
  }
  if (bossState && bossState.done && !S.missionsDone.boss) { bossVictory(); return; }
  closeAll();
  document.getElementById('boss-modal').style.display = 'flex';
  document.getElementById('app').classList.add('ba-on');
  bossStart();
  beep(240, 'sawtooth', 0.3, 0.05);
}
function resetBoss() {
  if (mgVis('boss-modal')) { bossStart(); return; }
  openBoss();
}
function bossStart() {
  bossState = bossFresh();
  bossLog('<span class="bad">⚠ SYSLOG · %STORM_CONTROL-3-FILTERED: broadcast storm 12,480 bcast/s trên VLAN 10</span>');
  bossLog('<span class="bad">%SW_MATRIX-4-MACFLAP: một MAC liên tục đổi cổng — có vòng lặp layer 2 trong Data Center</span>');
  bossLog('<span class="warn">Chị Lan (NOC): "Toàn thành phố đang sập vì loop. 3 phút (180 giây), ba bước: cô lập cổng loop → bấm lại cáp dự phòng → dựng lại bảng định tuyến."</span>');
  bossLog('<span class="cmd">Switch#</span>');
  renderBoss();
}

/* ---------- đồng hồ 90 giây — chạy theo rAF của mg-art.js ---------- */
function bossTick() {
  const st = bossState;
  if (!st || st.done || st.lost) return;
  const left = Math.max(0, Math.ceil((st.deadline - performance.now()) / 1000));
  if (left !== st.left) { st.left = left; bossClock(left); }
  if (left === 0) bossFail('⏱ HẾT THỜI GIAN — bão broadcast nhấn chìm toàn Data Center.');
}
function bossClock(left) {
  const el = document.getElementById('boss-time'), box = document.getElementById('boss-clock'), bar = document.getElementById('boss-bar');
  const tot = (bossState && bossState.secs) || BOSS_SECS;
  if (el) el.innerText = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
  if (box) { box.classList.toggle('warn', left <= 30 && left > 12); box.classList.toggle('crit', left <= 12); }
  if (bar) {
    bar.style.width = (left / tot * 100) + '%';
    bar.style.background = left <= 12 ? 'linear-gradient(90deg,#ef4444,#f87171)'
      : left <= 30 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#22c55e,#86efac)';
  }
}
function bossCmdErr() { if (bossState && bossState.phase === 1) bossState.cmdErr++; }
function bossPenalty(sec, msg) {
  const st = bossState;
  st.deadline -= sec * 1000; st.miss++;
  bossLog('<span class="bad">✗ ' + msg + ' <b>−' + sec + 's</b></span>');
  beep(160, 'sawtooth', 0.2, 0.04);
  const body = document.querySelector('#boss-modal .ba-body');
  if (body) { body.classList.remove('ba-flash'); void body.offsetWidth; body.classList.add('ba-flash'); }
}
function bossDamage(sec, msg) {
  const st = bossState;
  st.hp--;
  bossPenalty(sec, msg);
  if (st.hp <= 0) { bossFail('💔 ĐỘ ỔN ĐỊNH VỀ 0 — switch tự cô lập, mất quyền cấu hình.'); return false; }
  return true;
}
function bossFail(reason) {
  const st = bossState;
  if (!st || st.lost || st.done) return;
  st.lost = true; st.mode = 'lost';
  bossLog('<span class="bad">' + reason + '</span>');
  bossLog('<span class="warn">Bấm "KHỞI ĐỘNG LẠI" để bước lại ca trực — bạn đã biết phải làm gì rồi.</span>');
  showBanner('BÁO ĐỘNG ĐỎ', '💥 ĐẠI SỰ CỐ CHƯA ĐƯỢC KHỐNG CHẾ', reason, 'red');
  renderBoss();
}

/* ---------- PHA 1: CLI cô lập cổng loop ---------- */
function bossClickPort(i) {
  const st = bossState;
  if (!st || st.mode !== 'act' || st.phase !== 1 || st.done || st.lost) return;
  st.selIf = i;
  bossLog('<span class="sys">Chuột chọn cổng → Gi0/' + (i + 1) + ' · ' + bossPortName(i) + '</span>');
  beep(660, 'sine', 0.05, 0.03);
  renderBoss();
}
function bossIntfTable() {
  const st = bossState;
  st.busy.concat([st.loop]).sort((a, b) => a - b).forEach(p => {
    const c = SW_POOL.find(x => x.p === p + 1), loop = p === st.loop, down = st.down.includes(p);
    bossLog('<span class="' + (loop && !down ? 'bad' : down ? 'warn' : 'ok') + '">Gi0/' + (p + 1) + '  ' +
      (c.d + '          ').slice(0, 14) + ' ' + (c.v + '    ').slice(0, 6) + ' ' +
      (down ? 'adm-down  ' : 'connected ') + ' ' + (loop ? '12,480 bcast/s ◀ LOOP' : '   310 bcast/s') + '</span>');
  });
  bossLog('<span class="warn">Cổng loop = bộ đếm broadcast gấp ~40 lần và cáp quay về chính switch. shutdown nó: configure terminal → interface gi0/x → shutdown.</span>');
}
function bossCmd(raw) {
  const st = bossState;
  if (!st) return;
  const s = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!s || st.mode !== 'act' || st.done || st.lost) return;
  bossLog('<span class="cmd">' + bossPrompt() + ' ' + bossEsc(s) + '</span>');
  const l = s.toLowerCase();
  if (l === 'help' || l === '?') {
    bossLog('<span class="sys">Lệnh khả dụng: show interfaces status · configure terminal · interface gi0/&lt;1-24&gt; · shutdown · no shutdown · exit</span>');
  } else if (/^e(n|nable)$/.test(l)) {
    bossLog('<span class="ok">Bạn đã ở privileged EXEC mode.</span>');
  } else if (/^(s|sh|show)\s+(i|in|int|interfaces)/.test(l)) {
    bossIntfTable();
  } else if (/^(conf|configure)\s+(t|te|ter|term|terminal)?$/.test(l)) {
    st.ios = 'config';
    bossLog('<span class="ok">Enter configuration commands, one per line. End with CNTL/Z.</span>');
  } else if (/^(shut|shutdown)$/.test(l)) {
    if (st.ios !== 'if') { bossCmdErr(); bossLog('<span class="bad">Lệnh chỉ chạy được trong cấu hình interface — chọn cổng trước.</span>'); }
    else bossShutdown();
  } else if (/^no\s+(shut|shutdown)$/.test(l)) {
    if (st.ios !== 'if') { bossCmdErr(); bossLog('<span class="bad">Lệnh chỉ chạy được trong cấu hình interface.</span>'); }
    else if (!st.down.includes(st.selIf)) { bossCmdErr(); bossLog('<span class="warn">Cổng này đâu có down — không cần no shutdown.</span>'); }
    else {
      st.down = st.down.filter(x => x !== st.selIf);
      st.deadline -= 4000; st.miss++;
      bossLog('<span class="ok">%LINK-5-CHANGED: Interface Gi0/' + (st.selIf + 1) + ', changed state to up</span><span class="warn">Khôi phục cổng nhầm: −4s</span>');
    }
  } else if (l === 'exit' || l === 'end') {
    st.ios = l === 'end' ? 'priv' : (st.ios === 'if' ? 'config' : 'priv');
  } else {
    const m = l.match(/^(?:int(?:erface)?)?\s*(?:gigabitethernet|gi|gig|g)?\s*0?\s*\/\s*(\d{1,2})$/) || l.match(/^int(?:erface)?\s+(\d{1,2})$/);
    if (!m) { bossCmdErr(); bossLog('<span class="bad">^&nbsp;&nbsp;% Invalid input detected at &apos;^&apos; marker.</span>'); }
    else if (+m[1] < 1 || +m[1] > 24) { bossCmdErr(); bossLog('<span class="bad">%INVALID INPUT: interface gi0/' + m[1] + ' không tồn tại (1-24).</span>'); }
    else {
      st.ios = 'if'; st.selIf = +m[1] - 1;
      bossLog('<span class="ok">Configuring interface Gi0/' + m[1] + ' — ' + bossPortName(st.selIf) + '</span>');
    }
  }
  renderBoss();
}
function bossShutdown() {
  const st = bossState, p = st.selIf;
  st.down.push(p);
  if (p === st.loop) {
    st.solved[0] = true; st.ios = 'priv'; st.mode = 'act';
    if (!st.cmdErr) achUnlock('cli');
    bossLog('<span class="ok">%LINK-5-CHANGED: Interface Gi0/' + (p + 1) + ', changed state to administratively down</span>');
    bossLog('<span class="ok">%STORM_CONTROL-6-STOPPED: broadcast flood dừng — 12,480 → 38 bcast/s</span>');
    bossLog('<span class="sys">✔ PHA 1 HOÀN THÀNH · vòng layer-2 đã bị cô lập</span>');
    mgBurst('boss-cv', BS.p1.x0 + (p % BS.p1.cols) * BS.p1.pitch, BS.p1.rowY(p < BS.p1.cols ? 0 : 1), '#4ade80', 14);
    chord([660, 880, 1100]);
    bossAskCheck(0);
    return;
  }
  const name = bossPortName(p);
  bossCmdErr();
  if (bossDamage(10, 'Bạn vừa tắt <b>Gi0/' + (p + 1) + ' · ' + name + '</b> — cổng đang carrying traffic hợp lệ!')) {
    bossLog('<span class="warn">Khôi phục: interface gi0/' + (p + 1) + ' → no shutdown (−4s)</span>');
  }
}

/* ---------- thưởng +10s rồi chuyển thẳng pha kế tiếp (không còn câu hỏi phụ) ---------- */
function bossAskCheck(k) {
  const st = bossState;
  if (st.lost || st.done) return;
  st.checked[k] = true;
  st.deadline += 10000;
  bossLog('<span class="ok">✔ Pha ' + (k + 1) + ' hoàn thành — thưởng +10s cho ca trực. Chuyển sang pha tiếp theo…</span>');
  beep(880, 'sine', 0.09, 0.04);
  bossAdvance(k);
}
function bossAdvance(k) {
  const st = bossState;
  if (st.lost || st.done) return;
  st.mode = 'act';
  if (k < 2) {
    st.phase = k + 2; st.selRow = -1; st.selIf = -1; st.ios = 'priv';
    bossLog(k === 0
      ? '<span class="bad">⚠ Anh Khoa (DC): "Cáp uplink sang rack B đứt rồi! Bấm lại đầu dự phòng theo chuẩn T568B — sai 1 lõi là không thông."</span>'
      : '<span class="bad">⚠ Chị Lan (NOC): "Bảng định tuyến trên R1 bốc hơi theo cơn bão. Dựng lại 4 đường đi khẩn cấp, chọn đúng next-hop."</span>');
    beep(420, 'triangle', 0.12, 0.04);
  } else {
    st.done = true; st.mode = 'won';
    bossLog('<span class="ok">✔ PHA 3 HOÀN THÀNH · toàn bộ đường đi hồi sinh — traffic chảy trở lại.</span>');
    bossLog('<span class="sys">🏆 ĐẠI SỰ CỐ ĐƯỢC KHỐNG CHẾ. Bấm "KẾT THÚC ĐẠI SỰ CỐ" để xem báo cáo chiến thắng.</span>');
    showBanner('BÁO ĐỘNG ĐỎ ĐÃ GỠ', '🏆 ĐẠI SỰ CỐ ĐƯỢC KHỐNG CHẾ', 'Bấm "KẾT THÚC ĐẠI SỰ CỐ" trong bảng ải cuối', 'green');
    chord([660, 880, 1100, 1320]);
  }
  renderBoss();
}

/* ---------- PHA 2: bấm lại cáp dự phòng ---------- */
function bossWire(k) {
  const st = bossState;
  if (!st || st.phase !== 2 || st.mode !== 'act' || st.lost || st.done) return;
  const idx = st.disp2[k], next = st.pins.filter(Boolean).length;
  if (idx < next) return;
  if (idx !== next) {
    st.errPin = idx; st.errT = MGX.t;
    bossDamage(7, 'Sai thứ tự T568B — pin ' + (next + 1) + ' phải là <b>' + T568B[next].name + '</b>, không phải ' + T568B[idx].name + '.');
    mgBurst('boss-cv', BS.p2.chX(next), BS.p2.chTop + 40, '#ef4444', 7);
    renderBoss(); return;
  }
  st.pins[next] = T568B[idx];
  mgBurst('boss-cv', BS.p2.chX(next), BS.p2.chTop + 40, '#4ade80', 9);
  beep(760 + next * 40, 'sine', 0.07, 0.035);
  bossLog('<span class="ok">Pin ' + (next + 1) + ': ' + T568B[idx].name + ' — lõi đồng chạm sát mặt tiếp xúc</span>');
  if (next === 7) {
    st.solved[1] = true;
    bossLog('<span class="sys">Cable tester: PASS 8/8 · link Gi0/24 up 1000Mb full duplex</span>');
    chord([660, 880, 1100]);
    bossAskCheck(1);
  }
  renderBoss();
}
function bossWireClear() {
  const st = bossState;
  if (!bossBusy() || st.phase !== 2) return;
  if (st.pins.some(Boolean)) { st.pins = Array(8).fill(null); bossPenalty(5, 'Rút hết 8 lõi khỏi đầu bấm.'); }
  renderBoss();
}
function bossPinHint(i) {
  const st = bossState, next = st.pins.filter(Boolean).length;
  if (st.pins[i]) { bossLog('<span class="warn">Pin ' + (i + 1) + ' đã có lõi <b>' + st.pins[i].name + '</b>.</span>'); return; }
  if (i !== next) { bossLog('<span class="warn">Bấm thẻ dây theo thứ tự — lõi tiếp theo phải vào pin ' + (next + 1) + '.</span>'); return; }
  bossLog('<span class="cmd">Pin ' + (i + 1) + ' đang chờ: <b>' + T568B[i].name + '</b> — bấm thẻ dây đó bên trên.</span>');
  renderBoss();
}

/* ---------- PHA 3: bảng định tuyến khẩn cấp ---------- */
function bossMask(len) {
  if (len === 0) return '0.0.0.0';
  const b = [];
  for (let i = 0; i < 4; i++) b.push(len >= 8 * (i + 1) ? 255 : len <= 8 * i ? 0 : 256 - Math.pow(2, 8 * (i + 1) - len));
  return b.join('.');
}
function bossRow(k) {
  const st = bossState;
  if (!st || st.phase !== 3 || st.mode !== 'act' || st.lost || st.done) return;
  if (st.filled[k] != null) { bossLog('<span class="warn">Dòng ' + BOSS_ROUTES[k].dest + ' đã có next-hop.</span>'); return; }
  st.selRow = k;
  bossLog('<span class="cmd">R1-EMG(config)# ip route ' + BOSS_ROUTES[k].dest + ' ' + bossMask(BOSS_ROUTES[k].len) + ' &lt;next-hop&gt;</span>');
  beep(620, 'sine', 0.05, 0.03);
  renderBoss();
}
function bossCand(col) {
  const st = bossState;
  if (!st || st.phase !== 3 || st.mode !== 'act' || st.lost || st.done) return;
  const idx = st.disp3[col];
  if (st.selRow < 0) { bossLog('<span class="warn">Bấm một dòng đích trong bảng trước đã.</span>'); beep(300, 'square', 0.1, 0.03); return; }
  const r = BOSS_ROUTES[st.selRow];
  if (r.want === idx) {
    st.filled[st.selRow] = idx; st.selRow = -1;
    mgBurst('boss-cv', BS.p3.chipX(col) + BS.p3.chipW / 2, BS.p3.chipY + 12, '#4ade80', 10);
    beep(880, 'sine', 0.08, 0.04);
    bossLog('<span class="ok">%ROUTE-5-INSTALLED: ip route ' + r.dest + '/' + r.len + ' → ' + BOSS_CANDS[idx] + '</span>');
    if (st.filled.every(v => v != null)) {
      st.solved[2] = true;
      bossLog('<span class="sys">show ip route: 4 đường đã cài — cả thành phố ra Internet trở lại</span>');
      chord([660, 880, 1100]);
      bossAskCheck(2);
    }
  } else {
    st.errRow = st.selRow; st.errT3 = MGX.t;
    bossDamage(7, '<b>' + BOSS_CANDS[idx] + '</b> không phải next-hop của ' + r.dest + '/' + r.len + ' — gói tin sẽ đi sai đường.');
  }
  renderBoss();
}
function bossRoutePrint() {
  const st = bossState;
  if (!st) return;
  bossLog('<span class="cmd">R1-EMG# show ip route</span>');
  BOSS_ROUTES.forEach((r, k) => {
    const f = st.filled[k];
    bossLog('<span class="' + (f == null ? 'warn' : 'ok') + '">' + (f == null ? 'O*' : 'C>') + '   ' + r.dest + '/' + r.len +
      '  [110/0] via ' + (f == null ? '··· chưa có đường ··' : BOSS_CANDS[f]) + ' · ' + r.note + '</span>');
  });
  renderBoss();
}
function bossRouteClear() {
  const st = bossState;
  if (!bossBusy() || st.phase !== 3) return;
  if (st.filled.some(v => v != null)) { st.filled = BOSS_ROUTES.map(() => null); st.selRow = -1; bossPenalty(5, 'Xóa trắng bảng định tuyến.'); }
  renderBoss();
}

/* ---------- scene cho mg-art.js ---------- */
function bossScene() {
  const st = bossState, common = { phase: st.phase, heat: st.left <= 20 && !st.done ? 1 : 0, hint: st.mode === 'act' && !st.done && !st.lost };
  if (st.phase === 1) {
    const hov = MGX.bs.in && MGX.bs.kind === 'port' ? MGX.bs.k : -1;
    const stopped = st.down.includes(st.loop);
    return Object.assign(common, {
      loop: st.loop, storm: st.busy, down: st.down, sel: st.selIf,
      rate: stopped ? 38 : 12480 + Math.round(Math.sin(MGX.t * 7) * 820),
      hoverName: hov >= 0 ? 'Gi0/' + (hov + 1) + ' · ' + bossPortName(hov) : (st.selIf >= 0 ? 'Gi0/' + (st.selIf + 1) + ' · ' + bossPortName(st.selIf) + ' (đã chọn)' : 'Bấm vào cổng để chọn interface')
    });
  }
  if (st.phase === 2) {
    return Object.assign(common, {
      pins: st.pins, order: T568B, disp: st.disp2, sel: -1, filledN: st.pins.filter(Boolean).length,
      nextPin: st.pins.filter(Boolean).length, errPin: st.errPin, errT: st.errT, done: st.solved[1]
    });
  }
  const usedCols = st.disp3.map((idx, k) => st.filled.indexOf(idx) >= 0 ? k : -1).filter(k => k >= 0);
  return Object.assign(common, {
    routes: BOSS_ROUTES, cands: BOSS_CANDS, disp: st.disp3, filled: st.filled,
    filledN: st.filled.filter(v => v != null).length, usedCols: usedCols,
    selRow: st.selRow, errRow: st.errRow, errT: st.errT3, done: st.solved[2]
  });
}

/* ---------- render DOM ---------- */
function bossChips() {
  const st = bossState;
  if (st.mode === 'won') return '<span class="ba-prompt">🏆</span><span class="ba-chip on" style="cursor:default">3/3 pha hoàn tất — bấm KẾT THÚC ĐẠI SỰ CỐ để xem báo cáo</span>';
  if (st.mode === 'lost') return '<span class="ba-prompt">✗</span><span class="ba-chip" style="cursor:default">Ca trực thất bại — bấm KHỞI ĐỘNG LẠI để làm lại từ đầu</span>';
  if (st.phase === 1) {
    const p = st.selIf >= 0 ? st.selIf + 1 : st.loop + 1;   // tự điền cổng loop nếu người chơi chưa bấm cổng
    const shut = st.selIf >= 0 && st.down.includes(st.selIf);
    return `<span class="ba-prompt">${bossPrompt()}</span>
      <input id="boss-cmd" autocomplete="off" spellcheck="false" placeholder="gõ lệnh IOS rồi Enter…" />
      <button class="ba-chip" data-g="show" onclick="bossCmd('show interfaces status')">show int status</button>
      <button class="ba-chip" data-g="conf" onclick="bossCmd('configure terminal')" ${st.ios !== 'priv' ? 'disabled' : ''}>configure terminal</button>
      <button class="ba-chip" data-g="intf" onclick="bossCmd('interface gi0/${p}')" ${st.ios === 'if' ? 'disabled' : ''}>interface gi0/${p}</button>
      <button class="ba-chip${shut ? '' : ' go'}" data-g="shut" onclick="bossCmd('${shut ? 'no shutdown' : 'shutdown'}')" ${st.ios !== 'if' ? 'disabled' : ''}>${shut ? 'no shutdown' : 'shutdown'}</button>`;
  }
  if (st.phase === 2) {
    return `<span class="ba-prompt">T568B · ${st.pins.filter(Boolean).length}/8</span>
      <button class="ba-chip" onclick="bossWireClear()">↩ rút lại đầu bấm</button>`;
  }
  return `<span class="ba-prompt">R1-EMG</span>
    <button class="ba-chip" onclick="bossRoutePrint()">show ip route</button>
    <button class="ba-chip" onclick="bossRouteClear()">↩ xóa bảng route</button>`;
}
/* ---------- thanh HƯỚNG DẪN 1 DÒNG (gọn, không tràn) ---------- */
function bossGuideStyle() {
  if (document.getElementById('boss-guide-style')) return;
  const s = document.createElement('style'); s.id = 'boss-guide-style';
  s.textContent = `
  .ba-guide{height:34px;min-height:34px;margin:2px 0 4px;padding:0 14px;border-radius:9px;
    display:flex;align-items:center;overflow:hidden;
    background:linear-gradient(90deg,#241704,#0c1120);border:1.5px solid rgba(250,204,21,.6);
    box-shadow:0 3px 12px rgba(0,0,0,.5)}
  .ba-g-lead{font-size:13.5px;line-height:1;font-weight:800;color:#fde68a;white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;text-shadow:0 0 8px rgba(250,204,21,.35)}
  .ba-cmds .ba-chip.hl{border-color:#facc15 !important;color:#fff !important;
    box-shadow:0 0 0 2px rgba(250,204,21,.95),0 0 14px 4px rgba(250,204,21,.6);
    animation:baGlow 1s ease-in-out infinite}
  @keyframes baGlow{0%,100%{box-shadow:0 0 0 2px rgba(250,204,21,.95),0 0 0 0 rgba(250,204,21,.9)}
    50%{box-shadow:0 0 0 2px rgba(250,204,21,.95),0 0 16px 6px rgba(250,204,21,.6)}}`;
  document.head.appendChild(s);
}
function bossGuideInfo(st) {
  if (!st) return null;
  const loop = 'Gi0/' + (st.loop + 1);
  if (st.mode === 'won') return { lead: '🏆 Xong cả 3 pha — bấm [KẾT THÚC ĐẠI SỰ CỐ] để nhận danh hiệu.', hl: null };
  if (st.mode === 'lost') return { lead: '💥 Ca trực thất bại — bấm [KHỞI ĐỘNG LẠI] rồi làm theo bước đang nhấp nháy vàng.', hl: null };
  if (st.phase === 1) {
    if (st.ios === 'if') return { lead: '👉 BƯỚC 3: Bấm [shutdown] để cô lập cổng loop ' + loop + ' → xong Pha 1.', hl: 'shut' };
    if (st.ios === 'config') return { lead: '👉 BƯỚC 2: Bấm [interface ' + loop + '] — hệ thống đã tự chọn đúng cổng loop.', hl: 'intf' };
    return { lead: '👉 BƯỚC 1: Click cổng đỏ [' + loop + '] trên Switch → rồi bấm [configure terminal].', hl: 'conf' };
  }
  if (st.phase === 2) {
    const next = st.pins.filter(Boolean).length, nm = T568B[next] ? T568B[next].name : '';
    return { lead: next < 8 ? ('👉 Bấm thẻ dây cho PIN ' + (next + 1) + ' = ' + nm + ' (đang nhấp nháy vàng).') : '👉 Sắp xong — kiểm tra 8/8 lõi đã vào đúng thứ tự T568B.', hl: null };
  }
  if (st.selRow < 0) return { lead: '👉 BƯỚC 1: Bấm một DÒNG ĐÍCH đang trống trong bảng định tuyến.', hl: null };
  const r = BOSS_ROUTES[st.selRow];
  return { lead: '👉 BƯỚC 2: Bấm thẻ next-hop ĐÚNG cho ' + r.dest + '/' + r.len + ' (' + r.note + ').', hl: null };
}
function renderBossGuide(st) {
  const cmds = document.getElementById('boss-cmds');
  if (!cmds || !cmds.parentNode) return;
  let gb = document.getElementById('boss-guide');
  if (!gb) { gb = document.createElement('div'); gb.id = 'boss-guide'; gb.className = 'ba-guide'; cmds.parentNode.insertBefore(gb, cmds); }
  const info = bossGuideInfo(st);
  if (!info) { gb.style.display = 'none'; return; }
  gb.style.display = '';
  gb.innerHTML = '<div class="ba-g-lead">' + bossEsc(info.lead) + '</div>';
  cmds.querySelectorAll('.ba-chip.hl').forEach(el => el.classList.remove('hl'));
  if (info.hl) { const b = cmds.querySelector('.ba-chip[data-g="' + info.hl + '"]'); if (b && !b.disabled) b.classList.add('hl'); }
}
function renderBoss() {
  const st = bossState;
  if (!st) return;
  const box = document.getElementById('boss-cmds'), old = box.querySelector('#boss-cmd');
  const keep = old && old.value, focused = old && document.activeElement === old;
  box.innerHTML = bossChips();
  const inp = box.querySelector('#boss-cmd');
  if (inp) {
    if (keep) inp.value = keep;
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') { const v = inp.value; inp.value = ''; bossCmd(v); }
    });
    if (focused) inp.focus();
  }
  bossGuideStyle(); renderBossGuide(st);
  const logEl = document.getElementById('boss-log');
  logEl.innerHTML = st.logs.slice(-6).map(l => '<div>' + l + '</div>').join('');
  logEl.scrollTop = logEl.scrollHeight;   // luôn hiển thị trọn dòng mới nhất, không cắt nửa chữ
  document.getElementById('boss-hearts').innerText = '❤️'.repeat(Math.max(0, st.hp)) + '🖤'.repeat(Math.max(0, 3 - st.hp));
  document.getElementById('ba-phases').innerHTML = BOSS_PHASES.map((p, k) => {
    const cls = st.solved[k] ? 'done' : (st.phase === k + 1 && !st.lost && !st.done ? 'cur' : '');
    return `<span class="ba-pill ${cls}">${st.solved[k] ? '✔' : (k + 1)} · ${p.short.split('·')[1].trim()}</span>`;
  }).join('');
  document.getElementById('ba-mode').innerText =
    st.mode === 'won' ? 'STORM CONTAINED · CA TRỰC KẾT THÚC'
      : st.mode === 'lost' ? 'MẠNG SẬP · CA TRỰC THẤT BẠI'
        : 'BÁO ĐỘNG ĐỎ · PHA ' + st.phase + '/3';
  bossClock(st.left);
  document.getElementById('boss-finish-btn').disabled = !st.done;
}

/* ---------- màn kết thúc ---------- */
function bossVictory() {
  const st = bossState;
  if (!st || !st.done) { showToast('⚠️ Hãy hoàn thành đủ 3 pha trước đã!'); return; }
  closeAll();
  MGX.fw = []; MGX.fwWave = -1; MGX.fx = [];
  const used = st.used = Math.min(st.secs, Math.round((performance.now() - st.t0) / 1000));
  document.getElementById('vic-time').innerText = String(Math.floor(used / 60)).padStart(2, '0') + ':' + String(used % 60).padStart(2, '0');
  document.getElementById('vic-meta').innerHTML = [
    ['PHA', '3/3'], ['SAI SÓT', st.miss], ['ỔN ĐỊNH', st.hp + '/3'],
    ['THƯỞNG', '+300 XP · +3,000 Coin'], ['KỸ NĂNG', 'tất cả +1']
  ].map(m => `<span>${m[0]}: <b>${m[1]}</b></span>`).join('');
  document.getElementById('victory-modal').style.display = 'flex';
  document.getElementById('app').classList.remove('ba-on');
  showBanner('NETWORK CITY ĐÃ THÔNG MẠNG', '👑 VUA CỨU MẠNG CITY', 'Broadcast Storm bị khống chế trong ' + used + ' giây', 'violet');
  chord([660, 880, 1100, 1320, 1760]);
}
function bossFinish() {
  const st = bossState;
  if (!st || !st.done) { showToast('⚠️ Cần hoàn thành đủ 3 pha!'); return; }
  const ok = finishMission('boss', 900, 3000, null, 'Chị Lan', 'Giám đốc Vận hành',
    `🔥 <b>ĐẠI SỰ CỐ ĐÃ ĐƯỢC KHỐNG CHẾ!</b>\nEm cô lập cổng loop, bấm lại cáp dự phòng và dựng lại bảng định tuyến chỉ trong ${Math.min(bossState.secs, Math.round((performance.now() - bossState.t0) / 1000))} giây.\n🎁 Nhận: <b>+300 EXP | +3,000 Coin | TẤT CẢ KỸ NĂNG +1</b>`);
  if (ok) {
    Object.keys(S.skills).forEach(k => { S.skills[k] = Math.min(5, S.skills[k] + 1); });
    S.title = BOSS_TITLE;
    achUnlock('legend');
    syncHUD(); saveGame();
    setTimeout(() => showBanner('HOÀN THÀNH TOÀN BỘ', '🏆 ' + STAGES.length + '/' + STAGES.length + ' ẢI', 'Bạn là anh hùng của Network City — ' + BOSS_TITLE + '!', 'violet'), 800);
  }
}
function bossLeave() {
  const app = document.getElementById('app');
  if (app) app.classList.remove('ba-on');
}

/* ====================================================
   🎓 CHỨNG CHỈ CCNA — modal bản in + tải PNG
   ==================================================== */
const CERT_FILE = 'chung-chi-ccna.png';
const CERT_SKILLS = [
  ['networking', 'MẠNG'], ['hardware', 'P.CỨNG'], ['crimping', 'BẤM CÁP'],
  ['troubleshooting', 'SỬA LỖI'], ['wireless', 'WIFI'], ['datacenter', 'DATA C.']
];
const certPad = n => String(n).padStart(2, '0');
const certFmt = s => certPad(Math.floor(s / 60)) + ':' + certPad(s % 60);
function certHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function certScene() {
  const d = new Date(), y = d.getFullYear();
  const dd = certPad(d.getDate()), mm = certPad(d.getMonth() + 1);
  const dateStr = dd + '/' + mm + '/' + y;
  const name = String(S.name || 'Nhân IT').trim() || 'Nhân IT';
  const used = bossState && bossState.done && bossState.used != null ? bossState.used : null;
  return {
    name,
    rankLine: S.title + ' · CẤP ' + S.level,
    body: 'đã hoàn thành xuất sắc lộ trình thực chiến 10/10 ải tại Network City: khống chế Broadcast Storm'
      + ' — sự cố loop mạng và tấn công diện rộng ở Data Center — qua 3 pha liên hoàn là cô lập cổng loop'
      + ' trên switch, bấm lại dây cáp dự phòng và dựng lại bảng định tuyến khẩn cấp'
      + (used != null ? ', toàn mạng thông trở lại sau ' + certFmt(used) + '.' : '.'),
    id: 'NC-CCNA-' + y + '-' + (1000 + certHash(name + '|' + dateStr + '|' + S.level) % 9000),
    year: y,
    placeDate: 'Network City, ngày ' + dd + ' tháng ' + mm + ' năm ' + y,
    skills: CERT_SKILLS.map(([k, label]) => ({ label, v: Math.max(1, Math.min(5, S.skills[k] || 1)) })),
    left: { name: 'Thầy Đức', role: 'Trưởng đào tạo · Học viện CCNA' },
    right: { name: 'Chị Lan', role: 'Giám đốc Vận hành Network City' }
  };
}
function openCert() {
  if (!S.missionsDone.boss && !(bossState && bossState.done)) {
    showToast('🎓 Hãy phá xong Ải 10 — Data Center để được cấp chứng chỉ!');
    return;
  }
  MGX.certBack = mgVis('victory-modal');
  closeAll();
  const sc = certScene();
  document.getElementById('cert-modal').style.display = 'flex';
  drawCert(document.getElementById('cert-cv'), sc);
  const meta = document.getElementById('cert-meta');
  meta.textContent = '';
  [['HỌ TÊN', sc.name], ['DANH HIỆU', S.title], ['CẤP ĐỘ', 'Lv.' + S.level],
   ['SỐ HIỆU', sc.id], ['NGÀY CẤP', sc.placeDate.replace('Network City, ', '')]]
    .forEach(([k, v]) => {
      const row = document.createElement('div');
      row.appendChild(document.createTextNode(k + ': '));
      const b = document.createElement('b');
      b.textContent = v;
      row.appendChild(b);
      meta.appendChild(row);
    });
  document.getElementById('cert-note').innerHTML =
    'Ảnh xuất <b>' + CERT_FILE + '</b> · 800×600 px, đúng tỉ lệ bằng khen.<br>'
    + 'Chứng chỉ vẽ 100% bằng lệnh Canvas 2D nên tải được cả khi mở game bằng <b>file://</b>.';
  chord([523, 659, 784, 1046]);
}
function closeCert() {
  const m = document.getElementById('cert-modal');
  if (m) m.style.display = 'none';
  if (MGX.certBack) {
    document.getElementById('victory-modal').style.display = 'flex';
    MGX.certBack = false;
  } else closeAll();
}
function downloadCert() {
  const run = () => {
    const btn = document.getElementById('cert-dl');
    let cv;
    try {
      cv = certCanvas(certScene());
    } catch (e) {
      showToast('⚠️ Không xuất được chứng chỉ: ' + e.message);
      return;
    }
    const grab = href => {
      const a = document.createElement('a');
      a.href = href; a.download = CERT_FILE; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    };
    const done = () => {
      showToast('⬇ Đã lưu <b>' + CERT_FILE + '</b> (800×600) về máy!');
      if (btn) { btn.disabled = false; btn.innerHTML = '⬇ TẢI ẢNH VỀ MÁY'; }
    };
    if (btn) { btn.disabled = true; btn.innerHTML = '⬇ ĐANG XUẤT…'; }
    if (cv.toBlob) {
      cv.toBlob(b => {
        if (b) {
          const u = URL.createObjectURL(b);
          grab(u);
          setTimeout(() => URL.revokeObjectURL(u), 8000);
        } else grab(cv.toDataURL('image/png'));
        setTimeout(done, 150);
      }, 'image/png');
    } else { grab(cv.toDataURL('image/png')); setTimeout(done, 150); }
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run, run); else run();
}
window.addEventListener('resize', () => {
  if (mgVis('cert-modal')) drawCert(document.getElementById('cert-cv'), certScene());
});

/* ====================================================
   🎯 HỆ THỐNG NHIỆM VỤ CHO 5 TOÀ NHÀ MỚI
   ==================================================== */
function finishMission(key, xp, coin, skill, speaker, role, text) {
  if (S.missionsDone[key]) { showToast('Bạn đã hoàn thành nhiệm vụ này rồi!'); closeAll(); return false; }
  S.missionsDone[key] = true;
  if (skill) S.skills[skill] = Math.min(5, (S.skills[skill] || 0) + 1);
  addXP(xp); addCoin(coin);
  closeAll();
  setTimeout(() => showDlg(speaker, role, text), 200);
  if (key !== 'boss') setTimeout(() => announceStage(key), 750);
  saveGame();
  return true;
}
function openBuildingGame(id) {
  const g = INTERIORS[id] && INTERIORS[id].station.game;
  if (g === 'QUIZ') openQuiz();
  else if (g === 'TICKET') openTk();
  else if (g === 'PATCH') openPt();
  else if (g === 'WIFI') openWf();
  else if (g === 'TRACE') openTr();
  else if (g === 'SOCFW') openFw();
}
function openBuildingGame2(id) {
  const g = INTERIORS[id] && INTERIORS[id].station2.game;
  if (g === 'NOCLOAD') openNc();
}
function npcDialog(id) {
  const cfg = INTERIORS[id];
  const done = buildingStatus(id) === 'done';
  showDlg(cfg.npc.name, cfg.npc.role, done ? cfg.npc.done : cfg.npc.intro);
}

/* ====================================================
   🎓 MINI-GAME 4: THI THỬ CCNA (HỌC VIỆN)
   ==================================================== */
const QUIZ = [
  { q: 'Router hoạt động ở tầng nào của mô hình OSI?',
    a: ['Tầng 1 — Physical', 'Tầng 2 — Data Link', 'Tầng 3 — Network', 'Tầng 4 — Transport'], c: 2,
    hint: 'Router làm việc với địa chỉ IP nên thuộc tầng Network (tầng 3).' },
  { q: 'Mạng 192.168.1.0/24 có bao nhiêu địa chỉ host sử dụng được?',
    a: ['256', '254', '255', '128'], c: 1,
    hint: '2^8 − 2 = 254 (trừ địa chỉ mạng và địa chỉ broadcast).' },
  { q: 'Giao thức nào tự động cấp phát địa chỉ IP cho máy khách?',
    a: ['DNS', 'DHCP', 'ARP', 'ICMP'], c: 1,
    hint: 'DHCP — Dynamic Host Configuration Protocol.' },
  { q: 'Cổng (port) mặc định của HTTPS là bao nhiêu?',
    a: ['80', '21', '443', '22'], c: 2,
    hint: 'HTTPS = HTTP + TLS, mặc định dùng cổng 443.' },
  { q: 'Câu lệnh nào lưu cấu hình đang chạy vào NVRAM trên Cisco IOS?',
    a: ['copy running-config startup-config', 'save config', 'write all memory', 'reload'], c: 0,
    hint: 'copy run start — ghi vào startup-config trong NVRAM.' },
  { q: 'Thiết bị/giải pháp nào dùng để chia nhỏ broadcast domain?',
    a: ['Hub', 'VLAN trên Switch Layer 2', 'Repeater', 'Bộ chuyển đổi quang'], c: 1,
    hint: 'Mỗi VLAN là một broadcast domain riêng.' },
  { q: 'Subnet mask nào tương ứng với tiền tố /26?',
    a: ['255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224'], c: 2,
    hint: '/26 = 26 bit 1 → 255.255.255.192.' },
  { q: 'Địa chỉ IP nào sau đây là địa chỉ private (RFC 1918)?',
    a: ['8.8.8.8', '172.32.1.1', '192.168.10.25', '203.0.113.2'], c: 2,
    hint: 'Private gồm 10.x.x.x, 172.16–172.31.x.x và 192.168.x.x.' }
];
const QUIZ_SECS = 75;
let quizState = { i: 0, score: 0, locked: false, flag: [], ans: [], deadline: 0, timeout: false };

function openQuiz() { closeAll(); resetQuiz(); document.getElementById('quiz-modal').style.display = 'flex'; beep(600); }
function resetQuiz() {
  quizState = {
    i: 0, score: 0, locked: false, flag: [], ans: [], timeout: false,
    deadline: performance.now() + QUIZ.length * QUIZ_SECS * 1000
  };
  renderQuiz();
}
function quizNext() { if (quizState.timeout) return; quizState.i++; quizState.locked = false; renderQuiz(); }
function quizLeft() { return Math.max(0, Math.ceil((quizState.deadline - performance.now()) / 1000)); }

/* đồng hồ đếm ngược — chạy theo rAF của mg-art.js */
function quizTick() {
  const st = quizState;
  if (st.timeout || st.i >= QUIZ.length) return;
  const left = quizLeft(), el = document.getElementById('quiz-time'), box = document.getElementById('quiz-clock');
  if (el) el.innerText = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  if (box) { box.classList.toggle('warn', left <= 120 && left > 30); box.classList.toggle('crit', left <= 30); }
  const bar = document.getElementById('quiz-bar');
  if (bar) bar.style.width = (left / (QUIZ.length * QUIZ_SECS) * 100) + '%';
  if (left === 0) { st.timeout = true; st.i = QUIZ.length; renderQuiz(); }
}

function renderQuizNav() {
  const st = quizState;
  const pal = document.getElementById('quiz-palette');
  if (pal) pal.innerHTML = QUIZ.map((_, k) => {
    const a = st.ans[k];
    return `<span class="qp${a ? (a.ok ? ' ok' : ' bad') : ''}${k === st.i ? ' cur' : ''}${st.flag[k] ? ' flag' : ''}">${k + 1}</span>`;
  }).join('');
  const fb = document.getElementById('quiz-flag');
  if (fb) { fb.classList.toggle('on', !!st.flag[st.i]); fb.disabled = st.i >= QUIZ.length; }
}

function toggleFlag() {
  const st = quizState;
  if (st.i >= QUIZ.length) return;
  st.flag[st.i] = !st.flag[st.i];
  beep(st.flag[st.i] ? 760 : 420, 'sine', 0.05, 0.03);
  renderQuizNav();
  document.getElementById('quiz-hint').innerHTML = st.flag[st.i]
    ? '🚩 Đã đánh dấu câu ' + (st.i + 1) + ' để xem lại khi làm xong.'
    : '💡 Bỏ đánh dấu câu ' + (st.i + 1) + '.';
}

function renderQuiz() {
  const st = quizState;
  const body = document.getElementById('quiz-body');
  const cnt = document.getElementById('quiz-count');
  const fin = document.getElementById('quiz-finish-btn');
  cnt.innerText = Math.min(st.i + 1, QUIZ.length) + '/' + QUIZ.length;
  renderQuizNav();
  if (st.i >= QUIZ.length) {
    const pass = st.score >= 6;
    const used = QUIZ.length * QUIZ_SECS - quizLeft();
    body.innerHTML = `<div class="quiz-result">
      <div class="qr-band">${st.timeout ? 'THỜI GIAN LÀM BÀI ĐÃ HẾT' : 'BÀI THI KẾT THÚC'}</div>
      <div class="quiz-score">${st.score}/${QUIZ.length}</div>
      <div class="qr-verdict ${pass ? 'pass' : 'fail'}">${pass ? 'ĐẠT — CCNA 200-301 (need 6/8)' : 'CHƯA ĐẠT — cần đúng từ 6 câu'}</div>
      <div class="qr-meta">
        <span>⏱ Thời gian dùng: <b>${String(Math.floor(used / 60)).padStart(2, '0')}:${String(used % 60).padStart(2, '0')}</b></span>
        <span>✔ Đúng: <b>${st.score}</b></span><span>✘ Sai: <b>${st.ans.filter(a => a && !a.ok).length}</b></span>
        <span>▫ Bỏ: <b>${QUIZ.length - st.ans.filter(Boolean).length}</b></span>
        <span>🚩 Flag: <b>${st.flag.filter(Boolean).length}</b></span>
      </div>
      <div class="qr-note">${pass ? 'Bấm "NHẬN CHỨNG CHỈ" để kết thúc.' : 'Bấm "THI LẠI" để làm lại đề.'}</div>
    </div>`;
    fin.disabled = !pass;
    return;
  }
  const q = QUIZ[st.i];
  body.innerHTML = `<div class="quiz-q"><span class="qq-tag">QUESTION ${st.i + 1} · SINGLE ANSWER</span>${q.q}</div>` +
    q.a.map((txt, k) => `<div class="quiz-opt" onclick="answerQuiz(${k})">
        <span class="q-key">${String.fromCharCode(65 + k)}</span><span>${txt}</span></div>`).join('');
  fin.disabled = true;
  document.getElementById('quiz-hint').innerHTML = '💡 Chọn đáp án — hệ thống chấm điểm ngay lập tức.';
}

function answerQuiz(k) {
  const st = quizState;
  if (st.locked || st.i >= QUIZ.length) return;
  st.locked = true;
  const q = QUIZ[st.i];
  const opts = document.querySelectorAll('#quiz-body .quiz-opt');
  if (opts[q.c]) opts[q.c].classList.add('correct');
  st.ans[st.i] = { picked: k, ok: k === q.c };
  const hint = document.getElementById('quiz-hint');
  if (k === q.c) {
    st.score++;
    beep(880, 'sine', 0.09, 0.04);
    hint.innerHTML = '✅ <b>Chính xác!</b> ' + q.hint;
  } else {
    if (opts[k]) opts[k].classList.add('wrong');
    beep(160, 'sawtooth', 0.2, 0.04);
    hint.innerHTML = '❌ <b>Chưa đúng.</b> Đáp án: <b>' + q.a[q.c] + '</b> — ' + q.hint;
  }
  renderQuizNav();
  setTimeout(quizNext, 1300);
}

function quizFinish() {
  if (quizState.score < 6) { showToast('⚠️ Cần đúng ít nhất 6/8 câu mới đạt chứng chỉ!'); return; }
  finishMission('quiz', 600, 1800, 'networking', 'Thầy Đức', 'Giảng viên CCNA',
    `🎉 Chúc mừng em! Đạt <b>${quizState.score}/8</b> câu — đủ điều kiện nhận chứng chỉ <b>CCNA 200-301</b>!\n🎁 Nhận: <b>+200 EXP | +1,800 Coin | Networking +1</b>`);
}

/* ====================================================
   🎫 MINI-GAME 5: HELPDESK TICKET (TRỤ SỞ IT)
   ==================================================== */
const TICKET_CATS = [
  { icon: '🌐', name: 'Network', desc: 'Mạng, wifi, kết nối' },
  { icon: '🖥️', name: 'Hardware', desc: 'Thiết bị, linh kiện' },
  { icon: '💾', name: 'Software', desc: 'Ứng dụng, hệ điều hành' },
  { icon: '👤', name: 'Account', desc: 'Tài khoản, mật khẩu' }
];
const TICKETS = [
  { id: '#HD-1041', who: 'Phòng Kế toán', txt: 'Máy in không in được, đèn báo lỗi nháy đỏ liên tục.', cat: 1, why: 'Lỗi thiết bị in → nhóm Hardware.' },
  { id: '#HD-1042', who: 'Anh Hùng — Kinh doanh', txt: 'Ping 192.168.1.1 bị timeout, không vào được mạng nội bộ.', cat: 0, why: 'Mất kết nối mạng → nhóm Network.' },
  { id: '#HD-1043', who: 'Chị Lan — Kế toán', txt: 'Quên mật khẩu đăng nhập Windows, tài khoản bị khoá.', cat: 3, why: 'Tài khoản/mật khẩu → nhóm Account.' },
  { id: '#HD-1044', who: 'Chị Mai — Kinh doanh', txt: 'Outlook báo lỗi không gửi được mail từ sáng nay.', cat: 2, why: 'Lỗi ứng dụng email → nhóm Software.' },
  { id: '#HD-1045', who: 'Phòng họp tầng 2', txt: 'Wifi chập chờn, tín hiệu yếu khi họp online.', cat: 0, why: 'Sóng wifi/kết nối → nhóm Network.' },
  { id: '#HD-1046', who: 'Anh Khoa — Data Center', txt: 'Ổ cứng kêu lạch cạch, máy khởi động rất chậm.', cat: 1, why: 'Ổ cứng sắp hỏng → nhóm Hardware.' }
];
let tkState = { i: 0, ok: 0, locked: false };

function openTk() { closeAll(); resetTk(); document.getElementById('tk-modal').style.display = 'flex'; beep(600); }
function resetTk() { tkState = { i: 0, ok: 0, locked: false }; renderTk(); }
function tkNext() { tkState.i++; tkState.locked = false; renderTk(); }

function renderTk() {
  const st = tkState;
  const body = document.getElementById('tk-body');
  if (st.i >= TICKETS.length) {
    const pass = st.ok >= 5;
    body.innerHTML = `<div class="quiz-result">
      <div style="font-size:40px;">${pass ? '🎫' : '😵'}</div>
      <div class="quiz-score">${st.ok}/${TICKETS.length}</div>
      <div style="margin-top:10px; font-size:13px; font-weight:700; color:${pass ? '#4ade80' : '#fca5a5'};">
        ${pass ? 'XỬ LÝ ĐẠT YÊU CẦU!' : 'CẦN ĐÚNG TỪ 5 TICKET'}
      </div></div>`;
    document.getElementById('tk-bar').style.width = '100%';
    document.getElementById('tk-count').innerText = st.ok + '/' + TICKETS.length;
    document.getElementById('tk-finish-btn').disabled = !pass;
    return;
  }
  const t = TICKETS[st.i];
  body.innerHTML = `<div class="tk-card">
      <div class="tk-id">${t.id} • ${t.who}</div>
      <div class="tk-txt">"${t.txt}"</div>
    </div>
    <div class="tk-grid">
      ${TICKET_CATS.map((c, k) => `<div class="tk-cat" onclick="answerTk(${k})">
        <div style="font-size:22px;">${c.icon}</div>
        <div style="margin-top:4px;">${c.name}</div>
        <div style="font-size:9.5px; color:#93a4bd; font-weight:500; margin-top:2px;">${c.desc}</div>
      </div>`).join('')}
    </div>`;
  document.getElementById('tk-bar').style.width = (st.i / TICKETS.length * 100) + '%';
  document.getElementById('tk-count').innerText = st.i + '/' + TICKETS.length;
  document.getElementById('tk-finish-btn').disabled = true;
  document.getElementById('tk-hint').innerHTML = '💡 Ticket này thuộc nhóm nào?';
}

function answerTk(k) {
  const st = tkState;
  if (st.locked || st.i >= TICKETS.length) return;
  st.locked = true;
  const t = TICKETS[st.i];
  const cards = document.querySelectorAll('#tk-body .tk-cat');
  if (cards[t.cat]) cards[t.cat].classList.add('correct');
  const hint = document.getElementById('tk-hint');
  if (k === t.cat) {
    st.ok++;
    beep(880, 'sine', 0.09, 0.04);
    hint.innerHTML = '✅ <b>Đúng nhóm!</b> ' + t.why;
  } else {
    if (cards[k]) cards[k].classList.add('wrong');
    beep(160, 'sawtooth', 0.2, 0.04);
    hint.innerHTML = '❌ <b>Sai nhóm.</b> Đáp án: <b>' + TICKET_CATS[t.cat].name + '</b> — ' + t.why;
  }
  document.getElementById('tk-count').innerText = (st.i + 1) + '/' + TICKETS.length;
  setTimeout(tkNext, 1300);
}

function tkFinish() {
  if (tkState.ok < 5) { showToast('⚠️ Cần phân loại đúng ít nhất 5 ticket!'); return; }
  finishMission('helpdesk', 480, 1400, 'troubleshooting', 'Chị Linh', 'IT Helpdesk Lead',
    `🎉 Tuyệt vời! Em phân loại đúng <b>${tkState.ok}/6</b> ticket, hàng đợi đã sạch!\n🎁 Nhận: <b>+160 EXP | +1,400 Coin | Troubleshooting +1</b>`);
}

/* ====================================================
   🔌 MINI-GAME 6: PATCH PANEL (DATA CENTER)
   ==================================================== */
const PATCH_PLAN = [
  { srv: 'SRV-DB01', sw: 'Gi0/4', note: 'Database' },
  { srv: 'SRV-WEB01', sw: 'Gi0/2', note: 'Web server' },
  { srv: 'SRV-MAIL01', sw: 'Gi0/7', note: 'Mail server' },
  { srv: 'SRV-FILE01', sw: 'Gi0/1', note: 'File server' },
  { srv: 'SRV-BK01', sw: 'Gi0/9', note: 'Backup' }
];
let ptState = { sel: null, linked: [], dispSrv: [], dispSw: [], err: -99 };

function openPt() { closeAll(); resetPt(); document.getElementById('pt-modal').style.display = 'flex'; beep(600); }
function resetPt() {
  const idx = PATCH_PLAN.map((_, i) => i);
  ptState = {
    sel: null, linked: [], err: -99,
    dispSrv: idx.slice().sort(() => Math.random() - 0.5),
    dispSw: idx.slice().sort(() => Math.random() - 0.5)
  };
  renderPt();
}

// Dữ liệu để mg-art.js vẽ lại mỗi khung hình
function patchScene() {
  return {
    plan: PATCH_PLAN, sel: ptState.sel, linked: ptState.linked,
    dispSrv: ptState.dispSrv, dispSw: ptState.dispSw,
    wrongT: Math.max(0, 1 - (MGX.t - ptState.err) * 1.6)
  };
}

function renderPt() {
  const st = ptState;
  document.getElementById('pt-ref').innerHTML =
    '<b>📐 SƠ ĐỒ ĐẤU CÁP</b>' +
    PATCH_PLAN.map((p, i) =>
      `<span class="pc-chip"><i style="background:${CORD_COL[i % CORD_COL.length]}"></i>${p.srv} <b>→</b> ${p.sw}</span>`).join('');
  document.getElementById('pt-bar').style.width = (st.linked.length / PATCH_PLAN.length * 100) + '%';
  document.getElementById('pt-count').innerText = st.linked.length + '/' + PATCH_PLAN.length;
  document.getElementById('pt-finish-btn').disabled = st.linked.length !== PATCH_PLAN.length;
  const hint = document.getElementById('pt-hint');
  if (st.sel === null) hint.innerHTML = st.linked.length === PATCH_PLAN.length
    ? '✅ 5 link đã lên đèn xanh — Nhấn HOÀN THÀNH.'
    : '💡 Chọn 1 cổng Server bên trái, rồi bấm cổng Switch tương ứng theo sơ đồ.';
  else hint.innerHTML = `🎯 Đang cầm cáp <b>${PATCH_PLAN[st.sel].srv}</b> — bấm cổng <b>${PATCH_PLAN[st.sel].sw}</b> trên SW01.`;
}

function ptClickSrv(i) {
  if (ptState.linked.includes(i)) return;
  ptState.sel = (ptState.sel === i) ? null : i;
  beep(660, 'sine', 0.05, 0.03);
  renderPt();
}
function ptClickSw(i) {
  const st = ptState;
  if (st.linked.includes(i)) return;
  if (st.sel === null) { showToast('⚠️ Hãy chọn cổng Server bên trái trước!'); beep(300, 'square', 0.1, 0.03); return; }
  const ri = st.dispSw.indexOf(i), y = PP.rowY(ri);
  if (st.sel === i) {
    st.linked.push(i);
    st.sel = null;
    mgBurst('pt-cv', 522, y, '#22c55e', 12);
    beep(880, 'sine', 0.09, 0.04);
    renderPt();
    if (st.linked.length === PATCH_PLAN.length) { setTimeout(() => mgBurst('pt-cv', 410, 160, '#67e8f9', 18), 120); setTimeout(() => chord([660, 880, 1100]), 150); }
  } else {
    st.err = MGX.t;
    mgBurst('pt-cv', 522, y, '#ef4444', 8);
    showToast(`❌ Sai sơ đồ! ${PATCH_PLAN[st.sel].srv} phải nối vào ${PATCH_PLAN[st.sel].sw}.`);
    beep(160, 'sawtooth', 0.2, 0.04);
  }
}
/* Nối click chuột / cảm ứng vào 2 canvas mini-game */
(function mgBind() {
  const cv = document.getElementById('crimp-cv'), pw = document.getElementById('crimp-palette'), pt = document.getElementById('pt-cv');
  if (cv) {
    cv.addEventListener('click', e => { const i = crimpPinAt(cv, e); if (i >= 0) clickPin(i); });
    cv.addEventListener('mousemove', e => { cv.style.cursor = crimpPinAt(cv, e) >= 0 ? 'pointer' : 'default'; });
  }
  if (pw) {
    pw.addEventListener('click', e => { const i = crimpPaletteAt(pw, e); if (i >= 0) selectWire(T568B[i]); });
    pw.addEventListener('mousemove', e => { pw.style.cursor = crimpPaletteAt(pw, e) >= 0 ? 'pointer' : 'default'; });
  }
  if (pt) {
    pt.addEventListener('click', e => {
      const hit = ptRowAt(pt, e); if (!hit) return;
      if (hit.side === 'L') ptClickSrv(ptState.dispSrv[hit.row]);
      else ptClickSw(ptState.dispSw[hit.row]);
    });
    pt.addEventListener('mousemove', e => {
      const p = mgPoint(pt, e, PP.W, PP.H);
      MGX.mouse = { x: p.x, y: p.y, in: true };
      const hit = ptRowAt(pt, e);
      pt.style.cursor = hit ? 'pointer' : 'default';
    });
    pt.addEventListener('mouseleave', () => { MGX.mouse.in = false; });
  }
  const wf = document.getElementById('wf-cv'), trc = document.getElementById('tr-cv');
  if (wf) {
    wf.addEventListener('click', e => { const h = wfHit(wf, e); if (h) clickWf(h.ap, h.ch); });
    wf.addEventListener('mousemove', e => {
      const h = wfHit(wf, e);
      MGX.wf = h ? { ap: h.ap, ch: h.ch, in: true } : { in: false };
      wf.style.cursor = h ? 'pointer' : 'default';
    });
    wf.addEventListener('mouseleave', () => { MGX.wf = { in: false }; });
  }
  if (trc) {
    trc.addEventListener('click', e => { const k = traceHit(trc, e); if (k != null) clickHop(trState.disp[k]); });
    trc.addEventListener('mousemove', e => {
      const k = traceHit(trc, e);
      MGX.tr = { k: k == null ? -1 : k, in: k != null };
      trc.style.cursor = k == null ? 'default' : 'pointer';
    });
    trc.addEventListener('mouseleave', () => { MGX.tr = { k: -1, in: false }; });
  }
  const bcv = document.getElementById('boss-cv');
  if (bcv) {
    bcv.addEventListener('click', e => {
      const h = bossHit(bcv, e, bossState ? bossScene() : null);
      if (!h || !bossState || bossState.mode !== 'act') return;
      if (h.kind === 'port') bossClickPort(h.k);
      else if (h.kind === 'chip') bossWire(h.k);
      else if (h.kind === 'pin') bossPinHint(h.k);
      else if (h.kind === 'row') bossRow(h.k);
      else if (h.kind === 'cand') bossCand(h.k);
    });
    bcv.addEventListener('mousemove', e => {
      const h = bossHit(bcv, e, bossState ? bossScene() : null);
      MGX.bs = h ? { k: h.k, kind: h.kind, in: true } : { k: -1, kind: '', in: false };
      bcv.style.cursor = h ? 'pointer' : 'default';
    });
    bcv.addEventListener('mouseleave', () => { MGX.bs = { k: -1, kind: '', in: false }; });
  }
})();

function ptFinish() {
  if (ptState.linked.length !== PATCH_PLAN.length) { showToast('⚠️ Còn server chưa được đấu cáp!'); return; }
  finishMission('patch', 510, 1600, 'datacenter', 'Anh Khoa', 'System Admin',
    '🎉 Cáp đấu chuẩn sơ đồ, đèn link xanh hết rồi!\n🎁 Nhận: <b>+170 EXP | +1,600 Coin | Data Center Skill +1</b>');
}

/* ====================================================
   📶 MINI-GAME 7: QUY HOẠCH KÊNH WIFI (VP KINH DOANH)
   ==================================================== */
const WIFI_APS = [
  { name: 'AP-01', loc: 'Sảnh lễ tân' },
  { name: 'AP-02', loc: 'Phòng họp lớn' },
  { name: 'AP-03', loc: 'Khu làm việc chung' }
];
let wfState = { ch: [0, 0, 0] };

function openWf() { closeAll(); resetWf(); document.getElementById('wf-modal').style.display = 'flex'; beep(600); }
function resetWf() { wfState = { ch: [0, 0, 0] }; renderWf(); }

function wfConflicts() {
  const c = wfState.ch, bad = [];
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      if (c[i] && c[j] && Math.abs(c[i] - c[j]) < 5) bad.push([i, j]);
    }
  }
  return bad;
}
function wfValid() { return wfState.ch.every(v => v > 0) && wfConflicts().length === 0; }

function wfScene() {
  return { aps: WIFI_APS, ch: wfState.ch, conflicts: wfConflicts(), clean: wfValid() };
}

function renderWf() {
  const c = wfState.ch;
  const bad = wfConflicts();
  const chosen = c.filter(v => v > 0).length;
  document.getElementById('wf-bar').style.width = (chosen / 3 * 100) + '%';
  document.getElementById('wf-count').innerText = chosen + '/3';
  document.getElementById('wf-finish-btn').disabled = !wfValid();
  const warn = document.getElementById('wf-warn');
  if (bad.length) {
    warn.innerHTML = '⚠️ Chồng kênh: ' + bad.map(([i, j]) => `${WIFI_APS[i].name} ↔ ${WIFI_APS[j].name}`).join(', ') +
      ' → nhiễu sóng, mạng chập chờn!';
  } else if (wfValid()) {
    warn.innerHTML = '<span style="color:#4ade80; font-weight:700;">✅ Tuyệt vời! 3 AP đã dùng 3 kênh không chồng lấn — sóng sạch toàn sàn.</span>';
  } else {
    warn.innerHTML = '';
  }
}

function clickWf(ap, ch) {
  const wasClean = wfValid();
  wfState.ch[ap] = (wfState.ch[ap] === ch) ? 0 : ch;
  beep(660, 'sine', 0.05, 0.03);
  if (!wasClean && wfValid()) {
    mgBurst('wf-cv', WF.chX(wfState.ch[ap]), WF.laneY(ap) + 20, '#22c55e', 12);
    chord([660, 880, 1100]);
  }
  renderWf();
}
function wfFinish() {
  if (!wfValid()) { showToast('⚠️ Còn AP chồng kênh hoặc chưa chọn kênh!'); return; }
  finishMission('wifi', 420, 1200, 'wireless', 'Chị Mai', 'Trưởng phòng Kinh doanh',
    `🎉 Sóng wifi mượt cả sàn rồi em ơi! 3 AP dùng kênh ${wfState.ch.join(' / ')} không chồng lấn.\n🎁 Nhận: <b>+140 EXP | +1,200 Coin | Wireless Skill +1</b>`);
}

/* ====================================================
   🛰️ MINI-GAME 8: PHÂN TÍCH TRACEROUTE (TRẠM ISP)
   ==================================================== */
const HOPS = [
  { n: 'PC của bạn', ip: '192.168.1.10', ms: '0.4 ms' },
  { n: 'Router nhà (Gateway)', ip: '192.168.1.1', ms: '1 ms' },
  { n: 'ISP BRAS', ip: '10.255.0.1', ms: '8 ms' },
  { n: 'Core Router ISP', ip: '203.0.113.1', ms: '12 ms' },
  { n: 'DNS Google', ip: '8.8.8.8', ms: '22 ms' }
];
const TR_ICONS = ['pc', 'router', 'bras', 'core', 'cloud'];
let trState = { out: [], disp: [], wrong: 0, errIdx: -1, errT: -9 };

function trScene() {
  const st = trState;
  return { hops: HOPS, out: st.out, disp: st.disp, kinds: TR_ICONS, errIdx: st.errIdx, errT: st.errT };
}

function openTr() { closeAll(); resetTr(); document.getElementById('tr-modal').style.display = 'flex'; beep(600); }
function resetTr() {
  trState = { out: [], disp: [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5), wrong: 0, errIdx: -1, errT: -9 };
  renderTr();
}

function renderTr() {
  const st = trState;
  const out = document.getElementById('tr-out');
  const L = ['C:\\Users\\tech>tracert ' + HOPS[HOPS.length - 1].ip, ''];
  st.out.forEach((i, k) => L.push(
    `${String(k + 1).padStart(2, ' ')}  ${HOPS[i].ip.padEnd(15, ' ')} ${HOPS[i].ms.padStart(7, ' ')}  ${HOPS[i].n}`));
  if (st.out.length < HOPS.length) L.push(`${String(st.out.length + 1).padStart(2, ' ')}  * * *`.padEnd(38, ' ') + ' đang chờ phản hồi…');
  else L.push('', 'Hoàn tất: 5 hop tới 8.8.8.8, 0% mất gói.');
  out.innerText = L.join('\n');
  out.scrollTop = out.scrollHeight;
  document.getElementById('tr-bar').style.width = (st.out.length / HOPS.length * 100) + '%';
  document.getElementById('tr-count').innerText = st.out.length + '/' + HOPS.length;
  document.getElementById('tr-finish-btn').disabled = st.out.length !== HOPS.length;
  const hint = document.getElementById('tr-hint');
  if (st.out.length === HOPS.length) hint.innerHTML = '✅ Đã xác định đủ 5 hop! Nhấn HOÀN THÀNH.';
  else if (st.out.length === 0) hint.innerHTML = '💡 Gói tin luôn đi từ thiết bị gần bạn nhất trước.';
  else hint.innerHTML = `🎯 Hop tiếp theo là thiết bị kế tiếp trên đường ra Internet (đã đi qua ${st.out.length} hop).`;
}

function clickHop(i) {
  const st = trState;
  if (st.out.includes(i)) return;
  if (i !== st.out.length) {
    st.errIdx = i; st.errT = MGX.t;
    st.wrong++;
    beep(160, 'sawtooth', 0.18, 0.035);
    document.getElementById('tr-hint').innerHTML = `❌ Sai thứ tự! Gói tin chưa thể tới <b>${HOPS[i].n}</b> ở bước này.`;
    return;
  }
  st.out.push(i);
  mgBurst('tr-cv', TR.nx(i), TR.ny, '#22c55e', 10);
  beep(880, 'sine', 0.08, 0.04);
  renderTr();
  if (st.out.length === HOPS.length) setTimeout(() => mgBurst('tr-cv', TR.nx(4), TR.ny, '#67e8f9', 16), 120);
  if (st.out.length === HOPS.length) setTimeout(() => chord([660, 880, 1100]), 150);
}

function trFinish() {
  if (trState.out.length !== HOPS.length) { showToast('⚠️ Chưa xác định đủ 5 hop!'); return; }
  const bonus = trState.wrong === 0 ? ' (hoàn hảo, không sai bước nào!)' : '';
  finishMission('trace', 450, 1300, 'networking', 'Anh Sơn', 'NOC Engineer',
    `🎉 Em đọc traceroute chuẩn đấy${bonus}\nĐường đi: PC → Router → BRAS → Core → 8.8.8.8.\n🎁 Nhận: <b>+150 EXP | +1,300 Coin | Networking +1</b>`);
}

/* ============ TOAST NOTIFICATION ============ */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerText = msg;
  document.getElementById('app').appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s, transform .4s'; t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(-10px)'; setTimeout(() => t.remove(), 400); }, 1900);
}

/* ===== V2: ĐỒ HỌA MỚI ===== */
const _bgOld = buildWorldBG;
buildWorldBG = function () {
  _bgOld();
  bg.save(); bg.lineCap = 'round';
  const cable = f => {
    bg.strokeStyle = 'rgba(14,165,233,.16)'; bg.lineWidth = 9; f(); bg.stroke();
    bg.strokeStyle = 'rgba(56,189,248,.8)'; bg.lineWidth = 1.6; bg.setLineDash([10, 8]); f(); bg.stroke(); bg.setLineDash([]);
  };
  cable(() => { bg.beginPath(); rr(bg, 232, 144, 496, 314, 88); });
  cable(() => { bg.beginPath(); bg.moveTo(56, 173); bg.lineTo(256, 173); });
  cable(() => { bg.beginPath(); bg.moveTo(704, 173); bg.lineTo(910, 173); });
  cable(() => { bg.beginPath(); bg.moveTo(56, 447); bg.lineTo(906, 447); });
  bg.restore();
  const g = bg.createRadialGradient(480, 260, 80, 480, 300, 620);
  g.addColorStop(0, 'rgba(255,244,214,.30)'); g.addColorStop(1, 'rgba(40,70,120,.28)');
  bg.fillStyle = g; bg.fillRect(0, 0, 960, 600);
};
function drawPackets() {
  const t = Date.now() / 1000;
  [[56, 173, 200], [704, 173, 206], [56, 447, 850]].forEach(([x, y, w], i) => {
    for (let k = 0; k < 3; k++) {
      const px = x + ((t * 60 + k * w / 3 + i * 40) % w);
      ctx.fillStyle = 'rgba(56,189,248,.28)'; ctx.beginPath(); ctx.arc(px, y, 7, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(224,247,255,.95)'; ctx.beginPath(); ctx.arc(px, y, 3, 0, 7); ctx.fill();
    }
  });
}
const _renderOld = render;
render = function () {
  _renderOld();
  if (S.scene !== 'WORLD') return;
  if (!window._vg) {
    const c = document.createElement('canvas'); c.width = 960; c.height = 600; const q = c.getContext('2d');
    const v = q.createRadialGradient(480, 300, 260, 480, 300, 640); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(6,14,30,.42)');
    q.fillStyle = v; q.fillRect(0, 0, 960, 600); window._vg = c;
  }
  ctx.drawImage(window._vg, 0, 0);
};
const ROLE_C = { p:['#1e293b','#0284c7'], lan:['#4a2c14','#ec4899'], tuan:['#0f172a','#16a34a'], huong:['#7c2d12','#f59e0b'],
  duc:['#1e1b4b','#7c3aed'], linh:['#312e81','#0891b2'], khoa:['#0f172a','#0ea5e9'], mai:['#78350f','#10b981'], son:['#1c1917','#ef4444'] };
drawSprite = function (x, y, r = 'p') {
  const A = window._amb, me = r === 'p', mv = me ? S.p.moving : !!(A && A.moving), ph = (me ? S.p.step : (A ? A.ph : 0)) * 0.32;
  const bob = mv ? Math.abs(Math.sin(ph)) * 1.2 : Math.sin(Date.now() / 600 + x) * 0.4, sw = mv ? Math.sin(ph) * 3.4 : 0;
  const [hair, shirt] = ROLE_C[r] || ROLE_C.p, cx = x + 10, ty = y - bob, face = me ? (S.p.dir || 1) : (A ? A.dir : 1);
  const fem = ['lan', 'huong', 'linh', 'mai'].includes(r) || (/^a\d+$/.test(r) && +r.slice(1) % 2 === 1);
  const skin = '#f2c9a0', pant = fem ? '#3b4a6b' : '#2b3a55';
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(8,16,32,.8)';
  ctx.fillStyle = 'rgba(10,20,40,.3)'; ctx.beginPath(); ctx.ellipse(cx, y + 31.5, 9, 3, 0, 0, 7); ctx.fill();
  if (fem) { ctx.fillStyle = hair; rr(ctx, cx - 6.6, ty + 2, 13.2, 15, 5); ctx.fill(); ctx.stroke(); }
  [[-2.7, sw], [2.7, -sw]].forEach(([dx, s]) => {
    const lx = cx + dx + s * 0.3, lh = 9 - Math.max(0, s) * 0.5;
    ctx.fillStyle = pant; rr(ctx, lx - 2.4, ty + 22, 4.8, lh, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f1f5f9'; rr(ctx, lx - 3 + face * 0.7, ty + 20 + lh, 6.4, 3.2, 1.6); ctx.fill(); ctx.stroke();
  });
  [[-7.2, sw], [7.2, -sw]].forEach(([dx, s]) => {
    const ay = ty + 13.8 + s * 0.35;
    ctx.fillStyle = shirt; rr(ctx, cx + dx - 1.9, ay, 3.8, 8, 1.9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(cx + dx, ay + 9, 1.8, 0, 7); ctx.fill(); ctx.stroke();
  });
  ctx.fillStyle = shirt; rr(ctx, cx - 5.8, ty + 12.8, 11.6, 11, 3.5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.2)'; rr(ctx, cx - 4.4, ty + 14, 3.2, 8, 1.6); ctx.fill();
  ctx.fillStyle = pant; ctx.fillRect(cx - 5.4, ty + 21.4, 10.8, 2.4);
  ctx.fillStyle = skin; ctx.fillRect(cx - 1.6, ty + 11, 3.2, 3);
  ctx.beginPath(); ctx.moveTo(cx - 2.6, ty + 12.8); ctx.lineTo(cx + 2.6, ty + 12.8); ctx.lineTo(cx, ty + 15.6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, ty + 6.4, 5.6, 6.4, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(cx, ty + 4.6, 6.2, 5.2, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillRect(cx - 6.2, ty + 4.4, 1.7, fem ? 8 : 3); ctx.fillRect(cx + 4.5, ty + 4.4, 1.7, fem ? 8 : 3);
  ctx.fillStyle = '#0f172a'; [-2.3, 2.3].forEach(dx => { ctx.beginPath(); ctx.ellipse(cx + dx + face * .7, ty + 7, .95, 1.3, 0, 0, 7); ctx.fill(); });
  ctx.strokeStyle = hair; ctx.lineWidth = 1; ctx.beginPath();
  [-2.3, 2.3].forEach(dx => { ctx.moveTo(cx + dx + face * .7 - 1.5, ty + 4.9); ctx.lineTo(cx + dx + face * .7 + 1.5, ty + 4.7); }); ctx.stroke();
  ctx.strokeStyle = '#a35c44'; ctx.beginPath(); ctx.arc(cx + face * .6, ty + 9.2, 1.6, .2, Math.PI - .2); ctx.stroke();
  if (me) {
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(cx, ty + 5.6, 7.2, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.fillStyle = '#38bdf8'; rr(ctx, cx - 7.8, ty + 5, 2.8, 5, 1.2); ctx.fill(); rr(ctx, cx + 5, ty + 5, 2.8, 5, 1.2); ctx.fill();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx + face * 6.4, ty + 9.5); ctx.lineTo(cx + face * 3.4, ty + 10.6); ctx.stroke();
  }
  ctx.restore();
};

/* ===== V3: NỘI THẤT CHIBI / PIXEL ===== */
const IZO = '#0a1022';
function izb(x, y, w, h, r, c, hi) {
  ctx.fillStyle = c; rr(ctx, x, y, w, h, r); ctx.fill();
  if (hi) { ctx.fillStyle = hi; rr(ctx, x + 2, y + 2, w - 4, Math.min(5, h / 3), Math.max(1, r - 2)); ctx.fill(); }
  ctx.strokeStyle = IZO; ctx.lineWidth = 2; rr(ctx, x, y, w, h, r); ctx.stroke();
}
function izs(x, y, rx) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ellipsePath(ctx, x, y, rx, rx * 0.22); ctx.fill(); }
drawProp = function (p, acc, t) {
  const cx = p.x + (p.w || 0) / 2;
  if (p.t === 'desk') {
    izs(cx, p.y + p.h + 4, p.w / 2 + 6);
    izb(p.x, p.y, p.w, p.h, 6, '#c9935a', 'rgba(255,255,255,.35)');
    izb(p.x + 6, p.y + p.h - 10, p.w - 12, 10, 3, '#8a5a2e');
    const mx = cx - 24, my = p.y - 40;
    izb(mx, my, 48, 34, 5, '#1d2740');
    ctx.fillStyle = alphaC(acc, .55 + Math.sin(t * 1.6 + p.x) * .15); rr(ctx, mx + 4, my + 4, 40, 22, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(mx + 8, my + 9, 18, 2); ctx.fillRect(mx + 8, my + 14, 26, 2);
    izb(cx - 5, my + 34, 10, 6, 1, '#3a4660');
    izb(cx - 20, p.y + 6, 40, 9, 3, '#e5e9f2');
    izb(p.x + p.w - 26, p.y + 4, 12, 14, 4, '#f87171');
  } else if (p.t === 'plant') {
    const s = p.s || 1; izs(p.x, p.y + 30 * s, 20 * s);
    izb(p.x - 13 * s, p.y + 6 * s, 26 * s, 24 * s, 5, '#e0804f', 'rgba(255,255,255,.3)');
    [[-14, -8, 13], [14, -8, 13], [0, -22, 17], [0, -6, 14]].forEach(([dx, dy, r], i) => {
      ctx.fillStyle = i % 2 ? '#3ecb74' : '#26a85e'; ctx.beginPath(); ctx.arc(p.x + dx * s, p.y + dy * s, r * s, 0, 7); ctx.fill();
      ctx.strokeStyle = IZO; ctx.lineWidth = 2; ctx.stroke();
    });
  } else if (p.t === 'rack') {
    izs(cx, p.y + p.h + 3, p.w / 2 + 8);
    izb(p.x, p.y, p.w, p.h, 6, '#2f3d5c', 'rgba(255,255,255,.18)');
    const n = Math.floor((p.h - 34) / 22);
    for (let i = 0; i < n; i++) {
      const uy = p.y + 24 + i * 22;
      izb(p.x + 8, uy, p.w - 16, 17, 3, '#161e30');
      for (let k = 0; k < 4; k++) { ctx.fillStyle = Math.sin(t * 3 + i * 2 + k * 1.3) > 0 ? '#4ade80' : '#14532d'; ctx.fillRect(p.x + 14 + k * 8, uy + 6, 5, 5); }
      ctx.fillStyle = alphaC(acc, .85); ctx.fillRect(p.x + p.w - 32, uy + 6, 16, 5);
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px "Segoe UI",sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.label || '', cx, p.y + 15); ctx.textAlign = 'left';
  } else if (p.t === 'screen') {
    izb(p.x, p.y, p.w, p.h, 8, '#0f172a');
    ctx.fillStyle = alphaC(acc, .22); rr(ctx, p.x + 6, p.y + 6, p.w - 12, p.h - 12, 5); ctx.fill();
    ctx.strokeStyle = alphaC(acc, .95); ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const x = p.x + 12 + i * (p.w - 24) / 20, y = p.y + p.h * .64 + Math.sin(t * 2 + i * .7) * p.h * .14; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px "Segoe UI",sans-serif'; ctx.fillText(p.label || '', p.x + 14, p.y + 21);
  } else {
    izs(cx, p.y + p.h + 5, p.w / 2 + 8);
    [p.x + 22, p.x + p.w - 54].forEach(x => { izb(x, p.y - 14, 32, 18, 6, '#5a86f2'); izb(x, p.y + p.h - 4, 32, 18, 6, '#5a86f2'); });
    izb(p.x, p.y, p.w, p.h, 10, '#d9a066', 'rgba(255,255,255,.35)');
    izb(cx - 22, p.y + 16, 44, 28, 4, '#cfd8e8'); ctx.fillStyle = alphaC(acc, .65); ctx.fillRect(cx - 18, p.y + 20, 36, 18);
  }
};
drawStation = function (cfg, acc, t) {
  const st = cfg.station, x = st.x, y = st.y;
  izs(x, y + 76, 88);
  ctx.fillStyle = alphaC(acc, .2 + Math.sin(t * 3) * .08); ellipsePath(ctx, x, y + 60, 98, 24); ctx.fill();
  izb(x - 66, y + 54, 14, 22, 3, '#34415c'); izb(x + 52, y + 54, 14, 22, 3, '#34415c');
  izb(x - 76, y + 14, 152, 40, 8, '#5d7096', 'rgba(255,255,255,.35)');
  izb(x - 40, y - 30, 80, 48, 7, '#10192e');
  ctx.fillStyle = alphaC(acc, .5); rr(ctx, x - 34, y - 24, 68, 36, 4); ctx.fill();
  for (let i = 0; i < 6; i++) { ctx.fillStyle = Math.sin(t * 2 + i * 1.7) > 0 ? '#4ade80' : '#166534'; ctx.fillRect(x - 28 + i * 10, y - 18, 6, 6); }
  ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 26, y - 6 + i * 6, 52 - i * 14, 2.5);
  const by = y - 88 + Math.sin(t * 2.2) * 2;
  izb(x - 108, by, 216, 44, 12, acc, 'rgba(255,255,255,.35)');
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 4;
  ctx.font = 'bold 12.5px "Segoe UI",system-ui,sans-serif'; ctx.fillText(`${st.icon} ${st.title}`, x, by + 19);
  ctx.font = '9.5px "Segoe UI",system-ui,sans-serif'; ctx.fillText(st.sub, x, by + 34);
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  if (buildingStatus(cfg.id) === 'done') {
    izb(x + 62, y - 34, 62, 20, 10, '#22c55e'); ctx.fillStyle = '#04120a'; ctx.font = 'bold 9.5px "Segoe UI",sans-serif'; ctx.fillText('✅ XONG', x + 93, y - 20);
  }
  ctx.textAlign = 'left';
};
drawInterior = function (id) {
  if (id === 'NOC_SOC' && IMG.noc_bg) { drawNocSoc(); return; }
  if (id === 'ACADEMY' && IMG.ccna_bg) { drawAcademy(); return; }
  // Học viện CCNA có ảnh nền chi tiết riêng; ảnh chưa nạp thì rơi về khối vector bên dưới
  if (id === 'ACADEMY' && IMG.ccna_bg) { drawAcademy(); return; }
  // Phòng 6 — Trụ sở IT / Helpdesk vẽ bằng ảnh isometric mới
  if (id === 'IT' && IMG.it_bg) { drawItHelpdesk(); return; }
  // Cảnh 7 — Data Center vẽ bằng ảnh isometric cùng bộ với Phòng 6
  if (id === 'DC' && IMG.dc_bg) { drawDataCenter(); return; }
  // Cảnh 9 — Trạm mạng ISP vẽ bằng ảnh isometric cùng bộ
  if (id === 'ISP' && IMG.isp_bg) { drawIspStation(); return; }
  // Cảnh 8 — VP Kinh Doanh vẽ bằng ảnh isometric cùng bộ
  if (id === 'SALES' && IMG.sales_bg) { drawSalesOffice(); return; }
  const cfg = INTERIORS[id], acc = cfg.accent, t = Date.now() / 1000;
  ctx.fillStyle = cfg.floorA; ctx.fillRect(0, 0, 960, 600);
  ctx.fillStyle = 'rgba(255,255,255,.055)';
  for (let y = 132; y < 600; y += 44) for (let x = 0; x < 960; x += 44) if (((x + y) / 44) % 2 === 0) ctx.fillRect(x, y, 44, 44);
  ctx.fillStyle = alphaC(acc, .14); rr(ctx, 230, 250, 520, 200, 30); ctx.fill();
  ctx.strokeStyle = alphaC(acc, .45); ctx.lineWidth = 3; ctx.setLineDash([12, 9]); rr(ctx, 240, 260, 500, 180, 24); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = cfg.wallA; ctx.fillRect(0, 0, 960, 134);
  ctx.fillStyle = cfg.wallB; for (let x = 0; x < 960; x += 48) ctx.fillRect(x, 0, 3, 100);
  ctx.fillRect(0, 100, 960, 34);
  ctx.fillStyle = alphaC(acc, .9); ctx.fillRect(0, 98, 960, 4);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 134, 960, 6);
  for (let i = 0; i < 4; i++) {
    const wx = 300 + i * 110, g = ctx.createLinearGradient(0, 18, 0, 82);
    g.addColorStop(0, '#7cc8ff'); g.addColorStop(1, '#e4f5ff');
    ctx.fillStyle = g; ctx.fillRect(wx, 18, 84, 64);
    ctx.fillStyle = 'rgba(40,70,120,.5)'; [[6, 40, 14], [24, 30, 18], [46, 44, 12], [62, 34, 16]].forEach(([dx, dy, w]) => ctx.fillRect(wx + dx, 18 + dy + 8, w, 64 - dy - 8));
    ctx.strokeStyle = IZO; ctx.lineWidth = 3; ctx.strokeRect(wx, 18, 84, 64);
    ctx.fillRect(wx + 41, 18, 3, 64); ctx.fillRect(wx, 48, 84, 3);
    ctx.fillStyle = alphaC(acc, .8); ctx.fillRect(wx - 6, 14, 10, 72); ctx.fillRect(wx + 80, 14, 10, 72);
  }
  izb(160 - 22, 30, 44, 44, 22, '#f8fafc');
  const d = new Date(), a1 = d.getMinutes() / 60 * 6.283 - 1.5708, a2 = (d.getHours() % 12 + d.getMinutes() / 60) / 12 * 6.283 - 1.5708;
  ctx.strokeStyle = IZO; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(160, 52); ctx.lineTo(160 + Math.cos(a1) * 15, 52 + Math.sin(a1) * 15);
  ctx.moveTo(160, 52); ctx.lineTo(160 + Math.cos(a2) * 10, 52 + Math.sin(a2) * 10); ctx.stroke();
  izb(742, 16, 170, 70, 6, '#f8f1dc'); ctx.font = '36px "Segoe UI Emoji",sans-serif'; ctx.fillText(cfg.station.icon, 756, 64);
  ctx.fillStyle = '#4a3b22'; ctx.font = 'bold 10px "Segoe UI",sans-serif'; ctx.fillText(cfg.station.game, 810, 46);
  izb(26, 102, 250, 26, 8, acc, 'rgba(255,255,255,.3)');
  ctx.fillStyle = '#04121f'; ctx.font = 'bold 11.5px "Segoe UI",system-ui,sans-serif'; ctx.fillText(cfg.name, 40, 120);
  const cg = ctx.createRadialGradient(480, 0, 20, 480, 0, 520);
  cg.addColorStop(0, alphaC(acc, .1)); cg.addColorStop(1, alphaC(acc, 0)); ctx.fillStyle = cg; ctx.fillRect(0, 0, 960, 420);
  (cfg.props || []).slice().sort((a, b) => a.y - b.y).forEach(p => drawProp(p, acc, t));
  drawStation(cfg, acc, t);
  drawLockChip(cfg.station.x, cfg.station.y - 100, GAME_MISSION[cfg.station.game]);
  izb(22, 500, 140, 82, 8, '#7a4b2a', 'rgba(255,255,255,.25)'); izb(34, 510, 116, 70, 6, '#c9873f');
  ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(136, 546, 5, 0, 7); ctx.fill();
  izb(30, 556, 124, 24, 8, '#ef4444'); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Segoe UI",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🚪 RA THÀNH PHỐ', 92, 572); ctx.textAlign = 'left';
  [cfg.npc, { x: S.p.x, y: S.p.y, sprite: 'p' }].map(o => ({ k: o.y, f: () => drawSprite(o.x, o.y, o.sprite) }))
    .sort((a, b) => a.k - b.k).forEach(o => o.f());
};

/* ===== V4: VĂN PHÒNG / NETWORK ROOM / LAB PHẦN CỨNG (chibi) ===== */
const IZF = '"Segoe UI",system-ui,sans-serif';
function izPill(txt, x, y, w, c) {
  izb(x, y, w, 24, 8, c, 'rgba(255,255,255,.3)');
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px ' + IZF; ctx.textAlign = 'center'; ctx.fillText(txt, x + w / 2, y + 16); ctx.textAlign = 'left';
}
function izDoor() {
  izb(22, 500, 140, 82, 8, '#7a4b2a', 'rgba(255,255,255,.25)'); izb(34, 510, 116, 70, 6, '#c9873f');
  ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(136, 546, 5, 0, 7); ctx.fill();
  izPill('🚪 RA THÀNH PHỐ', 28, 556, 128, '#ef4444');
}
function izWin(x, y, w, h, a) {
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, S.weather === 'night' ? '#1b2a52' : '#7cc8ff'); g.addColorStop(1, S.weather === 'night' ? '#3b4a7a' : '#e4f5ff');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + 6, y + 6, w * .4, 5);
  ctx.strokeStyle = IZO; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h); ctx.fillStyle = IZO; ctx.fillRect(x + w / 2 - 1, y, 3, h);
  ctx.fillStyle = alphaC(a, .85); ctx.fillRect(x - 5, y - 3, 8, h + 6); ctx.fillRect(x + w - 3, y - 3, 8, h + 6);
}
function izChair(x, y, c) { izb(x, y, 28, 16, 7, c || '#5a86f2', 'rgba(255,255,255,.3)'); }
function izBench(x, y) {
  izs(x, y + 90, 84); izb(x - 62, y + 50, 10, 40, 3, '#5a3a20'); izb(x + 52, y + 50, 10, 40, 3, '#5a3a20');
  izb(x - 70, y + 20, 140, 30, 6, '#c9935a', 'rgba(255,255,255,.3)');
}
function izSign(x, y, c, title, sub) {
  izb(x - 68, y - 74, 136, 40, 10, c, 'rgba(255,255,255,.3)');
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 11px ' + IZF; ctx.fillText(title, x, y - 56);
  ctx.font = '9px ' + IZF; ctx.fillText(sub, x, y - 43); ctx.textAlign = 'left';
}
/* Nội thất văn phòng vẽ bằng khối hình học — chỉ dùng khi chưa nạp được
   assets/interior_bg_revamp.png (ảnh đã vẽ sẵn toàn bộ bàn, quầy, phòng máy). */
function drawOfficeVector(t) {
  for (let y = 0; y < 600; y += 26) { ctx.fillStyle = (y / 26) % 2 ? '#b98349' : '#ad7a43'; ctx.fillRect(0, y, 960, 26); ctx.fillStyle = 'rgba(60,30,10,.22)'; ctx.fillRect(0, y + 24, 960, 2); }
  ctx.fillStyle = '#3d4f6d'; ctx.fillRect(0, 0, 960, 52); ctx.fillStyle = '#c7d2e4'; ctx.fillRect(0, 46, 960, 8); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(0, 54, 960, 5);
  for (let i = 0; i < 5; i++) izWin(140 + i * 130, 8, 52, 32, '#38bdf8');
  const rug = (x, y, w, h, c) => { ctx.fillStyle = c; rr(ctx, x, y, w, h, 16); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2; ctx.setLineDash([8, 7]); rr(ctx, x + 6, y + 6, w - 12, h - 12, 12); ctx.stroke(); ctx.setLineDash([]); };
  rug(20, 62, 180, 140, 'rgba(56,130,200,.30)'); rug(230, 62, 200, 195, 'rgba(56,130,200,.30)');
  rug(30, 310, 200, 140, 'rgba(250,204,21,.22)'); rug(480, 310, 230, 160, 'rgba(34,197,94,.22)');
  izPill('1. LỄ TÂN', 30, 70, 100, '#0369a1'); izPill('2. PHÒNG KẾ TOÁN', 240, 70, 150, '#0369a1');
  izPill('3. PHÒNG HỌP LỚN', 40, 312, 150, '#b45309'); izPill('5. PANTRY & TRÀ', 490, 312, 140, '#15803d');
  izs(100, 156, 70); izb(40, 118, 120, 34, 8, '#c9935a', 'rgba(255,255,255,.3)'); izb(132, 106, 16, 14, 7, '#f43f5e');
  izs(315, 208, 90); izb(238, 132, 154, 72, 9, '#c9935a', 'rgba(255,255,255,.3)');
  izb(268, 108, 48, 36, 5, '#1d2740'); ctx.fillStyle = S.isFixed ? '#22c55e' : '#ef4444'; rr(ctx, 272, 112, 40, 24, 3); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px ' + IZF; ctx.textAlign = 'center'; ctx.fillText(S.isFixed ? '✔' : '✖', 292, 130); ctx.textAlign = 'left';
  izb(330, 146, 40, 10, 3, '#e5e9f2');
  izs(135, 432, 100); izChair(66, 334); izChair(116, 334); izChair(166, 334); izChair(66, 428); izChair(116, 428); izChair(166, 428);
  izb(48, 352, 174, 74, 12, '#d9a066', 'rgba(255,255,255,.35)'); izb(100, 372, 70, 32, 4, '#cfd8e8'); ctx.fillStyle = 'rgba(56,189,248,.65)'; ctx.fillRect(106, 377, 58, 22);
  izs(565, 392, 90); izb(490, 348, 150, 40, 6, '#8aa0bf', 'rgba(255,255,255,.35)'); izb(500, 322, 26, 28, 5, '#e24d4d'); izb(560, 358, 40, 14, 4, '#e5e9f2');
  izs(678, 402, 26); izb(662, 340, 32, 58, 6, '#eef3fb', 'rgba(255,255,255,.4)'); ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(678, 326, 13, 0, 7); ctx.fill(); ctx.strokeStyle = IZO; ctx.lineWidth = 2; ctx.stroke();
  izs(560, 475, 40); ctx.fillStyle = '#c9935a'; ctx.beginPath(); ctx.arc(560, 445, 28, 0, 7); ctx.fill(); ctx.stroke();
  izb(548, 436, 10, 10, 3, '#fff'); izb(566, 442, 10, 10, 3, '#fff');
  izb(712, 56, 248, 224, 12, '#17233a'); izb(740, 104, 90, 168, 6, '#2b3d5c', 'rgba(255,255,255,.2)'); izb(840, 104, 90, 168, 6, '#2b3d5c', 'rgba(255,255,255,.2)');
  ctx.fillStyle = alphaC('#38bdf8', .4 + Math.sin(t * 3) * .2); ctx.fillRect(832, 112, 4, 152);
  izb(726, 62, 214, 30, 9, '#0284c7', 'rgba(255,255,255,.3)'); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px ' + IZF; ctx.fillText('🔒 NETWORK ROOM ➔', 742, 82);
  izDoor();
}
/* Màn hình PC trên bàn Kế Toán số 1 — báo trạng thái mạng thuế của quest NAT,
   vẽ đè lên đúng vị trí màn hình trong ảnh nền mới. */
function drawOfficeScreen() {
  ctx.fillStyle = S.isFixed ? '#22c55e' : '#ef4444'; rr(ctx, 329, 178, 33, 26, 3); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px ' + IZF; ctx.textAlign = 'center';
  ctx.fillText(S.isFixed ? '✔' : '✖', 345, 197); ctx.textAlign = 'left';
}
drawOffice = function () {
  if (IMG.interior_bg) {
    ctx.drawImage(IMG.interior_bg, 0, 0, 960, 600);
    drawOfficeScreen();
  } else {
    drawOfficeVector(Date.now() / 1000);
  }
  drawSprite(282, 152, 'lan'); drawSprite(S.p.x, S.p.y, 'p');
};
/* ---- Ảnh nền AI (interior_network_bg_revamp / interior_hardware_bg_revamp)
   là JPEG 1024x637 vẽ lên khung canvas 960x600. ---- */
const IZ_SX = 1024 / 960, IZ_SY = 637 / 600;
function izMask(img, dx, dy, dw, dh, sx, sy) {
  ctx.drawImage(img, sx * IZ_SX, sy * IZ_SY, dw * IZ_SX, dh * IZ_SY, dx, dy, dw, dh);
}
/* interior_network_bg_revamp.png là mockup CẢ màn hình: ảnh bake sẵn thẻ nhân
   vật, 5 nút dock, pill tên phòng, ô chat, 3 nút cảm ứng và 2 nhân vật tĩnh.
   izFill lát một mảng tường/sàn sạch của chính bức ảnh đè lên vùng đó — chỉ
   drawImage nguồn→đích, không đọc pixel nên vẫn chạy được trên file://. */
function izFill(img, dx, dy, dw, dh, sx, sy, sw, sh) {
  ctx.save(); ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
  for (let y = 0; y < dh; y += sh) for (let x = 0; x < dw; x += sw) izMask(img, dx + x, dy + y, sw, sh, sx, sy);
  ctx.restore();
}

/* Nội thất phòng server vẽ bằng khối hình học — fallback khi chưa nạp được ảnh. */
function drawNetworkRoomVector(t) {
  ctx.fillStyle = '#0d1526'; ctx.fillRect(0, 0, 960, 600); ctx.fillStyle = 'rgba(56,189,248,.06)';
  for (let y = 100; y < 600; y += 40) for (let x = 0; x < 960; x += 40) if (((x + y) / 40) % 2 === 0) ctx.fillRect(x, y, 40, 40);
  ctx.fillStyle = '#16233d'; ctx.fillRect(0, 0, 960, 100); ctx.fillStyle = '#223559'; for (let x = 0; x < 960; x += 60) ctx.fillRect(x, 0, 3, 100);
  ctx.fillStyle = 'rgba(56,189,248,.85)'; ctx.fillRect(0, 98, 960, 4);
  izb(60, 54, 840, 14, 5, '#3a4a6a');
  ['#f59e0b', '#22c55e', '#38bdf8', '#ef4444'].forEach((c, k) => [0, 1, 2].forEach(i => {
    const x = 240 + i * 240 + k * 12 - 18, sw = Math.sin(t + k + i) * 3;
    ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, 68); ctx.quadraticCurveTo(x + sw, 100, x, 130); ctx.stroke();
  }));
  izPill('🔒 3. NETWORK ROOM - RACK & THIẾT BỊ', 30, 14, 300, '#0284c7');
  const pad = .25 + Math.sin(t * 3) * .1; ctx.fillStyle = alphaC('#38bdf8', pad); ellipsePath(ctx, 260, 440, 62, 18); ctx.fill();
  ctx.fillStyle = '#7dd3fc'; ctx.font = 'bold 9px ' + IZF; ctx.textAlign = 'center'; ctx.fillText('CONSOLE', 260, 444); ctx.textAlign = 'left';
  ['RACK01', 'RACK02', 'RACK03'].forEach((name, i) => {
    const rx = 180 + i * 240, main = i === 0;
    izs(rx + 70, 384, 84); izb(rx, 130, 140, 250, 8, main ? '#2c4468' : '#2a3550', 'rgba(255,255,255,.15)');
    if (main) { ctx.strokeStyle = alphaC('#38bdf8', .6 + Math.sin(t * 3) * .3); ctx.lineWidth = 3; rr(ctx, rx - 2, 128, 144, 254, 9); ctx.stroke(); }
    izb(rx + 4, 134, 132, 14, 4, main ? '#0369a1' : '#334155'); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px ' + IZF; ctx.fillText(name, rx + 10, 145);
    for (let u = 0; u < 6; u++) {
      const uy = 152 + u * 36; izb(rx + 8, uy, 124, 28, 3, '#111a2c');
      ctx.fillStyle = Math.sin(t * 4 + u * 1.3 + i) > 0 ? '#4ade80' : '#14532d'; ctx.fillRect(rx + 14, uy + 11, 5, 5);
      ctx.fillStyle = (S.isFixed || i > 0) ? '#22c55e' : '#ef4444'; ctx.fillRect(rx + 24, uy + 11, 5, 5);
      for (let q = 0; q < 8; q++) { ctx.fillStyle = '#475569'; ctx.fillRect(rx + 48 + q * 7.5, uy + 8, 5, 12); }
    }
  });
  izb(26, 520, 150, 40, 10, '#0284c7', 'rgba(255,255,255,.3)'); ctx.fillStyle = '#fff'; ctx.font = 'bold 11px ' + IZF; ctx.fillText('⬅ VỀ VĂN PHÒNG', 44, 545);
}
/* Ảnh có dải viền đen 28px quanh mép trên/trái, nên nguồn lát phải lấy từ
   hàng 28 trở xuống — nếu không sẽ nhân bản cả dải đen vào giữa phòng.
   Dải tường 336..486 và ô sàn 700..780 x 420..460 của ảnh không có mock-HUD
   → dùng làm nguồn lát. Toàn bộ số đo dưới đây quy về khung canvas 960x600. */
function izNetPatch(img) {
  izFill(img, 0, 0, 340, 130, 336, 28, 150, 102);      // thẻ nhân vật + pill tên phòng
  izFill(img, 0, 126, 186, 20, 336, 108, 150, 20);     // đáy thanh "Nhiệm vụ hiện tại" bake
  izFill(img, 486, 0, 474, 74, 336, 28, 150, 74);      // 5 nút dock + pill "3.NETWERK ROOM"
  izFill(img, 902, 172, 54, 46, 700, 420, 80, 40);     // nút sách nổi góc phải
  izFill(img, 186, 124, 54, 58, 250, 124, 54, 58);     // cô gái bake đứng trên nóc RACK01
  izFill(img, 96, 156, 86, 96, 340, 128, 84, 92);      // Tuấn bake + bảng tên của ảnh
  izFill(img, 62, 392, 104, 96, 700, 420, 80, 40);     // nhân vật player bake + bảng tên
  izFill(img, 336, 378, 66, 68, 700, 420, 80, 40);     // cô gái bake giữa phòng
  izFill(img, 288, 492, 672, 108, 700, 420, 80, 40);   // ô chat + thanh nhập + dải đáy
  izFill(img, 600, 466, 360, 134, 700, 420, 80, 40);   // 3 nút cảm ứng Touch/Chạy/Tương tác
}
/* Ảnh có sẵn nhãn RACK01-03 trên đầu mỗi tủ; mask cô gái bake đè lên nhãn
   RACK01 nên chỉ vẽ lại đúng nhãn đó, giữ nguyên vị trí gốc của ảnh. */
function izNetLabels() {
  izPill('🔒 3. NETWORK ROOM - RACK & THIẾT BỊ', 30, 14, 300, '#0284c7');
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px ' + IZF; ctx.fillText('RACK01', 196, 148);
}
drawNetworkRoom = function () {
  const t = Date.now() / 1000;
  if (IMG.net_bg) {
    ctx.drawImage(IMG.net_bg, 0, 0, 960, 600);
    izNetPatch(IMG.net_bg); izNetLabels();
  } else {
    drawNetworkRoomVector(t);
  }
  drawSprite(120, 200, 'tuan'); drawSprite(S.p.x, S.p.y, 'p');
};
drawWorkbench = function (x, y, icon, title, sub, color, done) {
  const t = Date.now() / 1000; izBench(x, y);
  izb(x - 40, y - 30, 80, 52, 6, '#232d44'); izb(x - 34, y - 24, 68, 40, 4, '#0e1424');
  izb(x - 30, y - 18, 5, 18, 1, '#a855f7'); izb(x - 22, y - 18, 5, 18, 1, '#f59e0b'); izb(x - 30, y + 4, 40, 9, 2, '#475569');
  const fx = x + 18, fy = y - 8; ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(fx, fy, 11, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5; for (let k = 0; k < 3; k++) { const a = t * 6 + k * 2.094; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(a) * 9, fy + Math.sin(a) * 9); ctx.stroke(); }
  ctx.fillStyle = done ? '#22c55e' : '#ef4444'; ctx.beginPath(); ctx.arc(x + 32, y - 25, 3 + Math.sin(t * 5) * .6, 0, 7); ctx.fill();
  izSign(x, y, color, `${icon} ${title}`, sub);
};
drawCrimpStation = function (x, y, done) {
  izBench(x, y); izb(x - 30, y - 20, 60, 10, 3, '#6b7280', 'rgba(255,255,255,.3)');
  izb(x - 46, y - 18, 18, 8, 4, '#ef4444'); izb(x + 28, y - 18, 18, 8, 4, '#ef4444');
  ['#f59e0b', '#22c55e', '#38bdf8', '#ef4444', '#a855f7'].forEach((c, i) => { izb(x - 32 + i * 15, y + 2, 10, 14, 2, '#eef2f7'); ctx.fillStyle = c; ctx.fillRect(x - 30 + i * 15, y + 4, 6, 4); });
  [14, 8].forEach((r, i) => { ctx.strokeStyle = IZO; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x + 45, y - 5, r, 0, 6.2); ctx.stroke(); ctx.strokeStyle = i ? '#f59e0b' : '#0ea5e9'; ctx.lineWidth = 4; ctx.stroke(); });
  izSign(x, y, done ? '#16a34a' : '#f59e0b', '🔨 BẤM CÁP RJ45', 'Bấm [E] để thực hành T568B');
};
drawDiagStation = function (x, y, done) {
  izBench(x, y); izb(x - 40, y - 30, 80, 52, 6, '#232d44'); ctx.fillStyle = done ? '#14532d' : '#3a0d0d'; rr(ctx, x - 34, y - 24, 68, 40, 4); ctx.fill();
  ctx.fillStyle = done ? '#bbf7d0' : '#fca5a5'; ctx.font = 'bold 10px ' + IZF; ctx.textAlign = 'center'; ctx.fillText(done ? '✔ OK' : '✖ NO POST', x, y - 1); ctx.textAlign = 'left';
  if (!done) {
    const b = Math.sin(Date.now() * .005) * 3; ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(x + 50, y - 44 + b); ctx.lineTo(x + 62, y - 20 + b); ctx.lineTo(x + 38, y - 20 + b); ctx.closePath(); ctx.fill(); ctx.strokeStyle = IZO; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = IZO; ctx.font = 'bold 13px ' + IZF; ctx.textAlign = 'center'; ctx.fillText('!', x + 50, y - 25 + b); ctx.textAlign = 'left';
  }
  izSign(x, y, done ? '#16a34a' : '#dc2626', '🩺 CHẨN ĐOÁN PC', 'Bấm [E] để sửa máy');
};
/* Nội thất lab vẽ bằng khối hình học — fallback khi chưa nạp được ảnh. */
function drawHardwareLabVector() {
  ctx.fillStyle = '#243247'; ctx.fillRect(0, 0, 960, 600); ctx.fillStyle = 'rgba(255,255,255,.05)';
  for (let y = 130; y < 600; y += 44) for (let x = 0; x < 960; x += 44) if (((x + y) / 44) % 2 === 0) ctx.fillRect(x, y, 44, 44);
  ctx.fillStyle = '#34445e'; ctx.fillRect(0, 0, 960, 130); ctx.fillStyle = '#2a3850'; for (let x = 0; x < 960; x += 24) ctx.fillRect(x, 0, 10, 124);
  for (let x = 0; x < 960; x += 40) { ctx.fillStyle = '#facc15'; ctx.fillRect(x, 126, 20, 6); ctx.fillStyle = IZO; ctx.fillRect(x + 20, 126, 20, 6); }
  const cg = ctx.createRadialGradient(480, 0, 20, 480, 0, 520); cg.addColorStop(0, 'rgba(250,204,21,.14)'); cg.addColorStop(1, 'rgba(250,204,21,0)'); ctx.fillStyle = cg; ctx.fillRect(0, 0, 960, 420);
  izPill('🔧 4. LAB PHẦN CỨNG & IT SUPPORT', 30, 14, 280, '#15803d');
  izb(380, 54, 400, 64, 6, '#27354f'); ctx.fillStyle = '#3a4a6a'; ctx.fillRect(386, 84, 388, 5);
  for (let i = 0; i < 8; i++) { izb(392 + i * 48, 62, 36, 18, 3, ['#0284c7', '#16a34a', '#f59e0b', '#ef4444', '#a855f7', '#38bdf8'][i % 6], 'rgba(255,255,255,.3)'); }
  ctx.fillStyle = '#86efac'; ctx.font = 'bold 10px ' + IZF; ctx.fillText('📦 KHO LINH KIỆN (CPU / RAM / GPU / SSD / PSU...)', 396, 106);
  drawWorkbench(200, 250, '🛠️', 'LẮP RÁP PC', 'Bấm [E] để lắp máy', '#0284c7', S.missionsDone.pcBuild); drawLockChip(200, 168, 'pcBuild');
  drawCrimpStation(480, 250, S.missionsDone.crimp); drawLockChip(480, 168, 'crimp');
  drawDiagStation(760, 250, S.missionsDone.diag); drawLockChip(760, 168, 'diag');
  izDoor();
}
/* Ảnh lab không bake mock-HUD nhưng vẽ chết 5 thứ: dải tên ải sai chữ
   ("4. HARDWARE L"), 2 nhân vật tĩnh, 2 chip khoá "Ải 2/Ải 3" và màn hình
   "NO POST". izFill lát đúng chất liệu gốc của ảnh (tường gỗ / kệ linh kiện /
   dãy case) đè lên, trạng thái thật do code vẽ. */
function izHwPatch(img) {
  izFill(img, 22, 14, 292, 32, 336, 8, 292, 32);       // dải tên ải bake sai chữ
  izFill(img, 448, 158, 80, 30, 540, 158, 80, 30);     // chip "Ải 2" bake
  izFill(img, 731, 158, 80, 30, 540, 158, 80, 30);     // chip "Ải 3" bake
  izFill(img, 442, 336, 50, 76, 392, 336, 50, 76);     // nhân vật áo xanh bake
  izFill(img, 655, 432, 76, 82, 700, 392, 68, 28);     // Chị Hương bake + bảng tên
  izFill(img, 802, 210, 28, 32, 700, 392, 68, 28);     // tam giác cảnh báo bake
  izPill('🔧 4. LAB PHẦN CỨNG & IT SUPPORT', 30, 14, 280, '#15803d');
}
/* Màn hình PC trên bàn CHẨN ĐOÁN: giữ đúng vị trí của ảnh (726..794, 231..267)
   nhưng nội dung theo tiến trình nhiệm vụ diag. */
function izHwScreen() {
  const done = S.missionsDone.diag;
  ctx.fillStyle = done ? '#14532d' : '#3a0d0d';
  rr(ctx, 726, 231, 68, 36, 5); ctx.fill();
  ctx.fillStyle = done ? '#eafff1' : '#ef4444'; ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center'; ctx.fillText(done ? '✔ POST OK' : '✖ NO POST', 760, 253); ctx.textAlign = 'left';
  if (done) return;
  const bob = Math.sin(Date.now() * .005) * 3;
  ctx.fillStyle = '#facc15'; ctx.beginPath();
  ctx.moveTo(816, 213 + bob); ctx.lineTo(827, 235 + bob); ctx.lineTo(805, 235 + bob);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1c1917'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('!', 816, 232 + bob); ctx.textAlign = 'left';
}
drawHardwareLab = function () {
  if (IMG.hw_bg) {
    ctx.drawImage(IMG.hw_bg, 0, 0, 960, 600);
    izHwPatch(IMG.hw_bg); izHwScreen();
    drawLockChip(200, 168, 'pcBuild'); drawLockChip(480, 168, 'crimp'); drawLockChip(760, 168, 'diag');
  } else {
    drawHardwareLabVector();
  }
  drawSprite(680, 470, 'huong'); drawSprite(S.p.x, S.p.y, 'p');
};
/* ---- interior_ccna_bg_revamp.png (Học viện CCNA) là JPEG 1024x637 có hai dải
   đen dọc mép trái/phải và vẽ chết 2 nhân vật chibi kèm bảng thoại của họ, trong
   khi game đã có NPC động + tên do code vẽ. izFill lát đúng chất liệu kề bên của
   ảnh đè lên; biển "PHÒNG THI CCNA", thảm "RA THÀNH PHỐ" và các áp-phích kiến
   thức trên tường là nội dung thật của phòng nên giữ nguyên. */
function izCcnaPatch(img) {
  izFill(img, 0, 0, 17, 128, 17, 0, 8, 128);          // dải đen mép trái - mảng tường
  izFill(img, 0, 128, 17, 472, 17, 128, 8, 472);      // dải đen mép trái - mặt sàn
  izFill(img, 940, 0, 20, 128, 932, 0, 8, 128);       // dải đen mép phải - mảng tường
  izFill(img, 940, 128, 20, 472, 932, 128, 8, 472);   // dải đen mép phải - mặt sàn
  izFill(img, 150, 302, 64, 28, 146, 396, 64, 28);    // bảng thoại "Thầy Đức" bake
  izFill(img, 164, 328, 36, 56, 160, 340, 36, 56);    // Thầy Đức bake (đã có NPC động)
  izFill(img, 452, 302, 131, 28, 452, 345, 131, 28);  // bảng thoại học trò bake
  izFill(img, 583, 302, 14, 28, 600, 302, 14, 28);    // đuôi bảng thoại đè lên vách buồng thi
  izFill(img, 505, 324, 34, 54, 460, 367, 34, 54);    // cô học trò bake
  izPill('🎓 5. HỌC VIỆN CCNA', 30, 14, 210, '#7c3aed');
}
function drawAcademy() {
  const c = INTERIORS.ACADEMY;
  ctx.drawImage(IMG.ccna_bg, 0, 0, 960, 600);
  izCcnaPatch(IMG.ccna_bg);
  drawLockChip(657, 452, GAME_MISSION[c.station.game]);
  [[c.npc.x, c.npc.y, c.npc.sprite], [S.p.x, S.p.y, 'p']].sort((a, b) => a[1] - b[1])
    .forEach(([x, y, r]) => drawSprite(x, y, r));
}

/* ---- interior_helpdesk_isometric.png (Phòng 6) là JPEG 1024x572 đổi đuôi .png,
   lát full khung 960x600 nên hệ số nguồn→canvas là 1024/960 × 572/600 (khác
   IZ_SX/IZ_SY của CCNA 637). Ảnh bản sạch đã bỏ toàn bộ nhân vật + nút UI, chỉ
   còn sót một hộp trắng chữ "SỞ IT" (vết cắt minimap cũ) ở góc trên phải →
   izItFill lát dải tường xám ngay kề trái hộp đè lên cho tường liền mạch.
   Chỉ drawImage nguồn→đích, không đọc pixel nên vẫn chạy trên file://. ---- */
const IT_SX = 1024 / 960, IT_SY = 572 / 600;
function izItFill(img, dx, dy, dw, dh, sx, sy, sw, sh) {
  ctx.save(); ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
  for (let y = 0; y < dh; y += sh) for (let x = 0; x < dw; x += sw)
    ctx.drawImage(img, sx * IT_SX, sy * IT_SY, sw * IT_SX, sh * IT_SY, dx + x, dy + y, sw, sh);
  ctx.restore();
}
function izItPatch(img) {
  // hộp trắng "SỞ IT" góc trên phải (canvas ~x736-908,y12-96) → lát tường xám kề trái
  izItFill(img, 736, 10, 174, 88, 712, 10, 22, 88);
}
function drawItHelpdesk() {
  const c = INTERIORS.IT;
  ctx.drawImage(IMG.it_bg, 0, 0, 960, 600);
  izItPatch(IMG.it_bg);
  // nhãn "RA THÀNH PHỐ" gọn trên thảm đỏ góc dưới trái (thảm này chưa có chữ)
  ctx.save(); ctx.translate(118, 540); ctx.rotate(-0.14); ctx.textAlign = 'center';
  ctx.font = 'bold 12.5px "Segoe UI",system-ui,sans-serif';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(70,12,12,.72)'; ctx.strokeText('🚪 RA THÀNH PHỐ', 0, 0);
  ctx.fillStyle = '#fff'; ctx.fillText('🚪 RA THÀNH PHỐ', 0, 0); ctx.restore(); ctx.textAlign = 'left';
  drawLockChip(c.station.x, c.station.y + 132, GAME_MISSION[c.station.game]);
  [[c.npc.x, c.npc.y, c.npc.sprite], [S.p.x, S.p.y, 'p']].sort((a, b) => a[1] - b[1])
    .forEach(([x, y, r]) => drawSprite(x, y, r));
}

/* ---- interior_datacenter_isometric.png (Cảnh 7 — DATA CENTER) là JPEG
   1024x572 đổi đuôi .png, lát full khung 960x600 y hệt Phòng 6 nên dùng chung
   hệ số IT_SX/IT_SY. Ảnh sạch: không NPC, không bong bóng tên, không nút UI,
   không hộp trắng lỗi ở góc trên phải. Thứ duy nhất còn sót là một ngôi sao
   xám 4 cánh AI vẽ lẫn ngay mép sàn góc dưới phải (canvas 858..896 × 478..528)
   → izIsoMask chép dải gỗ kề trái, trượt 90px DỌC THEO dốc mép sàn (dy/dx≈0.54)
   để đường mép và vân gỗ khớp nhau. Vẫn chỉ drawImage nguồn→đích, không đọc
   pixel nên chạy được trên file://. ---- */
function izIsoMask(img, dx, dy, dw, dh, sx, sy) {
  ctx.drawImage(img, sx * IT_SX, sy * IT_SY, dw * IT_SX, dh * IT_SY, dx, dy, dw, dh);
}
function izDcPatch(img) { izIsoMask(img, 834, 466, 76, 72, 744, 515); }
/* Nhãn nổi cho phòng vẽ bằng ảnh: chỉ chip [E] + badge ✅ XONG, không kèm
   bàn/ghế vector để không bị vẽ đè hai lớp lên thiết bị đã có trong ảnh. */
function izStationTag(cfg) {
  const st = cfg.station, x = st.x, by = st.y + 86 + Math.sin(Date.now() / 455) * 2;
  const txt = '[E] ' + st.icon + ' ' + st.title;
  ctx.font = 'bold 12px ' + IZF;
  const w = ctx.measureText(txt).width + 26;
  izb(x - w / 2, by, w, 26, 13, cfg.accent, 'rgba(255,255,255,.35)');
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 4;
  ctx.fillText(txt, x, by + 18);
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  if (buildingStatus(cfg.id) === 'done') {
    izb(x + w / 2 + 6, by + 3, 62, 20, 10, '#22c55e');
    ctx.fillStyle = '#04120a'; ctx.font = 'bold 9.5px ' + IZF; ctx.fillText('✅ XONG', x + w / 2 + 37, by + 17);
  }
  ctx.textAlign = 'left';
}
function drawDataCenter() {
  const c = INTERIORS.DC;
  ctx.drawImage(IMG.dc_bg, 0, 0, 960, 600);
  izDcPatch(IMG.dc_bg);
  izStationTag(c);
  drawLockChip(c.station.x, c.station.y + 132, GAME_MISSION[c.station.game]);
  [[c.npc.x, c.npc.y, c.npc.sprite], [S.p.x, S.p.y, 'p']].sort((a, b) => a[1] - b[1])
    .forEach(([x, y, r]) => drawSprite(x, y, r));
}

/* ---- interior_isp_isometric.png (Cảnh 9 — TRẠM MẠNG ISP) cũng là JPEG
   1024x572 đổi đuôi .png, lát full khung 960x600 → dùng chung IT_SX/IT_SY.
   Ảnh sạch: không NPC, không bong bóng tên, không nút UI. Defect duy nhất là
   ngôi sao xám 4 cánh AI vẽ lẫn ở vùng ĐEN ngoài mép sàn dưới-phải
   (canvas 858..902 × 484..526). Vì sao nằm trong nền đen chứ không trên gỗ nên
   chỉ cần chép một vùng đen thuần của chính ảnh (canvas 20..100 × 540..596,
   đã đo lumMax = 1.0) đè lên — 4 hộp ngắn xếp THANG bám dốc mép sàn
   (dx/dy ≈ -1.4) để không cắt mất chỉ một pixel của đường viền chân tường. ---- */
const IZ_ISP_BLACK = { x: 20, y: 540 };
function izIspPatch(img) {
  [[872, 490, 28, 8], [860, 498, 40, 6], [848, 504, 52, 8], [836, 512, 64, 20]]
    .forEach(([dx, dy, dw, dh]) => izIsoMask(img, dx, dy, dw, dh, IZ_ISP_BLACK.x, IZ_ISP_BLACK.y));
}
function drawIspStation() {
  const c = INTERIORS.ISP;
  ctx.drawImage(IMG.isp_bg, 0, 0, 960, 600);
  izIspPatch(IMG.isp_bg);
  izStationTag(c);
  drawLockChip(c.station.x, c.station.y + 132, GAME_MISSION[c.station.game]);
  [[c.npc.x, c.npc.y, c.npc.sprite], [S.p.x, S.p.y, 'p']].sort((a, b) => a[1] - b[1])
    .forEach(([x, y, r]) => drawSprite(x, y, r));
}

/* ---- interior_office_wifi_isometric.png (Cảnh 8 — VP KINH DOANH), cùng bộ
   JPEG 1024x572 lát full khung 960x600 → dùng chung IT_SX/IT_SY. Ảnh sạch:
   không NPC, không chữ UI; chữ "RA THÀNH PHỐ" trên thảm đỏ đã có sẵn trong
   ảnh nên không cần nhãn exit. Defect duy nhất: ngôi sao xám 4 cánh AI vẽ
   lẫn trên nền đen ngoài mép sàn dưới-phải (canvas 855..900 × 480..525) →
   chép đè vùng đen thuần cùng ảnh (canvas 680..742 × 548..600, hoàn toàn
   ngoài mép sàn SE). Nhãn [E] + lock chip + ✅ XONG vẽ nổi như Phòng 7/9. ---- */
function izSalesPatch(img) { izIsoMask(img, 852, 478, 62, 52, 680, 548); }
function drawSalesOffice() {
  const c = INTERIORS.SALES;
  ctx.drawImage(IMG.sales_bg, 0, 0, 960, 600);
  izSalesPatch(IMG.sales_bg);
  izStationTag(c);
  drawLockChip(c.station.x, c.station.y + 120, GAME_MISSION[c.station.game]);
  [[c.npc.x, c.npc.y, c.npc.sprite], [S.p.x, S.p.y, 'p']].sort((a, b) => a[1] - b[1])
    .forEach(([x, y, r]) => drawSprite(x, y, r));
}

/* ===== V5: TOÀ NHÀ + CÂY CHIBI, TÊN NHÂN VẬT ===== */
const PLAYER_NAME = 'Nhân-IT';
const IZ_NAMES = { lan:['Chị Lan','#facc15'], tuan:['Tuấn (Net)','#22c55e'], huong:['Chị Hương','#f59e0b'], duc:['Thầy Đức','#c084fc'],
  linh:['Chị Linh','#38bdf8'], khoa:['Anh Khoa','#0ea5e9'], mai:['Chị Mai','#10b981'], son:['Anh Sơn','#f87171'] };
const _sprNoName = drawSprite;
drawSprite = function (x, y, r = 'p') {
  _sprNoName(x, y, r);
  const me = r === 'p', [nm, col] = me ? [PLAYER_NAME, '#38bdf8'] : (IZ_NAMES[r] || ['???', '#94a3b8']);
  const cx = x + 10, h = me ? 24 : 17, ty = y - (me ? 33 : 24) + (me ? Math.sin(Date.now() / 330) * 1.5 : 0);
  ctx.save(); ctx.font = (me ? 'bold 14px ' : 'bold 10.5px ') + IZF;
  const w = ctx.measureText(nm).width + (me ? 38 : 16), g = ctx.createLinearGradient(0, ty, 0, ty + h);
  g.addColorStop(0, me ? '#22b8ff' : '#1e293b'); g.addColorStop(1, me ? '#0369a1' : '#0f172a');
  if (me) { ctx.fillStyle = 'rgba(56,189,248,.28)'; rr(ctx, cx - w / 2 - 4, ty - 4, w + 8, h + 8, h / 2 + 4); ctx.fill(); }
  ctx.fillStyle = g; rr(ctx, cx - w / 2, ty, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = me ? '#e0f7ff' : col; ctx.lineWidth = me ? 2 : 1.4; rr(ctx, cx - w / 2, ty, w, h, h / 2); ctx.stroke();
  ctx.fillStyle = me ? '#0369a1' : '#0f172a'; ctx.beginPath(); ctx.moveTo(cx - 4, ty + h - .5); ctx.lineTo(cx + 4, ty + h - .5); ctx.lineTo(cx, ty + h + 5); ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = me ? '#fff' : col;
  if (me) { ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 3; ctx.fillText(nm, cx + 9, ty + 17); ctx.shadowBlur = 0; ctx.font = '13px "Segoe UI Emoji",sans-serif'; ctx.fillText('💻', cx - w / 2 + 14, ty + 17); }
  else ctx.fillText(nm, cx, ty + 12.5);
  ctx.restore();
};
const IZ_BW = { OFFICE: '#f6dcaa', ACADEMY: '#dcc8f7', IT: '#c4e6fb', HARDWARE: '#c6ecce', DC: '#bfe3f2', SALES: '#c4eedd', ISP: '#f7c9c4' };
function izBldSpr(id, x, y) {
  const m = SPR_META['bld_' + id.toLowerCase()] || { w: 190, ay: 110 }, b = blds.find(q => q.id === id), t = Date.now() / 1000;
  const W = Math.min(m.w, b ? b.w + 6 : 190), H = Math.max(m.ay, 84), L = x - W / 2, T = y - H, rh = H * .34, c = b ? b.c : '#38bdf8';
  const night = S.weather === 'night';
  izs(x, y, W / 2 + 6);
  if (id === 'ACADEMY') { izb(L + W - 30, T - 16, 3, 20, 1, '#64748b'); ctx.fillStyle = '#facc15'; ctx.fillRect(L + W - 27, T - 15, 16, 9); ctx.strokeStyle = IZO; ctx.lineWidth = 1.5; ctx.strokeRect(L + W - 27, T - 15, 16, 9); }
  if (id === 'IT') { izb(L + 24, T - 18, 3, 22, 1, '#64748b'); ctx.fillStyle = Math.sin(t * 5) > 0 ? '#ef4444' : '#7f1d1d'; ctx.beginPath(); ctx.arc(L + 25.5, T - 19, 4, 0, 7); ctx.fill(); }
  if (id === 'ISP') { izb(L + W - 26, T - 8, 4, 14, 1, '#64748b'); ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.ellipse(L + W - 24, T - 10, 14, 8, -.5, 0, 7); ctx.fill(); ctx.strokeStyle = IZO; ctx.lineWidth = 2; ctx.stroke(); }
  izb(L, T + rh - 6, W, H - rh + 6, 10, IZ_BW[id] || '#e5e7eb', 'rgba(255,255,255,.5)');
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(L - 8, T + rh + 2); ctx.lineTo(L + 14, T); ctx.lineTo(L + W - 14, T); ctx.lineTo(L + W + 8, T + rh + 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = IZO; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(L + 18, T + 4, W - 36, 5);
  const meta = BLD_META[id]; ctx.font = '19px "Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(meta ? meta.icon : '🏢', x, T + rh * .82); ctx.textAlign = 'left';
  const wy = T + rh + 10;
  [[L + 14], [L + 42], [L + W - 64], [L + W - 36]].forEach(([wx], i) => {
    if (id === 'DC') { const fx = wx + 11, fy = wy + 11; izb(wx - 1, wy - 1, 24, 24, 12, '#1f3b52'); ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2;
      for (let k = 0; k < 3; k++) { const a = t * 6 * (i % 2 ? 1 : -1) + k * 2.094; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(a) * 9, fy + Math.sin(a) * 9); ctx.stroke(); } return; }
    izb(wx, wy, 22, 22, 4, night || Math.sin(t + i * 2) > -.2 && i % 2 ? '#ffe9a8' : '#9bd4f5'); ctx.fillStyle = IZO; ctx.fillRect(wx + 10, wy, 2, 22); ctx.fillRect(wx, wy + 10, 22, 2);
  });
  if (id === 'SALES' || id === 'OFFICE') for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#fff' : c; ctx.fillRect(x - 24 + k * 8, y - 40, 8, 10); }
  izb(x - 14, y - 30, 28, 30, 7, c, 'rgba(255,255,255,.35)'); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x + 8, y - 14, 2.2, 0, 7); ctx.fill();
}
function izTree(x, y, s, v) {
  izs(x, y + 1, 24 * s); izb(x - 4 * s, y - 14 * s, 8 * s, 15 * s, 2, '#7a4b2a');
  const g = ['#2f9e5b', '#27894f', '#3aa866'][v]; ctx.lineJoin = 'round';
  [[46, 30, 12], [38, 28, 34], [28, 26, 54]].forEach(([bw, th, by]) => {
    const l = x - bw * s / 2, r = x + bw * s / 2, bot = y - by * s + 12 * s, top = bot - th * s;
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(r, bot); ctx.lineTo(l, bot); ctx.closePath(); ctx.fill(); ctx.strokeStyle = IZO; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = '#f4f9ff'; ctx.beginPath(); ctx.moveTo(x, top + 1); ctx.lineTo(x + bw * s * .24, top + th * s * .5); ctx.lineTo(x + bw * s * .08, top + th * s * .42); ctx.lineTo(x - bw * s * .08, top + th * s * .52); ctx.lineTo(x - bw * s * .24, top + th * s * .5); ctx.closePath(); ctx.fill();
  });
  if (v === 2) [[-8, -30, '#ef4444'], [9, -46, '#facc15'], [-3, -62, '#38bdf8']].forEach(([dx, dy, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, 3 * s, 0, 7); ctx.fill(); });
}
function izLamp(x, y, s) {
  izs(x, y + 1, 12 * s); izb(x - 3 * s, y - 56 * s, 6 * s, 56 * s, 2, '#475569'); izb(x - 9 * s, y - 6 * s, 18 * s, 6 * s, 3, '#334155');
  ctx.fillStyle = S.weather === 'night' ? '#fff3b0' : '#fde68a'; ctx.beginPath(); ctx.arc(x, y - 60 * s, 8 * s, 0, 7); ctx.fill(); ctx.strokeStyle = IZO; ctx.lineWidth = 2.5; ctx.stroke();
}
function izSnowman(x, y, s) {
  izs(x, y + 1, 18 * s); [[0, -10, 13, '#fff'], [0, -29, 10, '#fff']].forEach(([dx, dy, r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y + dy * s, r * s, 0, 7); ctx.fill(); ctx.strokeStyle = IZO; ctx.lineWidth = 2.5; ctx.stroke(); });
  ctx.fillStyle = '#0f172a'; ctx.fillRect(x - 4 * s, y - 32 * s, 2 * s, 2 * s); ctx.fillRect(x + 3 * s, y - 32 * s, 2 * s, 2 * s);
  ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.moveTo(x, y - 29 * s); ctx.lineTo(x + 9 * s, y - 27 * s); ctx.lineTo(x, y - 25 * s); ctx.fill();
  izb(x - 8 * s, y - 46 * s, 16 * s, 9 * s, 2, '#ef4444'); izb(x - 11 * s, y - 38 * s, 22 * s, 4 * s, 2, '#b91c1c');
}
function izPresent(x, y, s, v) {
  const c = ['#ef4444', '#3b82f6', '#a855f7'][v]; izs(x, y + 1, 14 * s); izb(x - 11 * s, y - 18 * s, 22 * s, 18 * s, 3, c, 'rgba(255,255,255,.3)');
  ctx.fillStyle = '#facc15'; ctx.fillRect(x - 2 * s, y - 18 * s, 4 * s, 18 * s); ctx.fillRect(x - 11 * s, y - 11 * s, 22 * s, 4 * s);
  ctx.beginPath(); ctx.arc(x - 4 * s, y - 21 * s, 4 * s, 0, 7); ctx.arc(x + 4 * s, y - 21 * s, 4 * s, 0, 7); ctx.fill();
}
const _dsOld = drawSpr;
drawSpr = function (name, x, y, s) {
  s = s || 1;
  if (name.indexOf('bld_') === 0) { izBldSpr(name.slice(4).toUpperCase(), x, y); return true; }
  let m = /^p_tree_snow_([abc])$/.exec(name); if (m) { izTree(x, y, s, 'abc'.indexOf(m[1])); return true; }
  m = /^p_present_([abc])$/.exec(name); if (m) { izPresent(x, y, s, 'abc'.indexOf(m[1])); return true; }
  if (name === 'p_lantern') { izLamp(x, y, s); return true; }
  if (name === 'p_snowman') { izSnowman(x, y, s); return true; }
  return _dsOld(name, x, y, s);
};

/* ===== V6: DÂN CƯ TRONG THÀNH PHỐ (NPC đi lại, chào hỏi) ===== */
const AMB_G = ['Chào IT!', 'A, vua mọi nghề!', 'IT đa phương tiện kìa!', 'Master Culi kìa!', 'Đại ca Nhân-IT!', 'Cứu tinh công ty đây rồi!', 'Thánh sửa máy in tới rồi!',
  'IT ơi, wifi yếu quá!', 'Nhân-IT, restart thử chưa?', 'Ông trùm bấm cáp kìa!', 'IT ơi, em quên mật khẩu rồi!', 'Hôm nay có ca nào khó không IT?', 'Chào sếp IT!', 'Vua fix bug tới rồi!'];
const AMB_K = {
  drink: ['Ực ực… nước mát quá!', 'Cây nước này lạnh ghê!', 'Hết nước rồi, IT thay bình giúp em!'],
  meet: ['Suỵt… đang họp mà!', 'Deadline tuần sau nha cả nhà!', 'Máy chiếu lại không lên hình rồi…', 'Ai share màn hình giùm cái!'],
  present: ['Slide tiếp theo nè…', 'Số liệu quý này đẹp lắm!', 'Có câu hỏi nào không ạ?'],
  recep: ['Chào mừng đến công ty!', 'Anh chị cần gặp ai ạ?', 'Có khách tới, ai nhận giùm!'],
  desk: ['Ticket đâu mà nhiều thế…', 'Cà phê đâu rồi?', 'Lỗi này lạ ghê…', 'Hôm nay có bánh không ta?'],
  walk: ['Trễ họp rồi trễ họp rồi!', 'Trưa nay ăn gì nhỉ?', 'Wifi chỗ này chập chờn quá…', 'Đi photo tài liệu cái…'],
  chat: ['Nghe nói server sập đêm qua!', 'Cuối tuần đi cà phê không?', 'Order trà sữa nhóm mình nhé!', 'IT dạo này ngầu ghê!']
};
const AMB_H = ['#1e293b', '#4a2c14', '#78350f', '#0f172a', '#a16207', '#312e81', '#7c2d12', '#292524'];
const AMB_S = ['#f97316', '#14b8a6', '#8b5cf6', '#ec4899', '#84cc16', '#eab308', '#06b6d4', '#f43f5e', '#6366f1', '#22c55e', '#fb923c', '#0ea5e9'];
for (let i = 0; i < 14; i++) ROLE_C['a' + i] = [AMB_H[(i * 3) % AMB_H.length], AMB_S[(i * 5) % AMB_S.length]];
const AMBS = {};
const AMB_RING = [[320, 146], [640, 146], [726, 232], [726, 372], [640, 456], [320, 456], [234, 372], [234, 232]];
function ambBuild(sc) {
  const mk = (role, fx, fy, o) => {
    const n = Object.assign({ role, fx, fy, dir: 1, ph: 0, moving: false, wait: Math.random() * 3, v: 40, i: 0, sayT: 0, say: '', cool: Math.random() * 3, chat: 4 + Math.random() * 8, kind: 'walk', act: '', sit: false, path: null }, o);
    if (n.path) { const q = n.path[(n.i + n.path.length - 1) % n.path.length]; n.fx = q[0]; n.fy = q[1]; }
    return n;
  };
  const rot = (a, k) => a.slice(k).concat(a.slice(0, k));
  if (sc === 'WORLD') return [
    mk('a0', 0, 0, { path: AMB_RING, i: 1, v: 44 }), mk('a1', 0, 0, { path: AMB_RING.slice().reverse(), i: 1, v: 38 }), mk('a2', 0, 0, { path: rot(AMB_RING, 3), i: 1, v: 50 }),
    mk('a3', 0, 0, { path: [[70, 175], [230, 175]], i: 1, v: 40 }), mk('a4', 0, 0, { path: [[890, 175], [706, 175]], i: 1, v: 46 }),
    mk('a5', 0, 0, { path: [[70, 440], [890, 440]], i: 1, v: 52 }), mk('a6', 0, 0, { path: [[890, 440], [70, 440]], i: 1, v: 42 }),
    mk('a7', 440, 364, { kind: 'chat', dir: 1 }), mk('a8', 468, 364, { kind: 'chat', dir: -1 })];
  // Đám đông văn phòng: bám theo đúng vị trí nội thất trong ảnh nền mới
  if (sc === 'OFFICE') return [
    mk('a3', 150, 142, { kind: 'recep', dir: -1 }), mk('a9', 690, 470, { kind: 'drink', act: 'drink' }),
    mk('a4', 195, 487, { kind: 'meet', sit: true }), mk('a7', 310, 368, { kind: 'meet', sit: true }), mk('a10', 255, 487, { kind: 'meet', sit: true }),
    mk('a11', 105, 420, { kind: 'present', dir: 1 }), mk('a12', 488, 440, { kind: 'chat' }),
    mk('a8', 0, 0, { path: [[110, 312], [400, 312], [690, 312], [400, 312]], i: 1 })];
  if (sc === 'NET_ROOM') return [mk('a10', 0, 0, { path: [[330, 440], [560, 440], [800, 440], [560, 440]], i: 1, v: 46 })];
  if (sc === 'HARDWARE_LAB') return [mk('a11', 0, 0, { path: [[300, 382], [600, 382], [860, 382], [600, 382]], i: 1, v: 46 })];
  const c = INTERIORS[sc]; if (!c) return [];
  const rs = { ACADEMY: ['a5', 'a6'], IT: ['a2', 'a13'], DC: ['a0', 'a9'], SALES: ['a1', 'a12'], ISP: ['a7', 'a4'] }[sc] || ['a5', 'a6'];
  // VP Kinh Doanh: đi bộ dọc hành lang giữa phòng y≈425 (đường y 393..453 thông suốt);
  // người còn lại đứng cạnh sofa đáy — đường loop mặc định văng qua hộp dãy bàn giữa
  if (sc === 'SALES') return [
    mk(rs[0], 0, 0, { path: [[330, 425], [560, 425], [430, 425]], i: 1 }),
    mk(rs[1], 555, 448, { kind: 'chat', dir: -1 })
  ];
  const d = (c.props || []).find(q => q.t === 'desk' && q.y > 400) || { x: 280, y: 460, w: 150 };
  return [mk(rs[0], 0, 0, { path: [[300, 332], [560, 332], [430, 404], [300, 404]], i: 1 }), mk(rs[1], d.x + d.w + 28, d.y + 44, { kind: 'desk', dir: -1 })];
}
function ambList() { return AMBS[S.scene] || (AMBS[S.scene] = ambBuild(S.scene)); }
function ambStep() {
  const now = performance.now(), dt = Math.min(.05, (now - (ambStep.t || now)) / 1000); ambStep.t = now;
  const px = S.p.x + 10 + (S.scene === 'STREET' ? window._camX || 0 : 0), py = S.p.y + 30;
  const busy = () => getComputedStyle(document.getElementById('dialog')).display !== 'none' || !!openModalEl();
  ambList().forEach(n => {
    n.sayT -= dt; n.cool -= dt; n.chat -= dt; n.wait -= dt; n.moving = false;
    // Phố Ngoài: bong bóng do bộ hẹn thoại meme IT (stMemeStep) quản lí để không bao giờ có 2 người nói cùng lúc
    if (S.scene !== 'STREET') {
      if (Math.hypot(n.fx - px, n.fy - py) < 80 && n.cool <= 0 && !busy()) {
        const K = AMB_K[n.kind] || [];
        n.say = (Math.random() < .35 && K.length) ? K[Math.random() * K.length | 0] : AMB_G[Math.random() * AMB_G.length | 0];
        n.sayT = 3.2; n.cool = 9 + Math.random() * 6; n.chat = 8 + Math.random() * 6; n.dir = px > n.fx ? 1 : -1; n.wait = Math.max(n.wait, 1.8);
      } else if (n.chat <= 0) {
        const K = AMB_K[n.kind]; if (K && n.sayT <= 0) { n.say = K[Math.random() * K.length | 0]; n.sayT = 2.8; } n.chat = 9 + Math.random() * 9;
      }
    }
    if (!n.path || n.wait > 0) return;
    const T = n.path[n.i], dx = T[0] - n.fx, dy = T[1] - n.fy, dist = Math.hypot(dx, dy), st = n.v * dt;
    if (dist <= st) { n.fx = T[0]; n.fy = T[1]; n.i = (n.i + 1) % n.path.length; n.wait = Math.random() < .5 ? 0 : 1 + Math.random() * 3; }
    else { n.fx += dx / dist * st; n.fy += dy / dist * st; n.moving = true; if (Math.abs(dx) > 1) n.dir = dx > 0 ? 1 : -1; n.ph += st / 3.6; }
  });
}
function ambDraw(n) {
  const x = n.fx - 10, y = n.fy - 30;
  window._amb = { moving: n.moving, ph: n.ph, dir: n.dir }; ctx.save();
  try {
    if (n.sit) { ctx.beginPath(); ctx.rect(x - 18, y - 24, 56, 48); ctx.clip(); }
    _sprNoName(x, y, n.role);
  } finally { ctx.restore(); window._amb = null; }
  if (n.act === 'drink') { const cx = n.fx + n.dir * 9, cy = n.fy - 14; izb(cx - 3, cy - 4, 7, 9, 2, '#fff'); ctx.fillStyle = '#38bdf8'; ctx.fillRect(cx - 2, cy, 5, 4); }
}
const _spr2 = drawSprite;
drawSprite = function (x, y, r = 'p') {
  if (r !== 'p') return _spr2(x, y, r);
  let A = [], B = []; const pf = y + 30;
  try { const L = ambList().slice().sort((a, b) => a.fy - b.fy); A = L.filter(n => n.fy <= pf); B = L.filter(n => n.fy > pf); } catch (e) {}
  A.forEach(n => { try { ambDraw(n); } catch (e) {} });
  _spr2(x, y, 'p');
  B.forEach(n => { try { ambDraw(n); } catch (e) {} });
};
/* Tách bong bóng thành nhiều dòng (tối đa ~256px) cho thoại meme dài không tràn ra ngoài màn hình */
function sayLines(txt, maxW) {
  const L = []; let cur = '';
  txt.split(' ').forEach(w => {
    const t = cur ? cur + ' ' + w : w;
    if (cur && ctx.measureText(t).width > maxW) { L.push(cur); cur = w; } else cur = t;
  });
  if (cur) L.push(cur);
  return L;
}
function ambBubbles() {
  ambList().forEach(n => {
    if (n.sayT <= 0 || !n.say) return;
    ctx.save(); ctx.font = 'bold 11.5px ' + IZF; ctx.globalAlpha = Math.min(1, n.sayT * 2.5);
    const L = sayLines(n.say, 236), w = Math.min(256, Math.max.apply(null, L.map(s => ctx.measureText(s).width)) + 20), h = 9 + L.length * 14;
    const cam = S.scene === 'STREET' ? window._camX || 0 : 0;   // phố cuộn: kẹp trong khung nhìn, không ngoài màn hình
    const bx = Math.max(cam + 4, Math.min(cam + 956 - w, n.fx - w / 2)), by = Math.max(2, n.fy - 41 - h);
    izb(bx, by, w, h, 10, '#fffdf4');
    ctx.fillStyle = '#fffdf4'; ctx.beginPath(); ctx.moveTo(n.fx - 5, by + h - 1); ctx.lineTo(n.fx + 5, by + h - 1); ctx.lineTo(n.fx, by + h + 6); ctx.fill();
    ctx.strokeStyle = IZO; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(n.fx - 5, by + h); ctx.lineTo(n.fx, by + h + 6); ctx.lineTo(n.fx + 5, by + h); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center';
    L.forEach((s, i) => ctx.fillText(s, bx + w / 2, by + 15 + i * 14));
    ctx.restore();
  });
}
const _updAmb = update; update = function () { try { ambStep(); } catch (e) {} _updAmb(); };
const _rndAmb = render; render = function () { _rndAmb(); try { ambBubbles(); } catch (e) {} };

/* ============ TỰ ĐỘNG CANH GIỮA MÀN HÌNH (DỌC VÀ NGANG) ============ */
function fitApp() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = h > w;
  const app = document.getElementById('app');
  const touch = document.getElementById('touch');
  if (!app) return;

  if (isPortrait) {
    // Màn hình dọc: Khung game ở trên, phím bấm ở dưới
    const scale = Math.min((w - 12) / 960, (h * 0.48) / 600);
    app.style.left = '50%';
    app.style.top = `${10 + (300 * scale)}px`;
    app.style.transform = `translate(-50%, -50%) scale(${scale})`;
    if (touch) touch.classList.add('portrait-mode');
  } else {
    // Màn hình ngang: Khung game canh giữa toàn màn hình
    const scale = Math.min((w - 16) / 960, (h - 16) / 600);
    app.style.left = '50%';
    app.style.top = '50%';
    app.style.transform = `translate(-50%, -50%) scale(${scale})`;
    if (touch) touch.classList.remove('portrait-mode');
  }
}
window.addEventListener('resize', fitApp);
window.addEventListener('orientationchange', () => setTimeout(fitApp, 200));

/* ============ ĐIỀU KHIỂN CẢM ỨNG ĐỘC LẬP (KHÔNG BỊ LỖI BLUR) ============ */


function setupBtn(id, dirKey) {
  const el = document.getElementById(id);
  if (!el) return;

  const press = (e) => {
    e.preventDefault(); e.stopPropagation();
    touchDir[dirKey] = true;
    el.classList.add('active');
  };
  const release = (e) => {
    e.preventDefault(); e.stopPropagation();
    touchDir[dirKey] = false;
    el.classList.remove('active');
  };

  el.addEventListener('touchstart', press, { passive: false });
  el.addEventListener('touchend', release, { passive: false });
  el.addEventListener('touchcancel', release, { passive: false });
  el.addEventListener('mousedown', press);
  el.addEventListener('mouseup', release);
  el.addEventListener('mouseleave', release);
}

setupBtn('m-up', 'up');
setupBtn('m-down', 'down');
setupBtn('m-left', 'left');
setupBtn('m-right', 'right');

// Nút tương tác E
const actBtn = document.getElementById('m-act');
if (actBtn) {
  const doActTouch = (e) => {
    e.preventDefault(); e.stopPropagation();
    actBtn.classList.add('active');
    const dlg = document.getElementById('dialog');
    if (dlg && dlg.style.display === 'flex') {
      dlg.style.display = 'none';
    } else {
      doAction();
    }
    setTimeout(() => actBtn.classList.remove('active'), 150);
  };
  actBtn.addEventListener('touchstart', doActTouch, { passive: false });
  actBtn.addEventListener('click', doActTouch);
}
/* ============ BẬT / TẮT TOÀN MÀN HÌNH ============ */
function toggleFullScreen() {
  const doc = window.document;
  const docEl = doc.documentElement;

  const requestFS = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  const cancelFS = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    if (requestFS) {
      requestFS.call(docEl);
    }
  } else {
    if (cancelFS) {
      cancelFS.call(doc);
    }
  }
  setTimeout(fitApp, 200);
}
/* ===== V7: PHỐ NGOÀI + ẢI "CÀI WIN DẠO" ===== */
Object.assign(IZ_NAMES, { a2: ['Chị Hoa', '#facc15'], a5: ['Anh Tuấn', '#22c55e'], a8: ['Cô Mai', '#38bdf8'] });
const WIN_JOBS = [
 { who: 'Chị Hoa', ic: '☕', ask: 'Laptop Dell của quán chậm rì, dính virus. Cài lại Win giùm em nha!', qs: [
  ['Việc ĐẦU TIÊN trước khi cài lại Win?', ['Format ổ luôn cho nhanh', 'Sao lưu dữ liệu của khách ra ổ ngoài', 'Mang máy về tiệm tính sau'], 1, 'Luôn backup dữ liệu khách trước khi format!'],
  ['Tạo USB cài Win bằng cách nào?', ['Chép file ISO vào USB', 'Dùng Rufus: chọn ISO + chuẩn UEFI/GPT để tạo USB boot', 'Đổi đuôi .iso thành .exe'], 1, 'USB boot phải tạo bằng Rufus hoặc Media Creation Tool.'],
  ['Máy Dell: phím mở Boot Menu?', ['F12', 'Delete', 'F1'], 0, 'Dell dùng F12 để chọn thiết bị khởi động.'],
  ['Chọn kiểu cài nào để máy sạch virus?', ['Upgrade giữ file cũ', 'Custom: format phân vùng C rồi cài vào đó', 'Cài đè lên ổ D của khách'], 1, 'Custom + format C để xoá sạch virus, giữ nguyên ổ D.']] },
 { who: 'Anh Tuấn', ic: '🏪', ask: 'Máy HP tạp hoá cũ lắm, không nhận USB boot. Anh nhờ em cứu!', qs: [
  ['Máy đời cũ chỉ chạy Legacy BIOS, USB GPT không boot. Làm gì?', ['Tạo lại USB theo MBR/Legacy', 'Khuyên anh mua máy mới', 'Chép ISO vào ổ C'], 0, 'Máy Legacy cần USB chuẩn MBR.'],
  ['Máy HP: phím vào Boot Menu?', ['Esc rồi F9', 'Alt+F4', 'F12 luôn'], 0, 'HP: nhấn Esc rồi chọn F9 (Boot Device Options).'],
  ['Ổ HDD chậm ì ạch, em đề xuất gì?', ['Nâng cấp SSD', 'Đổi chuột mới', 'Mua thêm màn hình'], 0, 'Thay HDD bằng SSD nhanh hơn rõ rệt.'],
  ['Cài xong, bàn giao thế nào cho chuyên nghiệp?', ['Đưa máy rồi đi luôn', 'Test mạng, in, âm thanh rồi mới bàn giao', 'Cài bản crack cho rẻ'], 1, 'Luôn kiểm tra đủ chức năng trước khi giao máy.']] },
 { who: 'Cô Mai', ic: '🏢', ask: 'Máy Asus của cô bật lên báo No bootable device. Cô lo quá!', qs: [
  ['Gặp lỗi No bootable device, kiểm tra gì trước?', ['Vào BIOS xem ổ cứng có nhận và thứ tự boot', 'Thay luôn RAM', 'Đập máy cho nó tỉnh'], 0, 'Xem BIOS có nhận ổ không và Boot Order đúng chưa.'],
  ['Máy Asus: phím vào BIOS?', ['F2 (hoặc Delete)', 'F12', 'Ctrl+C'], 0, 'Asus thường dùng F2 hoặc Delete để vào BIOS.'],
  ['Ổ cứng hỏng nhiều bad sector, em làm gì?', ['Thay SSD mới rồi cài Win', 'Cài tiếp trên ổ hỏng', 'Bỏ qua cảnh báo'], 0, 'Ổ đã hỏng thì thay mới để tránh mất dữ liệu.'],
  ['Cô cần Office, Zalo, Unikey. Tải ở đâu an toàn?', ['Link lạ trên mạng', 'Trang chính thức của hãng', 'Bản crack có người chia sẻ'], 1, 'Chỉ tải phần mềm từ trang chính thức của hãng.']] }];
let WIN = null;
function winClose() { const m = document.getElementById('win-modal'); if (m) m.style.cssText = 'display:none'; WIN = null; releaseFocus(); }
function winOpen(i) {
  WIN = { i, q: 0, stars: 3, lock: false };
  let m = document.getElementById('win-modal');
  if (!m) { m = document.createElement('div'); m.id = 'win-modal'; m.className = 'modal'; document.getElementById('app').appendChild(m); }
  m.style.cssText = 'display:flex;flex-direction:column;gap:10px;position:absolute;inset:30px 70px;transform:none;animation:none;padding:18px 24px;background:linear-gradient(160deg,#0f1a33,#0a1224);border:2px solid #38bdf8;border-radius:18px;color:#e6edf7;font:14px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000a;overflow:auto';
  winRender();
}
function winRender() {
  const m = document.getElementById('win-modal'), J = WIN_JOBS[WIN.i], st = '⭐'.repeat(WIN.stars) + '☆'.repeat(3 - WIN.stars);
  const X = '<button onclick="winClose()" style="margin-left:10px;background:#1e293b;color:#fff;border:1px solid #475569;border-radius:8px;padding:2px 10px;cursor:pointer">✖</button>';
  const hd = `<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">${J.tag || '🪟 CÀI WIN DẠO'} — ${J.ic} ${J.who}</b><span style="font-size:18px">${st}${X}</span></div>`;
  if (WIN.q >= J.qs.length) {
    if (J.rep) return repairDone(J);
    const k = 'win' + WIN.i, first = !S.missionsDone[k], stars = WIN.stars;
    addXP(180 * stars); addCoin(600 * stars);   // x3 EXP + cày lại vẫn nhận ĐỦ 100% EXP/Coin
    let msg = `🎁 +${180 * stars} EXP | +${600 * stars} Coin` + (first ? '' : ' <span style="opacity:.75">(cày lại — vẫn đủ 100% thưởng)</span>');
    S.missionsDone[k] = Math.max(S.missionsDone[k] || 0, stars);
    if (first && S.missionsDone.win0 && S.missionsDone.win1 && S.missionsDone.win2) { addCoin(2000); msg += '<br>🏆 Hoàn thành cả 3 job: <b>Vua Cài Win Dạo</b> (+2,000 Coin)'; }
    saveGame(); beep(880, 'triangle', 0.2, 0.05);
    m.innerHTML = hd + `<div style="text-align:center;margin-top:30px;font-size:22px">${stars === 3 ? '🎉 Khách khen hết lời!' : stars === 2 ? '👍 Khách khá hài lòng' : '😅 Khách tạm hài lòng'}</div><div style="text-align:center;font-size:15px;line-height:1.8">${msg}</div><button onclick="winClose()" style="margin:16px auto;padding:10px 28px;border:0;border-radius:12px;background:#0ea5e9;color:#fff;font-weight:700;cursor:pointer">Xong job</button>`;
    return;
  }
  const Q = J.qs[WIN.q];
  m.innerHTML = hd + `<div style="opacity:.8">“${J.ask}”</div><div style="color:#7dd3fc">Bước ${WIN.q + 1}/${J.qs.length}</div><div style="font-size:16px;font-weight:700">${Q[0]}</div>` +
    Q[1].map((o, k) => `<button class="win-opt" onclick="winPick(${k})" style="text-align:left;padding:10px 14px;border-radius:12px;border:1px solid #334155;background:#16233f;color:#e6edf7;font-size:14px;cursor:pointer">${k + 1}. ${o}</button>`).join('') + '<div id="win-fb" style="min-height:36px;font-weight:600"></div>';
}
function winPick(k) {
  if (!WIN || WIN.lock) return;
  const Q = WIN_JOBS[WIN.i].qs[WIN.q], ok = k === Q[2], bt = document.getElementById('win-modal').querySelectorAll('.win-opt');
  WIN.lock = true; if (!ok) WIN.stars = Math.max(1, WIN.stars - 1);
  if (bt[k]) bt[k].style.background = ok ? '#15803d' : '#b91c1c'; if (bt[Q[2]]) bt[Q[2]].style.background = '#15803d';
  const fb = document.getElementById('win-fb'); if (fb) fb.innerHTML = (ok ? '✅ Chuẩn! ' : '❌ Chưa đúng — ') + Q[3];
  beep(ok ? 660 : 200, ok ? 'triangle' : 'square', 0.12, 0.04);
  setTimeout(() => { if (!WIN) return; WIN.q++; WIN.lock = false; winRender(); }, 1700);
}
document.addEventListener('keydown', e => { if (WIN && !WIN.lock && /^[1-3]$/.test(e.key) && WIN.q < WIN_JOBS[WIN.i].qs.length) winPick(+e.key - 1); });
function drawPrompt(txt) {
  ctx.save(); ctx.font = 'bold 12px ' + IZF; const w = ctx.measureText(txt).width + 22, bx = Math.max(4, Math.min(956 - w, S.p.x + 10 - w / 2)), by = Math.max(4, S.p.y - 66);
  izb(bx, by, w, 24, 12, '#fff7d6'); ctx.fillStyle = '#3b2f10'; ctx.textAlign = 'center'; ctx.fillText(txt, bx + w / 2, by + 16); ctx.restore();
}
function drawStreetVehicle(type, x, y, dir, helmetColor, shirtColor) {
  ctx.save();
  ctx.translate(x, y);
  if (dir < 0) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 8, type === 'taxi' ? 22 : 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (type === 'taxi') {
    ctx.font = '32px "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚕', 0, 0);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(2, -10, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.font = '30px "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛵', 0, 0);
    ctx.fillStyle = shirtColor || '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-4, -20, 10, 13, 3);
    ctx.fill();
    ctx.fillStyle = helmetColor || '#ef4444';
    ctx.beginPath();
    ctx.arc(1, -26, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, -28, 4, 4);
    ctx.strokeStyle = shirtColor || '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(1, -15);
    ctx.lineTo(8, -10);
    ctx.stroke();
  }
  ctx.restore();
}
/* ============================================================
   GIAO THÔNG ĐỘNG + HIỆN TRƯỜNG TAI NẠN — chỉ là hình ảnh vẽ thêm
   trong drawStreet(), không đụng collider/trigger/NPC thật.
   Toạ độ thế giới; trục y của mỗi món = điểm chạm đất (bánh xe/bàn chân).
   Ảnh cắt từ sheet street_env_traffic.png (SHEET có sheet:'traffic').
   ============================================================ */
const TRAFFIC_KINDS = [
  ['car_orange', 46], ['car_yellow', 46], ['truck_small', 48], ['pickup_blue', 48],
  ['van_beige', 48], ['van_blue', 47], ['van_green', 47], ['moto_red', 38],
  ['moto_blue', 36], ['moto_black', 38], ['bicycle', 42], ['bicycle_b', 42]
];
const TRAFFIC = [];
const ACC_X0 = 2110, ACC_X1 = 2410;          // hiện trường tai nạn nằm trên mặt nhựa
const LANE_FAR = 401, LANE_NEAR = 425;       // trục bánh xe hai làn (asphalt 352..447, vạch kẻ 404..411)
// [ảnh, trục x, cao, mép vỉa hè đứng] — so le nhau cho tự nhiên, không thành hàng dọc
// sprite trong sheet quay mặt về bên TRÁI; dir = chiều nhìn thật (1 = sang phải)
// cả cụm đứng trên vỉa hè ngay phía trên hiện trường và quay mặt vào giữa đống đổ nát
const CROWD = [
  ['cop_hand', 2176, 50, 320], ['npc_point_1', 2206, 46, 314], ['npc_point_2', 2244, 46, 322],
  ['npc_scared', 2272, 46, 316], ['npc_worried', 2308, 46, 325], ['npc_phone', 2348, 46, 318], ['npc_teen', 2384, 46, 324]
].map(([k, x, h, base], i) => ({ k, x, h, base, dir: x < 2262 ? 1 : -1, q: (i % 2) * 8, say: '', sayT: 0, cool: .6 + i * .9 }));
const ACC_SAYS = ['Trời ơi tai nạn kìa!', 'Kẹt đường rồi!', 'Đi đứng kiểu gì thế này?'];
// neo đáy = điểm chạm mặt đường; dải này bám mép lề phải của làn xe, nón + rào quây hai đầu
const ACC_PROPS = [
  ['cone_orange', 2244, 432, 20], ['barrier_stripe_b', 2122, 438, 30], ['sign_warning', 2404, 438, 40],
  ['car_crashed_blue', 2212, 442, 48], ['moto_crashed_red', 2306, 444, 36],
  ['barrier_orange', 2366, 444, 30], ['barrier_stripe', 2152, 444, 32],
  ['cone_orange', 2338, 446, 22], ['cone_orange', 2276, 448, 22], ['cone_orange', 2190, 448, 22], ['cone_orange', 2134, 448, 20]
];
let _stT = 0, _stDt = 0, _trNext = 0;
function streetAnim(t, camX) {
  _stDt = _stT ? Math.min(.1, Math.max(0, t - _stT)) : 0; _stT = t;
  if (t >= _trNext) {
    _trNext = t + .7 + Math.random() * 1.6;
    if (TRAFFIC.length < 6 && sheetSrc(SHEET[TRAFFIC_KINDS[0][0]])) {
      const [k, h] = TRAFFIC_KINDS[(Math.random() * TRAFFIC_KINDS.length) | 0];
      const dir = Math.random() < .5 ? 1 : -1, x = dir > 0 ? camX - 170 : camX + 1130;
      // làn vừa trống mới cho nhập xe, tránh chồng bánh lên nhau ngay cửa vào
      if (!TRAFFIC.some(o => o.dir === dir && Math.abs(o.x - x) < 190))
        TRAFFIC.push({ k, h, dir, y: dir > 0 ? LANE_FAR : LANE_NEAR, x, sp: 110 + Math.random() * 130 });
    }
  }
  // chống chồng xe cùng làn: ai đuổi kịp xe phía trước thì chạy chậm lại theo nó
  const laneOrder = (dir, y) => TRAFFIC.filter(v => v.y === y).sort((a, b) => dir * (b.x - a.x));
  [1, -1].forEach(dir => {
    const L = laneOrder(dir, dir > 0 ? LANE_FAR : LANE_NEAR);
    L.forEach((v, i) => { v.vs = v.sp; if (i && (L[i - 1].x - v.x) * dir < 100) v.vs = Math.min(v.vs, L[i - 1].vs); });
  });
  for (let i = TRAFFIC.length - 1; i >= 0; i--) {
    const v = TRAFFIC[i]; v.x += v.dir * v.vs * _stDt;
    if (v.x < camX - 320 || v.x > camX + 1280) TRAFFIC.splice(i, 1);
  }
  CROWD.forEach(c => {
    if (c.sayT > 0) { c.sayT -= _stDt; if (c.sayT <= 0) { c.say = ''; c.cool = 2 + Math.random() * 4; } return; }
    if ((c.cool -= _stDt) > 0) return;
    c.cool = 3 + Math.random() * 4;
    // không cho hai bóng đè lên nhau: người cạnh bên đang nói hoặc câu đã có người nói -> chờ lượt
    const speaking = CROWD.filter(o => o.sayT > 0);
    if (speaking.length >= 2 || speaking.some(o => Math.abs(o.x - c.x) < 150)) return;
    const free = ACC_SAYS.filter(s => !speaking.some(o => o.say === s));
    if (!free.length) return;
    c.say = free[(Math.random() * free.length) | 0]; c.sayT = 2.6 + Math.random() * 1.6;
  });
}
/* ============================================================
   NỀN PHỐ VẼ SẴN — assets/img/street_bg_clean.png (1024x572)
   Ảnh JPEG (đuôi .png) nên chỉ drawImage, không đọc pixel.
   Ghép các dải theo tỉ lệ dọc riêng để mép vỉa hè / lòng đường / cỏ
   trùng khít toạ độ sprite và trigger đang dùng (vỉa hè 270..352,
   nhựa 352..447, cỏ 458..600).
   Dải hàng rào sắt (src 200..258) đã CẮT BỎ khỏi ảnh: chân rào được kéo
   lên sát mép dưới mái nhà nên tầm nhìn trước cửa Kho/Công Trình thoáng
   hoàn toàn, chỉ còn cột điện + vỉa hè bê tông.
   Hộ lan xám trong ảnh cũng đã xoá hẳn (lát gạch vỉa hè + đùn nhựa):
   vỉa hè liền mạch xuống sát mép nhựa, thông với lòng đường và bãi cỏ.
   src[0,200]   -> dst[0,206]   trời, dãy nhà xa, lùm cây + thân cột điện
   src[258,306] -> dst[206,254] 1:1: đế cột điện nằm đúng chỗ cũ, không méo
   src[306,355] -> dst[254,352] mặt bê tông vỉa hè (phóng dọc ~2x)
   ============================================================ */
const BG_BANDS = [[0, 200, 0, 206], [258, 306, 206, 254], [306, 355, 254, 352], [355, 434, 352, 447], [434, 460, 447, 458], [460, 572, 458, 600]];
function drawStreetBg() {
  const im = IMG.street_bg; if (!im) return false;
  const sw = im.naturalWidth || im.width, k = (im.naturalHeight || im.height) / 572;
  for (const [sy0, sy1, dy0, dy1] of BG_BANDS)
    for (let x = 0; x < 2880; x += sw)
      ctx.drawImage(im, 0, sy0 * k, sw, (sy1 - sy0) * k, x, dy0, sw, dy1 - dy0);
  return true;
}
/* Bụi cây thấp thế chỗ hàng rào sắt cũ: chỉ cao tới đầu gối, đặt giữa hai
   căn nhà nên không che cửa tiệm, bảng hiệu hay tầm nhìn ra vỉa hè. */
const ST_BUSH = ['bushSmall', 'bushRound', 'bush'];
function drawStreetHedge() {
  if (!IMG.street) return;
  ST_HOUSE_X.forEach((cx, i) => {
    const mid = i ? (cx + ST_HOUSE_X[i - 1]) / 2 : cx - 170;
    [[mid - 30, 0], [mid + 34, 1]].forEach(([bx, o]) => {
      const k = ST_BUSH[(i + o) % ST_BUSH.length], h = 22 + ((i + o) % 3) * 5;
      const w = Math.round(sheetW(k, h));
      sheetDraw(ctx, k, bx - w / 2, 278 - h, w, h);
    });
  });
}
function drawTrafficRow() {
  TRAFFIC.slice().sort((a, b) => a.y - b.y).forEach(v => {
    const dh = v.h, dw = sheetW(v.k, dh);
    ctx.save();
    if (v.dir > 0) { ctx.translate(v.x, 0); ctx.scale(-1, 1); ctx.translate(-v.x, 0); }
    sheetDraw(ctx, v.k, v.x - dw / 2, v.y - dh, dw, dh);
    ctx.restore();
  });
}
function drawCrowd() {
  if (!IMG.traffic) return;
  const now = Date.now() / 700;
  CROWD.forEach(c => {
    const dh = c.h, dw = sheetW(c.k, dh), bob = Math.sin(now + c.x) * .9;
    ctx.fillStyle = 'rgba(23,63,102,.16)';
    ctx.beginPath(); ctx.ellipse(c.x, c.base + 1, dw * .42, 3.4, 0, 0, 7); ctx.fill();
    ctx.save();
    if (c.dir > 0) { ctx.translate(c.x, 0); ctx.scale(-1, 1); ctx.translate(-c.x, 0); }
    sheetDraw(ctx, c.k, c.x - dw / 2, c.base - dh + bob, dw, dh);
    ctx.restore();
  });
}
function drawAccident() {
  if (!IMG.traffic) return;
  ACC_PROPS.forEach(([k, x, base, h]) => { const dw = sheetW(k, h); sheetDraw(ctx, k, x - dw / 2, base - h, dw, h); });
  CROWD.forEach(c => {
    if (!c.say || c.sayT <= 0) return;
    ctx.save(); ctx.font = 'bold 11px ' + IZF; ctx.globalAlpha = Math.min(1, c.sayT * 2.2);
    const w = ctx.measureText(c.say).width + 16, h = 20, bx = c.x - w / 2, by = Math.max(246, c.base - c.h - 26 - c.q);
    izb(bx, by, w, h, 9, '#fffdf4');
    ctx.fillStyle = '#fffdf4'; ctx.beginPath(); ctx.moveTo(c.x - 4, by + h - 1); ctx.lineTo(c.x + 4, by + h - 1); ctx.lineTo(c.x, by + h + 5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = IZO; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c.x - 4, by + h); ctx.lineTo(c.x, by + h + 5); ctx.lineTo(c.x + 4, by + h); ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center'; ctx.fillText(c.say, bx + w / 2, by + 14); ctx.textAlign = 'left';
    ctx.restore();
  });
}
/* ông mặt trời + mây trôi — toạ độ màn hình, vẽ sau nền để mây nổi lên trên.
   Có nền vẽ sẵn thì chỉ giữ mây mờ (nền đã có ông mặt trời + mây của nó). */
function drawStreetSky(t, soft) {
  if (!soft) { ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(860, 64, 28, 0, 7); ctx.fill(); }
  [[(t * 12) % 1100 - 100, 56, 1], [(t * 8 + 500) % 1100 - 100, 104, .8], [(t * 10 + 250) % 1100 - 100, 36, .6]].forEach(([x, y, k]) => {
    ctx.fillStyle = soft ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.92)'; [[0, 0, 24], [22, -6, 19], [44, 0, 22]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(x + dx * k, y + dy * k, r * k, 0, 7); ctx.fill(); });
  });
}
/* Nhãn việc phụ bay trên mái nhà: 🎫 tên sự cố khi sẵn, ⏳ đếm giờ khi đang hồi */
function drawHdTag(cx, q, ready, t, i) {
  const w = 92, h = 21, x = cx - w / 2, y = 26 + (ready ? Math.sin(t * 3 + i) * 2.4 : 0);
  izb(x, y, w, h, 10, ready ? '#f59e0b' : '#334155', 'rgba(255,255,255,.35)');
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10.5px ' + IZF; ctx.textAlign = 'center';
  ctx.fillText(ready ? '🎫 ' + q.short : '⏳ ' + hdMs(hdLeft(q.key)), cx, y + 15);
  if (ready) {
    ctx.beginPath(); ctx.moveTo(cx - 5, y + h); ctx.lineTo(cx + 5, y + h); ctx.lineTo(cx, y + h + 6);
    ctx.closePath(); ctx.fillStyle = '#f59e0b'; ctx.fill();
  }
  ctx.textAlign = 'left';
}

/* ============================================================
   CHU KỲ NGÀY / ĐÊM PHỐ NGOÀI — 5 phút/vòng:
   ngày 45% → hoàng hôn 20% (ám cam hổ phách) → đêm 30% (navy) → bình minh 5%
   Trời/mây nằm sẵn trong ảnh nền nên chỉ phủ lớp màu + vẽ quầng sáng;
   HUD / modal là DOM riêng nên không hề bị ám tối.
   ============================================================ */
const ST_CYCLE = 300;
const ST_LAMPS = [[360, 'lampDouble', 80], [820, 'lampPost', 80], [1250, 'lampDouble', 80], [1700, 'lampPost', 80], [2150, 'lamp_post', 96], [2600, 'lampDouble', 80]];
const ST_HOUSE_X = [150, 470, 790, 1150, 1470, 1830, 2150, 2470, 2790];
const _stSigns = [];       // biển hiệu cần bloom (Quán Net Anh Ba + Server Mini), nạp lại mỗi frame
let _plF = 0;              // độ hiện quầng sáng người chơi — mờ dần khi dừng bước
function stDayNight() {
  const p = (Date.now() / 1000 % ST_CYCLE) / ST_CYCLE;
  if (p < 0.45) return { night: 0, dusk: 0 };
  if (p < 0.65) { const k = (p - 0.45) / 0.2; return { night: k, dusk: Math.sin(Math.PI * k) }; }
  if (p < 0.95) return { night: 1, dusk: 0 };
  return { night: 1 - (p - 0.95) / 0.05, dusk: 0 };
}
const stRgb = h => { const n = parseInt(h.slice(1), 16); return (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255); };
function stGlow(x, y, r, rgb, a) {
  if (a < 0.01) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')');
  g.addColorStop(0.55, 'rgba(' + rgb + ',' + (a * 0.4) + ')');
  g.addColorStop(1, 'rgba(' + rgb + ',0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
function stPool(x, y, r, a) {   // vệt sáng loang dài trên mặt đất dưới chân cột / cửa hàng
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .45); stGlow(0, 0, r, '255,190,95', a); ctx.restore();
}
function stNightPass(t, camX) {
  const ph = stDayNight();
  if (ph.night <= 0.01 && ph.dusk <= 0.01) { _plF = 0; return; }
  if (ph.dusk > 0.01) { ctx.fillStyle = 'rgba(255,140,50,' + (0.24 * ph.dusk) + ')'; ctx.fillRect(camX, 0, 960, 600); }
  if (ph.night > 0.01) {
    ctx.fillStyle = 'rgba(11,20,46,' + (0.58 * ph.night) + ')'; ctx.fillRect(camX, 0, 960, 600);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ST_LAMPS.forEach(([x, , h]) => {
      stGlow(x, 470 - h + 7, 16, '255,224,150', 0.85 * ph.night);   // bóng đèn
      stGlow(x, 470 - h + 7, 95, '255,196,110', 0.34 * ph.night);   // hào quang
      stPool(x, 466, 120, 0.26 * ph.night);                          // vệt sáng dưới chân cột
    });
    ST_HOUSE_X.forEach(cx => {                                       // đèn trước cửa hàng
      stGlow(cx, 250, 34, '255,205,120', 0.5 * ph.night);
      stPool(cx, 266, 66, 0.28 * ph.night);
    });
    _stSigns.forEach(([cx, ly, c]) => stGlow(cx, ly + 14, 150, stRgb(c), 0.3 * ph.night));
    const fx = S.p.x + camX + 10, fy = S.p.y + 30;   // quầng 60px quanh chân khi người chơi di chuyển
    _plF += ((S.p.moving ? 1 : 0) - _plF) * Math.min(1, _stDt * 5);
    if (_plF > 0.02) stGlow(fx, fy + 4, 60, '255,216,140', 0.55 * ph.night * _plF);
    ctx.restore();
    const pulse = 0.78 + 0.22 * Math.sin(t * 2.4);   // bloom biển hiệu 2 tiệm net
    _stSigns.forEach(([cx, ly, c, txt]) => {
      izb(cx - 100, ly, 200, 28, 10, c, 'rgba(255,255,255,.35)');
      ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 15 * pulse; ctx.fillStyle = '#fff';
      ctx.font = 'bold 12.5px ' + IZF; ctx.textAlign = 'center';
      ctx.fillText(txt, cx, ly + 19); ctx.restore(); ctx.textAlign = 'left';
    });
    ST_HOUSE_X.forEach((cx, i) => {   // mốc nhiệm vụ + nhãn việc phụ trên mái luôn rõ trên nền đêm
      const done = S.missionsDone['win' + i], b = Math.sin(t * 4 + i) * 3;
      izb(cx - 22, 226 + b, 44, 22, 11, done ? '#22c55e' : '#f59e0b');
      ctx.fillStyle = '#fff'; ctx.font = '13px "Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(done ? '✅' : '💻❗', cx, 242 + b); ctx.textAlign = 'left';
      const hq = HD_BY_HOUSE[i];
      if (hq) drawHdTag(cx, hq, hdReady(hq.key), t, i);
    });
  } else _plF = 0;
}

function drawStreet() {
  const t = Date.now() / 1000, camX = window._camX || 0;
  streetAnim(t, camX);
  _stSigns.length = 0;
  let g = ctx.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, '#6ec6ff'); g.addColorStop(1, '#dff3ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 600);
  ctx.save(); ctx.translate(-camX, 0);
  const HAS_BG = drawStreetBg();   // có nền vẽ sẵn -> bỏ hết các dải màu phẳng
  ctx.restore();
  drawStreetSky(t, HAS_BG);
  ctx.save(); ctx.translate(-camX, 0);
  const HOUSES = ['hoa', 'tuan', 'mai', 'kho_dung', 'cong_trinh', 'lap_rap', 'quan_net', 'server_mini', 'tiem_sua'];
  [['☕', 'QUÁN CÀ PHÊ HOA', '#f59e0b', 150], ['🏪', 'TẠP HOÁ ANH TUẤN', '#22c55e', 470], ['🏢', 'VĂN PHÒNG CÔ MAI', '#38bdf8', 790], ['📹', 'KHO ANH DŨNG', '#a855f7', 1150], ['🏗️', 'CÔNG TRÌNH NHÀ PHỐ', '#f97316', 1470], ['🖥️', 'LẮP RÁP MÔ HÌNH PC', '#06b6d4', 1830], ['🔌', 'QUÁN NET ANH BA', '#ec4899', 2150], ['💾', 'SERVER MINI CÔNG TY', '#14b8a6', 2470], ['🔧', 'TIỆM SỬA MÁY', '#ef4444', 2790]].forEach(([ic, nm, c, cx], si) => {
    // mỗi căn một sprite riêng (9 căn / 9 ô cắt), đỉnh mái neo cao 172, đế y=270
    const key = HOUSES[si], dh = 172, dw = sheetW(key, dh), dy = 270 - dh;
    if (sheetDraw(ctx, key, cx - dw / 2, dy, dw, dh)) {
      izb(cx - 100, dy - 36, 200, 28, 10, c, 'rgba(255,255,255,.3)'); ctx.fillStyle = '#fff'; ctx.font = 'bold 12.5px ' + IZF; ctx.textAlign = 'center'; ctx.fillText(ic + ' ' + nm, cx, dy - 17); ctx.textAlign = 'left';
      if (si === 6 || si === 7) _stSigns.push([cx, dy - 36, c, ic + ' ' + nm]);
    } else {
      izb(cx - 120, 130, 240, 140, 10, '#f3e3c3', 'rgba(255,255,255,.5)');
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#fff' : c; ctx.fillRect(cx - 120 + k * 40, 196, 40, 22); }
      izb(cx - 100, 150, 56, 38, 6, '#9bd4f5'); izb(cx + 44, 150, 56, 38, 6, '#9bd4f5'); izb(cx - 20, 222, 40, 48, 6, c);
      izb(cx - 100, 102, 200, 28, 10, c, 'rgba(255,255,255,.3)'); ctx.fillStyle = '#fff'; ctx.font = 'bold 12.5px ' + IZF; ctx.textAlign = 'center'; ctx.fillText(ic + ' ' + nm, cx, 121); ctx.textAlign = 'left';
      if (si === 6 || si === 7) _stSigns.push([cx, 102, c, ic + ' ' + nm]);
    }
  });
  if (!HAS_BG) {
    // không còn hàng rào sắt lẫn hộ lan: dải bê tông thoáng chạy sát mép dưới toà nhà
    ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, 206, 2880, 146);
    ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < 2880; x += 48) ctx.fillRect(x, 206, 2, 146);
  }
  drawStreetHedge();                // bụi cây thấp thay hàng rào, giữ tầm nhìn thoáng
  drawCrowd();                      // đám đông đứng xem hiện trường (trên vỉa hè)
  if (!HAS_BG) {
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, 346, 2880, 6);
    if (IMG.street) {
      // mặt đường nhựa từ sprite sheet: lấp nền tối phòng hờ + lặp tile giữ tỉ lệ gốc
      ctx.fillStyle = '#3f4550'; ctx.fillRect(0, 352, 2880, 100);
      const rw = Math.round(sheetW('road', 100));
      for (let x = 0; x < 2880; x += rw) sheetDraw(ctx, 'road', x, 352, rw, 100);
    } else {
      ctx.fillStyle = '#475569'; ctx.fillRect(0, 352, 2880, 100);
      ctx.fillStyle = '#e2e8f0'; for (let x = 0; x < 2880; x += 80) ctx.fillRect(x + 10, 400, 44, 4);
    }
  }
  if (!HAS_BG) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(0, 452, 2880, 6); ctx.fillStyle = '#6dbb62'; ctx.fillRect(0, 458, 2880, 142); }
  if (IMG.traffic) drawTrafficRow();
  else {
    drawStreetVehicle('moto', (t * 110) % 3300 - 120, LANE_FAR, 1, '#ef4444', '#0284c7');
    drawStreetVehicle('taxi', 3100 - (t * 80) % 3300, LANE_NEAR, -1);
    drawStreetVehicle('moto', (t * 70 + 400) % 3300 - 120, LANE_FAR, 1, '#f97316', '#eab308');
  }
  if (IMG.street) {
    // bãi cỏ dưới đường (458..600): thông, bụi, trụ đèn, cột điện — neo đáy tại mặt đất,
    // xếp theo trục y để vật gần hơn (thấp hơn) đè lên vật xa hơn
    const pines = ['pineSnowL', 'pineM', 'pineSnowM', 'pineL'];
    const DECOR = [];
    [60, 250, 520, 700, 900, 1100, 1350, 1600, 1850, 2100, 2350, 2600, 2850].forEach((x, i) => {
      DECOR.push([pines[i % pines.length], x, 560 - (i % 2) * 30, 92 - (i % 2) * 18]);
    });
    [[150, 588, 'bushBig'], [620, 590, 'bushSmall'], [1035, 588, 'bushBig'], [1560, 590, 'bushRound'], [1995, 588, 'bushBig'], [2160, 556, 'bush'], [2460, 590, 'bushSmall'], [2745, 592, 'bushRound']].forEach(([x, y, key]) => DECOR.push([key, x, y, 42]));
    ST_LAMPS.forEach(([x, key, h]) => DECOR.push([key, x, 470, h]));
    [[448, 'poleUtil', 588], [1335, 'poleUtil', 588], [2235, 'poleUtil', 588], [900, 'pole_wire', 592], [1780, 'pole_wire', 592], [2650, 'pole_wire', 592]].forEach(([x, key, y]) => DECOR.push([key, x, y, 132]));
    DECOR.push(['pot_bush', 1215, 592, 30], ['pot_flowers', 2506, 588, 30], ['signCity', 150, 590, 64]);
    DECOR.sort((a, b) => a[2] - b[2]).forEach(([key, x, base, h]) => {
      const w = sheetW(key, h); sheetDraw(ctx, key, x - w / 2, base - h, w, h);
    });
  } else {
    [60, 250, 520, 700, 900, 1100, 1350, 1600, 1850, 2100, 2350, 2600, 2850].forEach((x, i) => izTree(x, 560 - (i % 2) * 30, 1, i % 3)); izLamp(360, 470, 1); izLamp(820, 470, 1); izLamp(1250, 470, 1); izLamp(1700, 470, 1); izLamp(2150, 470, 1); izLamp(2600, 470, 1);
  }
  ctx.fillText('🛵', 120, 548); ctx.font = 'bold 10px ' + IZF; ctx.fillStyle = '#fff'; ctx.fillText('XE ĐỒ NGHỀ 🧰', 100, 560);
  izb(8, 296, 104, 26, 8, '#ef4444'); ctx.fillStyle = '#fff'; ctx.font = 'bold 10.5px ' + IZF; ctx.fillText('⬅ VỀ THÀNH PHỐ', 16, 313);
  const ids = ['a2', 'a5', 'a8', 'a3', 'a7', 'a4', 'a10', 'a11', 'a12'];
  ST_HOUSE_X.forEach((cx, i) => {
    drawSprite(cx - 10, 282, ids[i]); const done = S.missionsDone['win' + i], b = Math.sin(t * 4 + i) * 3;
    izb(cx - 22, 226 + b, 44, 22, 11, done ? '#22c55e' : '#f59e0b'); ctx.fillStyle = '#fff'; ctx.font = '13px "Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(done ? '✅' : '💻❗', cx, 242 + b); ctx.textAlign = 'left';
    const hq = HD_BY_HOUSE[i];
    if (hq) drawHdTag(cx, hq, hdReady(hq.key), t, i);
  });
  drawAccident();   // xe hỏng + nón + rào + bong bóng: vẽ sau các nhân vật để bóng thoại không bị đè
  drawSprite(S.p.x + camX, S.p.y, 'p');
  stNightPass(t, camX);
  ctx.restore();
  if (camX < 1920) { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = 'bold 26px ' + IZF; ctx.fillText('➡', 926 + Math.sin(t * 5) * 4, 300); }
  if (targetAct && targetAct.t === 'job') {
    const hq = HD_BY_HOUSE[targetAct.i];
    if (targetAct.i === 8) drawPrompt(hdReady('sua')
      ? '[E] 🔧 Tiệm Sửa Máy — phiếu hẹn + việc phụ đo SMART  ·  +' + HD_COIN + ' Coin'
      : '[E] 🔧 Tiệm Sửa Máy — phiếu hẹn  ·  việc phụ hồi ' + hdMs(hdLeft('sua')));
    else if (hq && hdReady(hq.key)) drawPrompt('[E] Việc phụ Helpdesk: ' + hq.dev + ' — ' + hq.who + '  ·  +' + HD_COIN + ' Coin');
    else if (hq) drawPrompt('[E] Nhận job: ' + WIN_JOBS[targetAct.i].who + '  ·  Helpdesk hồi ' + hdMs(hdLeft(hq.key)));
    else drawPrompt('[E] Nhận job: ' + WIN_JOBS[targetAct.i].who + (S.missionsDone['win' + targetAct.i] ? ' (làm lại)' : ''));
  }
  if (targetAct && targetAct.t === 'chat') drawPrompt('[E] Hỏi chuyện người đi đường');
  if (targetAct && targetAct.t === 'from_street') drawPrompt('[E] Về thành phố');
}
function drawGate() {
  const b = Math.sin(Date.now() / 300) * 2;
  // Tọa độ mới: x = 500, y = 535 (nằm ngay giữa lòng đường dưới đáy)
  izb(500, 535 + b, 126, 26, 9, '#f59e0b', 'rgba(255,255,255,.3)');
  ctx.fillStyle = '#1b1202';
  ctx.font = 'bold 10.5px ' + IZF;
  ctx.textAlign = 'center';
  ctx.fillText('⬇ PHỐ JOB DẠO', 563, 552 + b);
  ctx.textAlign = 'left';
  if (targetAct && targetAct.t === 'to_street') drawPrompt('[E] Ra phố cài Win dạo');
}
/* ============================================================
   THOẠI MEME IT — người đi dạo trên vỉa hè Phố Ngoài
   Mỗi 4-7s một NPC đang đi bộ (nằm trong khung nhìn) nhả ngẫu
   nhiên một câu "đặc sản" helpdesk, bong bóng lơ lửng 3.5s bám
   theo tọa độ NPC. Tối đa 1 bong bóng cùng lúc, kể cả nhường
   cụm đứng xem hiện trường (CROWD) để màn hình không loạn.
   Bấm [E] khi đứng gần (<45px): NPC dừng bước, quay mặt sang
   người chơi và nói ngay một câu.
   ============================================================ */
const IT_MEMES = [
  'Em đã thử tắt máy bật lại chưa?',
  'Anh IT ơi, chuột em bị đơ... à quên em chưa cắm đầu thu USB!',
  'Code chạy bình thường trên máy em mà, lên server sập là do mạng chứ!',
  'Nãy em lỡ click vào đường link nhận 500k trúng thưởng từ mail lạ...',
  'Màn hình không lên có phải do lỏng dây nguồn không anh?',
  'Ai bảo em xoá thư mục System32 cho nhẹ máy vậy trời?!',
  'Pass Wi-Fi công ty hôm nay đổi thành gì rồi anh ơi?',
  'Đừng lo, thứ Sáu deploy bản cập nhật lên production nhanh lắm, không lỗi đâu!',
  'Anh bấm giùm em cái dây mạng, sao đầu này hình vuông đầu kia hình tròn?',
  'Máy in kẹt giấy, em lỡ giật mạnh rách luôn cả cụm sấy rồi...',
  'Sao camera phòng họp cắm vào cổng HDMI không nhận mic vậy anh?',
  'Em gõ đúng pass 123456 mà server bảo mật khẩu quá yếu là sao?'
];
const stWalkers = () => ambList().filter(n => n.path && n.kind === 'walk');
let stMemeNext = 0;
const stSay = n => { n.say = IT_MEMES[(Math.random() * IT_MEMES.length) | 0]; n.sayT = 3.5; };
const stMemeGap = () => { stMemeNext = performance.now() + 4000 + Math.random() * 3000; };
function stMemeStep() {
  const now = performance.now();
  if (now < stMemeNext) return;
  if (getComputedStyle(document.getElementById('dialog')).display !== 'none' || openModalEl()) { stMemeNext = now + 1500; return; }
  const L = stWalkers();
  if (L.some(n => n.sayT > 0) || CROWD.some(c => c.sayT > 0)) { stMemeNext = now + 700; return; }
  const cam = window._camX || 0;
  const pool = L.filter(n => n.moving && n.fx > cam - 60 && n.fx < cam + 1020);
  if (!pool.length) { stMemeNext = now + 1200; return; }
  stSay(pool[(Math.random() * pool.length) | 0]);
  stMemeGap();
}
function stTalkTo(n) {
  const px = S.p.x + 10 + (window._camX || 0);
  stWalkers().forEach(o => { if (o !== n) { o.say = ''; o.sayT = 0; } });   // một người nói một lúc
  n.wait = 3.2; n.moving = false; n.dir = px > n.fx ? 1 : -1;               // dừng bước, quay mặt về phía người chơi
  stSay(n); stMemeGap();
  beep(640, 'triangle', .07, .03);
}
const _ab = ambBuild;
ambBuild = function (sc) {
  if (sc !== 'STREET') return _ab(sc);
  const w = (role, a, b, v) => ({ role, fx: a[0], fy: a[1], dir: 1, ph: 0, moving: false, wait: Math.random() * 2, v, i: 1, sayT: 0, say: '', cool: Math.random() * 3, chat: 4 + Math.random() * 6, kind: 'walk', act: '', sit: false, path: [a, b] });
  return [w('a0', [40, 338], [2840, 338], 40), w('a6', [2840, 480], [40, 480], 46), w('a1', [60, 520], [2820, 520], 36), w('a9', [900, 338], [1500, 338], 38)];
};
const _rndS = render;
render = function () {
  if (S.scene === 'STREET') { try { drawStreet(); ctx.save(); ctx.translate(-(window._camX || 0), 0); ambBubbles(); ctx.restore(); } catch (e) {} return; }
  _rndS(); if (S.scene === 'WORLD') { try { drawGate(); } catch (e) {} }
};

const _updS = update;
update = function () {
  _updS();
  try {
    if (S.scene === 'STREET') {
      S.p.y = clampWalkY('STREET', S.p.y);   // kẹp hai chiều: vỉa hè ↔ lòng đường ↔ bãi cỏ
      let cam = window._camX || 0;
      if (S.p.x > 620 && cam < 1920) { const d = Math.min(S.p.x - 620, 1920 - cam); cam += d; S.p.x -= d; }
      if (S.p.x < 300 && cam > 0) { const d = Math.min(300 - S.p.x, cam); cam -= d; S.p.x += d; }
      window._camX = cam;
      const px = S.p.x + 10 + cam, py = S.p.y + 30;
      stMemeStep();
      if (S.p.x + cam < 70) targetAct = { t: 'from_street' };
      ST_HOUSE_X.forEach((cx, i) => {
        if (Math.hypot(px - cx, py - 312) < 70) targetAct = { t: 'job', i };
      });
      // người đi dạo gần tầm với (không giành chỗ [E] của các căn nhà có job)
      if (!targetAct) {
        const mate = stWalkers().filter(n => Math.hypot(n.fx - px, n.fy - py) < 45)
          .sort((a, b) => Math.hypot(a.fx - px, a.fy - py) - Math.hypot(b.fx - px, b.fy - py))[0];
        if (mate) targetAct = { t: 'chat', n: mate };
      }
    } else if (S.scene === 'WORLD' && !targetAct && S.p.x > 460 && S.p.x < 620 && S.p.y > 510) {
      targetAct = { t: 'to_street' };
    }
  } catch (e) {}
};

const _daS = doAction;
doAction = function () {
  if (WIN || HD || shopOpen()) return;
  if (targetAct && targetAct.t === 'to_street') {
    S.scene = 'STREET';
    window._camX = 0;
    // Spawn cố định trên VỈA HÈ (chân tại y+30 = 312, ngay trước cửa các căn nhà).
    // Không mang toạ độ Y cũ từ Cổng Nam WORLD (>500) sang → rớt xuống nhựa/cỏ.
    S.p.x = 90;
    S.p.y = SCENE_WALK.STREET.spawnY;
    setZone('5. PHỐ NGOÀI', 'Phố Cài Win Dạo');
    beep(520);
    showToast('🛵 Ra phố nhận job cài Win dạo!');
    return;
  }
  if (targetAct && targetAct.t === 'from_street') {
    S.scene = 'WORLD';
    S.p.x = 540;
    S.p.y = 500;
    setZone('1. THÀNH PHỐ', 'Network City (World Map)');
    beep(380);
    return;
  }
  if (targetAct && targetAct.t === 'chat') { stTalkTo(targetAct.n); return; }
  if (targetAct && targetAct.t === 'chat') { stTalkTo(targetAct.n); return; }
  if (targetAct && targetAct.t === 'job') {
    const hq = HD_BY_HOUSE[targetAct.i];
    if (targetAct.i === 8) repairDesk();
    else if (hq) hdOpen(hq.key);
    else winOpen(targetAct.i);
    return;
  }
  _daS();
};

/* ===== V8: PHỐ CUỘN + 2 JOB MỚI (camera IP, đi dây công trình) ===== */
Object.assign(IZ_NAMES, { a3: ['Anh Dũng', '#a855f7'], a7: ['Bác Thợ Cả', '#f97316'] });
WIN_JOBS.push(
 { tag: '📹 LẮP CAMERA IP', who: 'Anh Dũng', ic: '📹', ask: 'Kho hay mất hàng. Lắp giúp anh 4 camera IP ngoài trời, xem được qua điện thoại nhé!', qs: [
  ['Cấp nguồn + dữ liệu cho camera ngoài trời xa tủ điện, tiện nhất?', ['Kéo ổ điện riêng cho từng camera', 'Switch PoE: một sợi cáp mạng vừa cấp nguồn vừa truyền hình ảnh', 'Dùng pin AA'], 1, 'PoE cấp nguồn qua cáp mạng, gọn và an toàn ngoài trời.'],
  ['Đặt camera ở cổng kho thế nào?', ['Hướng thẳng ra nắng gắt', 'Cao 2,5–3 m, chếch xuống, tránh ngược sáng, có hộp che mưa', 'Đặt sát đất cho dễ lấy'], 1, 'Đặt cao, tránh ngược sáng và che mưa nắng.'],
  ['Đặt IP cho camera/NVR thế nào cho ổn định?', ['IP tĩnh nằm ngoài dải DHCP (vd 192.168.1.201–204)', 'Để DHCP cấp lung tung', 'Đặt trùng IP của router'], 0, 'IP tĩnh tránh camera "mất tích" khi router cấp lại IP.'],
  ['Bàn giao: bảo mật camera ra sao?', ['Giữ mật khẩu mặc định admin/admin', 'Đổi mật khẩu mạnh, cập nhật firmware, không mở port bừa bãi', 'Dán mật khẩu lên tường'], 1, 'Camera mật khẩu mặc định rất dễ bị dò.']] },
 { tag: '🏗️ ĐI DÂY CÔNG TRÌNH', who: 'Bác Thợ Cả', ic: '🏗️', ask: 'Nhà phố mới xây 3 tầng, bác cần đi dây mạng trước khi trát tường!', qs: [
  ['Chọn cáp mạng đi âm tường cho nhà mới?', ['Dây điện thường', 'Cáp Cat6 UTP, luồn trong ống bảo vệ', 'Dây điện thoại cũ'], 1, 'Cat6 trong ống luồn dây: bền, tốc độ tốt, dễ thay sau này.'],
  ['Một đoạn cáp đồng Ethernet dài tối đa bao nhiêu?', ['30 m', '100 m (khoảng 90 m dây cố định + dây nhảy)', '300 m'], 1, 'Chuẩn Ethernet đồng giới hạn 100 m.'],
  ['Đi dây gần dây điện 220V thì làm sao?', ['Bó chung cho gọn', 'Đi tách riêng; nếu giao nhau thì cắt vuông góc', 'Cuốn quanh dây điện'], 1, 'Tránh nhiễu điện từ làm rớt mạng.'],
  ['Trước khi trát tường cần làm gì?', ['Đánh nhãn hai đầu và test thông mạch bằng máy test cáp', 'Trát luôn cho kịp', 'Cắt bớt dây cho gọn'], 0, 'Đánh nhãn + test cáp để khỏi đục tường tìm dây.']] });
/* ===== V10: 3 JOB MỚI + TIỆM SỬA MÁY (mang về, hẹn trả 2-3 ngày) ===== */
Object.assign(IZ_NAMES, { a4: ['Bạn Minh', '#06b6d4'], a10: ['Anh Ba', '#ec4899'], a11: ['Chú Hải', '#14b8a6'], a12: ['Chủ Tiệm', '#ef4444'] });
WIN_JOBS.push(
 { tag: '🖥️ LẮP RÁP MÔ HÌNH PC', who: 'Bạn Minh', ic: '🖥️', ask: 'Anh ơi, giúp em lắp bộ PC mô hình để học kỹ thuật viên nha!', qs: [
  ['Thứ tự hợp lý khi lắp linh kiện lên bo mạch chủ?', ['CPU → tản nhiệt (keo tản) → RAM → SSD M.2', 'RAM trước, mở socket CPU sau', 'Bắt ốc main vào case rồi mới tính'], 0, 'Lắp CPU, tản và RAM lên main trước khi bỏ vào case cho dễ thao tác.'],
  ['Gắn RAM đúng cách?', ['Ấn mạnh bất kể chiều', 'Khớp khe lệch trên RAM với khe main, ấn đến khi hai chốt kêu tách', 'Gắn lệch rồi vặn ốc'], 1, 'RAM chỉ có một chiều đúng, khớp khe lệch rồi ấn đều hai đầu.'],
  ['Cáp nguồn bắt buộc từ PSU cho main?', ['24-pin ATX và CPU 4/8-pin', 'Chỉ cáp SATA', 'Chỉ cáp USB'], 0, 'Main cần 24-pin ATX và nguồn phụ cho CPU.'],
  ['Dây nút nguồn/đèn từ case cắm vào đâu?', ['Cổng LAN', 'Cụm chân F_PANEL trên main', 'Khe RAM'], 1, 'Các dây nút nguồn, reset, đèn LED cắm vào F_PANEL.']] },
 { tag: '🔌 DÒ DÂY ĐỨT', who: 'Anh Ba', ic: '🔌', ask: 'Máy số 7 trong quán net mất mạng hoài. Em dò xem dây nào đứt giùm anh!', qs: [
  ['Máy mất mạng, đèn LAN không sáng. Kiểm tra đầu tiên?', ['Cài lại Windows', 'Cắm lại hai đầu, thử cổng switch khác và máy test cáp', 'Thay máy mới'], 1, 'Loại trừ cổng, đầu bấm và cáp trước khi nghi ngờ máy.'],
  ['Máy test cáp báo thiếu đèn số 3 và 6. Nghĩa là?', ['Cáp tốt', 'Đứt hoặc bấm hở các sợi 3 và 6 (cặp xanh lá)', 'Switch hỏng'], 1, 'Chân 3 và 6 là cặp xanh lá (T568B).'],
  ['Tìm chỗ đứt nhanh nhất?', ['Cắt bỏ cả sợi dây dài', 'Kiểm tra đầu bấm, điểm bị kẹp/gập; dùng máy dò cáp', 'Đoán đại'], 1, 'Dây hay đứt ở đầu bấm và chỗ bị kẹp hoặc gập.'],
  ['Cách sửa bền?', ['Quấn băng keo chỗ đứt', 'Cắt đoạn hỏng, bấm lại RJ45 (hoặc thay đoạn mới) rồi test lại', 'Nối bằng dây điện'], 1, 'Bấm lại đầu chuẩn và test đủ 8 đèn.']] },
 { tag: '💾 LẮP Ổ TẠO RAID', who: 'Chú Hải', ic: '💾', ask: 'Công ty chú có 4 ổ cứng mới, nhờ cháu lắp và dựng RAID cho chắc ăn!', qs: [
  ['RAID 1 làm gì?', ['Chia dữ liệu để nhanh, không dự phòng', 'Nhân bản (mirror) dữ liệu sang ổ thứ hai để dự phòng', 'Gộp ổ, hỏng một là mất hết'], 1, 'RAID 1 = mirror. RAID 0 mới là chia dữ liệu để nhanh.'],
  ['4 ổ, cần nhanh và sống sót khi hỏng 1 ổ?', ['RAID 0', 'RAID 5 hoặc RAID 10', 'Không cần RAID'], 1, 'RAID 5/10 chịu hỏng 1 ổ mà vẫn có tốc độ tốt.'],
  ['Chọn ổ để dựng RAID?', ['Cùng loại, cùng dung lượng (tốt nhất cùng model)', 'Trộn đủ loại cho rẻ', 'Một SSD một HDD'], 0, 'Ổ không đồng đều sẽ bị kéo về ổ nhỏ/chậm nhất.'],
  ['Một ổ trong RAID 5 hỏng, làm gì?', ['Format cả mảng', 'Thay ổ mới cùng dung lượng rồi rebuild (vẫn sao lưu dữ liệu)', 'Tắt máy bỏ đó'], 1, 'RAID không thay thế sao lưu — luôn backup riêng.']] },
 { tag: '🔧 TIỆM SỬA MÁY', who: 'Chủ Tiệm', ic: '🔧', ask: '', qs: [] });
const RP_T = [
 { rep: 'rp0', days: 2, who: 'Bạn Hùng', dev: 'PC đơ lag', qs: [
  ['PC mở lên là đơ lag. Xem gì trước?', ['Task Manager: CPU/RAM/Disk nào đang 100%, tiến trình nào ngốn', 'Đổi hình nền', 'Xoá thư mục System32'], 0, 'Task Manager cho thấy ngay tài nguyên nào bị nghẽn.'],
  ['Disk 100% ở ổ HDD cũ, nghe tiếng lạch cạch. Nghi ngờ?', ['Chuột hỏng', 'Ổ cứng sắp hỏng — kiểm tra SMART/bad sector', 'Màn hình hỏng'], 1, 'Disk 100% kèm tiếng lạch cạch là dấu hiệu ổ sắp chết.'],
  ['Việc cần làm trước khi sửa?', ['Sao lưu dữ liệu nếu còn đọc được', 'Format ngay', 'Kệ'], 0, 'Luôn cứu dữ liệu của khách trước.']] },
 { rep: 'rp1', days: 3, who: 'Cô Thu', dev: 'Laptop không lên nguồn', qs: [
  ['Laptop bấm nguồn không đèn. Kiểm tra trước?', ['Adapter, đèn báo sạc, thử tháo pin/cắm sạc khác', 'Cài lại Win', 'Thay màn hình'], 0, 'Loại trừ nguồn sạc và pin trước.'],
  ['Adapter tốt mà vẫn chết. Làm gì?', ['Mang về tiệm, tháo máy đo nguồn trên mainboard', 'Đập nhẹ cho nó tỉnh', 'Phơi nắng'], 0, 'Cần tháo máy kiểm tra các đường nguồn trên main.'],
  ['Báo giá cho khách thế nào?', ['Báo rõ lỗi, linh kiện cần thay và chi phí trước khi sửa', 'Sửa xong mới báo giá cao', 'Không báo'], 0, 'Minh bạch giá trước khi sửa để khách yên tâm.']] },
 { rep: 'rp2', days: 2, who: 'Bác Tư', dev: 'PC màn hình xanh (BSOD)', qs: [
  ['Máy hiện màn hình xanh lặp lại. Xem gì?', ['Mã lỗi, Event Viewer và driver cài gần đây', 'Rút điện liên tục', 'Đổi bàn phím'], 0, 'Mã lỗi và driver mới cài thường là manh mối chính.'],
  ['Nghi RAM lỗi, test thế nào?', ['MemTest86 / Windows Memory Diagnostic, hoặc thử từng thanh', 'Đoán', 'Bỏ qua'], 0, 'Test RAM bằng công cụ chuyên dụng hoặc thử từng thanh.'],
  ['Thanh RAM thứ hai báo lỗi. Xử lý?', ['Thay thanh RAM lỗi', 'Cứ dùng tiếp', 'Cài lại Win là hết'], 0, 'RAM lỗi phải thay, cài lại Win không khắc phục được.']] }];
RP_T.forEach(t => WIN_JOBS.push({ tag: '🔧 NHẬN MÁY SỬA', who: t.who, ic: '🔧', ask: `Khách mang tới: ${t.dev}. Em chẩn đoán rồi lập phiếu hẹn nhé!`, rep: t.rep, days: t.days,
  qs: t.qs.concat([['Hẹn trả máy cho khách thế nào?', ['Hứa 5 phút là xong cho khách vui', `Hẹn ${t.days} ngày (kèm phiếu hẹn), có phát sinh thì gọi báo`, 'Không hẹn, khi nào xong tự biết'], 1, 'Hẹn thực tế và ghi phiếu hẹn.']]) }));
const WIN_CSS = 'display:flex;flex-direction:column;gap:10px;position:absolute;inset:30px 70px;transform:none;animation:none;padding:18px 24px;background:linear-gradient(160deg,#0f1a33,#0a1224);border:2px solid #38bdf8;border-radius:18px;color:#e6edf7;font:14px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000a;overflow:auto';
const gmin = () => S.missionsDone.gmin == null ? 510 : S.missionsDone.gmin, rpS = () => S.missionsDone.rp || (S.missionsDone.rp = {});
function winBox() {
  let m = document.getElementById('win-modal');
  if (!m) { m = document.createElement('div'); m.id = 'win-modal'; m.className = 'modal'; document.getElementById('app').appendChild(m); }
  m.style.cssText = WIN_CSS; return m;
}
const BT = 'padding:8px 18px;border:0;border-radius:10px;font-weight:700;cursor:pointer;color:#fff;';
function repairDone(J) {
  rpS()[J.rep] = { st: 'repairing', due: gmin() + J.days * 1440, stars: WIN.stars }; saveGame();
  document.getElementById('win-modal').innerHTML = `<b style="font-size:17px">📋 Đã lập phiếu hẹn</b><div style="margin-top:14px;font-size:15px;line-height:1.8">Máy <b>${J.who}</b> đã được mang về tiệm.<br>Hẹn trả sau <b>${J.days} ngày</b> (ngày ${Math.floor(rpS()[J.rep].due / 1440) + 1}). Đến hẹn, quay lại <b>Tiệm Sửa Máy</b> để trả máy và nhận thưởng.</div><button onclick="repairDesk()" style="${BT}background:#0ea5e9;margin-top:16px">Về quầy tiệm</button>`;
}
function repairReturn(k) {
  const r = rpS()[k], t = RP_T.find(q => q.rep === k); if (!r || r.st !== 'ready') return;
  r.st = 'done'; addXP(210 * r.stars); addCoin(800 * r.stars); beep(880, 'triangle', 0.2, 0.05);
  const all = RP_T.every(q => rpS()[q.rep] && rpS()[q.rep].st === 'done'); if (all) { addCoin(3000); showToast('🏆 Trả đủ 3 máy: Chủ Tiệm Uy Tín (+3,000 Coin)'); }
  showToast(`✅ Trả máy ${t.who}: +${210 * r.stars} EXP, +${800 * r.stars} Coin`); saveGame(); repairDesk();
}
function repairDesk() {
  WIN = { desk: true, lock: true, q: 0, i: 8, stars: 3 }; const m = winBox(), R = rpS(), now = gmin();
  RP_T.forEach(t => { const r = R[t.rep]; if (r && r.st === 'repairing' && now >= r.due) r.st = 'ready'; });
  const hdReadySua = hdReady('sua');
  m.innerHTML = '<div style="display:flex;justify-content:space-between"><b style="font-size:17px">🔧 TIỆM SỬA MÁY — Phiếu hẹn</b><button onclick="winClose()" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:8px;padding:2px 10px;cursor:pointer">✖</button></div>' +
    `<div style="opacity:.8">Hôm nay: ngày ${Math.floor(now / 1440) + 1}. Nhận máy → chẩn đoán → mang về sửa → trả máy đúng hẹn.</div>` +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;border:1px solid #b45309;border-radius:12px;background:#241a07">' +
    '<div><b style="color:#fbbf24">🎫 Việc phụ Helpdesk</b> — Chủ Tiệm: đo SMART ổ HDD khách bằng CrystalDiskInfo<br>' +
    '<span style="opacity:.85;font-size:12.5px">Phát hiện ổ báo vàng (Caution) + tư vấn nâng cấp SSD · Thưởng +' + HD_COIN + ' Coin · +' + HD_XP + ' XP</span></div>' +
    (hdReadySua
      ? '<button onclick="hdOpen(\'sua\')" style="white-space:nowrap;' + BT + 'background:#f59e0b">🎫 LÀM VIỆC PHỤ</button>'
      : '<span style="color:#fbbf24;font-weight:700;white-space:nowrap">⏳ hồi sau ' + hdMs(hdLeft('sua')) + '</span>') +
    '</div>' +
    RP_T.map(t => {
      const r = R[t.rep], idx = WIN_JOBS.findIndex(q => q.rep === t.rep); let st, bt;
      if (!r) { st = 'Chưa nhận máy'; bt = `<button onclick="winOpen(${idx})" style="${BT}background:#0ea5e9">Nhận &amp; chẩn đoán</button>`; }
      else if (r.st === 'repairing') { st = `⏳ Đang sửa — còn khoảng ${Math.max(1, Math.ceil((r.due - now) / 1440))} ngày`; bt = ''; }
      else if (r.st === 'ready') { st = '📦 Sửa xong, đến hẹn trả máy!'; bt = `<button onclick="repairReturn('${t.rep}')" style="${BT}background:#16a34a">Trả máy cho khách</button>`; }
      else { st = '✅ Đã trả máy'; bt = ''; }
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border:1px solid #334155;border-radius:12px;background:#16233f"><div><b>${t.who}</b> — ${t.dev}<br><span style="opacity:.8">${st}</span></div>${bt}</div>`;
    }).join('');
}
setInterval(() => {
  try {
    if (S.missionsDone.gmin == null) S.missionsDone.gmin = 510; S.missionsDone.gmin += 16;
    if (typeof syncWeatherBadge === 'function') syncWeatherBadge();
  } catch (e) {}
}, 1000);
window.addEventListener('beforeunload', () => { try { saveGame(); } catch (e) {} });

/* ====================================================
   🎫 SIDE QUESTS HELPDESK — 3 minigame việc phụ trên phố
   thưởng +300 Coin · +450 XP · hồi (cooldown) 3 phút
   ==================================================== */
S.hd = S.hd || {};
const HD_CD = 180000, HD_COIN = 300, HD_XP = 450;
const HD_Q = {
  tuan: {
    key: 'tuan', house: 1, game: 'router', who: 'Anh Tuấn', ic: '🏪', hq: 'TẠP HOÁ ANH TUẤN',
    win: 'Cấu hình Router 192.168.1.1', a: '#22c55e', dev: 'Wifi bị lộ mật khẩu', short: 'WIFI LỘ PASS', secs: 80,
    ask: 'Wifi tạp hoá ai cũng dò được, trẻ cạnh bên xài chùa làm rớt mạng khách.',
    quote: 'Anh Tuấn: “Khách bấm vô là dính wifi luôn, không hỏi mật khẩu nữa. Cảm ơn em!”'
  },
  mai: {
    key: 'mai', house: 2, game: 'spooler', who: 'Cô Mai', ic: '🏢', hq: 'VĂN PHÒNG CÔ MAI',
    win: 'Máy in văn phòng — Cô Mai', a: '#38bdf8', dev: 'Máy in treo, không in được', short: 'MÁY IN TREO', secs: 80,
    ask: 'Máy in nhận lệnh rồi im bặt, cô cần 5 bản hợp đồng trong 10 phút.',
    quote: 'Cô Mai: “In reo đều trở lại rồi con ơi, cô kịp ký hợp đồng.”'
  },
  ba: {
    key: 'ba', house: 6, game: 'taskmgr', who: 'Anh Ba', ic: '🔌', hq: 'QUÁN NET ANH BA',
    win: 'Task Manager — máy chủ net', a: '#ec4899', dev: 'Máy chủ dính miner', short: 'MÁY CHỦ LAG', secs: 60,
    ask: 'Máy chủ quán net nóng ran, CPU peg 100%, khách chê lag sập tiệm.',
    quote: 'Anh Ba: “Mượt rồi em ơi! Khách chơi không càu nhàu nữa.”'
  },
  dung: {
    key: 'dung', house: 3, game: 'feed', who: 'Anh Dũng', ic: '📹', hq: 'KHO ANH DŨNG',
    win: 'Máy in tem mã vạch — Kho', a: '#a855f7', dev: 'Máy in tem kẹt giấy', short: 'IN TEM KẸT', secs: 75,
    ask: 'Máy in tem xuất kho kẹt giấy, tem in ra lệch trắng trơn, đơn hàng chất đống.',
    quote: 'Anh Dũng: “Tem in ra chuẩn từng milimet, đơn xuất kho chạy re!”'
  },
  hai: {
    key: 'hai', house: 7, game: 'netdrive', who: 'Chú Hải', ic: '💾', hq: 'SERVER MINI CÔNG TY',
    win: 'Máy chủ — ổ đĩa mạng Z:', a: '#14b8a6', dev: 'Ổ đĩa mạng Z: rớt', short: 'Ổ Z: RỚT', secs: 75,
    ask: 'Sáng nay cả công ty mở ổ Z: (Data) không được — họp phải chiếu báo cáo, cứu chú phát!',
    quote: 'Chú Hải: “Ổ Z: về đủ cả, báo cáo chiếu lành lành. May mà có em!”'
  },
  sua: {
    key: 'sua', house: 8, game: 'smart', who: 'Chủ Tiệm', ic: '🔧', hq: 'TIỆM SỬA MÁY',
    win: 'CrystalDiskInfo — đo SMART', a: '#ef4444', dev: 'HDD khách báo vàng', short: 'HDD CAUTION', secs: 85,
    ask: 'Máy khách chạy nặng ì, nghi ổ cứng. Chủ tiệm nhờ mở CrystalDiskInfo đo SMART giúp.',
    quote: 'Chủ Tiệm: “Bảng SMART chỉ ra là khách chịu thay SSD liền — phiếu tư vấn chuẩn nghề!”'
  }
};
const HD_BY_HOUSE = {};
Object.keys(HD_Q).forEach(k => { HD_BY_HOUSE[HD_Q[k].house] = HD_Q[k]; });
let HD = null;

const HD_SVCS = [
  ['Spooler lệnh in', 'Print Spooler', 'stop', 'Manual', true],
  ['Thông báo in', 'Print Notifications', 'run', 'Manual', false],
  ['Client DHCP', 'DHCP Client', 'run', 'Tự động', false],
  ['Bộ phân giải DNS', 'DNS Client', 'run', 'Tự động', false],
  ['Trung tâm bảo mật', 'Security Center', 'stop', 'Manual', false],
  ['Cập nhật Windows', 'Windows Update', 'stop', 'Manual', false],
  ['Trình lập lịch tác vụ', 'Task Scheduler', 'run', 'Tự động', false]
];
const HD_ST = { run: 'Đang chạy', stop: 'Đã dừng', start: 'Đang khởi động…', pause: 'Đang tạm dừng' };
const HD_RUN = [
  ['services.msc', 'dịch vụ hệ thống — chạy/dừng dịch vụ in', true],
  ['ncpa.cpl', 'kết nối mạng — đổi card mạng', false],
  ['devmgmt.msc', 'trình quản lý thiết bị — driver', false],
  ['msconfig', 'cấu hình hệ thống — tùy chọn khởi động', false],
  ['cleanmgr', 'dọn rác ổ đĩa', false],
  ['cmd', 'dòng lệnh Command Prompt', false]
];
const HD_PROCS = [
  ['svch0st.exe', 29, '310 MB', true, 'Chữ o thường giả danh svchost.exe — không phải dịch vụ Windows'],
  ['explorer.exe', 5, '62 MB', false, 'Giao diện Windows, end là mất màn hình giữa quán'],
  ['xmrig64.exe', 39, '180 MB', true, 'Trình đào tiền ảo (miner) đào chui bằng máy của khách'],
  ['dwm.exe', 3, '48 MB', false, 'Tiến trình hệ thống vẽ cửa sổ'],
  ['WUpdate-Assist.exe', 15, '96 MB', true, 'Giả Windows Update, cài từ link web lạ'],
  ['Counter-Strike 2', 4, '1.8 GB', false, 'Máy khách game của khách đang chơi'],
  ['chrome.exe', 3, '540 MB', false, 'Trình duyệt mở bảng giá'],
  ['System', 1, '—', false, 'Kernel Windows — không thể end'],
  ['nvcontainer.exe', 1, '24 MB', false, 'Dịch vụ driver NVIDIA']
];
const HD_SEC = [
  ['none', 'None — mạng mở, ai cũng vào được'],
  ['wep', 'WEP — chuẩn cũ, dò ra key trong vài phút'],
  ['wpa', 'WPA-PSK — chuẩn cũ, dễ bị phá'],
  ['wpa2', 'WPA2-PSK — khuyên dùng'],
  ['wpa3', 'WPA2/WPA3-mixed — an toàn nhất']
];

const hdPad = n => String(n).padStart(2, '0');
const hdEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hdMs = ms => { const q = Math.max(0, ms); return Math.floor(q / 60000) + ':' + hdPad(Math.floor(q % 60000 / 1000)); };
const hdLeft = k => Math.max(0, (S.hd[k] || 0) - Date.now());
const hdReady = k => !S.hd[k] || Date.now() >= S.hd[k];

function hdBox() {
  let m = document.getElementById('hd-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'hd-modal';
    m.className = 'modal hd-modal';
    document.getElementById('app').appendChild(m);
  }
  return m;
}
function hdShell(q) {
  const m = hdBox();
  m.style.setProperty('--hd-a', q.a);
  m.innerHTML = '<div class="hd-win">' +
    '<div class="hd-tbar"><span class="hd-tic">' + q.ic + '</span><b>' + q.win + '</b>' +
    '<span class="hd-mist" id="hd-mist"></span><span class="hd-clock" id="hd-clock"></span>' +
    '<span class="hd-usbtn" id="hd-usbtn" onclick="hdUsb()"></span><span class="hd-x" onclick="hdClose()">✕</span></div>' +
    '<div class="hd-stage" id="hd-stage"></div>' +
    '<div class="hd-foot" id="hd-foot"></div></div>';
}
function hdStage(html) { const s = document.getElementById('hd-stage'); if (s) s.innerHTML = html; }
function hdFoot(html, cls) {
  const f = document.getElementById('hd-foot');
  if (f) { f.innerHTML = html; f.className = 'hd-foot' + (cls ? ' ' + cls : ''); }
}
function hdMist() { const e = document.getElementById('hd-mist'); if (e) e.innerText = HD.mist ? '⚠ sai ' + HD.mist + ' bước' : '✔ chưa sai'; }
function hdShake(sel) {
  const e = document.querySelector(sel);
  if (!e) return;
  e.classList.remove('shake');
  void e.offsetWidth;            // buộc reflow để animation chạy lại lần thứ 2
  e.classList.add('shake');
}
function hdMiss(msg) {
  HD.mist++; hdMist();
  hdFoot('❌ ' + msg, 'bad');
  beep(210, 'square', .16, .045);
}
function hdClock() {
  const e = document.getElementById('hd-clock');
  if (!e || !HD) return;
  const left = HD.secs * 1000 - (Date.now() - HD.t0);
  e.innerText = '⏱ ' + hdMs(left);
  e.className = 'hd-clock' + (left < 15000 ? ' low' : '');
  if (left <= 0 && HD.st !== 'done' && HD.st !== 'lost') hdLose();
}

function hdOpen(key) {
  const q = HD_Q[key];
  if (!q) return false;
  if (!hdReady(key)) {
    showToast('⏳ Helpdesk ' + q.who + ' vừa xong — còn ' + hdMs(hdLeft(key)) + ' mới hồi. Làm job cài Win trước nhé!');
    if (WIN_JOBS[q.house] && WIN_JOBS[q.house].qs.length) winOpen(q.house);   // nhà 8 không có quiz — khỏi mở
    return false;
  }
  closeAll();
  HD = { q, game: q.game,
    st: q.game === 'spooler' ? 'desk' : q.game === 'router' ? 'login' : q.game === 'netdrive' ? 'ndesk'
      : q.game === 'feed' ? 'jam' : q.game === 'smart' ? 'cdi' : 'run',
    secs: q.secs + shopTime(), byUsb: false,
    t0: Date.now(), mist: 0, sel: -1, kill: 0, hold: 0, scraped: false,
    svcs: HD_SVCS.map(s => s.slice()), dead: HD_PROCS.map(() => false), cpu: HD_PROCS.map(p => p[1]) };
  hdShell(q);
  if (q.game === 'spooler') hdDesk();
  else if (q.game === 'router') hdRouterLogin();
  else if (q.game === 'netdrive') hdNdDesk();
  else if (q.game === 'feed') hdLp();
  else if (q.game === 'smart') hdCdi();
  else hdTask();
  hdMist(); hdClock(); hdUsbBtn();
  hdBox().style.display = 'flex';
  showToast('🎫 Việc phụ ' + q.who + ': ' + q.dev);
  beep(560, 'triangle', .12, .04);
  return true;
}
function hdClose() {
  const m = document.getElementById('hd-modal');
  if (m) m.style.display = 'none';
  HD = null;
  releaseFocus();
}
function hdLose() {
  const q = HD.q;
  HD.st = 'lost';
  hdUsbBtn();
  hdStage('<div class="hd-end"><div class="hd-endic">⏰</div><b>Hết giờ — ' + q.who + ' phải gọi người khác</b>' +
    '<div class="hd-endtx">Em chưa xử xong trong ' + HD.secs + ' giây nên chưa nhận thưởng.<br>Việc phụ chưa tính cooldown — em làm lại được ngay.</div>' +
    '<div class="hd-endbt"><button class="hd-btn pri" onclick="hdOpen(\'' + q.key + '\')">🔁 THỬ LẠI</button>' +
    '<button class="hd-btn ghost" onclick="hdClose()">✖ ĐÓNG</button></div></div>');
  hdFoot('❌ Quá thời gian — không nhận thưởng.', 'bad');
  beep(170, 'square', .26, .05);
}
function hdWin() {
  const q = HD.q, cd = shopCdMin();
  HD.st = 'done';
  S.hd[q.key] = Date.now() + shopCd();
  addCoin(HD_COIN); addXP(HD_XP); saveGame();
  hdUsbBtn();
  chord([660, 880, 1100, 1320]);
  showToast('🎫 ' + q.who + ': +' + HD_COIN + ' Coin · +' + shopXp(HD_XP) + ' XP — việc phụ hồi sau ' + cd + ' phút');
  const jobBtn = WIN_JOBS[q.house] && WIN_JOBS[q.house].qs.length
    ? '<button class="hd-btn" onclick="hdWinJob(' + q.house + ')">🪟 Làm job cài Win dạo</button>'
    : '<button class="hd-btn" onclick="hdDeskBack()">🔧 Về quầy Tiệm Sửa Máy</button>';
  hdStage('<div class="hd-end"><div class="hd-endic">' + (HD.byUsb ? '💾' : '🎉') + '</div><b>Việc phụ hoàn thành — ' + q.who + ' hài lòng</b>' +
    '<div class="hd-endtx">🎁 <b>+' + HD_COIN + ' Coin</b> · <b>+' + shopXp(HD_XP) + ' XP</b>' +
    (HD.byUsb ? '<br>Dùng <b>1 USB Cứu Hộ</b> — còn ' + invNum('usb') + ' cái trong túi.'
      : HD.mist ? '<br>Số bước làm sai: ' + HD.mist : '<br>Xuất sắc — không sai bước nào!') + '</div>' +
    '<div class="hd-quote">' + q.quote + '</div>' +
    '<div class="hd-endbt">' + jobBtn +
    '<button class="hd-btn ghost" onclick="hdClose()">✖ ĐÓNG</button></div></div>');
  hdFoot('⏳ Việc phụ này sẽ hồi lại sau ' + cd + ' phút — khi đó đèn 🎫 trên mái nhà lại sáng.', 'info');
}
function hdWinJob(i) { hdClose(); winOpen(i); }
function hdDeskBack() { hdClose(); repairDesk(); }

/* ---------- 1. CÔ MAI — services.msc & Print Spooler ---------- */
function hdDesk() {
  HD.st = 'desk';
  hdStage('<div class="hd-desktop">' +
    '<div class="hd-dicon"><span>🖨️</span><b>Máy in tầng 1</b></div>' +
    '<div class="hd-alert"><b>⚠ Không in được</b><small>Hàng đợi in báo “Print Spooler is not running”. ' +
    hdEsc(HD.q.ask) + '</small></div>' +
    '<div class="hd-qwin"><div class="hd-qbar"><span>🖨️ Hàng đợi in — Máy in tầng 1</span><b>✕</b></div>' +
    '<div class="hd-qrow"><span>Hop-dong-CCNA.docx</span><i>0%</i></div>' +
    '<div class="hd-qrow"><span>Bang-gia-thang-10.xlsx</span><i>0%</i></div>' +
    '<div class="hd-qrow"><span>Don-dat-hang.pdf</span><i>0%</i></div>' +
    '<div class="hd-qerr">Trạng thái: Lỗi — dịch vụ in không chạy</div></div>' +
    '<div class="hd-menu" id="hd-menu"></div>' +
    '</div><div class="hd-task"><button class="hd-start" onclick="hdMenu(true)">⊞</button>' +
    '<input id="hd-search" class="hd-search" placeholder="Tìm lệnh… gõ services.msc rồi Enter" autocomplete="off" ' +
    'oninput="hdMenu(true)" onkeydown="hdMenuKey(event)"><span class="hd-tray">🔊 🖧 ' + (typeof clockLabel === 'function' ? clockLabel() : '') + '</span></div>');
  hdFoot('💡 Bước 1: bấm vào ô tìm kiếm trên taskbar, gõ <b>services.msc</b> (hoặc Enter) để mở bảng dịch vụ.');
}
function hdMenu(open) {
  const box = document.getElementById('hd-menu');
  if (!box || !HD) return;
  if (!open) { box.innerHTML = ''; return; }
  const inp = document.getElementById('hd-search');
  const v = ((inp && inp.value) || '').trim().toLowerCase();
  const hits = v ? HD_RUN.filter(r => r[0].indexOf(v) > -1 || v.indexOf(r[0].split('.')[0]) > -1) : [];
  box.innerHTML = '<div class="hd-menuhd">⊞ Kết quả tìm kiếm</div>' +
    (hits.length ? hits.map(r => '<div class="hd-hit" onclick="hdRun(\'' + r[0] + '\')"><span>⚙️</span><b>' + r[0] +
      '</b><small>' + r[1] + '</small></div>').join('')
      : '<div class="hd-hit none">Không tìm thấy “' + hdEsc(v) + '”</div>');
  if (inp && document.activeElement !== inp) inp.focus();
}
function hdMenuKey(e) {
  if (e.key !== 'Enter' || !HD) return;
  const inp = document.getElementById('hd-search');
  const v = ((inp && inp.value) || '').trim().toLowerCase();
  const exact = HD_RUN.find(r => r[0] === v);
  if (exact) return hdRun(exact[0]);
  const near = HD_RUN.find(r => r[0].indexOf(v) === 0);
  if (near && v.length >= 4) return hdRun(near[0]);
  hdMiss('Không có lệnh “' + hdEsc(v) + '” trong danh sách — em chọn một gợi ý bên dưới nhé.');
}
function hdRun(name) {
  if (!HD || HD.st !== 'desk') return;
  const r = HD_RUN.find(x => x[0] === name);
  if (name === 'services.msc') { hdSvc(); beep(720, 'triangle', .1, .04); return; }
  hdMiss('<b>' + name + '</b> mở ' + (r ? r[1] : 'cửa sổ khác') + ' — không liên quan tới dịch vụ in. Gõ lại <b>services.msc</b>.');
}
function hdSvc() {
  HD.st = 'svc';
  hdStage('<div class="hd-svc"><div class="hd-svcbar">' +
    '<button class="hd-abn" onclick="hdSvcAct(\'Start\')">▶ Start</button>' +
    '<button class="hd-abn" onclick="hdSvcAct(\'Stop\')">⏹ Stop</button>' +
    '<button class="hd-abn pri" onclick="hdSvcAct(\'Restart\')">🔄 Restart</button>' +
    '<button class="hd-abn" onclick="hdSvcAct(\'Pause\')">⏸ Pause</button>' +
    '<span class="hd-sel" id="hd-selname"></span></div>' +
    '<div class="hd-thead"><span>Tên dịch vụ</span><span>Trạng thái</span><span>Kiểu khởi động</span></div>' +
    '<div class="hd-svcbody" id="hd-svcbody"></div></div>');
  hdSvcBody();
  hdFoot('💡 Bước 2: chọn <b>đúng</b> dịch vụ in trong danh sách rồi bấm <b>Restart</b>. Có tới 3 dịch vụ đang “Đã dừng” — đừng bấm bừa!');
}
function hdSvcBody() {
  const b = document.getElementById('hd-svcbody');
  if (!b) return;
  b.innerHTML = HD.svcs.map((s, i) => '<div class="hd-srow' + (HD.sel === i ? ' on' : '') + '" onclick="hdSvcSel(' + i + ')">' +
    '<span class="nm"><b>' + s[0] + '</b><small>' + s[1] + '</small></span>' +
    '<span class="st ' + s[2] + '">' + HD_ST[s[2]] + '</span><span class="tp">' + s[3] + '</span></div>').join('');
  const nm = document.getElementById('hd-selname');
  if (nm) nm.innerText = HD.sel < 0 ? 'Chưa chọn dịch vụ nào' : HD.svcs[HD.sel][0] + ' (' + HD.svcs[HD.sel][1] + ')';
}
function hdSvcSel(i) {
  if (!HD || HD.st !== 'svc') return;
  HD.sel = i;
  hdSvcBody();
  beep(620, 'sine', .04, .02);
}
function hdSvcAct(act) {
  if (!HD || HD.st !== 'svc') return;
  if (HD.sel < 0) { hdFoot('⚠ Em phải click chọn một dịch vụ trong danh sách trước đã.', 'warn'); return; }
  const s = HD.svcs[HD.sel];
  if (act !== 'Restart') {
    hdFoot('💡 <b>' + act + '</b> chưa đủ: hàng đợi in đang kẹt 3 lệnh. Cần <b>Restart</b> để dừng hẳn rồi chạy lại.', 'warn');
    beep(300, 'sine', .1, .03);
    return;
  }
  if (!s[4]) {
    hdMiss('<b>' + s[0] + ' (' + s[1] + ')</b> không phải dịch vụ in. Dịch vụ in tên tiếng Anh là gì nhỉ?');
    hdShake('.hd-svcbody');
    return;
  }
  s[2] = 'start';
  HD.restarting = HD.sel;
  hdSvcBody();
  hdFoot('🔄 Đang dừng và khởi động lại Print Spooler…', 'info');
  setTimeout(hdSvcUp, 1300);
}
function hdSvcUp() {
  if (!HD || HD.st !== 'svc') return;
  HD.svcs[HD.restarting][2] = 'run';
  achUnlock('spooler');
  hdPrintWin();
  chord([620, 780]);
}
function hdPrintWin() {
  HD.st = 'print';
  hdStage('<div class="hd-print"><div class="hd-prcard"><span class="hd-pric">🖨️</span><div>' +
    '<b>Spooler lệnh in — Print Spooler</b><em>Đang chạy · Tự động chậm</em></div></div>' +
    '<div class="hd-prlog" id="hd-prlog">&gt; Service restarted. Hàng đợi in đã xoá: 3 lệnh chờ.</div>' +
    '<button class="hd-btn pri" onclick="hdTestPrint()">🖨 IN TRANG THỬ</button></div>');
  hdFoot('💡 Bước 3: sửa xong phải in thử rồi mới bàn giao với cô Mai.');
}
function hdTestPrint() {
  if (!HD || HD.st !== 'print') return;
  HD.st = 'printing';
  const L = ['> Gửi lệnh in: Hop-dong-CCNA.pdf (5 trang)', '> Trang 1/5 … đã nhả', '> Trang 3/5 … đã nhả', '> Trang 5/5 … đã nhả. Kẹt giấy: 0'];
  let i = 0;
  const step = () => {
    if (!HD || HD.st !== 'printing') return;
    const log = document.getElementById('hd-prlog');
    if (log) log.innerText = L.slice(0, i + 1).join('\n');
    beep(520 + i * 90, 'triangle', .08, .03);
    i++;
    if (i < L.length) setTimeout(step, 620); else setTimeout(hdWin, 700);
  };
  step();
}

/* ---------- 2. ANH BA — Task Manager, end 3 tiến trình miner ---------- */
function hdTask() {
  HD.st = 'run';
  hdStage('<div class="hd-tm"><div class="hd-tmtabs"><b class="on">Tiến trình</b><span>Hiệu suất</span><span>Khởi động</span><span>Người dùng</span></div>' +
    '<div class="hd-thead"><span>Tên</span><span>CPU</span><span>Bộ nhớ</span></div>' +
    '<div class="hd-tmbody" id="hd-procs"></div>' +
    '<div class="hd-tmfoot"><span class="hd-cpulb">CPU</span><div class="hd-cpubar"><i id="hd-cpufill"></i></div>' +
    '<b id="hd-cputxt"></b><span class="hd-killed" id="hd-killed"></span>' +
    '<button class="hd-btn end" onclick="hdEndTask()">End task</button></div></div>');
  hdTaskBody();
  hdFoot('💡 Click tiến trình <b>ngốn CPU bất thường</b> rồi bấm <b>End task</b> — 3 con là xong. Đừng end nhầm tiến trình hệ thống!');
}
function hdTaskBody() {
  const b = document.getElementById('hd-procs');
  if (!b) return;
  b.innerHTML = HD_PROCS.map((p, i) => '<div class="hd-prow' + (HD.dead[i] ? ' dead' : '') + (HD.sel === i ? ' on' : '') +
    (HD.cpu[i] >= 15 ? ' hot' : '') + '" onclick="hdProcSel(' + i + ')"><span class="nm">' + hdEsc(p[0]) +
    '</span><span class="cpu">' + (HD.dead[i] ? 0 : HD.cpu[i]) + '%</span><span class="mem">' +
    (HD.dead[i] ? 'đã kết thúc' : p[2]) + '</span></div>').join('');
  let tot = 0;
  HD_PROCS.forEach((p, i) => { if (!HD.dead[i]) tot += HD.cpu[i]; });
  const f = document.getElementById('hd-cpufill'), t = document.getElementById('hd-cputxt'), k = document.getElementById('hd-killed');
  if (f) { f.style.width = Math.min(100, tot) + '%'; f.className = tot > 70 ? '' : tot > 40 ? 'warm' : 'cool'; }
  if (t) { t.innerText = tot + '%'; t.style.color = tot > 70 ? '#fca5a5' : '#86efac'; }
  if (k) k.innerText = 'Đã end ' + HD.kill + '/3 tiến trình đáng ngờ';
}
function hdTaskLive() {
  HD_PROCS.forEach((p, i) => {
    if (!HD.dead[i]) HD.cpu[i] = Math.max(1, p[1] + Math.round(Math.sin(Date.now() / 300 + i) * 2));
  });
  hdTaskBody();
}
function hdProcSel(i) {
  if (!HD || HD.st !== 'run' || HD.dead[i]) return;
  HD.sel = i;
  hdTaskBody();
  beep(600, 'sine', .04, .02);
}
function hdEndTask() {
  if (!HD || HD.st !== 'run') return;
  if (HD.sel < 0) { hdFoot('⚠ Chưa chọn tiến trình nào để end.', 'warn'); return; }
  const i = HD.sel, p = HD_PROCS[i];
  if (!p[3]) {
    hdMiss('<b>' + p[0] + '</b> là ' + p[4] + '. Chỉ end tiến trình lạ ngốn CPU thôi!');
    hdShake('#hd-procs');
    return;
  }
  HD.dead[i] = true; HD.kill++; HD.sel = -1;
  hdTaskBody();
  hdFoot('✅ Đã kết thúc <b>' + p[0] + '</b> — ' + p[4] + '.', 'good');
  beep(880, 'triangle', .12, .04);
  if (HD.kill >= 3) { HD.st = 'fix'; achUnlock('miner'); setTimeout(hdNetBack, 950); }
}
function hdNetBack() {
  if (!HD || HD.st !== 'fix') return;
  hdFoot('🖥️ CPU toàn máy chủ giảm còn 17%, quạt hết rú.', 'good');
  hdWin();
}

/* ---------- 3. ANH TUẤN — trang cấu hình Router 192.168.1.1 ---------- */
function hdRouterLogin() {
  HD.st = 'login';
  hdStage('<div class="hd-br"><div class="hd-brbar"><span class="hd-bt">⬅ ➡ ⟳</span>' +
    '<span class="hd-url">🔒 http://192.168.1.1<span>— Trang quản trị NC-Router</span></span></div>' +
    '<div class="hd-page"><div class="hd-login"><div class="hd-brand"><span>⬡</span><b>NC-ROUTER</b><small>Archer C7 · v5</small></div>' +
    '<h4>Đăng nhập quản trị</h4>' +
    '<label>User name<input id="hd-ru" value="admin" autocomplete="off"></label>' +
    '<label>Password<input id="hd-rp" type="password" placeholder="mật khẩu quản trị"></label>' +
    '<button class="hd-btn pri" onclick="hdLogin()">Login</button>' +
    '<div class="hd-err" id="hd-rerr"></div>' +
    '<div class="hd-note">📝 Nhãn dán đáy router: <b>admin / admin</b> — mật khẩu mặc định của hãng.</div>' +
    '</div></div></div>');
  const pi = document.getElementById('hd-rp');
  if (pi) pi.addEventListener('keydown', e => { if (e.key === 'Enter') hdLogin(); });
  hdFoot('💡 Bước 1: vào <b>192.168.1.1</b> và đăng nhập bằng mật khẩu mặc định dán sau router.');
}
function hdLogin() {
  if (!HD || HD.st !== 'login') return;
  const u = (document.getElementById('hd-ru').value || '').trim().toLowerCase();
  const p = document.getElementById('hd-rp').value || '';
  if (u === 'admin' && p === 'admin') { hdRouterForm(); chord([620, 760]); return; }
  const e = document.getElementById('hd-rerr');
  if (e) e.innerText = '❌ Đăng nhập bị từ chối.';
  hdShake('.hd-login');
  hdMiss('Sai user hoặc password quản trị. Em nhìn lại nhãn dán dưới đáy router nhé.');
}
function hdRouterForm() {
  HD.st = 'form';
  hdStage('<div class="hd-br"><div class="hd-brbar"><span class="hd-bt">⬅ ➡ ⟳</span>' +
    '<span class="hd-url">🔒 http://192.168.1.1<wbr>#wireless<span>— Không dây → Cơ bản</span></span></div>' +
    '<div class="hd-page"><div class="hd-form"><div class="hd-tabs2"><b>Cơ bản</b><span>Khách</span><span>Bảo mật</span></div>' +
    '<label>Wireless Name (SSID)<input id="hd-ssid" value="Quan_An_Tuan_WiFi"></label>' +
    '<label>Security<select id="hd-sec">' + HD_SEC.map(s => '<option value="' + s[0] + '"' + (s[0] === 'wpa2' ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select></label>' +
    '<label>Wireless Password<input id="hd-pass" placeholder="≥ 8 ký tự, có chữ và số" autocomplete="off" oninput="hdPass()">' +
    '<i class="hd-meter"><b id="hd-met"></b></i><em id="hd-passmsg">Mật khẩu mới để anh dán ở quầy cho khách</em></label>' +
    '<div class="hd-savebar"><button class="hd-btn pri" onclick="hdRouterSave()">💾 SAVE &amp; REBOOT</button><span id="hd-savemsg"></span></div>' +
    '</div></div></div>');
  hdFoot('💡 Bước 2: chọn <b>WPA2-PSK</b> trở lên, đặt mật khẩu Wi-Fi ≥ 8 ký tự có chữ + số, rồi bấm <b>Save &amp; Reboot</b>.');
}
function hdPass() {
  const inp = document.getElementById('hd-pass');
  if (!inp) return false;
  const v = inp.value, m = document.getElementById('hd-met'), msg = document.getElementById('hd-passmsg');
  let sc = 0;
  if (v.length >= 8) sc++;
  if (/[0-9]/.test(v)) sc++;
  if (/[a-zA-Z]/.test(v)) sc++;
  if (v.length >= 12) sc++;
  if (m) { m.style.width = (sc * 25) + '%'; m.className = sc >= 3 ? 'good' : sc === 2 ? 'mid' : ''; }
  if (msg) msg.innerText = !v.length ? 'Mật khẩu mới để anh dán ở quầy cho khách'
    : v.length < 8 ? 'Quá ngắn — Wi-Fi chuẩn cần tối thiểu 8 ký tự'
      : !/[a-zA-Z]/.test(v) ? 'Cần thêm chữ cái'
        : !/[0-9]/.test(v) ? 'Cần thêm chữ số — toàn chữ dễ bị dò lắm'
          : v.length >= 12 ? 'Rất mạnh ✅' : 'Đủ mạnh ✅';
  return v.length >= 8 && /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
}
function hdRouterSave() {
  if (!HD || HD.st !== 'form') return;
  const sec = document.getElementById('hd-sec').value;
  const ms = document.getElementById('hd-savemsg');
  if (sec !== 'wpa2' && sec !== 'wpa3') {
    if (ms) ms.innerText = '❌ Bảo mật này như không có.';
    hdShake('.hd-form');
    hdMiss('<b>' + HD_SEC.find(s => s[0] === sec)[1] + '</b> — khách hàng xóm vẫn vào chùa. Chọn WPA2-PSK trở lên.');
    return;
  }
  if (!hdPass()) {
    if (ms) ms.innerText = '❌ Mật khẩu chưa đạt chuẩn.';
    hdShake('.hd-form');
    hdMiss('Mật khẩu Wi-Fi cần tối thiểu 8 ký tự và có cả chữ lẫn số.');
    return;
  }
  HD.st = 'save';
  HD.ssid = (document.getElementById('hd-ssid').value || 'Quan_An_Tuan_WiFi').trim();
  const url = '🔒 http://192.168.1.1<span>— Đang áp dụng cấu hình…</span>';
  hdStage('<div class="hd-br"><div class="hd-brbar"><span class="hd-bt">⬅ ➡ ⟳</span><span class="hd-url">' + url + '</span></div>' +
    '<div class="hd-page boot"><div class="hd-bootbox"><span class="hd-spin"></span><b id="hd-bootlb">Đang lưu cấu hình…</b>' +
    '<i class="hd-prog"><b id="hd-prog"></b></i><div class="hd-bootlog" id="hd-bootlog">&gt; Ghi cấu hình vào flash…</div></div></div></div>');
  hdFoot('💾 Router lưu cấu hình rồi tự khởi động lại — chờ client kết nối lại.', 'info');
  const SEQ = [
    ['Đang lưu cấu hình…', '34', '> Ghi cấu hình vào flash… OK'],
    ['Router khởi động lại…', '68', '> Rebooting… 20s. Wi-Fi tắt tạm thời.'],
    ['Wi-Fi phát lại: ' + HD.ssid, '100', '> 5 client kết nối lại (WPA2-PSK). Mật khẩu cũ đã vô tác dụng.']
  ];
  let i = 0;
  const step = () => {
    if (!HD || HD.st !== 'save') return;
    const lb = document.getElementById('hd-bootlb'), pg = document.getElementById('hd-bootlog'), bar = document.getElementById('hd-prog');
    if (lb) lb.innerText = SEQ[i][0];
    if (bar) bar.style.width = SEQ[i][1] + '%';
    if (pg) pg.innerText = SEQ[i][2];
    beep(500 + i * 130, 'triangle', .09, .03);
    i++;
    if (i < SEQ.length) setTimeout(step, 1000); else setTimeout(hdWin, 900);
  };
  step();
}

/* ---------- 4. CHÚ HẢI — hộp thoại Run gõ \\192.168.1.200\Data gắn lại ổ Z: ---------- */
const ND_UNC = '\\\\192.168.1.200\\data';
function hdNdDesk() {
  HD.st = 'ndesk';
  hdStage('<div class="hd-desktop">' +
    '<div class="hd-dicon"><span>🗄️</span><b>Server Data</b></div>' +
    '<div class="hd-alert"><b>⚠ Ổ đĩa mạng Z: không kết nối được</b><small>' + hdEsc(HD.q.ask) +
    '<br>Lỗi: <i>An unexpected network error occurred.</i></small></div>' +
    '<div class="hd-qwin"><div class="hd-qbar"><span>🖥️ This PC — Ổ đĩa mạng</span><b>✕</b></div>' +
    '<div class="hd-zrow bad"><span>💾</span><div><b>Data (Z:)</b><small>\\\\192.168.1.200\\Data</small></div><i>✖ Đã ngắt kết nối</i></div>' +
    '<div class="hd-zrow"><span>💽</span><div><b>Windows (C:)</b><small>Ổ cục bộ</small></div><i>✔ Sẵn sàng</i></div>' +
    '</div>' +
    '<div class="hd-menu" id="hd-ndmenu"></div>' +
    '</div><div class="hd-task"><button class="hd-start" onclick="hdNdStart()">⊞</button>' +
    '<span class="hd-ndtip">Bấm ⊞ Start → Run (giống phím ⊞ + R) để mở hộp thoại Run</span>' +
    '<span class="hd-tray">🔊 🖧 ' + (typeof clockLabel === 'function' ? clockLabel() : '') + '</span></div>');
  hdFoot('💡 Bước 1: bấm <b>⊞ Start</b> trên taskbar rồi chọn <b>Run</b> để mở hộp thoại Run.');
}
function hdNdStart() {
  if (!HD || HD.st !== 'ndesk') return;
  const box = document.getElementById('hd-ndmenu');
  if (!box) return;
  if (box.innerHTML) { box.innerHTML = ''; return; }   // bấm ⊞ lần nữa = đóng menu
  box.innerHTML = '<div class="hd-menuhd">⊞ Start — Máy chủ mini</div>' +
    '<div class="hd-hit" onclick="hdNdRunWin()"><span>▶️</span><b>Run</b><small>chạy lệnh / mở đường dẫn</small></div>' +
    '<div class="hd-hit" onclick="hdNdThisPC()"><span>🖥️</span><b>This PC</b><small>xem các ổ đĩa</small></div>' +
    '<div class="hd-hit" onclick="hdNdShut()"><span>⏻</span><b>Shut down</b><small>tắt máy chủ</small></div>';
  beep(620, 'sine', .04, .02);
}
function hdNdThisPC() {
  if (!HD || HD.st !== 'ndesk') return;
  const box = document.getElementById('hd-ndmenu');
  if (box) box.innerHTML = '';
  hdFoot('🖥️ This PC chỉ còn ổ C: — ổ mạng <b>Z:</b> đã mất kết nối tới \\\\192.168.1.200\\Data. Dùng hộp thoại <b>Run</b> để nối lại nhé.', 'warn');
}
function hdNdShut() {
  if (!HD || HD.st !== 'ndesk') return;
  const box = document.getElementById('hd-ndmenu');
  if (box) box.innerHTML = '';
  hdMiss('Đừng tắt máy chủ — cả công ty đang chờ dữ liệu! Mở <b>Run</b> gõ đường dẫn mạng là ổ Z: về ngay.');
}
function hdNdRunWin() {
  if (!HD || HD.st !== 'ndesk') return;
  HD.st = 'runbox';
  hdStage('<div class="hd-desktop"><div class="hd-runwin">' +
    '<div class="hd-runbar"><span>▶️</span><b>Run</b><i onclick="hdNdCancel()">✕</i></div>' +
    '<div class="hd-runbody"><span class="hd-runic">🏃</span><div>' +
    '<p>Nhập tên chương trình, thư mục, tài liệu hoặc tài nguyên Internet, và Windows sẽ mở giúp bạn.</p>' +
    '<label>Open<input id="hd-ndin" class="hd-runin" placeholder="gõ đường dẫn UNC rồi Enter" autocomplete="off" spellcheck="false"></label>' +
    '</div></div>' +
    '<div class="hd-runbtns"><button class="hd-abn pri" onclick="hdNdGo()">OK</button>' +
    '<button class="hd-abn" onclick="hdNdCancel()">Cancel</button><button class="hd-abn">Browse…</button></div>' +
    '</div></div>' +
    '<div class="hd-task"><button class="hd-start">⊞</button>' +
    '<span class="hd-ndtip">Run — gõ \\192.168.1.200\Data để mở lại thư mục Data trên server</span>' +
    '<span class="hd-tray">🔊 🖧 ' + (typeof clockLabel === 'function' ? clockLabel() : '') + '</span></div>');
  const inp = document.getElementById('hd-ndin');
  if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') hdNdGo(); }); }
  hdFoot('💡 Bước 2: gõ <b>đường dẫn UNC</b> của server dữ liệu (xem lại đích của ổ Z: trong This PC) rồi bấm <b>OK</b>.');
}
function hdNdCancel() {
  if (!HD || HD.st !== 'runbox') return;
  hdNdDesk();
  hdFoot('💡 Đã đóng Run. Bấm ⊞ Start → Run để thử lại khi sẵn sàng.', 'info');
}
function hdNdGo() {
  if (!HD || HD.st !== 'runbox') return;
  const raw = (document.getElementById('hd-ndin').value || '').trim();
  if (!raw) { hdFoot('⚠ Chưa gõ gì — gõ đường dẫn UNC của server dữ liệu rồi bấm OK.', 'warn'); return; }
  const v = raw.replace(/\\+$/, '').toLowerCase();   // tha lỗi dấu \ thừa cuối đường dẫn
  if (v === ND_UNC) return hdNdMount();
  let msg;
  if (v.indexOf('z:') === 0) msg = 'Gõ <b>Z:</b> chỉ mở ổ đang đứt kết nối (lại báo lỗi). Phải gõ thẳng đường dẫn mạng <b>\\\\192.168.1.200\\Data</b>.';
  else if (v.indexOf('\\\\192.168.1.200') === 0) msg = 'Không có thư mục chia sẻ <b>' + hdEsc(v.slice(14)) + '</b> trên server — share dữ liệu tên <b>Data</b>.';
  else if (v.indexOf('\\\\') !== 0 && v.replace(/\\/g, '').indexOf('192.168.1.200') === 0) msg = 'Đúng server rồi nhưng thiếu hai dấu <b>\\\\</b> đầu — đường dẫn UNC đầy đủ là <b>\\\\192.168.1.200\\Data</b>.';
  else if (v.replace(/\\/g, '').indexOf('192.168.1.2') === 0) msg = 'Sai địa chỉ server — máy chủ dữ liệu là <b>192.168.1.200</b> (nhìn lại đích của ổ Z: trong This PC).';
  else if (v.indexOf('\\\\') !== 0) msg = 'Đường dẫn UNC phải bắt đầu bằng hai dấu <b>\\\\</b> — \\\\tên-máy\\thư-mục-chia-sẻ.';
  else msg = 'Chưa đúng — đường dẫn chuẩn là <b>\\\\192.168.1.200\\Data</b>.';
  hdShake('.hd-runwin');
  hdMiss(msg);
}
function hdNdMount() {
  HD.st = 'mount';
  hdStage('<div class="hd-desktop"><div class="hd-ndwin">' +
    '<div class="hd-qbar"><span>🔗 Đang kết nối \\\\192.168.1.200\\Data…</span></div>' +
    '<div class="hd-bootbox"><span class="hd-spin"></span><b id="hd-ndlb">Gửi yêu cầu SMB tới 192.168.1.200…</b>' +
    '<i class="hd-prog"><b id="hd-ndpg"></b></i><div class="hd-bootlog" id="hd-ndlog">&gt; SMB: đàm phán phiên làm việc…</div></div>' +
    '</div></div>');
  hdFoot('🔗 Windows đang mở đường dẫn và gán lại ký tự ổ <b>Z:</b>…', 'info');
  const SEQ = [
    ['Đang xác thực: WORKGROUP\\svc-data…', '36', '> Session setup OK · Tree connect \\\\192.168.1.200\\DATA ✓'],
    ['Áp dụng lại ổ Z: cho các máy công ty…', '72', '> Gán Z: → \\\\192.168.1.200\\Data · 24 máy nhận lại cấu hình'],
    ['Mở thư mục Data (Z:)…', '100', '> 5 mục · Kết nối ổn định ✓']
  ];
  let i = 0;
  const step = () => {
    if (!HD || HD.st !== 'mount') return;
    const lb = document.getElementById('hd-ndlb'), pg = document.getElementById('hd-ndpg'), lg = document.getElementById('hd-ndlog');
    if (lb) lb.innerText = SEQ[i][0];
    if (pg) pg.style.width = SEQ[i][1] + '%';
    if (lg) lg.innerText = SEQ[i][2];
    beep(500 + i * 130, 'triangle', .09, .03);
    i++;
    if (i < SEQ.length) setTimeout(step, 1000); else setTimeout(hdNdOk, 900);
  };
  step();
}
function hdNdOk() {
  if (!HD || HD.st !== 'mount') return;
  HD.st = 'zok';
  achUnlock('storage');
  hdStage('<div class="hd-desktop">' +
    '<div class="hd-alert ok"><b>✅ Ổ đĩa mạng Z: đã kết nối lại</b><small>\\\\192.168.1.200\\Data — cả công ty vào được dữ liệu.</small></div>' +
    '<div class="hd-qwin"><div class="hd-qbar"><span>🗄️ Data (Z:) — \\\\192.168.1.200\\Data</span><b>✕</b></div>' +
    '<div class="hd-zrow"><span>📁</span><div><b>Bao_cao_2026</b><small>thư mục</small></div><i>✔</i></div>' +
    '<div class="hd-zrow"><span>📁</span><div><b>Ke_toan</b><small>thư mục</small></div><i>✔</i></div>' +
    '<div class="hd-zrow"><span>📁</span><div><b>Nhan_su</b><small>thư mục</small></div><i>✔</i></div>' +
    '<div class="hd-zrow"><span>📊</span><div><b>Bao_cao_hoi_so.xlsx</b><small>2.4 MB</small></div><i>✔</i></div>' +
    '</div></div>' +
    '<div class="hd-task"><button class="hd-start">⊞</button>' +
    '<span class="hd-ndtip">Z: đã về — 24 máy trong công ty thấy lại dữ liệu</span>' +
    '<span class="hd-tray">🔊 🖧 ✔</span></div>');
  hdFoot('✅ Ổ Z: sáng lại trên mọi máy — chú Hải kịp chiếu báo cáo cuộc họp.', 'good');
  setTimeout(() => { if (HD && HD.st === 'zok') hdWin(); }, 1100);
}

/* ---------- 5. ANH DŨNG — máy in tem: gỡ kẹt + GIỮ Feed 3 giây calibrate gap ---------- */
const HD_LP_LCD = {
  jam: '🔴 LỖI: KẸT GIẤY — TEM RÁCH KẸT ĐẦU IN',
  open: '🟠 NẮP ĐANG MỞ — KIỂM TRA ĐƯỜNG TEM',
  open2: '🟠 ĐÃ GỠ TEM KẸT — HÃY ĐÓNG NẮP',
  cal: '🟡 CẢM BIẾN KHỔ TEM LỆCH — CẦN CALIBRATE',
  hold: '🟠 GIỮ FEED — CALIBRATE… '
};
function hdLp() {
  HD.st = 'jam';
  hdLpDraw();
  hdFoot('💡 Bước 1: <b>mở nắp</b> máy in, gỡ mảnh tem đang kẹt rồi đóng nắp lại. Nhìn LCD trên máy để theo dõi trạng thái.');
}
function hdLpDraw() {
  const st = HD.st, scraped = HD.scraped;
  const lcd = st === 'jam' ? HD_LP_LCD.jam : st === 'open' ? (scraped ? HD_LP_LCD.open2 : HD_LP_LCD.open) : HD_LP_LCD.cal;
  const led = st === 'jam' ? 'red' : st === 'open' ? 'orange' : 'yellow';
  const lid = st === 'open'
    ? '<div class="hd-lplid open"><div class="hd-lproll">🧻</div>' +
      (scraped ? '<div class="hd-lpjam gone">✔ đã gỡ tem kẹt</div>'
               : '<div class="hd-lpjam" onclick="hdLpClear()">🩹 mảnh tem kẹt — bấm để gỡ</div>') + '</div>'
    : '<div class="hd-lplid"><i>▮ thanh in nhiệt — nắp đóng ▮</i></div>';
  const btns = st === 'jam'
    ? '<button class="hd-abn pri" onclick="hdLpOpen()">🔓 Mở nắp</button><button class="hd-abn" onclick="hdLpPower()">⏻ Khởi động lại</button>'
    : st === 'open'
      ? (scraped ? '<button class="hd-abn pri" onclick="hdLpClose()">🔒 Đóng nắp</button>' : '')
      : '<button class="hd-abn" onclick="hdLpTest()">🖨 In tem thử</button><button class="hd-abn" onclick="hdLpPower()">⏻ Khởi động lại</button>';
  hdStage('<div class="hd-lpstage">' +
    '<div class="hd-lp" id="hd-lpbox">' + lid +
    '<div class="hd-lpface">' +
    '<span class="hd-lpled ' + led + '" id="hd-lpled"></span>' +
    '<span class="hd-lplcd" id="hd-lplcd">' + lcd + '</span>' +
    '<button class="hd-lpfeed" id="hd-lpfeed" onpointerdown="hdLpDown()" onpointerup="hdLpUp()" onpointerleave="hdLpUp()">FEED<small>giữ 3s</small></button>' +
    '</div>' +
    '<div class="hd-lpout"><span class="hd-lplabel" id="hd-lplabel"></span></div>' +
    '</div>' +
    '<div class="hd-lpbar"><b>Calibrate cảm biến khổ tem</b><i><u id="hd-lpfill"></u></i><span id="hd-lppct">0%</span></div>' +
    '<div class="hd-lpbtns">' + btns + '</div>' +
    '</div>');
}
function hdLpOpen() {
  if (!HD || HD.st !== 'jam') return;
  HD.st = 'open';
  hdLpDraw();
  hdFoot('🔓 Nắp đã mở — thấy mảnh tem rách kẹt ở đầu in. Bấm vào <b>mảnh tem</b> để gỡ ra.');
  beep(600, 'triangle', .08, .03);
}
function hdLpClear() {
  if (!HD || HD.st !== 'open' || HD.scraped) return;
  HD.scraped = true;
  hdLpDraw();
  hdFoot('🫳 Đã gỡ mảnh tem kẹt. Xả lại đường tem cho thẳng rồi <b>đóng nắp</b>.');
  beep(700, 'triangle', .08, .03);
}
function hdLpClose() {
  if (!HD || HD.st !== 'open' || !HD.scraped) return;
  HD.st = 'cal';
  hdLpDraw();
  hdFoot('💡 Nắp đã đóng nhưng LCD còn vàng: cảm biến khổ tem vẫn nhớ sai. <b>GIỮ nút FEED đủ 3 giây</b> để máy tự calibrate.');
  beep(640, 'triangle', .08, .03);
}
function hdLpPower() {
  if (!HD || (HD.st !== 'jam' && HD.st !== 'cal')) return;
  hdMiss('Khởi động lại <b>không</b> dạy lại cảm biến khổ tem. Quy trình đúng: gỡ tem kẹt xong <b>GIỮ Feed 3 giây</b> để calibrate.');
}
function hdLpTest() {
  if (!HD || HD.st !== 'cal') return;
  hdShake('#hd-lpbox');
  hdMiss('Chưa calibrate mà in ngay — tem cứ lệch khổ/blank. <b>GIỮ FEED 3 giây</b> trước đã!');
}
function hdLpDown() {
  if (!HD) return;
  if (HD.st === 'jam') return hdMiss('Không feed được — tem đang kẹt ở đầu in. Mở nắp gỡ tem trước!');
  if (HD.st === 'open') { hdFoot('⚠ Nắp còn mở — đóng nắp rồi mới giữ Feed được.', 'warn'); return; }
  if (HD.st !== 'cal' || HD.hold) return;
  HD.hold = Date.now();
  const el = document.getElementById('hd-lpfeed');
  if (el) el.classList.add('holding');
}
function hdLpUp() {
  if (!HD || !HD.hold) return;
  const held = Date.now() - HD.hold;
  HD.hold = 0;
  const el = document.getElementById('hd-lpfeed'), f = document.getElementById('hd-lpfill'), p = document.getElementById('hd-lppct');
  if (el) el.classList.remove('holding');
  if (f) { f.style.transition = 'none'; f.style.width = '0%'; void f.offsetWidth; f.style.transition = ''; }
  if (p) p.innerText = '0%';
  if (held >= 400) { hdFoot('⚠ Thả sớm! Giữ FEED <b>liên tục đủ 3 giây</b> — nhả giữa chừng là chạy lại từ đầu.', 'warn'); beep(300, 'sine', .12, .03); }
  else hdFoot('💡 Nhấp Feed chỉ nhả thêm tem trống. Phải <b>GIỮ 3 giây</b> mới vào chế độ calibrate.', 'info');
}
function hdLpTick() {
  if (!HD || HD.st !== 'cal' || !HD.hold) return;
  const p = Math.min(1, (Date.now() - HD.hold) / 3000);
  const f = document.getElementById('hd-lpfill'), pct = document.getElementById('hd-lppct'), lcd = document.getElementById('hd-lplcd');
  if (f) f.style.width = (p * 100).toFixed(0) + '%';
  if (pct) pct.innerText = Math.round(p * 100) + '%';
  if (lcd) lcd.innerText = HD_LP_LCD.hold + Math.round(p * 100) + '%';
  if (p >= 1) { HD.hold = 0; hdLpCal(); }
}
function hdLpCal() {
  HD.st = 'calrun';
  const el = document.getElementById('hd-lpfeed'), f = document.getElementById('hd-lpfill'), pct = document.getElementById('hd-lppct');
  if (el) el.classList.remove('holding');
  if (f) f.style.width = '100%';
  if (pct) pct.innerText = '100%';
  const lcd = document.getElementById('hd-lplcd'), led = document.getElementById('hd-lpled');
  const SEQ = [
    ['🔵 ĐANG ĐO CẢM BIẾN KHỔ TEM…', 'orange'],
    ['🔵 TÌM GAP GIỮA CÁC TEM… 40×30mm ✓', 'orange'],
    ['🟢 IN TEM KIỂM TRA…', 'green'],
    ['🟢 SẴN SÀNG — KHỔ TEM 40×30mm ✓', 'green']
  ];
  let i = 0;
  const step = () => {
    if (!HD || HD.st !== 'calrun') return;
    if (lcd) lcd.innerText = SEQ[i][0];
    if (led) led.className = 'hd-lpled ' + SEQ[i][1];
    if (i === 2) { const lb = document.getElementById('hd-lplabel'); if (lb) lb.classList.add('out'); }
    beep(560 + i * 110, 'triangle', .08, .03);
    i++;
    if (i < SEQ.length) setTimeout(step, 850); else setTimeout(() => { if (HD && HD.st === 'calrun') hdWin(); }, 900);
  };
  step();
}

/* ---------- 6. CHỦ TIỆM — CrystalDiskInfo: đọc SMART, tư vấn thay SSD ---------- */
const HD_DISKS = [
  { ic: '💽', nm: 'WDC WD5000AAKX', gb: '500 GB HDD', temp: 39, warn: true },
  { ic: '⚡', nm: 'Samsung SSD 870 EVO', gb: '250 GB SSD', temp: 31, warn: false },
  { ic: '💽', nm: 'Seagate ST1000DM010', gb: '1 TB HDD', temp: 34, warn: false }
];
const HD_SMART = [
  ['05', 'Sectors đã thay thế (Reallocated Sectors)', '1.528', true],
  ['C5', 'Sector chờ xử lý (Current Pending Sector)', '48', true],
  ['C6', 'Sector hỏng không sửa được (Uncorrectable)', '16', true],
  ['09', 'Tổng thời gian hoạt động', '28.431 giờ', false],
  ['C2', 'Nhiệt độ ổ cứng', '39 °C', false],
  ['01', 'Tỉ lệ lỗi đọc (Read Error Rate)', 'Bình thường', false]
];
function hdCdi() {
  HD.st = 'cdi';
  hdStage('<div class="hd-cdi">' +
    '<div class="hd-cdihd"><b>CrystalDiskInfo — máy khách của Chủ Tiệm</b>' +
    '<span class="hd-cdileg"><i class="g">● Good</i><i class="w">● Caution</i><i class="b">● Bad</i></span></div>' +
    '<div class="hd-cdigrid">' + HD_DISKS.map((d, i) =>
      '<div class="hd-cdidisk' + (d.warn ? ' warn' : '') + '" onclick="hdCdiDisk(' + i + ')">' +
      '<span>' + d.ic + '</span><b>' + d.nm + '</b><small>' + d.gb + ' · ' + d.temp + '°C</small>' +
      '<em class="' + (d.warn ? 'w' : 'g') + '">' + (d.warn ? '⚠ Caution' : '✓ Good') + '</em></div>').join('') + '</div>' +
    '<div class="hd-cdifo">Bấm vào ổ cứng cần soi sâu — sẽ mở bảng SMART chi tiết của ổ đó.</div>' +
    '</div>');
  hdFoot('💡 Bước 1: máy khách nghi ổ cứng — chọn đúng ổ đang <b>báo vàng (Caution)</b> trong CrystalDiskInfo.');
}
function hdCdiDisk(i) {
  if (!HD || HD.st !== 'cdi') return;
  const d = HD_DISKS[i];
  if (!d.warn) { hdShake('.hd-cdigrid'); return hdMiss('<b>' + d.nm + '</b> vẫn <b>Good</b> (xanh) — không phải ổ gây chậm. Chọn ổ đang chuyển vàng.'); }
  HD.st = 'smart';
  chord([620, 760]);
  hdStage('<div class="hd-cdi">' +
    '<div class="hd-cdihd"><b>' + d.ic + ' ' + d.nm + ' — SMART</b><span class="hd-cdileg"><i class="w">⚠ Tình trạng: Caution</i></span></div>' +
    '<div class="hd-cdisum">500 GB HDD · 39 °C · đã chạy 28.431 giờ (~3,2 năm liền mạch) · firmware 01.01A01</div>' +
    '<div class="hd-smhead"><span>ID</span><span>Chỉ số SMART</span><span>Giá trị thô</span><span>Đánh giá</span></div>' +
    '<div class="hd-smbody">' + HD_SMART.map((r, k) =>
      '<div class="hd-smrow' + (r[3] ? ' warn' : '') + '" onclick="hdCdiAttr(' + k + ')"><span>' + r[0] + '</span><b>' + r[1] + '</b>' +
      '<i>' + r[2] + '</i><em class="' + (r[3] ? 'w' : 'g') + '">' + (r[3] ? '⚠ Vàng' : '✓') + '</em></div>').join('') + '</div>' +
    '</div>');
  hdFoot('💡 Bước 2: bấm vào <b>chỉ số SMART</b> cho thấy ổ đang hỏng vật lý để ghi vào phiếu chẩn đoán.');
}
function hdCdiAttr(k) {
  if (!HD || HD.st !== 'smart') return;
  const r = HD_SMART[k];
  if (!r[3]) { hdShake('.hd-smbody'); return hdMiss('<b>' + r[1] + '</b> vẫn bình thường — chọn dòng đang <b>⚠ vàng</b>.'); }
  HD.st = 'advice';
  hdFoot('✅ Đúng — <b>' + r[1] + '</b> = ' + r[2] + ': ổ đang sinh bad sector, chết dần. Sang bước tư vấn.', 'good');
  beep(820, 'triangle', .1, .04);
  setTimeout(hdCdiAdvice, 1000);
}
function hdCdiAdvice() {
  if (!HD || HD.st !== 'advice') return;
  hdStage('<div class="hd-cdi"><div class="hd-cdihd"><b>📋 Phiếu tư vấn — nói gì với khách?</b></div>' +
    '<div class="hd-cdisum">Ổ <b>WDC WD5000AAKX</b> (Caution · 1.528 reallocated + 48 pending sector) — dữ liệu khách đang lơ lửng.</div>' +
    '<div class="hd-cdiopts">' +
    '<button class="hd-cdiopt ok" onclick="hdCdiPick(0)">💾 <b>Sao lưu toàn bộ dữ liệu ngay</b>, thay HDD bằng <b>SSD</b>, chuyển dữ liệu sang rồi bàn giao</button>' +
    '<button class="hd-cdiopt" onclick="hdCdiPick(1)">🧹 <b>Format lại ổ</b> cho sạch — bad sector tự hết, dùng tiếp thoải mái</button>' +
    '<button class="hd-cdiopt" onclick="hdCdiPick(2)">🕑 Ổ <b>còn chạy được</b>, để vài tháng nữa hẵng tính</button>' +
    '</div></div>');
  hdFoot('💡 Bước 3: chọn tư vấn đúng nghề — dữ liệu của khách là trên hết.');
}
function hdCdiPick(k) {
  if (!HD || HD.st !== 'advice') return;
  if (k === 0) { achUnlock('disk'); return hdWin(); }
  hdShake('.hd-cdiopts');
  hdMiss(k === 1
    ? 'Format <b>không chữa</b> bad sector vật lý — ổ vẫn chết dần, dữ liệu vẫn mất bất cứ lúc nào.'
    : 'Ổ Caution với hơn 1.500 sector hỏng có thể chết <b>sáng mai</b> — không ai hẹn giờ được với HDD.');
}

/* ---------- đồng hồ + hiệu ứng ---------- */
setInterval(() => {
  try {
    if (!HD) return;
    const m = document.getElementById('hd-modal');
    if (!m || m.style.display !== 'flex') { HD = null; return; }   // đóng bằng ESC / closeAll
    if (HD.st === 'done' || HD.st === 'lost') return;
    hdClock();
    if (HD.game === 'taskmgr' && HD.st === 'run') hdTaskLive();
    if (HD.game === 'feed' && HD.st === 'cal' && HD.hold) hdLpTick();
  } catch (e) {}
}, 250);

/* ====================================================
   🛒 CỬA HÀNG IT — tiêu Coin mua phụ nghề cứu mạng
   ==================================================== */
S.inv = S.inv || {};          // { itemKey: số lượng } — đồ đã mua, lưu trong S.inv
const SHOP_ITEMS = [
  { k: 'usb', ic: '💾', n: 'USB Cứu Hộ', price: 400, use: true,
    d: 'Cứu nguy có điều kiện: chứa bộ script fix nhanh, cắm vào là vụ Helpdesk đang dở được xử lý ngay lập tức. Mua được nhiều lần, mỗi lần dùng hết 1 cái.',
    e: 'Tự hoàn thành ngay 1 job Helpdesk đang mở' },
  { k: 'cafe', ic: '☕', n: 'Cà Phê Deadline', price: 1200,
    d: 'Cà phê quán net Anh Ba, ngon hơn lúc 2h sáng. Người ta nhanh tay thì việc phụ hồi nhanh.',
    e: 'Cooldown việc phụ ngoài phố: 3 phút → 1 phút' },
  { k: 'shoes', ic: '👟', n: 'Giày Sneaker IT', price: 900,
    d: 'Đế êm, bám sàn gạch men tòa office — chạy giữa phố và quảng trường đỡ hụt hơi.',
    e: 'Tốc độ di chuyển ngoài phố +40%' },
  { k: 'crimper', ic: '🗜️', n: 'Kìm Bấm Cáp Xịn', price: 1500,
    d: 'Kìm Cat6 có khoá lõi, bấm 8 lõi không rung tay. Các ải có đồng hồ sẽ dư thêm thời gian.',
    e: '+20 giây ở ải bấm cáp / sửa mạng có đồng hồ' },
  { k: 'thinkpad', ic: '💼', n: 'Laptop ThinkPad Cũ', price: 2400,
    d: 'Bàn phím lì lì nhưng bền, cài sẵn PuTTY + Wireshark. Chấm công nhanh hơn, sếp ghi nhận hơn.',
    e: 'Vĩnh viễn +10% XP từ mọi nhiệm vụ' },
  /* ---- Thuốc Tăng Lực (dùng ngay, mua được nhiều lần liên tục) ---- */
  { k: 'rbull', ic: '⚡', n: 'Thuốc Tăng Lực IT (RedBull Code)', price: 300, instant: true, xp: 300, spdMin: 2,
    d: 'Nạp code RedBull: tỉnh táo tức thì. Uống là tăng cấp ngay, lại còn chạy nhanh hơn hẳn.',
    e: '+300 EXP ngay (≈ lên 1 cấp) · Chạy +20% tốc độ trong 2 phút' },
  { k: 'coffeeX2', ic: '☕', n: 'Combo Cà Phê Đen Thức Đêm', price: 700, instant: true, xp: 750, xpMin: 5,
    d: 'Cà phê đen không đường + bánh mì, thức trắng cày ải. Tỉnh cả đêm, EXP nhân đôi mọi nhiệm vụ.',
    e: '+750 EXP ngay · x2 EXP mọi nhiệm vụ trong 5 phút' },
  { k: 'ccnapill', ic: '💊', n: 'Viên Nén Kiến Thức CCNA', price: 1200, instant: true, xp: 1500,
    d: 'Nén cả bộ giáo trình 200-301 vào một viên. Nuốt là thông, tăng vọt cấp độ ngay lập tức.',
    e: '+1.500 EXP ngay (≈ tăng vọt 5 cấp)' },
  { k: 'gempack', ic: '💰', n: 'Gói Đổi Kim Cương → Coin (Quỹ IT)', gemPrice: 5, instant: true, coin: 3000,
    d: 'Quy đổi Kim Cương thành Coin quỹ thực tập. Rủng rỉnh tiền mua Thuốc tăng lực và sắm đồ.',
    e: 'Đổi 5 💎 lấy +3.000 Coin' },
  { k: 'internSub', ic: '🎓', n: 'Trợ cấp Thực tập sinh', price: 0, instant: true, coin: 2000, subsidy: true,
    d: 'Hỗ trợ đột xuất khi ví cạn. Miễn phí 0đ, chỉ nhận được khi bạn đang dưới 500 Coin.',
    e: 'Miễn phí · +2.000 Coin (chỉ khi đang dưới 500 Coin)' }
];
const shopItem = k => SHOP_ITEMS.filter(x => x.k === k)[0];
// invNum / invHas / shopSpd / shopXp khai báo ở engine.js (nạp trước, xem ghi chú trên addXP)
const shopCd = () => invHas('cafe') ? 60000 : HD_CD;
const shopTime = () => invHas('crimper') ? 20 : 0;
const shopCdMin = () => Math.round(shopCd() / 60000);

/* ---------- Dải buff HUD: icon trang bị đang kích hoạt (dưới thẻ nhân vật) ---------- */
const HUD_BUFFS = [
  { k: 'shoes',    tip: 'Tốc độ di chuyển ngoài phố +40%' },
  { k: 'cafe',     tip: 'Cooldown việc phụ: 1 phút' },
  { k: 'crimper',  tip: '+20 giây ở ải bấm cáp có đồng hồ' },
  { k: 'thinkpad', tip: 'Vĩnh viễn +10% XP' }
];
let buffSig = null;
function updateBuffBar() {
  const bar = document.getElementById('buff-bar');
  if (!bar) return;
  const now = Date.now();
  const tmp = [];
  if (typeof boostXpOn === 'function' && boostXpOn()) tmp.push({ ic: '☕', tip: 'x2 EXP · còn ' + Math.ceil((BOOST.xp - now) / 1000) + 's' });
  if (typeof boostSpdOn === 'function' && boostSpdOn()) tmp.push({ ic: '⚡', tip: '+20% tốc chạy · còn ' + Math.ceil((BOOST.spd - now) / 1000) + 's' });
  const own = HUD_BUFFS.filter(b => invHas(b.k));
  const sig = tmp.map(b => b.tip).join('|') + '#' + own.map(b => b.k).join(',');
  if (sig !== buffSig) {          // chỉ vẽ lại khi danh sách đồ/buff đổi (buff đổi mỗi giây khi còn hiệu lực)
    buffSig = sig;
    bar.innerHTML = own.map(b => {
      const it = shopItem(b.k);
      return '<span class="buff-chip" data-tip="' + b.tip + '">' + it.ic + '</span>';
    }).join('') + tmp.map(b => '<span class="buff-chip" data-tip="' + b.tip + '">' + b.ic + '</span>').join('');
    bar.classList.toggle('hidden', !(own.length || tmp.length));
  }
  const card = document.getElementById('player-card');
  if (card) bar.style.top = (card.offsetTop + card.offsetHeight + 2) + 'px';
}
/* thuốc tăng lực hết hiệu lực theo thời gian thực → tick 1s để cập nhật/gỡ chip */
setInterval(() => { try { updateBuffBar(); } catch (e) {} }, 1000);
/* lúc mới load, thẻ nhân vật có thể chưa đo đúng (font/layout chưa xong) → đo lại khi trang ổn định */
window.addEventListener('load', updateBuffBar);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => updateBuffBar());
function shopBox() {
  let m = document.getElementById('shop-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'shop-modal';
    m.className = 'modal shop-modal';
    document.getElementById('app').appendChild(m);
  }
  return m;
}
function shopRow(it) {
  if (it.instant) return shopRowInstant(it);
  const has = invHas(it.k);
  const poor = S.coin < it.price;
  const btn = (has && !it.use)
    ? '<span class="sp-own">✔ ĐANG DÙNG</span>'
    : `<button class="sp-buy${poor ? ' poor' : ''}" onclick="shopBuy('${it.k}')">${COIN_IC} ${it.price.toLocaleString()}<b>MUA</b></button>`;
  return '<div class="sp-item' + (has ? ' owned' : '') + '">' +
    '<span class="sp-ic">' + it.ic + '</span>' +
    '<div class="sp-info"><b>' + it.n + (has && it.use ? '<i class="sp-qty">×' + invNum(it.k) + '</i>' : '') + '</b>' +
    '<span class="sp-eff">' + it.e + '</span>' +
    '<small>' + it.d + '</small></div>' + btn + '</div>';
}
/* Vật phẩm "dùng ngay" (Thuốc tăng lực / gói Coin): luôn bấm được, mua nhiều lần liên tục. */
function shopRowInstant(it) {
  const isGem = !!it.gemPrice;
  const price = isGem ? it.gemPrice : it.price;
  const poor = isGem ? (S.gem || 0) < price : S.coin < price;
  const blocked = it.subsidy && S.coin >= 500;
  const cur = isGem ? '💎' : (price === 0 ? '🆓' : COIN_IC);
  const priceTxt = price === 0 ? '0đ' : price.toLocaleString();
  const label = it.subsidy ? 'NHẬN' : 'DÙNG';
  const btn = blocked
    ? '<span class="sp-own">' + COIN_IC + ' ≥ 500 — hết cần trợ cấp</span>'
    : `<button class="sp-buy${poor ? ' poor' : ''}" onclick="shopBuy('${it.k}')">${cur} ${priceTxt}<b>${label}</b></button>`;
  return '<div class="sp-item sp-instant">' +
    '<span class="sp-ic">' + it.ic + '</span>' +
    '<div class="sp-info"><b>' + it.n + '</b>' +
    '<span class="sp-eff">' + it.e + '</span>' +
    '<small>' + it.d + '</small></div>' + btn + '</div>';
}
function shopSummary() {
  const own = SHOP_ITEMS.filter(it => invHas(it.k));
  if (!own.length) return '💡 Chưa có phụ kiện nào — kiếm ' + COIN_IC + ' Coin từ ải và việc phụ Helpdesk rồi quay lại.';
  return '🎒 Đang mang: ' + own.map(it => it.ic + ' ' + it.n + (it.use ? ' ×' + invNum(it.k) : '')).join(' · ');
}
function renderShop() {
  const m = shopBox();
  m.innerHTML = '<div class="sp-head"><span class="sp-logo">🛒</span><div><b>CỬA HÀNG IT</b>' +
    '<small>PHỤ KIỆN NGHỀ CỨU MẠNG · TRẢ BẰNG COIN</small></div>' +
    '<span class="sp-wallet">' + COIN_IC + ' <b>' + S.coin.toLocaleString() + '</b></span>' +
    '<span class="sp-x" onclick="closeShop()">✕</span></div>' +
    '<div class="sp-list">' + SHOP_ITEMS.map(shopRow).join('') + '</div>' +
    '<div class="sp-foot" id="sp-foot">' + shopSummary() + '</div>';
}
function shopOpen() {
  const m = document.getElementById('shop-modal');
  return !!m && m.style.display === 'flex';
}
function openShop() {
  if (HD && HD.st !== 'done' && HD.st !== 'lost') {
    showToast('⚠️ Cửa sổ việc phụ đang mở — bấm ✕ đóng lại rồi hãy đi mua đồ!');
    return;
  }
  closeAll();
  renderShop();
  shopBox().style.display = 'flex';
  beep(620, 'triangle', .08, .03);
}
function closeShop() { shopBox().style.display = 'none'; releaseFocus(); }
function shopBuy(k) {
  const it = shopItem(k);
  if (!it) return;
  if (it.instant) return buyInstant(it);
  if (S.coin < it.price) {
    showToast('Thiếu ' + (it.price - S.coin).toLocaleString() + ' Coin — làm thêm ải và việc phụ nhé!');
    beep(190, 'square', .18, .05);
    return;
  }
  S.coin -= it.price;
  S.inv[k] = invNum(k) + 1;
  if (SHOP_ITEMS.filter(x => invHas(x.k)).length >= 5) achUnlock('tycoon');
  syncHUD();
  chord([520, 660, 780]);
  renderShop();
  showToast(it.ic + ' Đã mua ' + it.n + ' — ' + it.e + (it.use ? ' (nút 💾 hiện trên tiêu đề cửa sổ việc phụ)' : ''));
}
/* Thuốc Tăng Lực & gói Coin: trả tiền (Coin hoặc 💎) rồi nhận hiệu ứng NGAY, mua được vô hạn. */
function buyInstant(it) {
  const isGem = !!it.gemPrice;
  const price = isGem ? it.gemPrice : it.price;
  if (it.subsidy && S.coin >= 500) { showToast('🎓 Trợ cấp chỉ nhận được khi ví đang dưới 500 Coin.'); return; }
  if (isGem) {
    if ((S.gem || 0) < price) { showToast('💎 Thiếu Kim Cương — cần ' + (price - (S.gem || 0)) + ' 💎 nữa.'); beep(190, 'square', .18, .05); return; }
    S.gem -= price;
  } else if (price > 0) {
    if (S.coin < price) { showToast('Thiếu ' + (price - S.coin).toLocaleString() + ' Coin — cày thêm ải và việc phụ nhé!'); beep(190, 'square', .18, .05); return; }
    S.coin -= price;
  }
  const notes = [];
  if (it.coin) { addCoin(it.coin); notes.push('+' + it.coin.toLocaleString() + ' Coin'); }
  if (it.xp) { addXP(it.xp); notes.push('+' + it.xp.toLocaleString() + ' EXP'); }   // addXP tự xử lý LEVEL UP
  if (it.spdMin) { BOOST.spd = Math.max(BOOST.spd, Date.now() + it.spdMin * 60000); notes.push('⚡ +20% tốc chạy ' + it.spdMin + '′'); }
  if (it.xpMin) { BOOST.xp = Math.max(BOOST.xp, Date.now() + it.xpMin * 60000); notes.push('☕ x2 EXP ' + it.xpMin + '′'); }
  chord([520, 660, 780]);
  saveGame();
  syncHUD();
  renderShop();
  try { updateBuffBar(); } catch (e) {}
  showToast(it.ic + ' ' + it.n + ' — ' + notes.join(' · '));
}
/* USB Cứu Hộ: dùng ngay trong cửa sổ việc phụ đang mở */
function hdUsbBtn() {
  const b = document.getElementById('hd-usbtn');
  if (!b) return;
  const live = !!HD && HD.st !== 'done' && HD.st !== 'lost';
  b.style.display = (live && invHas('usb')) ? '' : 'none';
  b.innerHTML = '💾 USB <b>×' + invNum('usb') + '</b>';
}
function hdUsb() {
  if (!HD) { showToast('💾 Chưa có việc phụ nào đang mở để cứu.'); return; }
  if (HD.st === 'done' || HD.st === 'lost') { showToast('💾 Vụ này đã xử xong rồi.'); return; }
  if (!invHas('usb')) { showToast('💾 Hết USB Cứu Hộ — mua ở 🛒 Cửa hàng với 400 Coin.'); return; }
  S.inv.usb = invNum('usb') - 1;
  HD.byUsb = true;
  syncHUD();
  hdWin();
}

/* ====================================================
   🚀 KHU 3 — CĂN CỨ MẶT TRĂNG IT  (scene LUNAR_BASE)

   Nhân IT bay phi thuyền từ Quảng trường Network City (Khu 1) lên Mặt Trăng,
   làm 10 ải quản trị hệ thống vũ trụ rồi đáp về Trái Đất. Toàn bộ code Khu 3
   nằm trong khối này; các scene cũ chỉ dùng chung engine không bị sửa logic.

   ---- ẢNH NỀN ----
   assets/lunar_base_bg.png là JPEG 1024x572 đổi đuôi .png. Thay vì kéo căng
   thành 960x600 (lệch 12% dọc), ảnh vẽ GIỮ TỈ LỆ KHUNG vào 960x536 đặt tại
   y=64..600; dải 0..64 là vũ trụ vector vẽ thêm. Mọi số đo dưới đây tính theo
   khung canvas đó. Ảnh bake sẵn mock-HUD (mũi tên lùi, tiêu đề, minimap, nút
   cảm ứng) nên phải lát đúng nền của chính ảnh đè lên — chỉ drawImage
   nguồn→đích, không đọc pixel (Chrome chặn getImageData trên file://).
   ==================================================== */
const LU_K = 960 / 1024, LU_Y0 = 64;
function luMask(img, dx, dy, dw, dh, sx, sy) {
  ctx.drawImage(img, sx / LU_K, (sy - LU_Y0) / LU_K, dw / LU_K, dh / LU_K, dx, dy, dw, dh);
}
function luFill(img, dx, dy, dw, dh, sx, sy, sw, sh) {
  ctx.save(); ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
  for (let y = 0; y < dh; y += sh) for (let x = 0; x < dw; x += sw) luMask(img, dx + x, dy + y, sw, sh, sx, sy);
  ctx.restore();
}
/* Nguồn lát: vũ trụ gần như một màu đen-xanh nên ghép không lộ mạch; mặt đất
   phải lấy đúng dải y của ô cần che thì mới khớp sáng tối (đo bằng
   tools/flat-regions.cjs). */
const LU_SRC = { space: [360, 92, 50, 40], horizon: [880, 196, 40, 24], mid: [0, 344, 40, 28], low: [120, 568, 40, 28], deep: [840, 568, 40, 28] };
function luErase(img) {
  luFill(img, 8, 64, 50, 54, LU_SRC.space[0], LU_SRC.space[1], LU_SRC.space[2], LU_SRC.space[3]);
  luFill(img, 55, 64, 264, 74, LU_SRC.space[0], LU_SRC.space[1], LU_SRC.space[2], LU_SRC.space[3]);
  luFill(img, 791, 64, 46, 48, LU_SRC.space[0], LU_SRC.space[1], LU_SRC.space[2], LU_SRC.space[3]);
  /* Bảng mock-HUD in ở góc phải ảnh cao tới sát chân trời (canvas y≈178) —
     phải lát đen phủ hết, nếu không còn lại khung bo tròn lửng lơ. */
  luFill(img, 824, 64, 136, 114, LU_SRC.space[0], LU_SRC.space[1], LU_SRC.space[2], LU_SRC.space[3]);
  /* Nút "layers" bake sát mép phải, nằm DƯỚI đường chân trời nên phải lát
     bằng đúng dải đất quanh nó — dùng nền đen sẽ cắt đôi chân trời. */
  luFill(img, 928, 182, 32, 30, LU_SRC.horizon[0], LU_SRC.horizon[1], LU_SRC.horizon[2], LU_SRC.horizon[3]);
  luFill(img, 10, 548, 58, 52, LU_SRC.low[0], LU_SRC.low[1], LU_SRC.low[2], LU_SRC.low[3]);
  luFill(img, 898, 488, 62, 54, LU_SRC.deep[0], LU_SRC.deep[1], LU_SRC.deep[2], LU_SRC.deep[3]);
  luFill(img, 898, 542, 62, 58, LU_SRC.deep[0], LU_SRC.deep[1], LU_SRC.deep[2], LU_SRC.deep[3]);
}
/* Sao nền: dùng cho cả cảnh thật lẫn đoạn phim phóng (bố cục theo khung 960x600).
   Trái Đất in sẵn trong ảnh chiếm 670..767 x 74..174 — không rắc sao lên nó. */
const LU_SKY = Array.from({ length: 120 }, (_, i) => ({
  x: (i * 137.5 + (i % 5) * 41) % 960,
  y: 4 + ((i * 71.3 + (i % 7) * 23) % 592),
  r: 0.5 + (i % 4) * 0.35
}));
function luSky(t, maxY) {
  LU_SKY.forEach((s, i) => {
    if (s.y > maxY) return;
    if (maxY < 300 && s.x > 660 && s.x < 782 && s.y > 58) return;
    const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 1.1 + i));
    ctx.fillStyle = 'rgba(205,228,255,' + a.toFixed(3) + ')';
    ctx.fillRect(s.x, s.y, s.r + 0.7, s.r + 0.7);
  });
}
function luSkyMoon(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 190);
  g.addColorStop(0, '#01030a'); g.addColorStop(1, '#0a1730');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 190);
  luSky(t, 150);
}
function luDust(t) {
  for (let i = 0; i < 26; i++) {
    const s = LU_SKY[i];
    const x = (s.x + t * (6 + i % 5)) % 960, y = 250 + ((s.y * 2.6 + Math.sin(t * .7 + i) * 9) % 330);
    ctx.fillStyle = 'rgba(226,232,240,' + (0.05 + (i % 4) * 0.02).toFixed(3) + ')';
    ctx.fillRect(x, y, 2, 2);
  }
}

/* ---- PHI THUYỀN ---- */
/* IMG.chars.ship do tools/bake-sprites.cjs tẩy nền trắng + cắt bbox alpha.
   Chưa nạp được ảnh thì vẽ tạm khối vector để scene không bao giờ trống. */
function luShip(g, cx, cy, h, rot) {
  const im = IMG.chars && IMG.chars.ship;
  g.save(); g.translate(cx, cy); if (rot) g.rotate(rot);
  if (im && im.width) {
    const w = h * im.width / im.height;
    g.drawImage(im, -w / 2, -h / 2, w, h);
  } else {
    const w = h * 0.62;
    g.fillStyle = '#e8eefc'; g.strokeStyle = '#0a1022'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, -h / 2); g.quadraticCurveTo(w / 2, -h * .1, w * .34, h / 2);
    g.lineTo(-w * .34, h / 2); g.quadraticCurveTo(-w / 2, -h * .1, 0, -h / 2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#38bdf8'; g.beginPath(); g.arc(0, -h * .16, w * .22, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#f97316'; g.fillRect(-w * .34, h * .34, w * .68, h * .1);
  }
  g.restore();
}
function luFlame(g, cx, cy, w, h, t) {
  const f = h * (0.75 + Math.abs(Math.sin(t * 22)) * 0.45);
  const grd = g.createLinearGradient(0, cy, 0, cy + f);
  grd.addColorStop(0, 'rgba(255,255,255,.95)'); grd.addColorStop(.35, 'rgba(253,224,71,.9)');
  grd.addColorStop(1, 'rgba(249,115,22,0)');
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(cx - w / 2, cy); g.quadraticCurveTo(cx, cy + f * 1.25, cx + w / 2, cy); g.closePath(); g.fill();
}

/* ====================================================
   6 ẢI KHU 3 — MINIGAME TƯƠNG TÁC LOGIC (không trắc nghiệm)
   (id riêng, không đụng STAGES / renderMissions / buildingLock cũ)
   px,py,pw = vị trí biển hologram; 6 biển trùng nhãn bake trong ảnh nền
   để che luôn chữ + "Lv.xx" mà artist vẽ sẵn.
   mg = module minigame trong LQM_GAMES; ask = lời dẫn trước khi vào trạm.
   ==================================================== */
const LUNAR_STAGES = [
  { id: 'lq_lab', no: 1, icon: '🔬', name: 'LAB NGHIÊN CỨU DOME', sign: 'NỐI MẠCH LƯỢNG TỬ', mg: 'circuit', lv: 12, x: 219, y: 317, r: 90, px: 56, py: 170, cw: 182, skill: 'hardware', xp: 60, coin: 900,
    ask: 'Lưới quang học của máy gia tốc lượng tử vừa lệch pha. Xoay từng ô mạch để luồng năng lượng xanh chảy từ Nguồn tới Đích!' },
  { id: 'lq_bio', no: 2, icon: '🌡️', name: 'SERVER BIODOME', sign: 'ĐIỀU ÁP LÀM MÁT', mg: 'thermal', lv: 13, x: 442, y: 372, r: 88, px: 352, py: 156, cw: 124, skill: 'datacenter', xp: 65, coin: 1000,
    ask: 'Bão Mặt Trời đang nung nóng dàn server trong vòm sinh thái. Chỉnh 4 thanh làm mát và xả áp đúng lúc để giữ nhiệt độ an toàn!' },
  { id: 'lq_sat', no: 3, icon: '🛰️', name: 'TRẠM THU PHÁT SATELLITE', sign: 'BẮT SÓNG LASER', mg: 'sat', lv: 14, x: 645, y: 262, r: 90, px: 556, py: 226, cw: 192, skill: 'networking', xp: 70, coin: 1100,
    ask: 'Beam laser từ Trái Đất lệch khỏi chảo thu. Ngắm đúng tọa độ tín hiệu, rồi tinh chỉnh tần số — pha để dao động ký khớp hoàn toàn!' },
  { id: 'lq_bay', no: 4, icon: '🚀', name: 'SÂN BAY VŨ TRỤ', sign: 'HIỆU CHUẨN BUỒNG LÁI', mg: 'ship', lv: 15, x: 745, y: 385, r: 90, px: 752, py: 422, cw: 176, skill: 'troubleshooting', xp: 75, coin: 1200,
    ask: 'Buồng lái phi thuyền vừa reset firmware. Ghi nhớ chuỗi đèn khởi động rồi đồng bộ xung năng lượng đúng 3 nhịp liên tiếp!' },
  { id: 'lq_cable', no: 5, icon: '🔌', name: 'TRẠM VẬN HÀNH CÁP MẠNG', sign: 'ĐẤU CÁP QUANG', mg: 'cable', lv: 16, x: 195, y: 540, r: 88, px: 295, py: 376, cw: 196, skill: 'crimping', xp: 80, coin: 1300,
    ask: 'Tủ sợi quang rối tung sau giông bão. Kéo các đầu cáp cùng màu nối lại với nhau sao cho không sợi nào cắt ngang sợi nào!' },
  { id: 'lq_sec', no: 6, icon: '🛡️', name: 'PHÒNG AN NINH MẠNG', sign: 'KHIÊN CHỐNG DDoS', mg: 'radar', lv: 17, x: 600, y: 555, r: 90, px: 506, py: 522, cw: 192, skill: 'networking', xp: 95, coin: 1600,
    ask: 'Radar báo một đợt DDoS 20 giây đang ập vào lõi server! Bấm nổ gói ĐỎ, tuyệt đối để yên gói XANH — lõi phải trụ vững!' }
];
/* Cho applySave biết 6 id này là CỜ ẢI (boolean) chứ không phải key động. */
LUNAR_STAGES.forEach(s => { STAGE_IDS[s.id] = 1; });
if (!S.missionsDone) S.missionsDone = {};
LUNAR_STAGES.forEach(s => { if (!(s.id in S.missionsDone)) S.missionsDone[s.id] = false; });

const luDone = () => LUNAR_STAGES.filter(s => S.missionsDone[s.id]).length;
function luOpen(s) {
  if (DEV.on) return true;
  return true;   // Nới lỏng: ai bay lên Mặt Trăng cũng chơi được cả 6 trạm — Lv. chỉ là khuyến nghị
}
function luLockTxt(s) {
  return 'ℹ️ Khuyến nghị Lv.' + s.lv + ' (bạn Lv.' + S.level + ') — vẫn chơi được!';
}

/* ---- BIỂN TRẠM (che luôn nhãn bake của ảnh nền) ---- */
function luSign(s, col, done, open) {
  const name = s.icon + ' ' + s.name;
  ctx.font = 'bold 11px ' + IZF;
  const w = Math.max(s.cw || 0, 46 + ctx.measureText(name).width, 150), h = 44;
  const x = Math.max(4, Math.min(956 - w, s.px)), y = s.py;
  ctx.strokeStyle = alphaC(col, .5); ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(x + 24, y + h); ctx.lineTo(s.x, s.y - 4); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(4,10,22,.9)'; rr(ctx, x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 10); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 22, y + 22, 13, 0, 7); ctx.fill();
  ctx.fillStyle = '#04101f'; ctx.font = 'bold 12px ' + IZF; ctx.textAlign = 'center';
  ctx.fillText(String(s.no), x + 22, y + 26); ctx.textAlign = 'left';
  ctx.fillStyle = '#eaf2ff'; ctx.font = 'bold 11px ' + IZF; ctx.fillText(name, x + 42, y + 19);
  ctx.font = '10px ' + IZF;
  ctx.fillStyle = done ? '#4ade80' : (open ? '#fde047' : '#94a3b8');
  ctx.fillText(done ? '✅ Đã hoàn thành' : ('🔓 Sẵn sàng — vào bằng [E] · Khuyên Lv.' + s.lv), x + 42, y + 34);
}
function luMarker(s, t) {
  const done = !!S.missionsDone[s.id], open = luOpen(s);
  const col = done ? '#4ade80' : (open ? (s.boss ? '#f97316' : '#38bdf8') : '#7c8aa5');
  const pulse = .5 + Math.sin(t * 2.2 + s.x * .013) * .5;
  ctx.fillStyle = alphaC(col, .10 + pulse * .07); ellipsePath(ctx, s.x, s.y, 26, 10); ctx.fill();
  ctx.strokeStyle = alphaC(col, .3 + pulse * .45); ctx.lineWidth = 2;
  ellipsePath(ctx, s.x, s.y, 26 + pulse * 5, 10 + pulse * 2); ctx.stroke();
  const lg = ctx.createLinearGradient(0, s.y - 52, 0, s.y);
  lg.addColorStop(0, alphaC(col, 0)); lg.addColorStop(1, alphaC(col, .28));
  ctx.fillStyle = lg; ctx.fillRect(s.x - 8, s.y - 52, 16, 52);
  ctx.font = '17px "Segoe UI Emoji",sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(s.icon, s.x, s.y - 54 + Math.sin(t * 2 + s.no) * 2.5); ctx.textAlign = 'left';
  luSign(s, col, done, open);
}
/* Thảm đáp [E] VỀ TRÁI ĐẤT ngay cạnh chân phi thuyền. Điểm đặt ở lối đi
   thoáng trên nền cát (sàn bệ đáp đã bỏ va chạm), bán kính nới để bấm [E] dễ. */
const LU_MAT = { x: 585, y: 455, r: 90 };
function luMat(t) {
  const p = .5 + Math.sin(t * 2.4) * .5;
  ctx.fillStyle = alphaC('#22c55e', .12 + p * .1); ellipsePath(ctx, LU_MAT.x, LU_MAT.y, LU_MAT.r, LU_MAT.r * .38); ctx.fill();
  ctx.strokeStyle = alphaC('#4ade80', .55 + p * .35); ctx.lineWidth = 2.5; ctx.setLineDash([9, 7]);
  ellipsePath(ctx, LU_MAT.x, LU_MAT.y, LU_MAT.r, LU_MAT.r * .38); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = alphaC('#bbf7d0', .35); ctx.lineWidth = 1.5;
  ellipsePath(ctx, LU_MAT.x, LU_MAT.y, LU_MAT.r * .62, LU_MAT.r * .24); ctx.stroke();
  /* Nhãn đặt TRÊN mép thảm; ẩn khi engine đã vẽ [E] cùng chỗ để không lặp chữ. */
  if (!(targetAct && targetAct.t === 'lu_return')) {
    ctx.font = 'bold 10px ' + IZF; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(4,10,22,.72)';
    const cap = '🌍 BÃI ĐÁP — VỀ TRÁI ĐẤT', cw = ctx.measureText(cap).width + 12;
    rr(ctx, LU_MAT.x - cw / 2, LU_MAT.y - 34, cw, 15, 7); ctx.fill();
    ctx.fillStyle = '#dcfce7'; ctx.fillText(cap, LU_MAT.x, LU_MAT.y - 23); ctx.textAlign = 'left';
  }
}
function luBaseVector() {
  const g = ctx.createLinearGradient(0, 150, 0, 600);
  g.addColorStop(0, '#6b7280'); g.addColorStop(1, '#3b4252');
  ctx.fillStyle = g; ctx.fillRect(0, 150, 960, 450);
  for (let i = 0; i < 12; i++) {
    const x = (i * 173) % 940 + 20, y = 210 + ((i * 97) % 330);
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ellipsePath(ctx, x, y, 34 + (i % 4) * 12, 13 + (i % 3) * 5); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  }
}
function drawLunarBase() {
  const t = Date.now() / 1000;
  luSkyMoon(t);
  if (IMG.lunar_bg) {
    ctx.drawImage(IMG.lunar_bg, 0, LU_Y0, 960, 536);
    luErase(IMG.lunar_bg);
  } else {
    luBaseVector();
  }
  luDust(t);
  LUNAR_STAGES.forEach(s => luMarker(s, t));
  luMat(t);
  drawSprite(S.p.x, S.p.y, 'p');
}

/* ====================================================
   BÃI ĐÁP PHI THUYỀN Ở KHU 1 + VẬT LÝ
   ==================================================== */
/* Cản vô hình rộng hơn nền bãi đáp: mép dưới của ô chặn nằm DƯỚI thảm 40px
   để nhãn [E] (vẽ tại S.p.y-36 trong engine.render) không bao giờ bị bãi
   đáp vẽ sau đó che mất. */
const LU_PAD = { cx: 640, cy: 278, rx: 78, ry: 24, box: [562, 186, 156, 172], tx: 640, ty: 372, tr: 62 };
const _luBoxCollides = boxCollides;
boxCollides = function (nx, ny) {
  if (_luBoxCollides(nx, ny)) return true;
  const cx = nx + 10, cy = ny + 18, r = 8, b = LU_PAD.box;
  return b[0] - r < cx && b[0] + b[2] + r > cx && b[1] - r < cy && b[1] + b[3] + r > cy;
};
function drawWorldPad() {
  const t = Date.now() / 1000, P = LU_PAD;
  ctx.fillStyle = 'rgba(4,10,22,.45)'; ellipsePath(ctx, P.cx, P.cy + 6, P.rx + 8, P.ry + 5); ctx.fill();
  ctx.fillStyle = '#1b2740'; ellipsePath(ctx, P.cx, P.cy, P.rx, P.ry); ctx.fill();
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.setLineDash([12, 9]);
  ellipsePath(ctx, P.cx, P.cy, P.rx - 5, P.ry - 3); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(56,189,248,.5)'; ctx.lineWidth = 2;
  ellipsePath(ctx, P.cx, P.cy, P.rx * .55, P.ry * .55); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * .25 + i * Math.PI * .5;
    const lx = P.cx + Math.cos(a) * (P.rx - 12), ly = P.cy + Math.sin(a) * (P.ry - 4);
    const on = Math.sin(t * 3 + i * 1.57) > 0;
    ctx.fillStyle = on ? '#fde047' : 'rgba(120,113,50,.6)';
    ctx.beginPath(); ctx.arc(lx, ly, 3.4, 0, 7); ctx.fill();
  }
  ctx.fillStyle = 'rgba(23,63,102,.35)'; ellipsePath(ctx, P.cx, P.cy + 4, P.rx * .8, P.ry * .7); ctx.fill();
  /* Tàu đặt cao hơn mép thảm: nhãn [E] của engine vẽ tại S.p.y-36 mà nhân vật bị
     ô chặn giữ từ y=348, nên đáy tàu (288) không bao giờ bị nhãn che ngược lại. */
  luShip(ctx, P.cx, P.cy - 62, 92, 0.5);
  ctx.font = 'bold 10px ' + IZF; ctx.textAlign = 'center'; ctx.fillStyle = '#dbeafe';
  ctx.fillText('🚀 BÃI ĐÁP PHI THUYỀN', P.cx, P.cy + P.ry - 4); ctx.textAlign = 'left';
  const glow = .5 + Math.sin(t * 4) * .5;
  ctx.fillStyle = alphaC('#4ade80', .3 + glow * .5);
  ctx.beginPath(); ctx.arc(P.cx, P.cy - 108, 3 + glow, 0, 7); ctx.fill();
}

/* ====================================================
   ĐOẠN PHIM PHÓNG 2 GIÂY
   Overlay là .modal inline display:flex → engine tự dừng game bên dưới
   (engine.update có nhánh if openModalEl()).
   ==================================================== */
function luCutOpen() {
  let ov = document.getElementById('lu-cut');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'lu-cut'; ov.className = 'modal';
    ov.innerHTML = '<canvas id="lu-cut-cv" width="960" height="600" style="width:100%;height:100%;display:block"></canvas>';
    document.getElementById('app').appendChild(ov);
  }
  ov.style.cssText = 'display:flex;position:absolute;inset:0;padding:0;margin:0;background:#01030a;border:0;border-radius:0;z-index:150;transform:none;animation:none;overflow:hidden';
  return ov;
}
function luCutFrame(c, p) {
  const t = Date.now() / 1000;
  c.fillStyle = '#01030a'; c.fillRect(0, 0, 960, 600);
  const streak = p < .42 ? 0 : Math.min(30, (p - .42) * 70);
  LU_SKY.forEach((s, i) => {
    const y = ((s.y + p * (260 + s.r * 420)) % 620) - 10;
    c.fillStyle = 'rgba(205,228,255,' + (0.2 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))).toFixed(3) + ')';
    c.fillRect(s.x, y, s.r + .8, s.r + .8 + streak);
  });
  /* Thị trấn lùi dần xuống dưới khung rồi biến mất; clamp ở 640 để đất
     không kéo phi thuyền rơi ngược khi đã hết đà bay. */
  const gy = 470 + Math.min(170, Math.max(0, p - .3) * 1500);
  if (gy < 640) {
    c.fillStyle = '#0d1a2e'; c.fillRect(0, gy, 960, 640 - gy);
    c.fillStyle = 'rgba(56,189,248,.35)'; c.fillRect(0, gy - 3, 960, 3);
    c.fillStyle = '#12203a';
    for (let i = 0; i < 7; i++) c.fillRect(40 + i * 130, gy - 46, 74, 46);
  }
  const lift = p < .3 ? 0 : Math.min(1, (p - .3) / .45);
  const shake = p < .34 ? Math.sin(t * 60) * 2.2 * Math.min(1, p / .1) : 0;
  const cx = 480 + shake, cy = gy - 96 - lift * 440;
  if (p > .04) luFlame(c, cx + 16, cy + 52, 34, 90, t);
  luShip(c, cx, cy, 118, 0.5 + lift * 0.18);
  if (p > .55) {
    const a = Math.min(1, (p - .55) / .2);
    c.globalAlpha = a;
    const eg = c.createRadialGradient(180, 620, 40, 180, 620, 320);
    eg.addColorStop(0, '#9fd8ff'); eg.addColorStop(.45, '#2b6cb0'); eg.addColorStop(1, '#041023');
    c.fillStyle = eg; c.beginPath(); c.arc(180, 620, 300, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.22)';
    for (let i = 0; i < 5; i++) c.fillRect(60 + i * 52, 520 + (i % 3) * 26, 40, 9);
    c.globalAlpha = 1;
  }
  if (p > .74) {
    const a = Math.min(1, (p - .74) / .16);
    c.globalAlpha = a;
    c.fillStyle = 'rgba(4,10,22,.72)'; c.fillRect(0, 236, 960, 128);
    c.fillStyle = '#fde047'; c.font = 'bold 30px "Segoe UI",sans-serif'; c.textAlign = 'center';
    c.fillText('KHU 3 · CĂN CỨ MẶT TRĂNG', 480, 292);
    c.fillStyle = '#7dd3fc'; c.font = 'bold 14px "Segoe UI",sans-serif';
    c.fillText('IT LUNAR BASE — ĐANG TIẾP CẬN BÃI ĐÁP', 480, 322);
    c.textAlign = 'left'; c.globalAlpha = 1;
  }
}
let LU_CUT = null;
function luCutClose(ov) { ov.style.cssText = 'display:none'; }
function luLaunch() {
  if (LU_CUT) return;
  const ov = luCutOpen(), cv = document.getElementById('lu-cut-cv'), c = cv.getContext('2d');
  const t0 = performance.now(), DUR = 2000;
  LU_CUT = { ov: ov };
  beep(120, 'sawtooth', .6, .05);
  const step = () => {
    if (!LU_CUT) return;
    if (ov.style.display !== 'flex') { LU_CUT = null; luLand(); return; }   // người chơi bấm ESC
    const p = Math.min(1, (performance.now() - t0) / DUR);
    luCutFrame(c, p);
    if (p < 1) requestAnimationFrame(step);
    else { LU_CUT = null; luCutClose(ov); luLand(); }
  };
  requestAnimationFrame(step);
}
function luLand() {
  S.scene = 'LUNAR_BASE';
  /* Đáp đúng giữa thảm [E] — spawn lệch vào vùng boss thì nhãn [E] ưu tiên ải. */
  S.p.x = LU_MAT.x - 10; S.p.y = LU_MAT.y - 18;
  shipUnlock();                 // đã bay một lần = sở hữu phi thuyền
  setZone('🚀 KHU 3 · MẶT TRĂNG', 'IT Lunar Base — Căn cứ Mặt Trăng');
  beep(520); chord([440, 660, 880]);
  showBanner('KHU 3 · CĂN CỨ MẶT TRĂNG', '🚀 Hạ cánh tại IT Lunar Base',
    luDone() + '/' + LUNAR_STAGES.length + ' trạm đã xong · Bấm [E] tại biển trạm để làm ải', 'violet');
  saveGame();
}
function luReturn() {
  S.scene = 'WORLD';
  S.p.x = 560; S.p.y = 380;
  setZone('1. THÀNH PHỐ', 'Network City (World Map)');
  beep(380);
  showToast('🌍 Về tới Network City — phi thuyền chờ ở quảng trường nếu muốn lên lại.');
  saveGame();
}

/* ====================================================
   BẢN ĐỒ DỊCH CHUYỂN NHANH (WORLD MAP)
   Lớp vỏ modal + nút bấm (minimap góc phải) sống ở engine.js; đây là toàn bộ
   nội dung: 3 địa danh, thumbnail vẽ từ ảnh nền thật, điều kiện bay và đích
   đến. Ảnh chỉ drawImage — không đọc pixel nên chạy tốt trên file://.
   ==================================================== */
const WM_SHIP_LV = 4;   // mốc cấp để bay ra Mặt Trăng từ bản đồ (đã nới lỏng từ Lv.6)
/* Khung ảnh cắt làm thumbnail, theo toạ độ ảnh GỐC; [0,0,0,0] = dùng trọn ảnh.
   Phố Ngoài lấy dải y 0..200 (trời + cột điện + mái nhà) vì phần dưới ảnh là
   rào chắn + nhựa trơn, đưa vào thumbnail thành dải xám vô nghĩa. Mặt Trăng lấy
   khu bãi đáp (vòm kính + ăng-ten + xe + mũi phi thuyền): đúng chất căn cứ và
   tránh các nhãn ải baked trên mặt ảnh. */
const WM_RECT = { WORLD: [0, 0, 0, 0], STREET: [60, 0, 430, 200], LUNAR_BASE: [365, 288, 430, 200] };
function wmBusy() { return !!LU_CUT; }              // đang chiếu phim phóng tàu
const shipReady = () => !!S.ship;
/* Lần đầu bước lên phi thuyền (bấm [E] ở bãi đáp hoặc fast-travel) là coi như
   sở hữu nó — từ đó bản đồ cho bay dù chưa tới Lv.6. */
function shipUnlock() { if (!S.ship) { S.ship = true; saveGame(); } }

function wmSpots() {
  const city = STAGES.filter(s => !!S.missionsDone[s.id]).length;
  const wins = ['win0', 'win1', 'win2'].filter(k => !!S.missionsDone[k]).length;
  return [
    { id: 'WORLD', no: 'KHU 1', icon: '🏙️', name: 'TRUNG TÂM THÀNH PHỐ',
      sub: '8 toà nhà ải · sở chỉ huy IT · bãi đáp phi thuyền giữa quảng trường',
      prog: '🎯 ' + city + '/' + STAGES.length + ' ải', img: IMG.bg, tint: '#3aa5ff' },
    { id: 'STREET', no: 'KHU 2', icon: '🛣️', name: 'PHỐ NGOÀI',
      sub: 'Tiệm Sửa Máy · bàn Cài Windows dạo · kiếm coin lẻ trên vỉa hè',
      prog: '🔧 ' + wins + '/3 job cài win', img: IMG.street_bg, tint: '#ffc93c' },
    { id: 'LUNAR_BASE', no: 'KHU 3', icon: '🌙', name: 'CĂN CỨ MẶT TRĂNG',
      sub: '10 trạm ải không gian · boss Trung tâm Quản trị hệ thống lõi',
      prog: '🚀 ' + luDone() + '/' + LUNAR_STAGES.length + ' trạm',
      img: IMG.lunar_bg, tint: '#a855f7', need: true }
  ];
}
/* Chỉ Khu 3 có điều kiện; hai khu đầu luôn đi được. */
function wmLock(spot) {
  if (!spot.need) return null;
  if (DEV.on || S.level >= WM_SHIP_LV || shipReady()) return null;
  return 'Cần <b>Lv.' + WM_SHIP_LV + '</b> hoặc đã mở khoá Phi thuyền';
}

function wmThumb(cv, spot) {
  if (!cv) return;
  const g = cv.getContext('2d'), W = cv.width, H = cv.height;
  const im = spot.img, r = WM_RECT[spot.id] || [0, 0, 0, 0];
  if (!im || !im.width) {                       // ảnh chưa nạp xong
    const gg = g.createLinearGradient(0, 0, 0, H);
    gg.addColorStop(0, '#1b2a4a'); gg.addColorStop(1, '#070d1a');
    g.fillStyle = gg; g.fillRect(0, 0, W, H);
    g.fillStyle = '#7f9bc4'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center';
    g.fillText('⏳ đang nạp ảnh…', W / 2, H / 2 + 4); g.textAlign = 'left';
    return;
  }
  const sx = r[0], sy = r[1], sw = r[2] || (im.width - sx), sh = r[3] || (im.height - sy);
  const k = Math.max(W / sw, H / sh), dw = sw * k, dh = sh * k;   // cover-crop giữa khung
  g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
  g.drawImage(im, sx, sy, sw, sh, (W - dw) / 2, (H - dh) / 2, dw, dh);
  const vg = g.createLinearGradient(0, H * .4, 0, H);             // mờ dần để chữ dễ đọc
  vg.addColorStop(0, 'rgba(4,10,22,0)'); vg.addColorStop(1, 'rgba(4,10,22,.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.restore();
}

function wmCard(spot) {
  const lock = wmLock(spot), here = S.scene === spot.id;
  const edge = here ? '#4ade80' : (lock ? '#3b4a68' : spot.tint);
  const c = document.createElement('div');
  c.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;border-radius:14px;' +
    'overflow:hidden;cursor:' + (lock ? 'not-allowed' : 'pointer') + ';border:2px solid ' + edge +
    ';background:linear-gradient(180deg,#111e38,#0a1222);transition:transform .12s ease,box-shadow .12s ease' +
    (lock ? ';filter:saturate(.5) brightness(.85)' : '');
  c.innerHTML =
    '<div style="position:relative;height:116px;background:#08101f">' +
      '<canvas width="248" height="116" style="width:100%;height:100%;display:block"></canvas>' +
      '<span style="position:absolute;top:7px;left:8px;background:rgba(6,12,26,.85);border:1.5px solid ' + edge +
        ';color:#dbeafe;font-size:9px;font-weight:800;letter-spacing:.6px;padding:2px 8px;border-radius:99px">' +
        spot.no + '</span>' +
      (here ? '<span style="position:absolute;right:8px;top:7px;background:rgba(6,12,26,.85);border:1.5px solid #4ade80;color:#4ade80;font-size:9px;font-weight:800;padding:2px 8px;border-radius:99px">📍 ĐANG Ở ĐÂY</span>' : '') +
    '</div>' +
    '<div style="padding:9px 11px 11px;display:flex;flex-direction:column;gap:5px;flex:1">' +
      '<b style="font-size:12.5px;line-height:1.25;color:' + (spot.need ? '#c4b5fd' : '#fde047') + '">' +
        spot.icon + ' ' + spot.name + '</b>' +
      '<span style="font-size:10.5px;color:#93a4bd;line-height:1.5">' + spot.sub + '</span>' +
      '<span style="font-size:10px;color:#7dd3fc;font-weight:800">' + spot.prog + '</span>' +
      '<span style="margin-top:auto;font-size:11px;font-weight:800;color:' +
        (lock ? '#fca5a5' : '#04101f') + ';background:' + (lock ? 'rgba(248,113,113,.14)' : spot.tint) +
        ';border:1px solid ' + (lock ? 'rgba(248,113,113,.4)' : 'transparent') +
        ';border-radius:9px;padding:6px 8px;text-align:center">' +
        (lock ? '🔒 ' + lock : (here ? 'Đang ở đây' : '▶ Dịch chuyển')) + '</span>' +
    '</div>';
  wmThumb(c.querySelector('canvas'), spot);
  c.onclick = () => wmGo(spot.id);
  c.onmouseenter = () => { if (!lock && !here) { c.style.transform = 'translateY(-3px)'; c.style.boxShadow = '0 12px 26px rgba(4,10,24,.7)'; } };
  c.onmouseleave = () => { c.style.transform = 'none'; c.style.boxShadow = 'none'; };
  return c;
}

function renderWorldMap(body) {
  if (!body) return;
  body.innerHTML = '';
  const chip = (txt, col, bg, bd) =>
    '<span style="background:' + bg + ';border:1.5px solid ' + bd + ';border-radius:99px;padding:3px 11px;color:' + col + '">' + txt + '</span>';
  const hud = document.createElement('div');
  hud.style.cssText = 'display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px;font-size:11px;font-weight:800';
  hud.innerHTML = chip('⭐ Lv.' + S.level, '#fde047', '#1e2b4d', '#3b5bb5') +
    chip(COIN_IC + ' ' + (S.coin || 0).toLocaleString('en-US') + ' Coin', '#ffc93c', '#2a2410', '#6b5a1e') +
    chip(shipReady() ? '🚀 Phi thuyền: đã mở khoá' : '🚀 Phi thuyền: chưa bay lần nào',
         shipReady() ? '#4ade80' : '#94a3b8', '#101f2b', shipReady() ? '#2f7a52' : '#33445e');
  body.appendChild(hud);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;gap:12px;align-items:stretch';
  wmSpots().forEach(s => grid.appendChild(wmCard(s)));
  body.appendChild(grid);

  const note = document.createElement('p');
  note.style.cssText = 'margin-top:12px;font-size:10.5px;color:#8ea3c4;line-height:1.65';
  note.innerHTML = '💡 <b>Dịch chuyển nhanh</b> giữ nguyên nhân vật, trang phục, Coin, XP và tiến trình ải. ' +
    'Riêng <b style="color:#c4b5fd">KHU 3 · Căn cứ Mặt Trăng</b> cần <b>Lv.' + WM_SHIP_LV + '</b> ' +
    '<i>hoặc</i> một lần tự tay bấm <b>[E]</b> tại <b>Bãi Đáp Phi Thuyền</b> ở quảng trường Khu 1 — bay xong là Phi thuyền được ghi nhận vĩnh viễn, hết khoá.';
  body.appendChild(note);
}

function wmToWorld() {
  /* Đang ở Mặt Trăng thì để cốt truyện dẫn đường: phi thuyền chở về quảng trường. */
  if (S.scene === 'LUNAR_BASE') { luReturn(); return; }
  S.scene = 'WORLD'; window._camX = 0;
  S.p.x = 480; S.p.y = 392;                     // quảng trường, dưới đài phun nước
  setZone('1. THÀNH PHỐ', 'Network City (World Map)');
  showToast('🏙️ Có mặt tại trung tâm Network City.');
  beep(380); saveGame();
}
function wmToStreet() {
  S.scene = 'STREET'; window._camX = 0;
  S.p.x = 90; S.p.y = SCENE_WALK.STREET.spawnY;  // đúng vỉa hè như cổng ra phố
  setZone('5. PHỐ NGOÀI', 'Phố Cài Win Dạo');
  showToast('🛣️ Ra tới Phố Ngoài — tiệm sửa máy và bàn cài Win ở ngay đây.');
  beep(380); saveGame();
}
/* Bấm thẻ trên bản đồ: kiểm điều kiện, đóng modal rồi đặt nhân vật vào khu.
   Lên Mặt Trăng đi qua luLaunch để còn xem đoạn phim phóng 2 giây. */
function wmGo(id) {
  const spot = wmSpots().filter(s => s.id === id)[0];
  if (!spot) return;
  if (S.scene === id) { closeWorldMap(); showToast('📍 Bạn đang ở ' + spot.name.toLowerCase() + ' rồi.'); return; }
  const lock = wmLock(spot);
  if (lock) {
    showToast('🔒 Khu 3 cần Lv.' + WM_SHIP_LV + ' hoặc mở khoá Phi thuyền — ra quảng trường Khu 1 bấm [E] lên tàu nhé!');
    beep(200, 'square', .16, .035);
    return;
  }
  closeWorldMap();
  if (id === 'LUNAR_BASE') { shipUnlock(); luLaunch(); return; }
  if (id === 'STREET') wmToStreet(); else wmToWorld();
}

/* ====================================================
   MINIGAME ẢI KHU 3 — TƯƠNG TÁC LOGIC TRỰC TIẾP
   Không trắc nghiệm. 6 trạm = 6 minigame canvas:
   ① xoay ô mạch dẫn nguồn    ② điều áp làm mát lõi server
   ③ bắt sóng laser vệ tinh   ④ hiệu chuẩn buồng lái phi thuyền
   ⑤ đấu cáp quang không cắt  ⑥ khiên chặn bão DDoS
   State + luật chơi ở đây; vẽ canvas ở mg-art.js (drawLqm).
   Mọi mốc thời gian dùng MGX.t (đồng hồ khung vẽ) chứ không
   setTimeout — tab ẩn vẫn pause đúng như các minigame cũ.
   ==================================================== */
const LQW = 760, LQH = 400;              // hệ tọa độ nội bộ canvas
const lqClamp = (v, a, b) => Math.max(a, Math.min(b, v));
let LQM = null;                          // { i, g, done, stars, t, _hint }
function lqmVisible() {
  const m = document.getElementById('lu-mini');
  return !!m && m.style.display === 'flex';
}
function lqmClose() {
  const m = document.getElementById('lu-mini');
  if (m) m.style.display = 'none';
  LQM = null;
  releaseFocus();
}

/* ---------- ① NỐI MẠCH LƯỢNG TỬ (click xoay ô mạch 4×4) ---------- */
function lqmG1Mask(g, i) {
  let m = g.base[i];
  for (let k = 0; k < g.rot[i] % 4; k++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
}
function lqmG1Power(g) {
  // Quy ước 4 hướng KHỚP vớilqDrawCircuit: UP=1, RIGHT=2, DOWN=4, LEFT=8
  const dirs = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
  const mask = [];
  for (let i = 0; i < 16; i++) mask.push(lqmG1Mask(g, i));
  const pw = new Array(16).fill(0), q = [];
  const si = g.sr * 4;
  if (mask[si] & 8) { pw[si] = 1; q.push(si); }   // ô góc vào cần cổng LEFT mở để nhận ⚡ từ NGUỒN
  while (q.length) {
    const ci = q.pop(), cx = ci & 3, cy = ci >> 2, m = mask[ci];
    for (const d of dirs) {
      if (!(m & d[2])) continue;
      const nx = cx + d[0], ny = cy + d[1];
      if (nx < 0 || nx > 3 || ny < 0 || ny > 3) continue;
      const ni = ny * 4 + nx;
      // Chỉ truyền điện khi CẢ HAI ô có đầu ống hướng vào nhau (cổng đối diện khớp)
      const opp = ((d[2] << 2) | (d[2] >> 2)) & 15;   // 1<->4, 2<->8
      if (!(mask[ni] & opp)) continue;
      if (!pw[ni]) { pw[ni] = 1; q.push(ni); }
    }
  }
  const ei = g.er * 4 + 3;
  // Ô ra bắt buộc có cổng RIGHT mở mới nối được sang hộp ĐÍCH
  return { pw: pw, mask: mask, dst: !!(pw[ei] && (mask[ei] & 2)) };
}
const LQM_G1 = {
  init(g, t) {
    const shapes = [3, 6, 12, 9, 7, 14, 13, 11, 5, 10];   // góc, thẳng, chữ T đủ hướng
    g.t0 = t; g.win = false; g.moves = 0;
    g.base = new Array(16).fill(0); g.rot = new Array(16).fill(0);
    let tries = 0, ok = false;
    while (!ok && tries++ < 90) {
      /* đường ống chuẩn: đi ngang dần từ cột 0 sang cột 3, thỉnh thoảng ngoằn lên/xuống */
      const path = [[(Math.random() * 4) | 0, 0]], seen = {};
      let r = path[0][0], c = 0; seen[r + '-0'] = 1;
      while (c < 3) {
        const up = r > 0 && !seen[(r - 1) + '-' + c], dn = r < 3 && !seen[(r + 1) + '-' + c];
        if ((up || dn) && Math.random() < 0.5) {
          r = (up && dn) ? (Math.random() < 0.5 ? r - 1 : r + 1) : (up ? r - 1 : r + 1);
          seen[r + '-' + c] = 1; path.push([r, c]);
        } else {
          c++; seen[r + '-' + c] = 1; path.push([r, c]);
        }
      }
      const add = {};
      for (let i = 0; i + 1 < path.length; i++) {
        const a = path[i], b = path[i + 1];
        let d1, d2;
        if (b[0] > a[0]) { d1 = 4; d2 = 1; } else if (b[0] < a[0]) { d1 = 1; d2 = 4; }
        else if (b[1] > a[1]) { d1 = 2; d2 = 8; } else { d1 = 8; d2 = 2; }
        const ia = a[0] * 4 + a[1], ib = b[0] * 4 + b[1];
        add[ia] = (add[ia] || 0) | d1; add[ib] = (add[ib] || 0) | d2;
      }
      for (let i = 0; i < 16; i++) {
        g.base[i] = add[i] || shapes[(Math.random() * shapes.length) | 0];
        g.rot[i] = 1 + ((Math.random() * 3) | 0);
      }
      g.sr = path[0][0]; g.er = path[path.length - 1][0];
      g.base[g.sr * 4] |= 8;         // cổng vào từ NGUỒN (mép trái)
      g.base[g.er * 4 + 3] |= 2;     // cổng ra tới ĐÍCH (mép phải)
      ok = !lqmG1Power(g).dst;       // xáo xong phải đang tắc điện mới đạt
    }
    g.pw = lqmG1Power(g).pw;
    g.mask = lqmG1Power(g).mask;
  },
  tick(g, t) {
    const p = lqmG1Power(g);
    g.pw = p.pw; g.mask = p.mask;
    if (p.dst) g.win = true;
  },
  ptr(g, k, p) {
    if (k !== 'down') return;
    const c = Math.floor((p.x - 217) / 84), r = Math.floor((p.y - 37) / 84);
    if (c < 0 || c > 3 || r < 0 || r > 3) return;
    if ((p.x - 217) % 84 > 74 || (p.y - 37) % 84 > 74) return;
    const i = r * 4 + c;
    g.rot[i] = (g.rot[i] + 1) % 4; g.moves++;
    beep(520 + (i % 4) * 40, 'triangle', .05, .03);
    mgBurst('lu-mini', 217 + c * 84 + 37, 37 + r * 84 + 37, '#38bdf8', 4);
  },
  hint(g) { return '🖱️ Click ô để xoay 90° · Dẫn ⚡ từ NGUỒN (trái) sang ĐÍCH (phải) — đã xoay ' + g.moves + ' lần'; },
  stars(g) { const el = MGX.t - g.t0; return el <= 45 ? 3 : el <= 80 ? 2 : 1; }
};

/* ---------- ② ĐIỀU ÁP LÀM MÁT LÕI SERVER (kéo thanh + xả áp) ---------- */
const LQM_G2 = {
  init(g, t) {
    g.t0 = t; g.win = false; g.s = [1.5, 1.5, 1.5, 1.5];
    g.p = [0.7, 2.1, 3.6, 5.0]; g.q = [1.3, 0.4, 2.8, 4.4];
    g.T = [52, 52, 52, 52]; g.prog = 0; g.lastVent = -99; g.drag = -1; g.inb = true;
  },
  tick(g, t, dt) {
    for (let i = 0; i < 4; i++) {
      const storm = 36 + 16 * Math.sin(0.45 * t + g.p[i]) + 4 * Math.sin(1.15 * t + g.q[i]);
      g.T[i] += (30 + storm - 4.6 * g.s[i] - g.T[i]) * Math.min(1, 0.5 * dt);
    }
    g.inb = g.T.every(v => v >= 40 && v <= 65);
    g.prog = lqClamp(g.prog + (g.inb ? 13 : -14) * dt, 0, 100);
    if (g.prog >= 100) g.win = true;
  },
  ptr(g, k, p, t) {
    if (k === 'down') {
      if (p.y >= 336 && p.y <= 384 && p.x >= 320 && p.x <= 580) { this.vent(g, t); return; }
      for (let i = 0; i < 4; i++) {
        const gx = 50 + i * 170;
        if (p.x >= gx - 8 && p.x <= gx + 148 && p.y >= 286 && p.y <= 326) g.drag = i;
      }
    }
    if (g.drag >= 0 && (k === 'down' || k === 'move')) {
      const gx = 50 + g.drag * 170;
      g.s[g.drag] = lqClamp((p.x - gx) / 140 * 5, 0, 5);
    }
    if (k === 'up') g.drag = -1;
  },
  vent(g, t) {
    if (t - g.lastVent < 8) { beep(180, 'square', .08, .03); return; }
    g.lastVent = t;
    for (let i = 0; i < 4; i++) g.T[i] = Math.max(25, g.T[i] - 10);
    beep(300, 'sawtooth', .18, .04);
    mgBurst('lu-mini', 450, 360, '#67e8f9', 14);
  },
  hint(g) { return '🎚️ Kéo thanh gạch để chỉnh công suất làm mát · Giữ CẢ 4 cột trong 40–65°C để nạp tiến độ · 💨 XẢ ÁP hạ ngay −10°C (hồi 8 giây)'; },
  stars(g) { const el = MGX.t - g.t0; return el <= 35 ? 3 : el <= 55 ? 2 : 1; }
};

/* ---------- ③ BẮT SÓNG LASER VỆ TINH (ngắm chảo + chỉnh sóng) ---------- */
const LQM_G3 = {
  init(g, t) {
    g.t0 = t; g.win = false; g.ph = 0;
    g.rx = 380; g.ry = 195; g.tx = 380; g.ty = 195; g.aim = false; g.hold = 0;
    g.ft = 2.2 + Math.random() * 2.0; g.at = 42 + Math.random() * 24;
    g.f0 = 2.2; g.a0 = 42;
    if (Math.abs(g.f0 - g.ft) < 0.25) g.f0 = 4.2;
    if (Math.abs(g.a0 - g.at) < 8) g.a0 = 66;
    g.lock = 0; g.df = false; g.da = false;
  },
  tick(g, t, dt) {
    if (g.ph === 0) {
      g.bx = 380 + 250 * Math.sin(0.51 * t); g.by = 195 + 110 * Math.sin(0.83 * t + 1.2);
      g.rx += (g.tx - g.rx) * Math.min(1, 9 * dt);
      g.ry += (g.ty - g.ry) * Math.min(1, 9 * dt);
      if (Math.hypot(g.rx - g.bx, g.ry - g.by) <= 30) g.hold = Math.min(1.6, g.hold + dt);
      else g.hold = Math.max(0, g.hold - 0.8 * dt);
      if (g.hold >= 1.6) { g.ph = 1; g.lock = 0; beep(780, 'sine', .12, .05); mgBurst('lu-mini', g.bx, g.by, '#fde047', 16); }
    } else {
      g.lock = (Math.abs(g.f0 - g.ft) <= 0.10 && Math.abs(g.a0 - g.at) <= 5) ? Math.min(1.4, g.lock + dt) : Math.max(0, g.lock - dt);
      if (g.lock >= 1.4) g.win = true;
    }
  },
  ptr(g, k, p) {
    if (g.ph === 0) {
      if (k === 'down') g.aim = true;
      if (g.aim && (k === 'down' || k === 'move')) { g.tx = lqClamp(p.x, 80, 700); g.ty = lqClamp(p.y, 60, 330); }
      if (k === 'up') g.aim = false;
      return;
    }
    if (k === 'down') {
      if (p.y >= 286 && p.y <= 314 && p.x >= 200 && p.x <= 560) g.df = true;
      else if (p.y >= 338 && p.y <= 366 && p.x >= 200 && p.x <= 560) g.da = true;
    }
    if (k === 'up') { g.df = false; g.da = false; }
    if (g.df || g.da) {
      const v = lqClamp((p.x - 200) / 360, 0, 1);
      if (g.df) g.f0 = 2.2 + v * 2.0;
      if (g.da) g.a0 = 42 + v * 24;
    }
  },
  hint(g) {
    return g.ph === 0
      ? '🛰️ Kéo ô ngắm trùng TÍN HIỆU sáng — giữ khớp 1.6 giây để khoá búp sóng (' + Math.round(g.hold / 1.6 * 100) + '%)'
      : '🎚️ Kéo 2 thanh cho sóng TRẠM khớp sóng TRÁI ĐẤT — giữ khoá 1.4s (' + Math.round(g.lock / 1.4 * 100) + '%)';
  },
  stars(g) { const el = MGX.t - g.t0; return el <= 30 ? 3 : el <= 55 ? 2 : 1; }
};

/* ---------- ④ HIỆU CHUẨN BUỒNG LÁI (nhớ chuỗi đèn + khoá xung) ---------- */
const LQM_G4 = {
  btn: '⚡ KHOÁ XUNG',
  init(g, t) {
    g.t0 = t; g.win = false; g.ph = 0; g.err = 0; g.miss = 0; g.level = 0;
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8]; g.seq = [];
    for (let i = 0; i < 5; i++) g.seq.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
    g.play0 = t + 0.6; g.idx = 0; g.ready = false; g.lit = -1;
    g.flash = -1; g.flashOk = 0; g.flashT = -9;
    g.sync0 = 0; g.needle = 80; g.hitT = -9; g.hitOk = 0;
  },
  tick(g, t) {
    if (g.ph === 0) {
      g.lit = -1;
      for (let k = 0; k < 5; k++) if (t >= g.play0 + 0.7 * k && t <= g.play0 + 0.7 * k + 0.5) g.lit = g.seq[k];
      if (t > g.play0 + 0.7 * 5 + 0.15) g.ready = true;
    } else {
      const per = [3.0, 2.6, 2.3][Math.min(2, g.level)];
      const u = ((t - g.sync0) / per) % 2;
      g.needle = 80 + 600 * (1 - Math.abs(u - 1));
    }
  },
  ptr(g, k, p, t) {
    if (k !== 'down' || g.ph !== 0 || !g.ready) return;
    const c = Math.floor((p.x - 236) / 100), r = Math.floor((p.y - 30) / 100);
    if (c < 0 || c > 2 || r < 0 || r > 2) return;
    if ((p.x - 236) % 100 > 88 || (p.y - 30) % 100 > 88) return;
    const i = r * 3 + c;
    if (i === g.seq[g.idx]) {
      g.idx++; g.flash = i; g.flashOk = 1; g.flashT = t;
      beep(600 + g.idx * 60, 'triangle', .07, .04);
      if (g.idx >= 5) { g.ph = 1; g.sync0 = t; g.needle = 80; beep(840, 'sine', .14, .05); }
    } else {
      g.err++; g.idx = 0; g.ready = false; g.play0 = t + 0.5; g.lit = -1;
      g.flash = i; g.flashOk = 0; g.flashT = t;
      beep(160, 'square', .16, .04);
    }
  },
  pulse(g, t) {
    if (g.ph !== 1) { beep(170, 'square', .07, .03); return; }
    const zh = [70, 56, 46][Math.min(2, g.level)];
    const ok = Math.abs(g.needle - 380) <= zh / 2;
    g.hitT = t; g.hitOk = ok;
    if (ok) {
      g.level++;
      beep(700 + g.level * 80, 'triangle', .1, .05);
      mgBurst('lu-mini', 380, 206, '#4ade80', 14);
      if (g.level >= 3) g.win = true;
    } else {
      g.miss++; g.level = 0;
      beep(150, 'square', .18, .045);
      mgBurst('lu-mini', g.needle, 206, '#ef4444', 10);
    }
  },
  hint(g) {
    return g.ph === 0
      ? '🧠 Ghi nhớ 5 ô sáng rồi bấm lại đúng thứ tự' + (g.ready ? ' — tới lượt bạn! (' + g.idx + '/5)' : ' — đang phát chuỗi…')
      : '⚡ Bấm [KHOÁ XUNG] khi kim vào vùng xanh — cần 3 lần liên tiếp · Chuỗi xung: ' + g.level + '/3';
  },
  stars(g) { const f = g.err + g.miss; return f <= 2 ? 3 : f <= 5 ? 2 : 1; }
};

/* ---------- ⑤ ĐẤU CÁP QUANG KHÔNG GIAO CẮT (kéo nút) ---------- */
function lqmG5Pts(g) {
  const d = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const on = (a, b, c) => Math.min(a.x, b.x) - 0.5 <= c.x && c.x <= Math.max(a.x, b.x) + 0.5 &&
    Math.min(a.y, b.y) - 0.5 <= c.y && c.y <= Math.max(a.y, b.y) + 0.5 && Math.abs(d(a, b, c)) < 1;
  const seg = [];
  for (let a = 0; a < 4; a++) seg.push([g.nodes[a], g.nodes[a + 4]]);
  const pts = [];
  for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
    const p1 = seg[a][0], p2 = seg[a][1], p3 = seg[b][0], p4 = seg[b][1];
    if (!p1 || !p3) continue;
    const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      const tt = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / (den || 1);
      pts.push({ x: p1.x + tt * (p2.x - p1.x), y: p1.y + tt * (p2.y - p1.y) });
    } else if (on(p3, p4, p1)) pts.push({ x: p1.x, y: p1.y });
    else if (on(p3, p4, p2)) pts.push({ x: p2.x, y: p2.y });
    else if (on(p1, p2, p3)) pts.push({ x: p3.x, y: p3.y });
    else if (on(p1, p2, p4)) pts.push({ x: p4.x, y: p4.y });
  }
  return pts;
}
const LQM_G5 = {
  init(g, t) {
    g.t0 = t; g.win = false; g.drag = -1; g.nodes = [];
    for (let tries = 0; tries < 80; tries++) {
      const nd = []; let ok = true;
      for (let i = 0; i < 8 && ok; i++) {
        let placed = false;
        for (let a = 0; a < 200 && !placed; a++) {
          const x = 78 + Math.random() * 604, y = 64 + Math.random() * 274;
          if (nd.every(n => Math.hypot(n.x - x, n.y - y) >= 88)) { nd.push({ x: x, y: y }); placed = true; }
        }
        ok = placed;
      }
      if (ok) { g.nodes = nd; if (lqmG5Pts(g).length >= 2) break; }
    }
    if (!g.nodes.length) g.nodes = [{ x: 120, y: 100 }, { x: 300, y: 320 }, { x: 520, y: 90 }, { x: 660, y: 300 }, { x: 640, y: 120 }, { x: 110, y: 330 }, { x: 320, y: 80 }, { x: 400, y: 320 }];
    g.crossP = lqmG5Pts(g); g.cross = g.crossP.length;
  },
  tick(g, t) {
    g.crossP = lqmG5Pts(g);
    g.cross = g.crossP.length;
    if (g.cross === 0 && t - g.t0 > 1.0) g.win = true;
  },
  ptr(g, k, p) {
    if (k === 'down') {
      let best = -1, bd = 26;
      g.nodes.forEach((n, i) => { const dd = Math.hypot(n.x - p.x, n.y - p.y); if (dd < bd) { bd = dd; best = i; } });
      g.drag = best;
    }
    if (g.drag >= 0 && (k === 'move' || k === 'down')) {
      const n = g.nodes[g.drag];
      n.x = lqClamp(p.x, 78, 682); n.y = lqClamp(p.y, 64, 338);
    }
    if (k === 'up') g.drag = -1;
  },
  hint(g) { return '🖱️ Kéo các nút để nối dây cùng màu — không dây nào cắt dây nào · Giao cắt hiện tại: ' + g.cross; },
  stars(g) { const el = MGX.t - g.t0; return el <= 30 ? 3 : el <= 60 ? 2 : 1; }
};

/* ---------- ⑥ KHIÊN CHẮN BÃO DDoS (bấm phá gói đỏ 20 giây) ---------- */
const LQM_G6 = {
  init(g, t) {
    g.t0 = t; g.win = false; g.integ = 100; g.pk = [];
    g.el = 0; g.next = 0.7; g.kill = 0; g.pass = 0; g.clickB = 0; g.dead = false; g.deadT = 0;
  },
  spawn(g) {
    const side = (Math.random() * 4) | 0;
    let x, y;
    if (side === 0) { x = -20; y = 40 + Math.random() * 320; }
    else if (side === 1) { x = 780; y = 40 + Math.random() * 320; }
    else if (side === 2) { x = 60 + Math.random() * 640; y = -20; }
    else { x = 60 + Math.random() * 640; y = 420; }
    g.pk.push({
      x: x, y: y, v: 55 + Math.random() * 25,
      a: Math.atan2(205 - y, 380 - x) + (Math.random() - 0.5) * 0.24,
      red: Math.random() < 0.62
    });
  },
  tick(g, t, dt) {
    if (g.dead) { g.deadT += dt; if (g.deadT >= 1.6) LQM_G6.init(g, t); return; }
    g.el += dt;
    if (g.el >= 20) { g.win = true; return; }
    const iv = 0.9 - 0.2 * (g.el / 20);
    while (g.el >= g.next) { LQM_G6.spawn(g); g.next += iv; }
    for (let i = g.pk.length - 1; i >= 0; i--) {
      const p = g.pk[i];
      p.x += Math.cos(p.a) * p.v * dt; p.y += Math.sin(p.a) * p.v * dt;
      if (Math.hypot(p.x - 380, p.y - 205) < 36) {
        g.pk.splice(i, 1);
        if (p.red) { g.integ -= 12; mgBurst('lu-mini', 380, 205, '#ef4444', 10); beep(150, 'square', .12, .04); }
        else { g.pass++; g.integ = Math.min(100, g.integ + 2); mgBurst('lu-mini', 380, 205, '#22c55e', 6); }
        if (g.integ <= 0) { g.integ = 0; g.dead = true; mgBurst('lu-mini', 380, 205, '#f97316', 26); beep(90, 'sawtooth', .35, .05); }
      }
    }
  },
  ptr(g, k, p, t) {
    if (k !== 'down' || g.dead) return;
    let best = -1, bd = 26;
    g.pk.forEach((q, i) => { const dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < bd) { bd = dd; best = i; } });
    if (best < 0) return;
    const q = g.pk[best];
    g.pk.splice(best, 1);
    if (q.red) { g.kill++; mgBurst('lu-mini', q.x, q.y, '#f87171', 12); beep(760, 'triangle', .06, .035); }
    else {
      g.clickB++; g.integ -= 8;
      mgBurst('lu-mini', q.x, q.y, '#fde047', 12); beep(140, 'square', .2, .05);
      if (g.integ <= 0) { g.integ = 0; g.dead = true; mgBurst('lu-mini', 380, 205, '#f97316', 20); }
    }
  },
  hint(g) {
    if (g.dead) return '💥 LÕI QUÁ TẢI — khởi động lại sau giây lát…';
    return '🎯 Bấm phá gói ĐỎ (DDoS) trước khi chạm lõi · ĐỂ YÊN gói XANH (dữ liệu hợp lệ) — bấm nhầm bị trừ 8% · Còn ' +
      Math.max(0, Math.ceil(20 - g.el)) + 's';
  },
  stars(g) { return g.integ >= 75 ? 3 : g.integ >= 45 ? 2 : 1; }
};

/* i của trạm = i của module — thứ tự khớp LUNAR_STAGES */
const LQM_GAMES = [LQM_G1, LQM_G2, LQM_G3, LQM_G4, LQM_G5, LQM_G6];

function lqmPtr(kind, p) {
  if (!LQM || LQM.done) return;
  LQM_GAMES[LQM.i].ptr(LQM.g, kind, p, MGX.t);
}
function lqmPulse() {
  if (!LQM || LQM.done) return;
  const mod = LQM_GAMES[LQM.i];
  if (mod.pulse) mod.pulse(LQM.g, MGX.t);
}
function lqmFoot() {
  const f = document.getElementById('lu-mini-foot');
  if (!f || !LQM) return;
  const mod = LQM_GAMES[LQM.i];
  f.innerHTML =
    (mod.btn ? '<button onclick="lqmPulse()" style="padding:9px 26px;border:0;border-radius:12px;background:linear-gradient(160deg,#7c3aed,#4c1d95);color:#fff;font-weight:800;cursor:pointer;font-size:14px">' + mod.btn + '</button>' : '') +
    '<button onclick="lqmReplay()" style="padding:8px 16px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer;font-size:12px">🔄 LÀM LẠI</button>' +
    '<button onclick="lqmClose()" style="padding:8px 16px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer;font-size:12px">✖ THOÁT</button>';
}
function lqmEnter(i) {
  const s = LUNAR_STAGES[i];
  if (!luOpen(s)) {
    showToast('🔒 ' + s.name + ' — ' + luLockTxt(s) + '. Lên cấp bằng ải thành phố và việc phụ nhé!');
    beep(200, 'square', .16, .035);
    return;
  }
  let m = document.getElementById('lu-mini');
  if (!m) { m = document.createElement('div'); m.id = 'lu-mini'; m.className = 'modal'; document.getElementById('app').appendChild(m); }
  m.style.cssText = 'display:flex;flex-direction:column;gap:8px;position:absolute;inset:14px 76px;transform:none;animation:none;padding:14px 20px 12px;background:linear-gradient(160deg,#0e1a30,#04060d);border:2px solid #a855f7;border-radius:18px;color:#e6edf7;font:13px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000c';
  m.innerHTML =
    '<div id="lu-mini-hd" style="display:flex;justify-content:space-between;align-items:center"></div>' +
    '<div id="lu-mini-hint" style="font-size:12px;color:#c4b5fd;min-height:16px"></div>' +
    '<div style="display:flex;justify-content:center"><canvas id="lu-mini-cv" style="width:760px;max-width:100%;display:block;border-radius:12px;background:#04060c;touch-action:none;cursor:crosshair"></canvas></div>' +
    '<div id="lu-mini-foot" style="display:flex;justify-content:center;align-items:center;gap:10px;min-height:38px"></div>';
  const cv = document.getElementById('lu-mini-cv');
  const pos = ev => mgPoint(cv, ev, LQW, LQH);
  cv.addEventListener('pointerdown', ev => { try { cv.setPointerCapture(ev.pointerId); } catch (e) {} lqmPtr('down', pos(ev)); });
  cv.addEventListener('pointermove', ev => lqmPtr('move', pos(ev)));
  cv.addEventListener('pointerup', ev => lqmPtr('up', pos(ev)));
  cv.addEventListener('pointercancel', () => lqmPtr('up', { x: -99, y: -99 }));
  LQM = { i: i, g: {}, done: false, stars: 0, t: MGX.t, _hint: null };
  LQM_GAMES[i].init(LQM.g, MGX.t);
  document.getElementById('lu-mini-hd').innerHTML =
    '<b style="font-size:16px">' + s.icon + ' ' + s.name + ' — MINIGAME ' + s.no + '/' + LUNAR_STAGES.length + '</b>' +
    '<span style="display:flex;gap:8px;align-items:center;font-size:12px;color:#94a3b8">Lv.' + s.lv +
    '<button onclick="lqmClose()" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:8px;padding:2px 10px;cursor:pointer">✖</button></span>';
  lqmFoot();
  beep(660, 'triangle', .1, .04);
}
function lqmReplay() {
  if (!LQM) return;
  LQM.done = false; LQM.stars = 0; LQM.g = {}; LQM._hint = null;
  const el = document.getElementById('lu-mini-hint');
  if (el) el.style.color = '#c4b5fd';
  LQM_GAMES[LQM.i].init(LQM.g, MGX.t);
  lqmFoot();
  beep(520, 'triangle', .1, .04);
}
function lqmWin() {
  const s = LUNAR_STAGES[LQM.i], mod = LQM_GAMES[LQM.i];
  LQM.done = true;
  LQM.stars = mod.stars(LQM.g);
  const st = '⭐'.repeat(LQM.stars) + '☆'.repeat(3 - LQM.stars);
  const first = !S.missionsDone[s.id];
  S.missionsDone[s.id] = true;
  let msg = '';
  {
    const xp = s.xp * LQM.stars, coin = s.coin * LQM.stars;
    addXP(xp); addCoin(coin);   // cày lại minigame vẫn nhận ĐỦ 100% EXP/Coin
    if (s.skill && S.skills[s.skill] !== undefined) S.skills[s.skill] = Math.min(5, S.skills[s.skill] + 1);
    msg = '🎁 +' + xp + ' EXP | +' + coin.toLocaleString() + ' Coin' + (s.skill ? ' | +' + s.skill.toUpperCase() + ' Skill' : '') + (first ? '' : ' <span style="opacity:.7">(cày lại — đủ 100%)</span>');
  }
  saveGame(); beep(880, 'triangle', .2, .05);
  updateQuestHUD();
  showToast('🌟 ' + s.name + ' hoàn thành xuất sắc!');
  const nx = LUNAR_STAGES.filter(z => !S.missionsDone[z.id])[0];
  const el = document.getElementById('lu-mini-hint');
  if (el) {
    el.style.color = '#4ade80';
    el.innerHTML = '🎉 <b>MINIGAME HOÀN THÀNH!</b> ' + st + ' — ' + msg + ' · 🌙 Khu 3: ' + luDone() + '/' + LUNAR_STAGES.length +
      (nx ? ' · Trạm tiếp: ' + nx.icon + ' ' + nx.name : ' · <b>Toàn bộ căn cứ đã hiệu chuẩn xong!</b>');
  }
  const f = document.getElementById('lu-mini-foot');
  if (f) f.innerHTML =
    '<button onclick="lqmClose()" style="padding:9px 30px;border:0;border-radius:12px;background:#22c55e;color:#04120a;font-weight:800;cursor:pointer;font-size:14px">✔ XONG TRẠM</button>' +
    '<button onclick="lqmReplay()" style="padding:9px 18px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer">🔄 CHƠI LẠI</button>';
}
/* Được mg-art.js gọi mỗi khung hình khi modal lu-mini đang mở */
function lqmFrame(cv, t) {
  if (!LQM || !lqmVisible()) return;
  const dt = Math.min(0.05, Math.max(0, t - (LQM.t || t)));
  LQM.t = t;
  const mod = LQM_GAMES[LQM.i];
  if (!LQM.done) {
    mod.tick(LQM.g, t, dt);
    const hint = mod.hint ? mod.hint(LQM.g, t) : '';
    if (hint !== LQM._hint) {
      LQM._hint = hint;
      const el = document.getElementById('lu-mini-hint');
      if (el) el.innerHTML = hint;
    }
    if (LQM.g.win) lqmWin();
  }
  if (typeof drawLqm === 'function') drawLqm(cv, t, LQM);
}

/* ====================================================
   NỐI VÀO VÒNG LẶP (wrapper — không sửa hàm cũ)
   ==================================================== */
const _updLu = update;
update = function () {
  _updLu();
  if (LQM && !lqmVisible()) LQM = null;          // bấm ESC → closeAll() ẩn modal
  if (S.scene === 'WORLD' && !LU_CUT) {
    const cx = S.p.x + 10, cy = S.p.y + 18;
    if (Math.hypot(cx - LU_PAD.tx, cy - LU_PAD.ty) < LU_PAD.tr)
      targetAct = { t: 'to_lunar', txt: '[E] 🚀 LÊN PHI THUYỀN — MẶT TRĂNG' };
  } else if (S.scene === 'LUNAR_BASE' && !LU_CUT) {
    const cx = S.p.x + 10, cy = S.p.y + 18;
    if (Math.hypot(cx - LU_MAT.x, cy - LU_MAT.y) < LU_MAT.r)
      targetAct = { t: 'lu_return', txt: '[E] 🌍 LÊN PHI THUYỀN VỀ TRÁI ĐẤT' };
    for (const s of LUNAR_STAGES) {
      if (Math.hypot(cx - s.x, cy - s.y) < s.r) targetAct = { t: 'lu_stage', i: s.no - 1, txt: '[E] ' + s.icon + ' ' + s.sign };
    }
  }
};

const _rndLu = render;
render = function () {
  _rndLu();
  if (S.scene === 'WORLD') drawWorldPad();
};

const _daLu = doAction;
doAction = function () {
  if (LQM) { lqmPulse(); return; }               // phím Space/[E] = nút hành động trong minigame
  if (targetAct && targetAct.t === 'to_lunar') { luLaunch(); return; }
  if (targetAct && targetAct.t === 'lu_return') { luReturn(); return; }
  if (targetAct && targetAct.t === 'lu_stage') { lqmEnter(targetAct.i); return; }
  _daLu();
};

/* Bảng nhiệm vụ (M): nối thêm 6 minigame Khu 3 vào cuối danh sách cũ. */
const _rmsLu = renderMissions;
renderMissions = function () {
  _rmsLu();
  const listEl = document.getElementById('mission-list');
  const head = document.getElementById('mis-head');
  if (head) head.innerHTML += ' · 🌙 Khu 3: ' + luDone() + '/' + LUNAR_STAGES.length;
  const sep = document.createElement('div');
  sep.style.cssText = 'padding:8px 6px 2px;color:#c4b5fd;font-weight:700;font-size:11px;letter-spacing:.5px';
  sep.innerText = '🚀 KHU 3 — CĂN CỨ MẶT TRĂNG (minigame, lên phi thuyền ở quảng trường)';
  listEl.appendChild(sep);
  LUNAR_STAGES.forEach(s => {
    const done = !!S.missionsDone[s.id], open = luOpen(s);
    const div = document.createElement('div');
    div.className = 'mission-item' + (done ? ' done' : '') + (open ? '' : ' locked');
    div.innerHTML = '<b style="color:' + (done ? '#22c55e' : (open ? '#a855f7' : '#64748b')) + '; font-size:11px;">' +
      (open || done ? s.icon : '🔒') + ' 🌙 ải ' + s.no + ' — ' + s.name.split(' — ')[0] + '</b>' +
      '<div style="font-size:10px; color:#94a3b8; margin-top:2px;">Khuyên Lv.' + s.lv + ' · Minigame: ' + s.sign + '</div>' +
      '<div style="font-size:10px; color:' + (done ? '#22c55e' : (open ? '#facc15' : '#94a3b8')) + '; margin-top:4px;">' +
      (done ? '✅ Hoàn thành' : (open ? '🔄 Đã mở khoá' : '🔒 ' + luLockTxt(s))) + '</div>';
    div.onclick = () => {
      document.querySelectorAll('.mission-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active'); lqmDetail(s); beep(550, 'sine', .04);
    };
    listEl.appendChild(div);
  });
};
function lqmDetail(s) {
  const done = !!S.missionsDone[s.id], open = luOpen(s);
  document.getElementById('mission-detail').innerHTML =
    '<h3 style="color:#c4b5fd; font-size:14px;">' + s.icon + ' ' + s.name + '</h3>' +
    '<p style="color:#94a3b8; font-size:11px; margin:4px 0 10px 0;">🌙 KHU 3 · CĂN CỨ MẶT TRĂNG — Ải ' + s.no + '/' + LUNAR_STAGES.length +
    ' · <b style="color:#fde047">Khuyên Lv.' + s.lv + '</b> (không khoá)</p>' +
    '<div style="background:#090f1d; border-left:3px solid #a855f7; padding:8px 12px; margin-bottom:12px; line-height:1.5; font-size:12px;">"' + s.ask + '"</div>' +
    '<b>CÁC BƯỚC:</b><div style="margin:6px 0;font-size:12px;line-height:1.7">' +
    '▫ Lên phi thuyền ở Bãi Đáp quảng trường Khu 1<br>▫ Đến biển trạm ' + s.icon + ' trong căn cứ<br>▫ Bấm [E] và chơi minigame <b>' + s.sign + '</b><br>▫ Về đích càng nhanh / càng ít lỗi để nhận ⭐⭐⭐</div>' +
    '<p style="margin-top:14px; color:var(--yellow);">🎁 Phần thưởng: +' + s.xp + ' EXP/sao, +' + s.coin.toLocaleString() + ' Coin/sao' +
    (s.skill ? ', +' + s.skill.toUpperCase() + ' Skill' : '') + '</p>' +
    '<p style="margin-top:10px; color:' + (done ? 'var(--green)' : (open ? 'var(--cyan)' : 'var(--red)')) + '; font-weight:bold; font-size:13px;">' +
    (done ? '✅ ĐÃ HOÀN THÀNH' : (open ? '🔄 ĐANG MỞ — tìm trạm trong căn cứ' : '🔒 ' + luLockTxt(s))) + '</p>';
}

/* ============ INIT ============ */
buildWorldBG();
fitApp();
const LOADED = loadGame();
achAutoCheck();
achTabLabel();
syncHUD();
renderSkillsList();
if (typeof syncWeatherBadge === 'function') syncWeatherBadge();
updateQuestHUD();
if (LOADED) {
  setTimeout(() => {
    const cur = currentStage();
    showToast('💾 Đã tải tiến trình: ' + stagesDone() + '/' + STAGES.length + ' ải · Lv.' + S.level +
      (cur ? ' — Tiếp tục Ải ' + (cur.i + 1) + ': ' + cur.s.name : ' — Đã phá đảo!'));
  }, 600);
}

/* ============ HÀM XÁC NHẬN RESET TIẾN TRÌNH ============ */
function confirmResetGame() {
  const xacNhan = confirm("⚠️ CẢNH BÁO:\nBạn có chắc chắn muốn xóa toàn bộ tiến trình (Ải, Cấp độ, Coin, Kỹ năng) để chơi lại từ đầu không?");
  if (xacNhan) {
    // 1. Tắt tính năng tự động lưu để nó không ghi đè lại dữ liệu cũ khi reload
    window.removeEventListener('beforeunload', saveGame);
    saveGame = function() {}; 

    // 2. Xóa sạch bộ nhớ lưu trữ
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {}

    // 3. Tải lại game mới tinh
    location.reload();
  }
}

function resetGame() {
  confirmResetGame();
}

/* ============================================================
   🚨 SỰ CỐ KHẨN CẤP — HOTLINE SẾP GỌI (Emergency Incidents)
   ------------------------------------------------------------
   Bạn là kỹ sư on-call của Network City. Cứ 3.5–5 phút chơi, nếu
   đang đứng ở Phố Ngoài (STREET) hoặc Quảng trường (WORLD) và không
   cầm modal / phiên ải nào, Sếp gọi hotline báo sự cố:
     • chuông đổ 6 giây (không bấm thì tự bắt máy),
     • rồi là cuộc đua wall-clock: chạy đến đúng căn nhà, bấm [E]
       mở hiện trường và thao tác nghiệp vụ chuẩn trước khi hết giờ.
   Đồng hồ KHÔNG vào save (reload giữa sự cố coi như chưa từng gọi),
   toàn bộ cờ do clearEmergency() dọn nên không kẹt di chuyển.
   Test nhanh: window.triggerEmergency('ransomware' | 'ups' | 'dns').
   ============================================================ */
const EMG_COIN = 500, EMG_XP = 750, EMG_FINE = 150;
const EMG_GAP_MIN = 210, EMG_GAP_MAX = 300;   // 3.5 – 5 phút
const EMG_ODDS = .75;                          // xác suất nổ sự cố khi tới hẹn
const EMG_RING_MS = 6000;                      // tự bắt máy sau 6s
const EMG_WHO = 'Sếp Lan', EMG_ROLE = 'Giám đốc Vận hành';

/* house = chỉ số trong ST_HOUSE_X của phố: 1 Tạp hoá (trạm mạng), 2 VP Cô Mai, 7 Server Mini */
const EMG_EVENTS = [
  {
    id: 'ransomware', ic: '🔒', game: 'pull', house: 2, place: 'Văn phòng Cô Mai', secs: 60,
    name: 'Máy Sếp dính Ransomware', win: 'HIỆN TRƯỜNG — MÁY SẾP ĐANG BỊ MÃ HOÁ',
    ring: 'Sếp: “Máy anh màn hình đỏ hết rồi, nó đếm khoá dữ liệu kìa!”',
    brief: `😱 <b>Sếp Lan — Văn phòng Cô Mai:</b><br>“Em ơi, anh vừa click cái link trong email <i>Hoá đơn GTGT</i>, giờ màn hình nhảy ô đỏ,
      file nào cũng đổi đuôi <b>.crim</b> và nó đếm phần trăm khoá dữ liệu!<br>Em chạy qua phòng anh NGAY, vào máy anh mà xử!”`,
    foot: '👉 Malware đang mã hoá từng file và gọi về C&C. Cô lập máy khỏi LAN là bước 1 của quy trình IR.',
    ok: '🔌 Cáp LAN đã rút! Máy Sếp cô lập khỏi mạng nội bộ, chuỗi mã hoá dừng lại. Sếp thở phào.',
    bad: '😤 “Khoá xong rồi em ơi! Toàn bộ hợp đồng quý 4 thành .crim. Anh trừ KPI em vụ này!”'
  },
  {
    id: 'ups', ic: '🔋', game: 'breakers', house: 7, place: 'Nhà số 7 — Server Mini', secs: 75,
    name: 'Phòng Server sập nguồn UPS', win: 'HIỆN TRƯỜNG — TỦ ĐIỆN SERVER MINI',
    ring: 'Sếp: “Mất điện đột ngột, UPS sắp cạn bình rồi!”',
    brief: `🔋 <b>Sếp Lan — Nhà số 7:</b><br>“Cúp điện bất ngờ, bình ắc quy UPS tụt còn vài phút là mất hết dịch vụ công ty!<br>
      Em qua tủ điện, <b>gạt 3 cầu dao dự phòng CB-01 → CB-02 → CB-03 theo đúng thứ tự</b> để kích máy phát diesel.
      Gạt sai thứ tự là aptomat nhảy lại đấy!”`,
    foot: '👉 Trình tự chuẩn: nguồn dự phòng → liên kết tủ → tải. Sai bước là mạch không đóng.',
    ok: '⚡ Máy phát đã nổ! Tủ điện Server Mini chạy nguồn dự phòng, dịch vụ công ty không gián đoạn.',
    bad: '😤 “UPS cạn bình, sập cả công ty luôn rồi! Không ai cứu được dữ liệu đang ghi dở.”'
  },
  {
    id: 'dns', ic: '🌐', game: 'dns', house: 1, place: 'Nhà số 1 — Trạm mạng Tạp hoá', secs: 60,
    name: 'Đứt cáp quang biển — mạng sập', win: 'HIỆN TRƯỜNG — ROUTER TRẠM MẠNG',
    ring: 'Sếp: “Toàn bộ máy nhân viên không vào được mạng!”',
    brief: `🌐 <b>Sếp Lan — Trạm mạng:</b><br>“Tuyến cáp quang chính mất tín hiệu, nhân viên báo mất mạng hàng loạt.<br>
      Em chạy xuống trạm, vào router <b>đổi Primary DNS đang là 0.0.0.0 sang một DNS công cộng</b> (Cloudflare hoặc Google)
      rồi bấm Lưu để cứu dịch vụ phân giải tên miền!”`,
    foot: '👉 0.0.0.0 không phân giải được tên — chọn DNS công cộng công khai rồi lưu cấu hình.',
    ok: '🛰️ DNS công cộng đã bật, tên miền phân giải trở lại, nhân viên vào mạng được rồi!',
    bad: '😤 “Bao nhiêu máy vẫn quay mòng mòng vì không có ai phân giải DNS. Trễ hẹn quá em!”'
  }
];
const EMG_BY_ID = {}; EMG_EVENTS.forEach((e, i) => { EMG_BY_ID[e.id] = e; EMG_BY_ID[i] = e; });
const EMG_FILES = ['Hop-dong-QUY4.xlsx', 'KeToan_Thang10.sdb', 'Bao-gia-khach.docx', 'Anh-gia-dinh.JPG', 'Du-phong-ERP.mdf', 'De-cuong-CCNA.pdf'];
const EMG_DNS = [
  ['0.0.0.0', '0.0.0.0', 'đang dùng — không phân giải'],
  ['1.1.1.1', '1.1.1.1', 'Cloudflare'],
  ['8.8.8.8', '8.8.8.8', 'Google DNS'],
  ['192.168.1.1', '192.168.1.1', 'gateway nội bộ']
];

var EMG = null;
var emgNextAt = 0, emgSirenT = null, emgRingT = null, emgHudTxt = '';

const emgEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const emgPad = n => String(n).padStart(2, '0');
const emgMs = ms => { const q = Math.max(0, Math.floor((ms | 0) / 1000)); return emgPad(Math.floor(q / 60)) + ':' + emgPad(q % 60); };
const emgLeft = () => EMG ? Math.max(0, EMG.deadline - Date.now()) : 0;
const emgModalOpen = () => !!openModalEl();
const emgDlgOpen = () => document.getElementById('dialog').style.display === 'flex';
/* Điều kiện nổ sự cố: ở STREET/WORLD, không giữa ải — modal/helpdesk/job/shop/Boss đều chặn */
function emgCanFire() {
  if (EMG) return false;
  if (S.scene !== 'STREET' && S.scene !== 'WORLD') return false;
  if (WIN || HD || shopOpen()) return false;
  if (emgModalOpen() || emgDlgOpen()) return false;
  if (bossState && !bossState.done) return false;
  return true;
}
function emgSchedule(ms) {
  emgNextAt = Date.now() + (ms != null ? ms : (EMG_GAP_MIN + Math.random() * (EMG_GAP_MAX - EMG_GAP_MIN)) * 1000);
}

/* ---------- khung DOM (tạo chậm, không đụng index.html) ---------- */
function emgBox(id, cls) {
  let m = document.getElementById(id);
  if (!m) {
    m = document.createElement('div');
    m.id = id; m.className = cls;
    document.getElementById('app').appendChild(m);
  }
  return m;
}
const emgCall = () => emgBox('emg-call', 'emg-call');
const emgHud = () => emgBox('emg-hud', 'emg-hud');
const emgModal = () => emgBox('emg-modal', 'modal emg-modal');

/* ---------- âm thanh ---------- */
function emgLamp(on) {
  if (on) { let k = 0; emgSirenT = setInterval(() => { beep(k++ % 2 ? 1180 : 880, 'triangle', .16, .04); }, 300); }
  else { clearInterval(emgSirenT); emgSirenT = null; }
}
function emgSiren(on) {
  if (on) { if (emgSirenT) return; let k = 0; emgSirenT = setInterval(() => { beep(k++ % 2 ? 610 : 940, 'square', .2, .035); }, 400); }
  else { clearInterval(emgSirenT); emgSirenT = null; }
}
function emgStopSound() { emgLamp(false); emgSiren(false); }

/* ---------- 1) chuông gọi đến ---------- */
function emgRing(ev) {
  if (!ev) return;
  closeAll();
  EMG = { ev, st: 'ring', t0: Date.now(), deadline: 0, miss: 0, pick: null, brk: [false, false, false], encFiles: 0 };
  const el = emgCall();
  el.innerHTML =
    '<div class="emg-call-row"><span class="emg-call-ph">📞</span>' +
    '<div class="emg-call-info"><b class="emg-call-tt">🚨 HOTLINE KHẨN CẤP: SẾP GỌI!</b>' +
    '<small class="emg-call-who">' + emgEsc(EMG_WHO + ' · ' + EMG_ROLE) + '</small>' +
    '<small class="emg-call-sub">' + emgEsc(ev.ring) + '</small></div></div>' +
    '<div class="emg-call-act">' +
    '<button class="emg-call-btn" onclick="emgAnswer()">📞 BẮT MÁY</button>' +
    '<span class="emg-call-auto">tự bắt sau <b id="emg-call-n">6</b>s</span></div>';
  el.classList.add('on');
  emgRingCount();
  emgLamp(true);
  emgRingT = setTimeout(emgAutoAnswer, EMG_RING_MS);   // không bấm thì Sếp coi như đã báo xong
  showToast('📞 Cuộc gọi khẩn cấp từ Sếp!');
}
function emgRingCount() {
  const n = document.getElementById('emg-call-n');
  if (n) n.innerText = Math.max(0, Math.ceil((EMG_RING_MS - (Date.now() - EMG.t0)) / 1000));
}
function emgAutoAnswer() {
  emgRingT = null;
  if (!EMG || EMG.st !== 'ring') return;
  if (emgModalOpen()) { emgRingT = setTimeout(emgAutoAnswer, 1500); return; }   // đang mở popup khác -> chờ
  emgAnswer();
}
function emgAnswer() {
  if (!EMG || EMG.st !== 'ring') return;
  clearTimeout(emgRingT); emgRingT = null;
  emgLamp(false);
  EMG.st = 'live';
  EMG.t0 = Date.now();
  EMG.deadline = Date.now() + EMG.ev.secs * 1000;
  const c = document.getElementById('emg-call'); if (c) c.classList.remove('on');
  showDlg(EMG_WHO, EMG_ROLE, EMG.ev.brief);
  emgHudPaint(true);
  emgSiren(true);
  beep(300, 'sawtooth', .3, .05);
}

/* ---------- 2) HUD khẩn cấp ---------- */
function emgHint() {
  if (S.scene === 'STREET') return '🏃 Chạy đến ' + EMG.ev.place + ' rồi bấm [E]';
  if (S.scene === 'WORLD') return '🏃 Xuống cổng phía Nam → ra Phố Ngoài';
  return '🏃 Về Phố Ngoài — ' + EMG.ev.place;
}
function emgHudPaint(force) {
  const el = emgHud();
  const left = emgLeft(), pct = Math.max(0, Math.min(100, left / (EMG.ev.secs * 10) ));
  const txt = '🚨 KHẨN CẤP: ' + EMG.ev.name + ' · ⏳ ' + emgMs(left) + ' · ' + emgHint();
  if (force || txt !== emgHudTxt) {
    emgHudTxt = txt;
    el.innerHTML = '<span class="emg-hud-tx">' + emgEsc(txt) + '</span>' +
      '<span class="emg-hud-bar"><i style="width:' + pct + '%"></i></span>';
  }
  el.classList.add('on');
  el.classList.toggle('low', left < 15000);
}
function emgHudHide() {
  const el = document.getElementById('emg-hud');
  if (el) { el.classList.remove('on', 'low'); el.innerHTML = ''; }
  emgHudTxt = '';
}

/* ---------- 3) hiện trường: mở bằng [E] tại đúng căn nhà ---------- */
function emgStage(html) { const s = document.getElementById('emg-stage'); if (s) s.innerHTML = html; }
function emgFoot(html, cls) {
  const f = document.getElementById('emg-foot');
  if (f) { f.innerHTML = html; f.className = 'emg-foot' + (cls ? ' ' + cls : ''); }
}
function emgShake(sel) {
  const e = document.querySelector(sel); if (!e) return;
  e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake');
}
function emgMist() { const e = document.getElementById('emg-mist'); if (e) e.innerText = EMG.miss ? '⚠ sai ' + EMG.miss + ' bước' : '✔ chưa sai'; }
function emgClock() { const e = document.getElementById('emg-clock'); if (!e || !EMG) return; const l = emgLeft(); e.innerText = '⏳ ' + emgMs(l); e.className = 'emg-clock' + (l < 15000 ? ' low' : ''); }

function emgOpenTask() {
  if (!EMG || EMG.st !== 'live') return;
  closeAll();
  EMG.st = 'task';
  const ev = EMG.ev, m = emgModal();
  m.innerHTML =
    '<div class="emg-tbar"><span class="emg-tic">' + ev.ic + '</span><b>' + emgEsc(ev.win) + '</b>' +
    '<span class="emg-mist" id="emg-mist">✔ chưa sai</span>' +
    '<span class="emg-clock" id="emg-clock">⏳ ' + emgMs(emgLeft()) + '</span>' +
    '<span class="emg-x" onclick="emgBack()">✕</span></div>' +
    '<div class="emg-stage" id="emg-stage"></div>' +
    '<div class="emg-foot" id="emg-foot">' + emgEsc(ev.foot) + '</div>';
  if (ev.game === 'pull') emgPullRender();
  else if (ev.game === 'breakers') emgBrkRender();
  else emgDnsRender();
  emgMist();
  m.style.display = 'flex';
  beep(520, 'triangle', .1, .04);
}
function emgBack() {
  const m = document.getElementById('emg-modal');
  if (m) m.style.display = 'none';
  if (EMG && EMG.st === 'task') { EMG.st = 'live'; showToast('⏳ Sự cố vẫn đang chạy — quay lại hiện trường bằng [E]!'); }
}

/* --- kịch bản 1: rút dây LAN khi thanh mã hoá chạy --- */
function emgPullRender() {
  emgStage('<div class="emg-ransom">' +
    '<div class="emg-rnote"><div class="emg-rt">⛔ YOUR FILES ARE ENCRYPTED</div>' +
    '<div class="emg-rsub">CrimsonLock 3.1 · chuộc 0.5 BTC trước khi <b>.crim</b> phủ hết ổ C:</div>' +
    '<div class="emg-rfiles">' + EMG_FILES.map(f => '<span class="emg-rf">📄 ' + emgEsc(f) + '</span>').join('') + '</div>' +
    '<div class="emg-encrow"><span>Mã hoá</span><span class="emg-encbar"><i id="emg-encfill"></i></span><b id="emg-encpc">0%</b></div></div>' +
    '<button class="emg-pullbtn" onclick="emgPull()">🔌 RÚT DÂY MẠNG LAN KHẨN CẤP</button>' +
    '<div class="emg-tip">Trên mạng nội bộ, rút cáp LAN cô lập host nhanh hơn mọi phần mềm — malware mất đường báo về máy chủ điều khiển.</div></div>');
}
function emgPullLive() {
  const l = emgLeft(), pct = Math.min(100, Math.round((1 - l / (EMG.ev.secs * 1000)) * 100));
  const bar = document.getElementById('emg-encfill'), pc = document.getElementById('emg-encpc');
  if (bar) bar.style.width = pct + '%';
  if (pc) pc.innerText = pct + '%';
  const fs = document.querySelectorAll('.emg-rf');
  const locked = Math.floor(pct / 100 * fs.length);
  fs.forEach((el, i) => { const on = i < locked; if ((el.dataset.l === '1') !== on) { el.dataset.l = on ? '1' : ''; el.innerHTML = (on ? '🔒 ' : '📄 ') + emgEsc(EMG_FILES[i]); el.classList.toggle('locked', on); } });
}
function emgPull() { if (EMG && EMG.st === 'task') emgWin(); }

/* --- kịch bản 2: gạt 3 cầu dao theo thứ tự 1-2-3 --- */
function emgBrkRender() {
  const on = n => EMG.brk[n];
  emgStage('<div class="emg-brkwrap">' +
    '<div class="emg-panel"><div class="emg-panelh">TỦ ĐIỆN DỰ PHÒNG — SERVER MINI</div>' +
    '<div class="emg-brks">' + [0, 1, 2].map(k =>
      '<div class="emg-brk' + (on(k) ? ' on' : '') + '" id="emg-brk' + k + '" onclick="emgBrk(' + k + ')">' +
      '<span class="emg-brk-lb">CB-0' + (k + 1) + '</span>' +
      '<span class="emg-brk-lever"><i></i></span>' +
      '<span class="emg-brk-st">' + (on(k) ? 'ĐÓNG' : 'MỞ') + '</span></div>').join('') + '</div></div>' +
    '<div class="emg-panel gen"><div class="emg-panelh">MÁY PHÁT DIESEL</div>' +
    '<div class="emg-gen" id="emg-gen"><span class="emg-gen-led"></span><b>' +
    (EMG.brk.every(Boolean) ? '⚡ ĐANG CẤP NGUỒN' : '⛔ CHƯA KÍCH NGUỒN') + '</b>' +
    '<small>UPS còn ' + Math.ceil(emgLeft() / 1000) + 's nữa là cạn bình</small></div></div></div>' +
    '<div class="emg-tip">Gạt đúng trình tự: <b>CB-01 → CB-02 → CB-03</b>. Sai bước aptomat liên khoá không đóng.</div>');
}
function emgBrk(k) {
  if (!EMG || EMG.st !== 'task') return;
  const next = EMG.brk.filter(Boolean).length;
  if (EMG.brk[k]) { emgFoot('⚙️ CB-0' + (k + 1) + ' đang đóng rồi — hãy tắt cầu dao mở kế tiếp.', 'warn'); beep(240, 'square', .1, .03); return; }
  if (k !== next) {
    EMG.miss++; emgMist(); emgShake('#emg-brk' + k);
    emgFoot('❌ Sai trình tự! Liên khoá chỉ nhận gạt <b>CB-0' + (next + 1) + '</b> trước.', 'bad');
    beep(200, 'square', .18, .045);
    return;
  }
  EMG.brk[k] = true;
  emgBrkRender();
  emgFoot('✔ CB-0' + (k + 1) + ' đã đóng.', 'ok');
  beep(300 + 90 * k, 'triangle', .14, .045);
  if (EMG.brk.every(Boolean)) setTimeout(() => { if (EMG && EMG.st === 'task') emgWin(); }, 420);
}

/* --- kịch bản 3: đổi Primary DNS rồi lưu --- */
function emgDnsRender() {
  const rows = EMG_DNS.map((d, i) =>
    '<div class="emg-dnsrow' + (EMG.pick === d[0] ? ' sel' : '') + (d[0] === '0.0.0.0' ? ' now' : '') + '" onclick="emgDnsPick(' + i + ')">' +
    '<span class="emg-dns-radio"></span><b>' + emgEsc(d[0]) + '</b><small>' + emgEsc(d[2]) + (d[0] === '0.0.0.0' ? ' · đang dùng' : '') + '</small></div>').join('');
  emgStage('<div class="emg-router">' +
    '<div class="emg-rhead"><span>🌐 R-TRAM — WAN: <b class="down">quang · LOSS OF LIGHT</b></span>' +
    '<span class="emg-rcl">12 máy nội bộ đang chờ phân giải tên</span></div>' +
    '<div class="emg-rform"><div class="emg-rlab">PRIMARY DNS SERVER</div>' + rows +
    '<button class="emg-save" onclick="emgDnsSave()">💾 LƯU CẤU HÌNH</button></div></div>' +
    '<div class="emg-tip">Cáp biển đứt thì đường ra Internet chậm, nhưng <b>DNS = 0.0.0.0</b> là lỗi cấu hình khiến mọi tên miền chết hẳn.</div>');
}
function emgDnsPick(i) {
  if (!EMG || EMG.st !== 'task') return;
  EMG.pick = EMG_DNS[i][0];
  emgDnsRender();
  emgFoot('🖊 Đã chọn <b>' + emgEsc(EMG_DNS[i][0]) + '</b> — bấm Lưu cấu hình để áp dụng.', 'warn');
  beep(560, 'triangle', .07, .03);
}
function emgDnsSave() {
  if (!EMG || EMG.st !== 'task') return;
  const p = EMG.pick;
  if (!p) { EMG.miss++; emgMist(); emgShake('.emg-rform'); emgFoot('❌ Chưa chọn DNS nào — bấm vào một hàng rồi Lưu.', 'bad'); beep(200, 'square', .16, .045); return; }
  if (p === '0.0.0.0') { EMG.miss++; emgMist(); emgShake('.emg-rform'); emgFoot('❌ 0.0.0.0 không phải máy chủ DNS — không có ai phân giải tên cả.', 'bad'); beep(200, 'square', .16, .045); return; }
  if (p === '192.168.1.1') { EMG.miss++; emgMist(); emgShake('.emg-rform'); emgFoot('❌ 192.168.1.1 là gateway nội bộ — nó không phục vụ DNS ra ngoài Internet.', 'bad'); beep(200, 'square', .16, .045); return; }
  emgFoot('✔ %SYS-5-CONFIG_I: Configured from console — DNS ' + emgEsc(p) + ' đã áp dụng.', 'ok');
  setTimeout(() => { if (EMG && EMG.st === 'task') emgWin(); }, 350);
}

/* ---------- 4) thắng / thua / dọn cờ ---------- */
function emgWin() {
  const ev = EMG.ev;
  emgStopSound();
  closeAll();
  clearEmergency();
  addCoin(EMG_COIN); addXP(EMG_XP);
  chord([660, 880, 1100, 1320]);
  showBanner('SỰ CỐ KHẨN CẤP ĐÃ DỪNG', ev.ic + ' ' + ev.name,
    '🎁 Nóng tay: <b>+' + EMG_COIN + ' Coin</b> · <b>+' + EMG_XP + ' XP</b> — Sếp ghi nhận tinh thần on-call!', 'green');
  setTimeout(() => showDlg(EMG_WHO, EMG_ROLE, '🎉 ' + emgEsc(ev.ok)), 220);
  achUnlock('hotline_hero');
  saveGame(); syncHUD();
}
function emgLose() {
  const ev = EMG.ev, fine = Math.min(EMG_FINE, Math.max(0, S.coin));
  emgStopSound();
  closeAll();
  clearEmergency();
  if (fine > 0) addCoin(-fine);
  showBanner('SẾP KHIỂN TRÁCH', '⏰ Hết giờ — ' + ev.name,
    fine > 0 ? 'Trừ ' + fine + ' Coin tiền phạt KPI!' : 'Coin đã cạn, Sếp ghi sổ phạt lại!', 'red');
  setTimeout(() => showDlg(EMG_WHO, EMG_ROLE, emgEsc(ev.bad)), 220);
  beep(180, 'square', .34, .05);
  saveGame();
}
function clearEmergency() {
  emgStopSound();
  clearTimeout(emgRingT); emgRingT = null;
  const c = document.getElementById('emg-call'); if (c) c.classList.remove('on');
  const m = document.getElementById('emg-modal'); if (m) m.style.display = 'none';
  emgHudHide();
  EMG = null;
  emgSchedule();
}

/* ---------- 5) vòng điều phối ---------- */
setInterval(() => {
  try {
    if (!EMG) {
      if (document.hidden || Date.now() < emgNextAt) return;
      if (!emgCanFire()) { emgSchedule(20000); return; }          // đang bận → thử lại sau 20s
      if (Math.random() > EMG_ODDS) { emgSchedule(45000); return; } // tới hẹn nhưng Sếp chưa gọi
      emgRing(EMG_EVENTS[(Math.random() * EMG_EVENTS.length) | 0]);
      return;
    }
    if (EMG.st === 'ring') { emgRingCount(); return; }
    if (EMG.st === 'live' || EMG.st === 'task') {
      const left = emgLeft();
      emgHudPaint(false);
      if (left <= 0) { emgLose(); return; }
      const m = document.getElementById('emg-modal');
      if (EMG.st === 'task') {
        if (!m || m.style.display !== 'flex') EMG.st = 'live';     // ESC / closeAll → đóng popup, sự cố vẫn chạy
        else { emgClock(); if (EMG.ev.game === 'pull') emgPullLive(); }
      }
    }
  } catch (e) {}
}, 200);

/* mũi tên vàng chỉ đường + [E] ưu tiên hiện trường (vẽ sau mọi scene, toạ độ màn hình) */
function emgAim() {
  if (!EMG || (EMG.st !== 'live' && EMG.st !== 'task') || emgModalOpen()) return null;
  if (S.scene === 'STREET') return [ST_HOUSE_X[EMG.ev.house] - (window._camX || 0), 306];
  if (S.scene === 'WORLD') return [563, 540];
  return null;
}
function emgArrow() {
  const a = emgAim(); if (!a) return;
  const ox = S.p.x + 10, oy = S.p.y + 26, ang = Math.atan2(a[1] - oy, a[0] - ox);
  const r = 50 + Math.sin(Date.now() / 160) * 7;
  ctx.save();
  ctx.translate(ox + Math.cos(ang) * r, oy + Math.sin(ang) * r);
  ctx.rotate(ang);
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-9, -11); ctx.lineTo(-3, 0); ctx.lineTo(-9, 11); ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 7;
  ctx.fillStyle = '#ffd93d'; ctx.fill();
  ctx.shadowBlur = 0; ctx.lineWidth = 2.2; ctx.strokeStyle = '#7a5200'; ctx.stroke();
  ctx.restore();
}

const _updE = update;
update = function () {
  _updE();
  try {
    if (EMG && EMG.st === 'live' && S.scene === 'STREET' && !emgModalOpen()) {
      const px = S.p.x + 10 + (window._camX || 0);
      if (Math.hypot(px - ST_HOUSE_X[EMG.ev.house], S.p.y + 30 - 312) < 74) targetAct = { t: 'emg' };
    }
  } catch (e) {}
};

const _rndE = render;
render = function () {
  _rndE();
  try {
    emgArrow();
    if (targetAct && targetAct.t === 'emg' && EMG) {
      const l = emgLeft();
      drawPrompt('[E] 🚨 ' + EMG.ev.name + ' — hiện trường còn ' + emgMs(l));
    }
  } catch (e) {}
};

const _daE = doAction;
doAction = function () {
  if (targetAct && targetAct.t === 'emg') { emgOpenTask(); return; }
  _daE();
};

/* lệnh dev: window.triggerEmergency('ransomware' | 'ups' | 'dns' | 0..2 | bỏ trống = ngẫu nhiên) */
window.triggerEmergency = function (type) {
  if (EMG) clearEmergency();
  let ev = null;
  if (type === undefined || type === null || type === 'random') ev = EMG_EVENTS[(Math.random() * EMG_EVENTS.length) | 0];
  else ev = EMG_BY_ID[type];
  if (!ev) { showToast("⚠️ Không có sự cố '" + type + "' — dùng ransomware | ups | dns"); return null; }
  emgRing(ev);
  if (S.scene !== 'STREET' && S.scene !== 'WORLD') showToast('📍 Sự cố ở Phố Ngoài — về phố để chạy test');
  return ev.id;
};
emgSchedule(45000);   // cuộc gọi đầu tiên sau ~45s để người chơi kịp ổn định

/* ====================================================
   🛡️ CẢNH 10: TRUNG TÂM NOC/SOC & 4 ẢI THỰC HÀNH CNTT
   🛡️ CẢNH 10: TRUNG TÂM NOC/SOC & 4 ẢI THỰC HÀNH CNTT
   🛡️ CẢNH 10: TRUNG TÂM NOC/SOC & 4 ẢI THỰC HÀNH CNTT
   ==================================================== */
function drawNocSocStationTag(st, done) {
  const x = st.x, by = st.y - 48 + Math.sin(Date.now() / 420 + x * 0.02) * 2;
  const txt = (done ? '✅ ' : st.icon + ' ') + st.title.replace('BÀN ', '');
  ctx.font = 'bold 10px "Segoe UI",sans-serif';
  const w = ctx.measureText(txt).width + 18;
  izb(x - w / 2, by, w, 22, 11, done ? '#15803d' : '#0284c7', 'rgba(255,255,255,.3)');
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
  ctx.fillText(txt, x, by + 15); ctx.textAlign = 'left';
}

function drawNocSoc() {
  const c = INTERIORS.NOC_SOC;
  ctx.drawImage(IMG.noc_bg, 0, 0, 960, 600);
  
  // Vẽ nhãn trên 4 bàn máy tính
  drawNocSocStationTag(c.station, !!S.missionsDone.socfw);
  drawNocSocStationTag(c.station2, !!S.missionsDone.socmalware);
  drawNocSocStationTag(c.station3, !!S.missionsDone.socloop);
  drawNocSocStationTag(c.station4, !!S.missionsDone.nocload);

  // Nhãn thảm đỏ ra thành phố
  ctx.save(); ctx.translate(180, 500); ctx.rotate(-0.12); ctx.textAlign = 'center';
  ctx.font = 'bold 11px "Segoe UI",sans-serif';
  ctx.fillStyle = '#ffffff'; ctx.fillText('🚪 RA THÀNH PHỐ', 0, 0); ctx.restore(); ctx.textAlign = 'left';

  [[c.npc.x, c.npc.y, c.npc.sprite], [S.p.x, S.p.y, 'p']].sort((a, b) => a[1] - b[1])
    .forEach(([x, y, r]) => drawSprite(x, y, r));
}

function openBuildingGame(id) {
  const g = INTERIORS[id] && INTERIORS[id].station.game;
  if (g === 'QUIZ') openQuiz();
  else if (g === 'TICKET') openTk();
  else if (g === 'PATCH') openPt();
  else if (g === 'WIFI') openWf();
  else if (g === 'TRACE') openTr();
  else if (g === 'SOCFW') openFw();
}
function openBuildingGame2(id) {
  const g = INTERIORS[id] && INTERIORS[id].station2.game;
  if (g === 'MALWARE') openMalware();
  else if (g === 'NOCLOAD') openNc();
}
function openBuildingGame3(id) {
  const g = INTERIORS[id] && INTERIORS[id].station3.game;
  if (g === 'SWITCHLOOP') openSwitchLoop();
}
function openBuildingGame4(id) {
  const g = INTERIORS[id] && INTERIORS[id].station4.game;
  if (g === 'NOCLOAD') openNc();
}

function checkNocSocAllDone() {
  if (S.missionsDone.socfw && S.missionsDone.socmalware && S.missionsDone.socloop && S.missionsDone.nocload) {
    if (!S.missionsDone.hungThanCert) {
      S.missionsDone.hungThanCert = true;
      setTimeout(openHungThanCert, 400);
    }
  }
}

/* ====================================================
   ẢI 1: BÀN TƯỜNG LỬA (SOCFW) — CHẶN IP FLOOD & ĐÓNG PORT
   ==================================================== */
let fwState = { blocked: false, p23: true, p445: true };
function openFw() {
  closeAll();
  let m = document.getElementById('fw-modal');
  if (!m) {
    m = document.createElement('div'); m.id = 'fw-modal'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  m.style.cssText = 'display:flex !important; flex-direction:column !important; gap:10px !important; position:absolute !important; top:30px !important; bottom:30px !important; left:60px !important; right:60px !important; transform:none !important; animation:none !important; margin:0 !important; padding:18px 24px !important; background:linear-gradient(160deg,#0a1324,#050811) !important; border:2px solid #ef4444 !important; border-radius:16px !important; color:#e2e8f0 !important; font:13px "Segoe UI",sans-serif !important; z-index:120 !important; box-shadow:0 20px 60px #000c !important; overflow:auto !important;';
  renderFw();
  beep(600);
}

function renderFw() {
  const m = document.getElementById('fw-modal');
  if (m) {
    m.style.setProperty('transform', 'none', 'important');
    m.style.setProperty('top', '30px', 'important');
    m.style.setProperty('left', '60px', 'important');
    m.style.setProperty('bottom', '30px', 'important');
    m.style.setProperty('right', '60px', 'important');
    m.style.setProperty('margin', '0', 'important');
  }
  const safe = fwState.blocked && !fwState.p23 && !fwState.p445;
  m.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:8px">
      <b style="font-size:16px;color:#f87171">🛡️ BÀN 1: TƯỜNG LỬA NEXT-GEN FIREWALL (SOC)</b>
      <button onclick="closeAll()" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:3px 10px;cursor:pointer">✕</button>
    </div>
    <div style="background:#111c33;padding:10px 14px;border-radius:8px;border-left:4px solid #ef4444;font-size:12px;line-height:1.5">
      <b>TÌNH HUỐNG:</b> Hệ thống bị tấn công từ chối dịch vụ (DDoS 28,450 req/s) và dò quét cổng Windows SMB. Hãy phân tích log để chặn IP botnet và đóng các cổng dịch vụ nguy hiểm!
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:6px">
      <div style="background:#080e1a;border:1px solid #1e293b;border-radius:8px;padding:10px">
        <b style="color:#38bdf8">📋 LOG TRUY CẬP THỜI GIAN THỰC</b>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px;font-family:monospace;font-size:11px">
          <div style="padding:6px;background:#0f172a;border-radius:4px">192.168.1.45:443 ➔ Web-Server (12 req/s) · Hợp lệ</div>
          <div style="padding:6px;background:${fwState.blocked?'#14532d':'#450a0a'};border:1px solid ${fwState.blocked?'#22c55e':'#ef4444'};border-radius:4px;display:flex;justify-content:space-between;align-items:center">
            <span>198.51.100.45 ➔ DDoS (28,450 req/s)</span>
            <button onclick="fwToggleBlock()" style="background:${fwState.blocked?'#22c55e':'#ef4444'};color:#fff;border:0;border-radius:4px;padding:3px 8px;cursor:pointer;font-weight:700">
              ${fwState.blocked?'ĐÃ CHẶN (DROP)':'CHẶN IP NÀY'}</button>
          </div>
          <div style="padding:6px;background:#0f172a;border-radius:4px">10.0.0.12:53 ➔ DNS Query (4 req/s) · Hợp lệ</div>
          <div style="padding:6px;background:#0f172a;border-radius:4px">203.0.113.88 ➔ SMB Scan Port 445 · Rủi ro cao</div>
        </div>
      </div>
      <div style="background:#080e1a;border:1px solid #1e293b;border-radius:8px;padding:10px">
        <b style="color:#38bdf8">🔒 BẢNG QUẢN LÝ CỔNG (PORT SECURITY)</b>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;font-size:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;padding:6px 10px;border-radius:6px">
            <span>Port 443 (HTTPS Web Bảo mật)</span><b style="color:#22c55e">MỞ (ON)</b>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;padding:6px 10px;border-radius:6px">
            <span>Port 23 (Telnet - Truyền văn bản trần)</span>
            <button onclick="fwTogglePort('p23')" style="background:${fwState.p23?'#ef4444':'#22c55e'};color:#fff;border:0;border-radius:4px;padding:3px 10px;cursor:pointer;font-weight:700">
              ${fwState.p23?'ĐANG MỞ (ĐÓNG NGAY)':'ĐÃ ĐÓNG (SECURED)'}</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#0f172a;padding:6px 10px;border-radius:6px">
            <span>Port 445 (SMB - Nguy cơ Ransomware)</span>
            <button onclick="fwTogglePort('p445')" style="background:${fwState.p445?'#ef4444':'#22c55e'};color:#fff;border:0;border-radius:4px;padding:3px 10px;cursor:pointer;font-weight:700">
              ${fwState.p445?'ĐANG MỞ (ĐÓNG NGAY)':'ĐÃ ĐÓNG (SECURED)'}</button>
          </div>
        </div>
        <div style="margin-top:12px;padding:8px;border-radius:6px;background:${safe?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)'};color:${safe?'#4ade80':'#fca5a5'};font-weight:700;text-align:center">
          ${safe ? '✅ Tải mạng đã hạ về 18% — Hệ thống Firewall an toàn!' : '⚠️ Cảnh báo: Tải mạng 99% — Vẫn còn nguy cơ tấn công!'}
        </div>
      </div>
    </div>
    <div style="margin-top:auto;display:flex;justify-content:flex-end;gap:10px">
      <button onclick="fwFinish()" ${safe?'':'disabled'} style="background:${safe?'#22c55e':'#475569'};color:#fff;border:0;border-radius:8px;padding:9px 24px;font-weight:700;cursor:${safe?'pointer':'not-allowed'}">
        HOÀN THÀNH ẢI 1</button>
    </div>`;
}
function fwToggleBlock() { fwState.blocked = !fwState.blocked; beep(fwState.blocked?750:350); renderFw(); }
function fwTogglePort(p) { fwState[p] = !fwState[p]; beep(fwState[p]?350:750); renderFw(); }
function fwFinish() {
  if (!fwState.blocked || fwState.p23 || fwState.p445) return;
  finishMission('socfw', 500, 2000, 'networking', 'Anh Nam', 'Trưởng Ca Trực',
    '🎉 Xuất sắc! Em đã chặn đứng IP botnet và đóng chặt các cổng dịch vụ nguy hiểm!');
  checkNocSocAllDone();
}

/* ====================================================
   ẢI 2: BÀN DIỆT MALWARE (MALWARE) — PROCESS EXPLORER
   ==================================================== */
let malState = { killed1: false, killed2: false, cleanReg: false };
function openMalware() {
  closeAll();
  let m = document.getElementById('mal-modal');
  if (!m) {
    m = document.createElement('div'); m.id = 'mal-modal'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  m.style.cssText = 'display:flex;flex-direction:column;gap:10px;position:absolute;inset:30px 60px;transform:none;animation:none;padding:18px 24px;background:linear-gradient(160deg,#0a1324,#050811);border:2px solid #38bdf8;border-radius:16px;color:#e2e8f0;font:13px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000c;overflow:auto';
  renderMalware();
  beep(600);
}
function renderMalware() {
  const m = document.getElementById('mal-modal');
  const cpu = (malState.killed1 ? 0 : 58) + (malState.killed2 ? 0 : 34) + 8;
  const safe = malState.killed1 && malState.killed2 && malState.cleanReg;
  m.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:8px">
      <b style="font-size:16px;color:#38bdf8">🦠 BÀN 2: TRUNG TÂM PHẢN ỨNG MÃ ĐỘC (ENDPOINT SECURITY)</b>
      <button onclick="closeAll()" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:3px 10px;cursor:pointer">✕</button>
    </div>
    <div style="background:#111c33;padding:10px 14px;border-radius:8px;border-left:4px solid #38bdf8;font-size:12px;line-height:1.5">
      <b>TÌNH HUỐNG:</b> Máy trạm kỹ thuật bị cấy mã độc đào Monero ngầm. CPU đang peg <b>${cpu}%</b>! Hãy tìm đúng 2 tiến trình đào coin giả mạo để End Process, sau đó bấm Quét sạch mã độc.
    </div>
    <div style="background:#080e1a;border:1px solid #1e293b;border-radius:8px;padding:10px;margin-top:6px;overflow-x:auto">
      <div style="display:grid;grid-template-columns:180px 80px 80px 180px 120px;font-weight:700;color:#94a3b8;border-bottom:1px solid #1e293b;padding-bottom:6px">
        <span>Tên Tiến Trình</span><span>PID</span><span>CPU %</span><span>Đường Dẫn</span><span>Hành Động</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;font-family:monospace;font-size:12px">
        <div style="display:grid;grid-template-columns:180px 80px 80px 180px 120px;align-items:center;padding:5px 0">
          <span>System</span><span>4</span><span>1%</span><span>C:\\Windows</span><span style="color:#64748b">Hệ thống</span>
        </div>
        <div style="display:grid;grid-template-columns:180px 80px 80px 180px 120px;align-items:center;padding:5px 0;background:${malState.killed1?'transparent':'rgba(239,68,68,.12)'}">
          <span style="color:${malState.killed1?'#64748b':'#f87171'}">svch0st_miner.exe</span><span>6620</span><span>${malState.killed1?'0%':'58%'}</span><span>AppData/Roaming</span>
          <button onclick="malKill(1)" ${malState.killed1?'disabled':''} style="background:${malState.killed1?'#334155':'#ef4444'};color:#fff;border:0;border-radius:4px;padding:3px 8px;cursor:pointer">
            ${malState.killed1?'ĐÃ DIỆT':'KILL PROCESS'}</button>
        </div>
        <div style="display:grid;grid-template-columns:180px 80px 80px 180px 120px;align-items:center;padding:5px 0">
          <span>mysqld.exe</span><span>2840</span><span>7%</span><span>Program Files/MySQL</span><span style="color:#64748b">Database</span>
        </div>
        <div style="display:grid;grid-template-columns:180px 80px 80px 180px 120px;align-items:center;padding:5px 0;background:${malState.killed2?'transparent':'rgba(239,68,68,.12)'}">
          <span style="color:${malState.killed2?'#64748b':'#f87171'}">xmrig_core.exe</span><span>9114</span><span>${malState.killed2?'0%':'34%'}</span><span>Temp/xmrig</span>
          <button onclick="malKill(2)" ${malState.killed2?'disabled':''} style="background:${malState.killed2?'#334155':'#ef4444'};color:#fff;border:0;border-radius:4px;padding:3px 8px;cursor:pointer">
            ${malState.killed2?'ĐÃ DIỆT':'KILL PROCESS'}</button>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;background:#080e1a;padding:10px;border-radius:8px">
      <span>CPU Hiện Tại: <b style="color:${cpu>30?'#ef4444':'#22c55e'};font-size:15px">${cpu}%</b></span>
      <button onclick="malQuarantine()" ${malState.killed1&&malState.killed2&&!malState.cleanReg?'':'disabled'} style="background:${malState.cleanReg?'#22c55e':(malState.killed1&&malState.killed2?'#f59e0b':'#334155')};color:#fff;border:0;border-radius:6px;padding:8px 16px;font-weight:700;cursor:pointer">
        ${malState.cleanReg?'✔ ĐÃ DỌN SẠCH REGISTRY':'🧹 QUÉT & CÁCH LY MÃ ĐỘC'}</button>
    </div>
    <div style="margin-top:auto;display:flex;justify-content:flex-end;gap:10px">
      <button onclick="malFinish()" ${safe?'':'disabled'} style="background:${safe?'#22c55e':'#475569'};color:#fff;border:0;border-radius:8px;padding:9px 24px;font-weight:700;cursor:${safe?'pointer':'not-allowed'}">
        HOÀN THÀNH ẢI 2</button>
    </div>`;
}
function malKill(idx) {
  if (idx === 1) malState.killed1 = true;
  if (idx === 2) malState.killed2 = true;
  beep(750, 'triangle', 0.1);
  renderMalware();
}
function malQuarantine() {
  malState.cleanReg = true;
  chord([660, 880, 1100]);
  renderMalware();
}
function malFinish() {
  if (!malState.killed1 || !malState.killed2 || !malState.cleanReg) return;
  finishMission('socmalware', 500, 2000, 'troubleshooting', 'Anh Nam', 'Trưởng Ca Trực',
    '🎉 Tuyệt vời! Em đã kết liễu 2 tiến trình đào coin và cách ly hoàn toàn mã độc!');
  checkNocSocAllDone();
}

/* ====================================================
   ẢI 3: BÀN LOOP SWITCH (SWITCHLOOP) — STP & BPDU GUARD
   ==================================================== */
let loopState = { port3Down: false, bpduEnabled: false };
function openSwitchLoop() {
  closeAll();
  let m = document.getElementById('loop-modal');
  if (!m) {
    m = document.createElement('div'); m.id = 'loop-modal'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  m.style.cssText = 'display:flex;flex-direction:column;gap:10px;position:absolute;inset:30px 60px;transform:none;animation:none;padding:18px 24px;background:linear-gradient(160deg,#0a1324,#050811);border:2px solid #facc15;border-radius:16px;color:#e2e8f0;font:13px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000c';
  renderSwitchLoop();
  beep(600);
}
function renderSwitchLoop() {
  const m = document.getElementById('loop-modal');
  const storm = !loopState.port3Down;
  const safe = loopState.port3Down && loopState.bpduEnabled;
  m.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:8px">
      <b style="font-size:16px;color:#facc15">⚡ BÀN 3: BẢNG ĐIỀU KHIỂN SWITCH CORE (LOOP LAYER-2)</b>
      <button onclick="closeAll()" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:3px 10px;cursor:pointer">✕</button>
    </div>
    <div style="background:#111c33;padding:10px 14px;border-radius:8px;border-left:4px solid #facc15;font-size:12px;line-height:1.5">
      <b>TÌNH HUỐNG:</b> Bão broadcast <b>35,000 bcast/s</b> làm nghẽn toàn mạng do 2 cổng Gi0/3 và Gi0/4 bị cắm nhầm dây loop. Hãy ngắt kết nối cổng loop và kích hoạt cơ chế BPDU Guard để bảo vệ switch!
    </div>
    <div style="background:#080e1a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-top:6px">
      <b style="color:#94a3b8">BẢNG TRẠNG THÁI 8 CỔNG GIGABIT ETHERNET</b>
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-top:10px">
        <div style="background:#0f172a;padding:8px;border-radius:6px;border:1px solid #22c55e">
          <b>Gi0/1</b> · PC Kế toán<br><span style="color:#4ade80">● Link Up (100Mbps)</span>
        </div>
        <div style="background:#0f172a;padding:8px;border-radius:6px;border:1px solid #22c55e">
          <b>Gi0/2</b> · Server Web<br><span style="color:#4ade80">● Link Up (1Gbps)</span>
        </div>
        <div style="background:#0f172a;padding:8px;border-radius:6px;border:1px solid ${storm?'#ef4444':'#64748b'}">
          <b>Gi0/3</b> · Cáp Loop A<br>
          <span style="color:${storm?'#f87171':'#64748b'}">${storm?'⚡ BÃO LOOP 35k pkts/s':'⛔ ĐÃ SHUTDOWN'}</span>
          <button onclick="loopTogglePort()" style="margin-top:6px;width:100%;background:${storm?'#ef4444':'#334155'};color:#fff;border:0;border-radius:4px;padding:4px;cursor:pointer">
            ${storm?'SHUTDOWN PORT 3':'MỞ LẠI'}</button>
        </div>
        <div style="background:#0f172a;padding:8px;border-radius:6px;border:1px solid ${storm?'#f59e0b':'#22c55e'}">
          <b>Gi0/4</b> · Cáp Loop B<br>
          <span style="color:${storm?'#fbbf24':'#4ade80'}">${storm?'⚠ Nhấp nháy MAC Flap':'● Hoạt động bình thường'}</span>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;background:#080e1a;padding:10px;border-radius:8px;margin-top:6px">
      <div>
        <b>Cơ chế Spanning-Tree & BPDU Guard:</b><br>
        <small style="color:#94a3b8">Tự động ngắt cổng nếu phát hiện gói BPDU loop</small>
      </div>
      <button onclick="loopToggleBPDU()" style="background:${loopState.bpduEnabled?'#22c55e':'#f59e0b'};color:#fff;border:0;border-radius:6px;padding:8px 18px;font-weight:700;cursor:pointer">
        ${loopState.bpduEnabled?'✔ ĐÃ BẬT BPDU GUARD':'BẬT SPANNING-TREE & BPDU GUARD'}</button>
    </div>
    <div style="margin-top:auto;display:flex;justify-content:flex-end;gap:10px">
      <button onclick="loopFinish()" ${safe?'':'disabled'} style="background:${safe?'#22c55e':'#475569'};color:#fff;border:0;border-radius:8px;padding:9px 24px;font-weight:700;cursor:${safe?'pointer':'not-allowed'}">
        HOÀN THÀNH ẢI 3</button>
    </div>`;
}
function loopTogglePort() { loopState.port3Down = !loopState.port3Down; beep(loopState.port3Down?750:350); renderSwitchLoop(); }
function loopToggleBPDU() { loopState.bpduEnabled = true; chord([660, 880, 1100]); renderSwitchLoop(); }
function loopFinish() {
  if (!loopState.port3Down || !loopState.bpduEnabled) return;
  finishMission('socloop', 500, 2000, 'networking', 'Anh Nam', 'Trưởng Ca Trực',
    '🎉 Quá giỏi! Em đã dập tắt bão broadcast và bật BPDU Guard chống loop vĩnh viễn!');
  checkNocSocAllDone();
}

/* ====================================================
   ẢI 4: BÀN CÂN BẰNG TẢI (NOCLOAD) — LOAD BALANCING
   ==================================================== */
let ncState = { algo: 'single', balanced: false, healthCheck: false };
function openNc() {
  closeAll();
  let m = document.getElementById('nc-modal');
  if (!m) {
    m = document.createElement('div'); m.id = 'nc-modal'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  m.style.cssText = 'display:flex;flex-direction:column;gap:10px;position:absolute;inset:30px 60px;transform:none;animation:none;padding:18px 24px;background:linear-gradient(160deg,#0a1324,#050811);border:2px solid #a855f7;border-radius:16px;color:#e2e8f0;font:13px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000c';
  renderNc();
  beep(600);
}
function renderNc() {
  const m = document.getElementById('nc-modal');
  const safe = (ncState.algo === 'rr' || ncState.algo === 'lc') && ncState.balanced && ncState.healthCheck;
  m.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #334155;padding-bottom:8px">
      <b style="font-size:16px;color:#c084fc">⚖️ BÀN 4: HỆ THỐNG CÂN BẰNG TẢI LOAD BALANCER (NOC)</b>
      <button onclick="closeAll()" style="background:#1e293b;color:#fff;border:1px solid #475569;border-radius:6px;padding:3px 10px;cursor:pointer">✕</button>
    </div>
    <div style="background:#111c33;padding:10px 14px;border-radius:8px;border-left:4px solid #a855f7;font-size:12px;line-height:1.5">
      <b>TÌNH HUỐNG:</b> Cụm 3 Server Web đang nghẽn nặng. Node 1 gánh <b>96%</b> tải (sắp sập), trong khi Node 2 và Node 3 chỉ chạy 2%. Hãy đổi thuật toán sang Round Robin và san đều tải cho cả 3 node!
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:6px">
      <div style="background:#080e1a;border:1px solid ${ncState.balanced?'#22c55e':'#ef4444'};border-radius:8px;padding:12px;text-align:center">
        <b>NODE 1 (Web-01)</b><br>
        <span style="font-size:24px;font-weight:700;color:${ncState.balanced?'#4ade80':'#f87171'}">${ncState.balanced?'33%':'96%'}</span>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px">${ncState.balanced?'Ổn định mát mẻ':'Quá nhiệt nghẽn mạng!'}</div>
      </div>
      <div style="background:#080e1a;border:1px solid ${ncState.balanced?'#22c55e':'#38bdf8'};border-radius:8px;padding:12px;text-align:center">
        <b>NODE 2 (Web-02)</b><br>
        <span style="font-size:24px;font-weight:700;color:${ncState.balanced?'#4ade80':'#38bdf8'}">${ncState.balanced?'34%':'2%'}</span>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px">${ncState.balanced?'Ổn định mát mẻ':'Rảnh rỗi phí tài nguyên'}</div>
      </div>
      <div style="background:#080e1a;border:1px solid ${ncState.balanced?'#22c55e':'#38bdf8'};border-radius:8px;padding:12px;text-align:center">
        <b>NODE 3 (Web-03)</b><br>
        <span style="font-size:24px;font-weight:700;color:${ncState.balanced?'#4ade80':'#38bdf8'}">${ncState.balanced?'33%':'2%'}</span>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px">${ncState.balanced?'Ổn định mát mẻ':'Rảnh rỗi phí tài nguyên'}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">
      <div style="background:#080e1a;padding:10px;border-radius:8px">
        <b>1. Chọn Thuật Toán Cân Bằng Tải:</b>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button onclick="ncSetAlgo('rr')" style="flex:1;background:${ncState.algo==='rr'?'#22c55e':'#1e293b'};color:#fff;border:0;border-radius:6px;padding:6px;cursor:pointer;font-weight:700">
            Round Robin</button>
          <button onclick="ncSetAlgo('lc')" style="flex:1;background:${ncState.algo==='lc'?'#22c55e':'#1e293b'};color:#fff;border:0;border-radius:6px;padding:6px;cursor:pointer;font-weight:700">
            Least Conn</button>
        </div>
      </div>
      <div style="background:#080e1a;padding:10px;border-radius:8px">
        <b>2. Phân Bổ Tỷ Trọng & Health Check:</b>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button onclick="ncBalance()" style="flex:1;background:${ncState.balanced?'#22c55e':'#f59e0b'};color:#fff;border:0;border-radius:6px;padding:6px;cursor:pointer;font-weight:700">
            ${ncState.balanced?'✔ ĐÃ CHIA TẢI 33%':'SAN ĐỀU 3 NODE'}</button>
          <button onclick="ncToggleHealth()" style="flex:1;background:${ncState.healthCheck?'#22c55e':'#1e293b'};color:#fff;border:0;border-radius:6px;padding:6px;cursor:pointer;font-weight:700">
            ${ncState.healthCheck?'✔ HEALTH CHECK: OK':'BẬT HEALTH CHECK'}</button>
        </div>
      </div>
    </div>
    <div style="margin-top:auto;display:flex;justify-content:flex-end;gap:10px">
      <button onclick="ncFinish()" ${safe?'':'disabled'} style="background:${safe?'#22c55e':'#475569'};color:#fff;border:0;border-radius:8px;padding:9px 24px;font-weight:700;cursor:${safe?'pointer':'not-allowed'}">
        HOÀN THÀNH ẢI 4</button>
    </div>`;
}
function ncSetAlgo(a) { ncState.algo = a; beep(700); renderNc(); }
function ncBalance() { ncState.balanced = true; chord([660, 880]); renderNc(); }
function ncToggleHealth() { ncState.healthCheck = true; beep(880); renderNc(); }
function ncFinish() {
  if (!ncState.balanced || !ncState.healthCheck) return;
  finishMission('nocload', 500, 2000, 'datacenter', 'Anh Nam', 'Trưởng Ca Trực',
    '🎉 Tuyệt cú mèo! 3 node server đã chia đều tải, SLA dịch vụ đạt 100%!');
  checkNocSocAllDone();
}

/* ====================================================
   🎆 HIỆU ỨNG PHÁO HOA ĂN MỪNG CHỨNG CHỈ
   ==================================================== */
let fwTimer = null;
let fwParticles = [];

function startFireworks() {
  stopFireworks();
  let cv = document.getElementById('fw-cert-canvas');
  if (!cv) {
    cv = document.createElement('canvas');
    cv.id = 'fw-cert-canvas';
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:200';
    document.body.appendChild(cv);
  }
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  const fctx = cv.getContext('2d');
  fwParticles = [];

  function blast(x, y) {
    const colors = ['#facc15', '#f43f5e', '#38bdf8', '#4ade80', '#c084fc', '#fbbf24', '#ffffff'];
    const count = 45 + Math.random() * 30;
    const col = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 7;
      fwParticles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.018,
        color: col,
        size: 2 + Math.random() * 3.5
      });
    }
    if (typeof beep === 'function') beep(500 + Math.random() * 400, 'triangle', 0.09, 0.035);
  }

  // Khởi động 2 quả nổ đầu tiên
  blast(cv.width * 0.25, cv.height * 0.3);
  blast(cv.width * 0.75, cv.height * 0.35);

  let lastTick = Date.now();
  function renderFwLoop() {
    const modal = document.getElementById('ht-cert-modal');
    if (!modal || modal.style.display === 'none') {
      stopFireworks();
      return;
    }
    fctx.clearRect(0, 0, cv.width, cv.height);

    if (Date.now() - lastTick > 380) {
      blast(cv.width * (0.15 + Math.random() * 0.7), cv.height * (0.15 + Math.random() * 0.45));
      lastTick = Date.now();
    }

    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.09; // trọng lực
      p.vx *= 0.98;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        fwParticles.splice(i, 1);
        continue;
      }

      fctx.save();
      fctx.globalAlpha = Math.max(0, p.alpha);
      fctx.fillStyle = p.color;
      fctx.shadowColor = p.color;
      fctx.shadowBlur = 6;
      fctx.beginPath();
      fctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fctx.fill();
      fctx.restore();
    }

    fwTimer = requestAnimationFrame(renderFwLoop);
  }
  fwTimer = requestAnimationFrame(renderFwLoop);
}

function stopFireworks() {
  if (fwTimer) {
    cancelAnimationFrame(fwTimer);
    fwTimer = null;
  }
  const cv = document.getElementById('fw-cert-canvas');
  if (cv) cv.remove();
}

function closeHungThanModal() {
  stopFireworks();
  closeAll();
}

/* ====================================================
   🏆 MODAL CHỨNG CHỈ DANH DỰ: "HUNG THẦN IT"
   ==================================================== */
function openHungThanCert() {
  closeAll();
  addCoin(50000); addXP(500);
  S.title = 'Hung Thần IT';
  saveGame(); syncHUD();
  
  let m = document.getElementById('ht-cert-modal');
  if (!m) {
    m = document.createElement('div'); m.id = 'ht-cert-modal'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  m.style.cssText = 'display:flex !important; flex-direction:column !important; gap:12px !important; position:absolute !important; inset:20px 40px !important; transform:none !important; animation:none !important; padding:20px 28px !important; background:radial-gradient(circle at center, #1e1b4b, #09081a) !important; border:3px solid #facc15 !important; border-radius:20px !important; color:#fff !important; font:13px "Segoe UI",sans-serif !important; z-index:150 !important; box-shadow:0 0 50px rgba(250,204,21,.5), 0 20px 60px #000 !important; overflow:auto !important;';
  
  const d = new Date();
  const dateStr = String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
  
  m.innerHTML = `
    <div style="text-align:center;border:2px dashed rgba(250,204,21,.5);border-radius:14px;padding:20px;background:rgba(0,0,0,.45)">
      <div style="font-size:11px;letter-spacing:2px;color:#fde047">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — NETWORK CITY CYBER COMMAND</div>
      <h1 style="margin:10px 0 4px;font-size:26px;color:#facc15;text-shadow:0 0 16px rgba(250,204,21,.7)">🏆 CHỨNG CHỈ: HUNG THẦN IT 🏆</h1>
      <div style="font-size:13px;color:#93c5fd;font-style:italic">Chứng nhận thành tích đặc biệt xuất sắc trong vận hành An ninh mạng & Điều hành NOC/SOC</div>
      <div style="margin:16px 0;font-size:15px">Trao tặng cho Kỹ sư: <b style="font-size:22px;color:#38bdf8;text-decoration:underline">${S.name || 'Nhân IT'}</b></div>
      <div style="max-width:700px;margin:0 auto;font-size:12.5px;line-height:1.7;color:#e2e8f0;background:rgba(255,255,255,.05);padding:12px;border-radius:8px">
        Đã một mình trấn áp thành công 4 đại sự cố tại Trung Tâm Điều Hành NOC/SOC: 
        Đập tan bão tấn công từ chối dịch vụ (DDoS) bằng Next-Gen Firewall, thanh trừng triệt để mã độc đào coin ẩn, dập tắt bão broadcast loop mạng trên Core Switch, và cân bằng tải hoàn hảo cụm máy chủ doanh nghiệp.
      </div>
      <div style="display:flex;justify-content:space-around;margin-top:20px;align-items:center">
        <div style="text-align:center">
          <div style="font-size:11px;color:#94a3b8">NGÀY CẤP: ${dateStr}</div>
          <b style="color:#fde047">Anh Nam</b><br><small style="color:#94a3b8">Trưởng Ca Trực NOC/SOC</small>
        </div>
        <div style="width:72px;height:72px;border-radius:50%;border:2px solid #ef4444;background:rgba(239,68,68,.2);display:flex;align-items:center;justify-content:center;color:#ef4444;font-weight:900;font-size:10px;text-align:center;line-height:1.2;transform:rotate(-12deg)">
          ĐÃ DUYỆT<br>★ NOC/SOC ★
        </div>
        <div style="text-align:center">
          <div style="font-size:11px;color:#94a3b8">DANH HIỆU MỚI: HUNG THẦN IT</div>
          <b style="color:#fde047">Chị Lan</b><br><small style="color:#94a3b8">Giám Đốc Vận Hành</small>
        </div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
      <span style="color:#4ade80;font-weight:700;font-size:14px">🎁 PHẦN THƯỞNG: +50,000 Coin · +500 XP · Danh hiệu HUNG THẦN IT</span>
      <div style="display:flex;gap:10px">
        <button onclick="downloadHungThanPNG()" style="background:#0284c7;color:#fff;border:0;border-radius:8px;padding:9px 18px;font-weight:700;cursor:pointer">
          ⬇️ TẢI CHỨNG CHỈ VỀ MÁY</button>
        <button onclick="closeHungThanModal()" style="background:#22c55e;color:#051205;border:0;border-radius:8px;padding:9px 24px;font-weight:800;cursor:pointer">
          🎉 NHẬN THƯỞNG & ĐÓNG</button>
      </div>
    </div>`;
  
  // Bắn pháo hoa và phát nhạc khải hoàn
  startFireworks();
  chord([523, 659, 784, 1046, 1318]);
}

function downloadHungThanPNG() {
  const c = document.createElement('canvas');
  c.width = 960; c.height = 600;
  const g = c.getContext('2d');
  
  // Background
  const grd = g.createRadialGradient(480, 300, 50, 480, 300, 550);
  grd.addColorStop(0, '#1e1b4b'); grd.addColorStop(1, '#09081a');
  g.fillStyle = grd; g.fillRect(0, 0, 960, 600);
  
  // Golden border
  g.strokeStyle = '#facc15'; g.lineWidth = 6;
  g.strokeRect(20, 20, 920, 560);
  g.strokeStyle = 'rgba(250,204,21,.4)'; g.lineWidth = 2;
  g.strokeRect(30, 30, 900, 540);
  
  // Texts
  g.fillStyle = '#fde047'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center';
  g.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM — NETWORK CITY CYBER COMMAND', 480, 65);
  
  g.fillStyle = '#facc15'; g.font = 'bold 32px sans-serif';
  g.fillText('CHỨNG CHỈ: HUNG THẦN IT', 480, 125);
  
  g.fillStyle = '#93c5fd'; g.font = 'italic 15px sans-serif';
  g.fillText('Chứng nhận thành tích đặc biệt xuất sắc trong vận hành An ninh mạng & NOC/SOC', 480, 165);
  
  g.fillStyle = '#fff'; g.font = '18px sans-serif';
  g.fillText('Trao tặng cho Kỹ sư:', 480, 220);
  
  g.fillStyle = '#38bdf8'; g.font = 'bold 28px sans-serif';
  g.fillText(S.name || 'Nhân IT', 480, 260);
  
  g.fillStyle = '#cbd5e1'; g.font = '14px sans-serif';
  g.fillText('Đã hoàn thành xuất sắc 4 đại sự cố tại Trung Tâm Điều Hành Mạng & An Ninh Mạng (NOC/SOC):', 480, 310);
  g.fillText('1. Chặn đứng cuộc tấn công DDoS botnet và đóng các cổng nguy hiểm bằng Next-Gen Firewall.', 480, 340);
  g.fillText('2. Thanh trừng mã độc đào Monero ẩn và cách ly hoàn toàn tiến trình độc hại.', 480, 365);
  g.fillText('3. Dập tắt bão Broadcast Loop trên Core Switch và kích hoạt BPDU Guard bảo vệ.', 480, 390);
  g.fillText('4. Tái cấu trúc cân bằng tải Round Robin đưa cụm 3 máy chủ về 100% SLA.', 480, 415);
  
  // Signatures
  g.fillStyle = '#facc15'; g.font = 'bold 16px sans-serif';
  g.fillText('Anh Nam', 220, 500);
  g.fillText('Chị Lan', 740, 500);
  g.fillStyle = '#94a3b8'; g.font = '12px sans-serif';
  g.fillText('Trưởng Ca Trực NOC/SOC', 220, 525);
  g.fillText('Giám Đốc Vận Hành', 740, 525);
  
  // Seal
  g.save(); g.translate(480, 490); g.rotate(-0.2);
  g.strokeStyle = '#ef4444'; g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, 40, 0, 7); g.stroke();
  g.fillStyle = 'rgba(239,68,68,.15)'; g.fill();
  g.fillStyle = '#ef4444'; g.font = 'bold 11px sans-serif';
  g.fillText('ĐÃ PHÊ DUYỆT', 0, -6);
  g.fillText('★ NOC/SOC ★', 0, 12);
  g.restore();
  
  const a = document.createElement('a');
  a.href = c.toDataURL('image/png');
  a.download = 'chung-chi-hung-than-it.png';
  a.click();
  showToast('⬇️ Đã lưu chứng chỉ chung-chi-hung-than-it.png về máy!');
}

/* ====================================================
   🔊 BỘ THƯ VIỆN ÂM THANH SCI-FI & RETRO (WEB AUDIO SFX)
   ==================================================== */
function sfxCoin() {
  if (!soundOn) return;
  try {
    const a = getAC();
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(987.77, now); // B5
    o.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    o.connect(g); g.connect(a.destination);
    o.start(now); o.stop(now + 0.35);
  } catch(e){}
}

function sfxAlarm() {
  if (!soundOn) return;
  try {
    const a = getAC();
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(440, now);
    o.frequency.linearRampToValueAtTime(880, now + 0.15);
    o.frequency.linearRampToValueAtTime(440, now + 0.3);
    g.gain.setValueAtTime(0.03, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    o.connect(g); g.connect(a.destination);
    o.start(now); o.stop(now + 0.32);
  } catch(e){}
}

function sfxZap() {
  if (!soundOn) return;
  try {
    const a = getAC();
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(120, now);
    o.frequency.exponentialRampToValueAtTime(30, now + 0.12);
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.connect(g); g.connect(a.destination);
    o.start(now); o.stop(now + 0.12);
  } catch(e){}
}

function sfxClick() {
  if (!soundOn) return;
  try {
    const a = getAC();
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(1200, now);
    g.gain.setValueAtTime(0.02, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    o.connect(g); g.connect(a.destination);
    o.start(now); o.stop(now + 0.04);
  } catch(e){}
}

function sfxBuzz() {
  if (!soundOn) return;
  try {
    const a = getAC();
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(130, now);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    o.connect(g); g.connect(a.destination);
    o.start(now); o.stop(now + 0.22);
  } catch(e){}
}

function sfxFanfare() {
  if (!soundOn) return;
  const notes = [523.25, 659.25, 783.99, 1046.50, 987.77, 1318.51];
  notes.forEach((f, idx) => {
    setTimeout(() => {
      try {
        const a = getAC();
        const now = a.currentTime;
        const o = a.createOscillator(), g = a.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        o.connect(g); g.connect(a.destination);
        o.start(now); o.stop(now + 0.35);
      } catch(e){}
    }, idx * 110);
  });
}

/* ====================================================
   ✨ HIỆU ỨNG THỊ GIÁC: CHỮ NỔI (FLOAT TEXT) & RUNG MÀN HÌNH
   ==================================================== */
let floatingTexts = [];
let shakeFrames = 0;
let shakePower = 0;

function showFloatText(txt, color = '#facc15', x = S.p.x + 10, y = S.p.y - 20) {
  floatingTexts.push({
    txt: txt,
    color: color,
    x: x,
    y: y,
    alpha: 1,
    vy: -1.2,
    life: 55
  });
}

function triggerShake(frames = 10, power = 4) {
  shakeFrames = frames;
  shakePower = power;
}

// Móc vào vòng render để hiển thị chữ nổi và rung camera
const _origRenderFX = render;
render = function() {
  if (shakeFrames > 0) {
    const rx = (Math.random() - 0.5) * shakePower;
    const ry = (Math.random() - 0.5) * shakePower;
    ctx.save();
    ctx.translate(rx, ry);
    _origRenderFX();
    ctx.restore();
    shakeFrames--;
  } else {
    _origRenderFX();
  }

  // Cập nhật và vẽ các dòng chữ nổi bay lên
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= 1 / ft.life;

    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(ft.txt, ft.x + 1, ft.y + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.txt, ft.x, ft.y);
    ctx.restore();
  }
};

// Móc vào hàm cộng Coin/XP để tự động bật âm thanh và chữ nổi
const _origAddCoinFX = addCoin;
addCoin = function(n) {
  _origAddCoinFX(n);
  if (n > 0) {
    sfxCoin();
    showFloatText('+' + n.toLocaleString() + ' Coin 🪙', '#facc15');
  }
};

const _origAddXPFX = addXP;
addXP = function(n) {
  _origAddXPFX(n);
  if (n > 0) {
    showFloatText('+' + n + ' XP ⭐', '#38bdf8', S.p.x + 10, S.p.y - 36);
  }
};

