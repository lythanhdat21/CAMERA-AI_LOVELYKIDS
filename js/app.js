/* Website mã nhãn & IP thiết bị trên mặt bằng – dự án CAMERA-AI LovelyKids (bản chính thức, bước 3).
   Thiết kế đã duyệt ở bước 1–2: nền tối #1f242d, KHÔNG hiệu ứng chuyển động; mọi thay đổi hiện ngay.
   Dữ liệu: js/data.js (window.DATA) – tạo bằng script xuất bản của dự án (xuat_ban_website.py), không sửa tay.

   - Tổng quan: số liệu, bảng theo khu vực, cách xem, cách đọc mã nhãn.
   - 4 tab mặt bằng dùng chung một khung: Camera (mã + IP), Control, Ổ cắm & tủ điện, TEL-DATA & Wi-Fi (chỉ mã):
     - Rê chuột vào thiết bị: phóng to ký hiệu + mã (+ IP). Click / chạm: giữ phóng to 5 giây, đếm ngược từng giây.
     - Lăn chuột / kéo: xem bản vẽ. Điện thoại: kéo 1 ngón, chụm 2 ngón để phóng to. Bản đồ nhỏ: tới vị trí.
     - Nút +: mở/đóng chú giải. Nút ⋮⋮⋮: mở/đóng hình thiết bị (ảnh sản phẩm / ký hiệu, mã chữ vàng, số lượng);
       chọn hình rồi bấm × thì mặt bằng chỉ còn các loại đã chọn, bấm ⋮⋮⋮ lần nữa thì hiện lại tất cả.
       Điện thoại: giữ và kéo từng nút sang chỗ khác (nhớ vị trí trên máy người xem).
   - Tìm mã/IP trên cả 4 bộ mặt bằng (↑ ↓ Enter).
   - Tải về: 7 file. Lưu ý: các điểm còn thiếu / chênh lệch / cần xác minh.

   Địa chỉ trang (gửi link cho đối tác):
     #tong-quan · #camera · #camera/2 (mặt bằng thứ 2 trong danh sách) · #tai-ve · #luu-y · #ma=T1-CH01 (mở đúng thiết bị)
   Phím tắt (máy tính): A / D – sang tab bên trái / bên phải; W / S – lên / xuống mặt bằng; đều chạy vòng.
   Tham số chụp ảnh kiểm tra: ?demo=phim&phim=D,S (giả lập nhấn phím) · ?demo=legend (mở chú giải) · ?demo=hinh (mở hình thiết bị)
   · ?demo=chon&chon=CN2,NG (đã chọn hình) · ?demo=loc&chon=CN2,NG (đã bấm ×, đang lọc) · ?demo=keo-hinh (giả lập kéo nút ⋮⋮⋮)
   · ?demo=search&q=<chuỗi> (danh sách gợi ý)
   · ?demo=xem-tu&tu=<mã tủ>&pad=<hệ số> (phóng quanh tủ + bảng IP, không mở khung tủ)
   Bảng IP cạnh tủ: chủ dự án duyệt 17/11/2026 phương án "mọi thiết bị có IP trong tủ" (PA2, docs 2026-11-17_09). */
(() => {
  "use strict";
  const D = window.DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const MB = D.mat_bang;
  const LOGO = "assets/logo.png";            // logo bản sáng cho nền tối (tạo từ logo gốc)
  const PLAN_TABS = ["camera", "control", "ocam", "tel"];
  const INFO = {
    camera: { ten: "Camera", dv: "camera" },
    control: { ten: "Control", dv: "thiết bị" },
    ocam: { ten: "Ổ cắm & tủ điện", dv: "thiết bị" },
    tel: { ten: "TEL-DATA & Wi-Fi", dv: "điểm" },
  };
  const soTb = (p) => p.items.filter((i) => i.loai !== "RK").length;   // thiết bị trên mặt bằng, không tính tủ rack
  const isTrunking = (p) => p.nhom_trang.startsWith("Mặt bằng trunking");

  /* ================= biểu tượng ================= */
  const ICON = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
    camera: '<rect x="3" y="7" width="13" height="10" rx="2.5"/><path d="m16 11 5-3v8l-5-3"/><circle cx="9.5" cy="12" r="2.2"/>',
    control: '<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="16" cy="12" r="3"/>',
    ocam: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9.5 9.5v3M14.5 9.5v3M12 15.5v.5"/>',
    tel: '<path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a5.5 5.5 0 0 1 8 0"/><circle cx="12" cy="18.5" r="1"/><path d="M2 9.5a14.5 14.5 0 0 1 20 0"/>',
    dl: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
    note: '<path d="M12 3.5 22 20H2z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  };
  const icon = (k, size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  /* ================= header + tab ================= */
  const TABS = [
    ["tong-quan", "Tổng quan", "home"],
    ["camera", "Camera", "camera", D.tabs.camera.so],
    ["control", "Control", "control", D.tabs.control.so],
    ["ocam", "Ổ cắm & tủ điện", "ocam", D.tabs.ocam.so],
    ["tel", "TEL-DATA & Wi-Fi", "tel", D.tabs.tel.so],
    ["tai-ve", "Tải về", "dl"],
    ["luu-y", "Lưu ý", "note", 0, true],
  ];
  const TAB_IDS = TABS.map((t) => t[0]);
  $("#hdr").innerHTML = `
    <div class="top" id="top"><div class="top-in">
      <img class="logo" src="${LOGO}" alt="CAMERA AI LOVELYKIDS">
      <div class="sep"></div>
      <div class="title"><h1>Mã nhãn &amp; địa chỉ IP thiết bị trên mặt bằng</h1>
        <div class="sub">Dự án CAMERA-AI LovelyKids · Dữ liệu cập nhật ${D.ngay}</div></div>
      <button class="s-btn" id="s-btn" type="button" aria-label="Tìm mã nhãn hoặc IP">${icon("search", 19)}</button>
      <div class="search">${icon("search", 17)}
        <input type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" aria-label="Tìm mã nhãn hoặc IP"
          placeholder="Tìm mã nhãn hoặc IP – ví dụ T1-CH01, 10.10.1.61"></div>
    </div></div>
    <nav class="tabs" aria-label="Nội dung"><div class="tabs-in">
      ${TABS.map(([id, name, ic, cnt, dot]) => `<a class="tab${id === "tai-ve" ? " right" : ""}" href="#${id}" data-id="${id}">${icon(ic, 17)}${name}${
        cnt ? `<span class="chip num">${cnt}</span>` : ""}${dot ? '<span class="dot" aria-hidden="true"></span>' : ""}</a>`).join("")}
    </div></nav>`;
  $$("img[data-logo]").forEach((i) => (i.src = LOGO));

  let curTab = null, planTab = null;
  const lastPage = { camera: 1, control: 1, ocam: 0, tel: 1 };   // mở sẵn Tầng 1 (ổ cắm: Tầng 1 + Phòng bảo vệ ở vị trí 0 sau khi sắp xếp)
  for (const t of PLAN_TABS) {
    const i = MB[t].findIndex((p) => p.khu_vuc.startsWith("Tầng 1"));
    if (i >= 0) lastPage[t] = i;
  }

  function setHash() {
    const h = PLAN_TABS.includes(curTab) ? `#${curTab}/${cur + 1}` : `#${curTab}`;
    if (location.hash !== h) history.replaceState(null, "", h);
  }
  function showTab(id) {
    curTab = id;
    $$(".tab").forEach((t) => {
      t.classList.toggle("on", t.dataset.id === id);
      if (t.dataset.id === id) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    const pane = PLAN_TABS.includes(id) ? "v-mat-bang" : `v-${id}`;
    $$(".view-pane").forEach((p) => (p.hidden = p.id !== pane));
    if (PLAN_TABS.includes(id)) {
      if (planTab !== id) openPlanTab(id);
      else if (cur !== lastPage[id]) loadPlan(lastPage[id]);
      else { apply(); placeAll(); }
    } else {
      closeLens();
    }
    const on = $(".tab.on");
    if (on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
    setHash();
  }
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.toLowerCase().startsWith("ma=")) {
      const q = h.slice(3).trim().toLowerCase();
      const x = ALL.find((a) => a.ma.toLowerCase() === q || (a.ip && a.ip === q));
      if (x) { go(x); return; }
    }
    const [id, n] = h.split("/");
    const tab = TAB_IDS.includes(id) ? id : "tong-quan";
    if (PLAN_TABS.includes(tab) && n && +n >= 1 && +n <= MB[tab].length) lastPage[tab] = +n - 1;
    showTab(tab);
  }

  /* ================= Tổng quan ================= */
  function renderOverview() {
    const cols = PLAN_TABS;
    const sum = (r) => cols.reduce((s, c) => s + r[c], 0);
    const tot = Object.fromEntries(cols.map((c) => [c, D.khu_vuc.reduce((s, r) => s + r[c], 0)]));
    const pages = cols.reduce((s, t) => s + D.tabs[t].trang, 0);
    $("#ov").innerHTML = `
    <section class="hero">
      <div><h2>Mã nhãn và địa chỉ IP của ${D.tong} thiết bị</h2>
        <p>Trang này thay cho bộ bản vẽ PDF. Chọn một tab để xem từng mặt bằng: mỗi thiết bị có ký hiệu, mã nhãn và
        địa chỉ IP (nếu đã có) ngay cạnh vị trí lắp. Rê chuột hoặc chạm vào thiết bị để phóng to.</p></div>
      <div class="meta"><span class="pill">Cập nhật <b>${D.ngay}</b></span>
        <span class="pill"><b>4</b> bộ mặt bằng · <b>${pages}</b> trang</span></div>
    </section>
    <section class="cards">${cols.map((t) => {
      const x = D.tabs[t];
      const ip = (x.co_ip ? `<span class="tag ok">${x.co_ip}/${x.so} có IP</span>` : `<span class="tag no">${x.ip_tu ? "Điểm trên mặt bằng: chưa có IP" : "Chỉ mã nhãn – chưa có IP"}</span>`)
        + (x.ip_tu ? ` <span class="tag ok">${x.ip_tu} thiết bị trong tủ có IP</span>` : "");
      return `<a class="card ${t}" href="#${t}">
        <div class="head"><span class="ico">${icon(t, 19)}</span>${INFO[t].ten}</div>
        <div class="big num">${x.so}</div><div class="unit">${INFO[t].dv} · ${x.trang} trang mặt bằng</div>
        <ul>${x.nhom.map(([n, v]) => `<li><b class="num">${v}</b> ${esc(n)}</li>`).join("")}</ul>
        <div>${ip}</div><div class="go">Xem mặt bằng →</div></a>`;
    }).join("")}</section>
    <section class="grid2">
      <div class="panel"><h3>Số thiết bị theo khu vực</h3><div class="tbl-wrap">
        <table class="t num"><tr><th>Khu vực</th><th>Camera</th><th>Control</th><th>Ổ cắm &amp; tủ điện</th>
          <th>TEL-DATA &amp; Wi-Fi</th><th>Tổng</th></tr>
        ${D.khu_vuc.map((r) => `<tr><td>${esc(r.khu_vuc)}</td>${cols.map((c) => (r[c] ? `<td>${r[c]}</td>` : `<td class="z">–</td>`)).join("")}
          <td><b>${sum(r)}</b></td></tr>`).join("")}
        <tr class="sum"><td>Tổng</td>${cols.map((c) => `<td>${tot[c]}</td>`).join("")}<td>${sum(tot)}</td></tr></table></div>
      </div>
      <div class="panel"><h3>Cách xem mặt bằng</h3><div class="howto">
        ${[["Chọn tab và mặt bằng.", "Mỗi tab là một bộ bản vẽ; danh sách mặt bằng nằm bên trái (trên điện thoại: ô chọn phía trên bản vẽ). Hai nút bên phải mặt bằng: <span class='ib lg'>+</span> mở chú giải, <span class='ib hinh'>" + DOTS + "</span> mở hình thiết bị.<span class='chi-pc'> Phím <kbd>A</kbd> / <kbd>D</kbd>: sang tab bên trái / bên phải; <kbd>W</kbd> / <kbd>S</kbd>: lên / xuống mặt bằng trong danh sách.</span>"],
           ["Rê chuột vào thiết bị", "để phóng to ký hiệu, mã nhãn và IP. <b>Click (hoặc chạm)</b> để giữ phóng to trong 5 giây."],
           ["Tìm nhanh", "bằng ô tìm kiếm phía trên: gõ mã nhãn hoặc IP, trang sẽ mở đúng mặt bằng và chỉ vào thiết bị."],
           ["Lăn chuột để phóng to cả bản vẽ, kéo để di chuyển.", "Trên điện thoại: chụm hai ngón để phóng to. Khung nhỏ ở góc cho biết đang xem phần nào."]]
          .map(([b, t], k) => `<div class="step"><span class="n">${k + 1}</span><div><b>${b}</b> ${t}</div></div>`).join("")}
      </div>
      <div class="decode">
        <div class="demo"><div class="lbl"><b>T1-CH01</b><span>10.10.1.61</span></div></div>
        <div><div class="codeparts"><span class="a">T1</span>-<span class="b">CH</span><span class="c">01</span></div>
          <ul><li><i style="background:var(--code-a)"></i>Khu vực: T1 = Tầng 1</li>
            <li><i style="background:var(--code-b)"></i>Loại thiết bị theo ký hiệu bản vẽ</li>
            <li><i style="background:var(--code-c)"></i>Số thứ tự trong khu vực</li></ul></div>
        <p class="note">Mọi thiết bị dùng chung cách ghi: <b>T1-CH01</b> = camera nhiệt (CH) số 01 ở Tầng 1; <b>T2-SW03</b> = công tắc số 03 ở Tầng 2. Mã loại camera: <b>CC</b> bán cầu AI · <b>CR</b> trụ · <b>CD</b> bán cầu 2MP · <b>CH</b> nhiệt · <b>CX</b> xoay (PTZ). Thiết bị ngoài camera hiện chỉ có mã nhãn.</p>
      </div></div>
    </section>`;
  }

  /* ================= Tải về ================= */
  const size = (kb) => (kb >= 1024 ? (kb / 1024).toFixed(1).replace(".", ",") + " MB" : kb + " KB");
  function renderDownloads() {
    $("#dl").innerHTML = `
    <section class="hero"><div><h2>Tải về</h2>
      <p>Bản vẽ PDF, bảng dữ liệu Excel và báo cáo đối chiếu của dự án, dùng khi cần in, lưu trữ hoặc lọc dữ liệu.</p></div></section>
    ${D.tai_ve.map((g) => `<h3 class="dl-h">${esc(g.nhom)}</h3><div class="dl-grid">
      ${g.files.map((f) => `<div class="dl-card">
        <div class="dl-ico ${f.loai.toLowerCase()}">${f.loai}</div>
        <div class="dl-body"><b>${esc(f.ten)}</b><p>${esc(f.mo_ta)}</p>
          <div class="dl-meta"><span>${esc(f.file)}</span>${f.trang ? `<span>${f.trang} trang</span>` : ""}${
            f.sheet ? `<span>${f.sheet.length} sheet</span>` : ""}<span>${size(f.kb)}</span></div></div>
        <a class="btn pri dl-btn" href="${esc(f.href)}" download>${icon("dl", 16)} Tải về</a></div>`).join("")}</div>`).join("")}`;
  }

  /* ================= Lưu ý ================= */
  const LY_ICON = { "chua-lam": "note", thieu: "search", chenh: "ocam", "xung-dot": "note" };
  function renderNotes() {
    $("#ly").innerHTML = `
    <section class="hero"><div><h2>Lưu ý</h2>
      <p>Các điểm còn thiếu, chênh lệch hoặc cần xác minh tính đến ${D.ngay}. Mã và số lượng của các thiết bị
      trong những mục này có thể thay đổi sau khi được xác nhận.</p></div></section>
    <div class="ly-ok">✓ ${esc(D.luu_y_camera)}</div>
    <div class="ly-chips">${D.luu_y.map((s) => `<button type="button" class="ly-chip ${s.loai}" data-to="ly-${s.loai}">
      <b class="num">${s.y.length}</b>${esc(s.tieu_de)}</button>`).join("")}</div>
    <div class="ly-grid">${D.luu_y.map((s) => `<section class="ly-sec ${s.loai}" id="ly-${s.loai}">
      <h3><span class="ly-ico">${icon(LY_ICON[s.loai], 17)}</span>${esc(s.tieu_de)}<span class="num">${s.y.length}</span></h3>
      <ul>${s.y.map(([b, t]) => `<li><b>${esc(b)}:</b> ${esc(t)}</li>`).join("")}</ul></section>`).join("")}</div>
    <p class="ly-src">Nguồn: báo cáo ${esc(D.luu_y_nguon)}. Bản đầy đủ ở tab <a href="#tai-ve">Tải về</a>.</p>`;
    $$(".ly-chip").forEach((c) => c.addEventListener("click", () => $("#" + c.dataset.to).scrollIntoView({ block: "start" })));
  }

  /* ================= nội dung khung mặt bằng ================= */
  /* Dải ảnh thiết bị của trang: ảnh sản phẩm (camera, control) hoặc ô ký hiệu cắt từ bản vẽ A3 (g.ky_hieu),
     mã chữ vàng, số lượng trên mặt bằng đang xem. Control: dải ảnh ghi mã bản vẽ (KG2…), nhãn ghi mã loại → "Nhãn: …-SW". */
  function renderStrip(el, plan) {
    el.innerHTML = `<div class="stp-h"><span>Hình thiết bị · ${esc(plan.khu_vuc)}</span>
      <em>Chọn hình để lọc, rồi bấm <b>×</b> để xem trên mặt bằng</em></div><div class="stp-row">` + plan.dai_anh.map((g) => `
      <div class="sg"><div class="sg-h">${esc(g.nhom)}<span class="num">${g.tong}</span></div><div class="sg-row">
        ${g.items.map((i) => `<div class="st${g.ky_hieu ? " kh" : ""}${chon.has(i.ma) ? " chon" : ""}" data-ma="${esc(i.ma)}"
          role="button" tabindex="0" aria-pressed="${chon.has(i.ma)}" title="${esc(i.ten)} (${esc(i.model)})">
          <div class="st-img"><img src="${i.anh}" alt="${esc(i.ma)}"></div>
          <div class="st-ma">${esc(i.ma)}</div><div class="st-sl">Số lượng: <b class="num">${i.sl}</b></div>
          ${i.ma_nhan && i.ma_nhan !== i.ma ? `<div class="st-nh">Nhãn: …-${esc(i.ma_nhan)}</div>` : ""}</div>`).join("")}
      </div></div>`).join("") + "</div>";
  }
  /* Nhãn trên mặt bằng: camera có mã + IP; thiết bị khác chỉ có mã (cỡ chữ theo bản vẽ, plan.fs). */
  function labelHtml(plan, it, style, attr = "") {
    return it.ip
      ? `<div class="lbl"${attr} style="${style}"><b>${it.ma}</b><span>${it.ip}</span></div>`
      : `<div class="lbl lbl1"${attr} style="--fs:${plan.fs}px;${style}"><b>${it.ma}</b></div>`;
  }
  /* Ký hiệu trong chú giải: tròn / chữ nhật / thoi (màu lấy mẫu từ bản vẽ) hoặc ảnh ký hiệu cắt từ bản vẽ A3. */
  function legendSym(i) {
    if (i.hinh === "anh") return `<span class="sym anh"><img src="${i.anh}" alt="${esc(i.ma)}"></span>`;
    const st = `background:${i.mau};color:${i.chu}`;
    return i.hinh === "thoi"
      ? `<span class="sym thoi" style="${st}"><i>${esc(i.ma)}</i></span>`
      : `<span class="sym ${i.hinh}" style="${st}">${esc(i.ma)}</span>`;
  }
  function renderLegend(el, plan) {
    el.innerHTML = `<div class="lgp-h">Chú giải · ${esc(plan.khu_vuc)}</div>` + plan.chu_giai.map((g) => `
      <div class="lgp-g">${esc(g.nhom)} <span class="num">(${g.tong})</span></div>
      ${g.items.map((i) => `<div class="lgp-i">${legendSym(i)}
        <div class="lgp-t">${i.hinh === "anh" ? `<em>${esc(i.ma)}</em> ` : ""}${esc(i.ten)}<small>${esc(i.model)}</small></div>
        <b class="num">${i.sl}</b></div>`).join("")}`).join("");
  }

  /* ================= mặt bằng (dùng chung 4 tab) ================= */
  const cv = $("#cv");
  let PLANS = null, P = null, cur = -1, stage = null;
  const view = { tx: 0, ty: 0, z: 1 };
  const MAX_Z = 8;

  let lblBase = "";
  function openPlanTab(id) {
    planTab = id;
    PLANS = MB[id];
    const pdf = $("#pdf");
    pdf.href = D.tabs[id].pdf;
    pdf.innerHTML = icon("dl", 16) + " Tải PDF";
    $("#fit").innerHTML = `<span>Vừa màn hình</span>${icon("fit", 18)}`;
    lblBase = id === "camera"
      ? `<div class="lbl"><b>Mã nhãn</b><span>Địa chỉ IP</span></div> nhãn thiết bị`
      : `<div class="lbl lbl1" style="--fs:13px"><b>Mã nhãn</b></div> nhãn thiết bị (chưa có IP)`;
    let grp = null, og = null;
    $("#floors").innerHTML = PLANS.map((p, i) => {
      const h = p.nhom_trang && p.nhom_trang !== grp ? `<h5>${esc((grp = p.nhom_trang))}</h5>` : "";
      return `${h}<button type="button" class="floor" data-i="${i}"><span>${esc(p.khu_vuc)}</span><span class="c num">${soTb(p)}</span></button>`;
    }).join("");
    $("#floor-sel").innerHTML = PLANS.map((p, i) => {
      let h = "";
      if (p.nhom_trang && p.nhom_trang !== og) { h = (og ? "</optgroup>" : "") + `<optgroup label="${esc((og = p.nhom_trang))}">`; }
      return `${h}<option value="${i}">${esc(p.khu_vuc)}${isTrunking(p) ? " (trunking)" : ""} · ${soTb(p)} ${INFO[id].dv}</option>`;
    }).join("") + (og ? "</optgroup>" : "");
    $$(".floor").forEach((f) => f.addEventListener("click", () => { loadPlan(+f.dataset.i); setHash(); }));
    if (!stp.hidden) { chon.clear(); setPanel(FLOAT[1], false); }   // đổi tab: bỏ các hình đang chọn dở của tab trước
    cur = -1;
    loadPlan(clamp(lastPage[id], 0, PLANS.length - 1));
  }
  $("#floor-sel").addEventListener("change", (e) => { loadPlan(+e.target.value); setHash(); e.target.blur(); });

  function loadPlan(idx) {
    closeLens();
    cur = idx; P = PLANS[idx]; lastPage[planTab] = idx;
    $$(".floor").forEach((f) => f.classList.toggle("on", +f.dataset.i === idx));
    $("#floor-sel").value = String(idx);
    $("#crumb").innerHTML = `${esc(INFO[planTab].ten)} <span>›</span> ${esc(P.khu_vuc)}${isTrunking(P) ? " <span>· trunking</span>" : ""}`;
    closeRack();
    const n = soTb(P), nip = P.items.filter((i) => i.ip).length, nr = P.items.length - n;
    const ipTu = P.items.filter((i) => i.loai === "RK" && TU[i.ma]).reduce((s, i) => s + tbCoIp(TU[i.ma]).length, 0);
    $("#count").textContent = (nip ? `${n} ${INFO[planTab].dv} · ${nip} có IP` : `${n} ${INFO[planTab].dv} · chưa có IP`)
      + (nr ? ` · ${nr} tủ rack` + (ipTu ? ` (${ipTu} IP trong tủ)` : "") : "");
    renderStrip(stp, P);
    renderLegend(lgp, P);
    if (stage) stage.remove();
    stage = document.createElement("div");
    stage.className = "stage";
    stage.style.width = P.w + "px";
    stage.style.height = P.h + "px";
    const lw = Math.max(0.3, P.fs * 0.09);
    let h = `<div class="bg" style="background-image:url(${P.img})"></div>
      <div class="clip" style="left:${P.clip_x1}px"></div><div class="loc-layer"></div><svg width="${P.w}" height="${P.h}">`;
    P.items.forEach((it, i) => {
      const [a, b] = it.leader;
      h += `<g data-i="${i}"><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke-width:${lw}"/><circle cx="${a[0]}" cy="${a[1]}" r="${lw * 2}"/></g>`;
    });
    h += `</svg>`;
    P.items.forEach((it) => {
      if (it.khung) { const s = it.sym_box; h += `<div class="rk-vung" style="left:${s[0]}px;top:${s[1]}px;width:${s[2] - s[0]}px;height:${s[3] - s[1]}px"></div>`; }
    });
    P.items.forEach((it, i) => {
      const [x0, y0, x1, y1] = it.label_box, s = it.sym_box, m = Math.max(1, P.fs * 0.25);
      h += labelHtml(P, it, `left:${(x0 + x1) / 2}px;top:${(y0 + y1) / 2}px`, ` data-i="${i}"`) +
        `<div class="hit" data-i="${i}" style="left:${s[0] - m}px;top:${s[1] - m}px;width:${s[2] - s[0] + 2 * m}px;height:${s[3] - s[1] + 2 * m}px"></div>
         <div class="hit" data-i="${i}" style="left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px"></div>`;
    });
    stage.innerHTML = h;
    cv.prepend(stage);
    const nBang = bangIpTu();
    $("#lbl-demo").innerHTML = `<div class="lbl-demo-r">${lblBase}</div>` + (nBang ? `<div class="lbl-demo-r"><div class="ip-tu mau" style="--fs:12px"><div class="h">Trong tủ</div>
      <div class="r"><i class="proc"></i><b>Mã nhãn</b><span>Địa chỉ IP</span></div></div> IP thiết bị trong tủ rack</div>` : "");
    $$(".hit", stage).forEach((el) => {
      el.addEventListener("mouseenter", () => { if (!(gest && gest.moved)) { clearTimeout(closeT); openLens(+el.dataset.i, false); } });
      el.addEventListener("mouseleave", scheduleClose);
    });
    $("#mini").innerHTML = `<img src="${P.mini}" alt=""><div class="vp"></div>`;
    applyFilter();
    fit();
    placeAll();
  }

  /* ================= bảng IP thiết bị trong tủ rack, đặt cạnh tủ trên mặt bằng (17/11/2026) =================
     Thiết bị trong tủ không có ký hiệu riêng trên mặt bằng (hoặc ký hiệu không có nhãn), nên IP được gom thành một bảng nhỏ
     nối với nhãn tủ bằng dây dẫn. Cỡ chữ theo nhãn của bản vẽ (P.fs), phóng to cùng mặt bằng. Chọn chỗ đặt: thử các vị trí
     quanh tủ, lấy chỗ ít đè nhãn / ký hiệu nhất, trong phần bản vẽ (không chạm khung chú giải). Click bảng → mở khung tủ. */
  function tbCoIp(R) {                      // thiết bị trong tủ có IP (PA2 – chủ dự án duyệt 17/11/2026); Processor đứng trước
    const xs = [...R.units, ...R.ngoai_u].filter((x) => x.ma && x.ip);
    return xs.sort((a, b) => (a.nhom === "proc" ? 0 : 1) - (b.nhom === "proc" ? 0 : 1));
  }
  function bangIpTu() {
    let so = 0;
    const svg = $("svg", stage), obs = [];
    const nong = (b, m) => [b[0] - m, b[1] - m, b[2] + m, b[3] + m];          // chừa khoảng cách quanh vật cản
    P.items.forEach((it) => { obs.push(nong(it.label_box, P.fs * 0.4), nong(it.sym_box, P.fs * 0.4)); });
    (P.phu || []).forEach((x) => obs.push(nong(x.box, P.fs * 0.4)));
    const placed = [];
    P.items.forEach((it, i) => {
      const R = it.loai === "RK" && TU[it.ma];
      const xs = R ? tbCoIp(R) : [];
      if (!xs.length) return;
      const el = document.createElement("div");
      el.className = "ip-tu";
      el.dataset.i = i;
      el.style.setProperty("--fs", P.fs + "px");
      el.innerHTML = `<div class="h">Trong tủ ${esc(R.ma)}</div>` + xs.map((x) =>
        `<div class="r"><i class="${x.nhom}"></i><b>${esc(x.ma)}</b><span>${esc(x.ip)}</span></div>`).join("");
      stage.appendChild(el);
      const w = el.offsetWidth, hh = el.offsetHeight, g = P.fs * 0.8;
      const L = it.label_box, S = it.sym_box;
      const U = [Math.min(L[0], S[0]), Math.min(L[1], S[1]), Math.max(L[2], S[2]), Math.max(L[3], S[3])];
      const cx = (U[0] + U[2]) / 2, cy = (U[1] + U[3]) / 2;
      const cand = [];
      for (const d of [g, 3 * g, 6 * g, 10 * g]) {
        for (const f of [0, -0.5, 0.5, -1, 1]) {
          cand.push([cx - w / 2 + f * w, U[3] + d], [cx - w / 2 + f * w, U[1] - d - hh],      // dưới, trên
            [U[0] - d - w, cy - hh / 2 + f * hh], [U[2] + d, cy - hh / 2 + f * hh]);         // trái, phải
        }
      }
      const area = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
      let best = null;
      cand.forEach(([x, y], k) => {
        const B = [x, y, x + w, y + hh];
        if (B[0] < 2 || B[1] < 2 || B[2] > P.clip_x1 - 4 || B[3] > P.h - 2) return;
        const s = [...obs, ...placed].reduce((a, o) => a + area(B, o), 0) + k * 0.01;   // ưu tiên chỗ gần, thứ tự dưới/trên/trái/phải
        if (!best || s < best.s) best = { s, B };
      });
      if (!best) { el.remove(); return; }
      const B = best.B;
      placed.push(B);
      el.style.left = B[0] + "px";
      el.style.top = B[1] + "px";
      // dây dẫn: từ cạnh tủ (ký hiệu/khung + nhãn) gần nhất tới cạnh bảng gần nhất – không chạy xuyên cụm thiết bị
      const px = clamp(clamp(cx, B[0], B[2]), U[0], U[2]), py = clamp(clamp(cy, B[1], B[3]), U[1], U[3]);
      const qx = clamp(px, B[0], B[2]), qy = clamp(py, B[1], B[3]);
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      Object.entries({ x1: px, y1: py, x2: qx, y2: qy, class: "ip-tu-day", "data-i": i }).forEach(([k, v]) => ln.setAttribute(k, v));
      ln.style.strokeWidth = Math.max(0.3, P.fs * 0.09);
      svg.appendChild(ln);
      el.addEventListener("click", (e) => { e.stopPropagation(); openRack(it.ma); });
      el.addEventListener("pointerdown", (e) => e.stopPropagation());
      so++;
    });
    return so;
  }

  /* ================= lọc theo loại thiết bị (chọn hình trong khung ⋮⋮⋮) =================
     Khung mở: bấm hình để chọn/bỏ chọn (chưa lọc). Bấm × (đóng khung): nếu có chọn thì mặt bằng chỉ còn
     ký hiệu + nhãn của các loại đã chọn. Bấm ⋮⋮⋮ lần nữa: hiện lại tất cả, bỏ các lựa chọn cũ để chọn lại.
     Bộ lọc giữ khi đổi mặt bằng trong cùng tab; nút "Hiện tất cả" trên nhãn "Đang lọc" để bỏ lọc. */
  const chon = new Set();
  const filter = {};                       // tab → Set mã loại đang lọc
  const PAD_LOC = 3.5;                     // pt quanh ký hiệu (≥ vùng giữ màu gốc khi dựng ảnh nền)
  function applyFilter() {
    if (!stage) return;
    const F = filter[planTab] || null, chip = $("#loc-chip");
    const all = [...P.items.map((it) => ({ loai: it.loai, b: it.sym_box })), ...(P.phu || []).map((x) => ({ loai: x.loai, b: x.box }))];
    P.items.forEach((it, i) => $$(`[data-i="${i}"]`, stage).forEach((e) => e.classList.toggle("an", !!F && !F.has(it.loai))));
    let h = "";
    if (F) {
      const pos = (b) => `left:${b[0] - PAD_LOC}px;top:${b[1] - PAD_LOC}px;width:${b[2] - b[0] + 2 * PAD_LOC}px;height:${b[3] - b[1] + 2 * PAD_LOC}px`;
      for (const x of all) if (!F.has(x.loai)) h += `<div class="loc-che" style="${pos(x.b)}"></div>`;
      // ký hiệu được chọn vẽ lại trên lớp che (khi nằm sát ký hiệu bị ẩn)
      for (const x of all) if (F.has(x.loai)) h += `<div class="loc-hien" style="${pos(x.b)};background-image:url(${P.img});
        background-size:${P.w}px ${P.h}px;background-position:${PAD_LOC - x.b[0]}px ${PAD_LOC - x.b[1]}px"></div>`;
    }
    $(".loc-layer", stage).innerHTML = h;
    cv.classList.toggle("dang-loc", !!F);
    if (!F) { chip.hidden = true; return; }
    const n = all.filter((x) => F.has(x.loai)).length;
    const vang = [...F].filter((c) => !all.some((x) => x.loai === c));
    chip.innerHTML = `<span>Đang lọc:</span>${[...F].map((c) => `<b>${esc(c)}</b>`).join("")}
      <span class="n">${n}/${all.length} ký hiệu</span><button type="button" id="loc-bo">Hiện tất cả</button>${
      vang.length ? `<small>${vang.map(esc).join(", ")}: ${vang.some((c) => P.dai_anh.some((g) => g.items.some((i) => i.ma === c)))
        ? "không có ký hiệu riêng trên mặt bằng" : "không có trên mặt bằng này"}</small>` : ""}`;
    chip.hidden = false;
    $("#loc-bo").onclick = () => clearFilter();
  }
  function clearFilter() {
    delete filter[planTab];
    chon.clear();
    $$(".st.chon", stp).forEach((e) => { e.classList.remove("chon"); e.setAttribute("aria-pressed", "false"); });
    applyFilter();
  }
  function toggleTile(el) {
    const c = el.dataset.ma, on = !chon.has(c);
    if (on) chon.add(c); else chon.delete(c);
    el.classList.toggle("chon", on);
    el.setAttribute("aria-pressed", String(on));
  }

  function apply() {
    if (!stage) return;
    stage.style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.z})`;
    $("#zv").textContent = Math.round(view.z * 100) + "%";
    const m = $("#mini"), vp = m.querySelector(".vp"), s = m.clientWidth / P.w;
    if (!vp || !s) return;
    Object.assign(vp.style, { left: -view.tx / view.z * s + "px", top: -view.ty / view.z * s + "px",
      width: cv.clientWidth / view.z * s + "px", height: cv.clientHeight / view.z * s + "px" });
  }
  const fitZoom = () => {
    const f = P.fit;
    return Math.max(0.05, Math.min(cv.clientWidth / (f[2] - f[0]), cv.clientHeight / (f[3] - f[1])) * 0.96);
  };
  function fit() {
    const f = P.fit, z = fitZoom();
    view.z = z;
    view.tx = (cv.clientWidth - (f[2] - f[0]) * z) / 2 - f[0] * z;
    view.ty = (cv.clientHeight - (f[3] - f[1]) * z) / 2 - f[1] * z;
    apply();
  }
  function zoomAt(px, py, z) {
    z = clamp(z, fitZoom() * 0.6, MAX_Z);
    view.tx = px - (px - view.tx) * (z / view.z);
    view.ty = py - (py - view.ty) * (z / view.z);
    view.z = z;
    apply();
  }
  $("#zi").onclick = () => { closeLens(); zoomAt(cv.clientWidth / 2, cv.clientHeight / 2, view.z * 1.35); };
  $("#zo").onclick = () => { closeLens(); zoomAt(cv.clientWidth / 2, cv.clientHeight / 2, view.z / 1.35); };
  $("#fit").onclick = () => { closeLens(); fit(); };
  cv.addEventListener("wheel", (e) => {
    if (!P || e.target.closest(".lgp, .stp")) return;
    e.preventDefault();
    closeLens();
    const r = cv.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, view.z * Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });
  $("#mini").addEventListener("click", (e) => {
    e.stopPropagation();
    const m = $("#mini"), r = m.getBoundingClientRect(), s = m.clientWidth / P.w;
    closeLens();
    view.tx = cv.clientWidth / 2 - (e.clientX - r.left) / s * view.z;
    view.ty = cv.clientHeight / 2 - (e.clientY - r.top) / s * view.z;
    apply();
  });

  /* kéo (chuột / 1 ngón) và chụm 2 ngón để phóng to */
  const pts = new Map();
  let gest = null;
  const local = (x, y) => { const r = cv.getBoundingClientRect(); return [x - r.left, y - r.top]; };
  cv.addEventListener("pointerdown", (e) => {
    if (!P || e.target.closest(".mini, .lens, .lg-btn, .lgp, .st-btn, .stp")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) {
      gest = { mode: "pan", moved: false, type: e.pointerType, x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, hit: e.target.closest(".hit") };
    } else if (pts.size === 2) {
      closeLens();
      const [a, b] = [...pts.values()], [mx, my] = local((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      gest = { mode: "pinch", moved: true, d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: view.z,
        cx: (mx - view.tx) / view.z, cy: (my - view.ty) / view.z };
      cv.classList.add("drag");
    }
  });
  window.addEventListener("pointermove", (e) => {
    if (!gest || !pts.has(e.pointerId)) return;
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (gest.mode === "pinch" && pts.size >= 2) {
      const [a, b] = [...pts.values()], [mx, my] = local((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      const z = clamp(gest.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / gest.d, fitZoom() * 0.6, MAX_Z);
      view.z = z; view.tx = mx - gest.cx * z; view.ty = my - gest.cy * z;
      apply();
    } else if (gest.mode === "pan") {
      const dx = e.clientX - gest.x, dy = e.clientY - gest.y;
      if (!gest.moved && Math.hypot(dx, dy) > 5) { gest.moved = true; cv.classList.add("drag"); closeLens(); }
      if (gest.moved) { view.tx = gest.tx + dx; view.ty = gest.ty + dy; apply(); }
    }
  });
  // chạm (không kéo): mở thiết bị được chạm; trên màn hình cảm ứng chạm gần (≤ 24 px) cũng được
  function nearest(clientX, clientY, maxPx) {
    const [px, py] = local(clientX, clientY), sx = (px - view.tx) / view.z, sy = (py - view.ty) / view.z;
    let best = -1, bd = maxPx / view.z;
    const F = filter[planTab];
    P.items.forEach((it, i) => {
      if (F && !F.has(it.loai)) return;
      for (const b of [it.sym_box, it.label_box]) {
        const dx = Math.max(b[0] - sx, 0, sx - b[2]), dy = Math.max(b[1] - sy, 0, sy - b[3]), d = Math.hypot(dx, dy);
        if (d < bd) { bd = d; best = i; }
      }
    });
    return best;
  }
  const endGesture = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (gest && gest.mode === "pan" && !gest.moved && e.type === "pointerup") {
      const i = gest.hit ? +gest.hit.dataset.i : gest.type !== "mouse" ? nearest(e.clientX, e.clientY, 24) : -1;
      if (i >= 0 && !moTu(i)) openLens(i, true);
    }
    if (pts.size === 0) { gest = null; cv.classList.remove("drag"); }
    else if (gest && gest.mode === "pinch" && pts.size === 1) {     // nhấc 1 ngón: kéo tiếp bằng ngón còn lại
      const [p] = [...pts.values()];
      gest = { mode: "pan", moved: true, type: "touch", x: p[0], y: p[1], tx: view.tx, ty: view.ty, hit: null };
    }
  };
  window.addEventListener("pointerup", endGesture);
  window.addEventListener("pointercancel", endGesture);

  /* ================= kính phóng to ================= */
  let lens = null, closeT = 0;
  function scheduleClose() {
    clearTimeout(closeT);
    closeT = setTimeout(() => { if (lens && !lens.pinned && !lens.hover) closeLens(); }, 140);
  }
  function openLens(i, pin) {
    if (lens && lens.i === i) { if (pin) pinLens(); return; }
    closeLens();
    const it = P.items[i], z = view.z, k = Math.max(1.25, 27 / (P.fs * z));   // mã nhãn hiện cao ~27 px
    const s = it.sym_box, l = it.label_box, p = Math.max(1.5, P.fs * 0.5);
    const g = [Math.min(s[0], l[0]) - p, Math.min(s[1], l[1]) - p, Math.max(s[2], l[2]) + p, Math.max(s[3], l[3]) + p];
    const gw = (g[2] - g[0]) * z * k, gh = (g[3] - g[1]) * z * k;
    const cx = view.tx + (g[0] + g[2]) / 2 * z, cy = view.ty + (g[1] + g[3]) / 2 * z;
    const left = clamp(cx - gw / 2, 8, cv.clientWidth - gw - 8), top = clamp(cy - gh / 2, 8, cv.clientHeight - gh - 38);
    const L = (x) => (x - g[0]) * z * k, T = (y) => (y - g[1]) * z * k;
    const [a, b] = it.leader, lw = Math.max(0.3, P.fs * 0.09);
    const el = document.createElement("div");
    el.className = "lens";
    el.style.cssText = `left:${left}px;top:${top}px;width:${gw}px`;
    el.innerHTML = `<div class="lens-img" style="height:${gh}px;background-image:url(${P.img});
        background-size:${P.w * z * k}px ${P.h * z * k}px;background-position:${-g[0] * z * k}px ${-g[1] * z * k}px">
        <svg width="${gw}" height="${gh}"><line x1="${L(a[0])}" y1="${T(a[1])}" x2="${L(b[0])}" y2="${T(b[1])}"
          stroke="var(--leader)" stroke-width="${lw * z * k}"/><circle cx="${L(a[0])}" cy="${T(a[1])}" r="${lw * 2 * z * k}" fill="var(--leader)"/></svg>
        ${labelHtml(P, it, `left:${L((l[0] + l[2]) / 2)}px;top:${T((l[1] + l[3]) / 2)}px;transform:translate(-50%,-50%) scale(${(z * k).toFixed(2)})`)}</div>
      <div class="lens-foot"><span></span><i></i></div>`;
    cv.appendChild(el);
    lens = { i, el, pinned: false, hover: false };
    const me = lens;
    el.addEventListener("mouseenter", () => { me.hover = true; clearTimeout(closeT); });
    el.addEventListener("mouseleave", () => { me.hover = false; if (!me.pinned) scheduleClose(); });
    el.addEventListener("click", () => pinLens());
    cv.classList.add("focus");
    if (pin) pinLens();
  }
  function pinLens() {
    if (!lens) return;
    const me = lens, sp = me.el.querySelector(".lens-foot span"), bar = me.el.querySelector(".lens-foot i");
    me.pinned = true;
    me.el.classList.add("pinned");
    clearInterval(me.iv); clearTimeout(me.to);
    let n = 5;
    const say = () => {
      sp.textContent = me.el.clientWidth < 300 ? `Thu nhỏ sau ${n} giây` : `Giữ phóng to · tự thu nhỏ sau ${n} giây`;
      bar.style.width = (n / 5) * 100 + "%";
    };
    say();
    me.iv = setInterval(() => { n = Math.max(0, n - 1); say(); }, 1000);
    me.to = setTimeout(() => { if (lens === me) closeLens(); }, 5000);
  }
  function closeLens() {
    if (!lens) return;
    clearInterval(lens.iv); clearTimeout(lens.to);
    lens.el.remove();
    lens = null;
    cv.classList.remove("focus");
  }

  /* ================= nút nổi bên phải mặt bằng: + (chú giải) và ⋮⋮⋮ (hình thiết bị) ================= */
  // Bấm: mở/đóng khung; mỗi lúc chỉ mở một khung để không chồng nhau.
  // Máy tính: nút cố định góc phải. Cảm ứng: giữ và kéo để đổi chỗ; vị trí lưu trong localStorage của máy người xem
  // (chỉ là tiện ích – trình duyệt chặn lưu trữ thì nút về chỗ mặc định).
  const DOTS = '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">' +
    [4, 10, 16].flatMap((y) => [4, 10, 16].map((x) => `<circle cx="${x}" cy="${y}" r="2.2" fill="currentColor"/>`)).join("") + "</svg>";
  const XMARK = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4 4 14" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>';
  const FLOAT = [
    { btn: $("#lg-btn"), panel: $("#lgp"), key: "ma-ip.vi-tri-nut-chu-giai", width: 370,
      show: (b, open) => { b.textContent = open ? "−" : "+"; b.title = open ? "Đóng chú giải" : "Mở chú giải"; } },
    { btn: $("#st-btn"), panel: $("#stp"), key: "ma-ip.vi-tri-nut-hinh-thiet-bi", width: 0,
      show: (b, open) => { b.innerHTML = open ? XMARK : DOTS; b.title = open ? "Đóng hình thiết bị" : "Mở hình thiết bị"; } },
  ];
  const lgp = FLOAT[0].panel, stp = FLOAT[1].panel;
  function placeBtn(f) {
    const b = f.btn;
    if (!f.pos || !cv.clientWidth) { b.style.left = ""; b.style.top = ""; b.style.right = ""; return; }
    const cw = cv.clientWidth, ch = cv.clientHeight, w = b.offsetWidth;
    b.style.right = "auto";
    b.style.left = clamp(f.pos.fx * cw, 8, cw - w - 8) + "px";
    b.style.top = clamp(f.pos.fy * ch, 8, ch - w - 8) + "px";
  }
  function placePanel(f) {
    const p = f.panel, b = f.btn;
    if (p.hidden || !cv.clientWidth) return;
    const cw = cv.clientWidth, ch = cv.clientHeight;
    const bx = b.offsetLeft, by = b.offsetTop, bw = b.offsetWidth, right = bx + bw / 2 > cw / 2, wide = cw >= 600;
    Object.assign(p.style, { left: "0px", top: "0px", right: "auto", maxHeight: "" });
    if (f.width) p.style.width = Math.min(f.width, cw - 24) + "px";       // chú giải: rộng cố định
    else {                                                                 // hình thiết bị: vừa nội dung, tự xuống dòng
      p.style.width = wide ? "max-content" : cw - 24 + "px";
      p.style.maxWidth = (wide ? cw - bw - 44 : cw - 24) + "px";
    }
    const pw = p.offsetWidth;
    let left, top;
    if ((right ? bx - 10 : cw - bx - bw - 10) >= pw + 8) {   // đủ chỗ bên cạnh nút (máy tính)
      left = right ? bx - 10 - pw : bx + bw + 10;
      p.style.maxHeight = ch - 16 + "px";
      top = clamp(by, 8, Math.max(8, ch - p.offsetHeight - 8));
    } else if (by + bw / 2 <= ch / 2) {                     // màn hình hẹp, nút ở nửa trên: mở phía dưới nút
      left = (cw - pw) / 2;
      top = by + bw + 10;
      p.style.maxHeight = Math.max(120, ch - top - 8) + "px";
    } else {                                                // nút ở nửa dưới: mở phía trên nút
      left = (cw - pw) / 2;
      p.style.maxHeight = Math.max(120, by - 18) + "px";
      top = Math.max(8, by - 10 - p.offsetHeight);
    }
    Object.assign(p.style, { left: clamp(left, 8, cw - pw - 8) + "px", top: top + "px" });
  }
  const placeAll = () => FLOAT.forEach((f) => { placeBtn(f); placePanel(f); });
  function setPanel(f, open) {
    if (open) FLOAT.forEach((o) => { if (o !== f && !o.panel.hidden) setPanel(o, false); });
    const was = !f.panel.hidden;
    f.panel.hidden = !open;
    if (f.panel === stp && P && was !== open) {
      if (open) clearFilter();                                   // mở lại: hiện tất cả, chọn lại từ đầu
      else if (chon.size) { filter[planTab] = new Set(chon); applyFilter(); }
    }
    f.btn.classList.toggle("on", open);
    f.btn.setAttribute("aria-expanded", String(open));
    f.show(f.btn, open);
    placePanel(f);
  }
  const setLegend = (open) => setPanel(FLOAT[0], open);
  stp.addEventListener("click", (e) => { const el = e.target.closest(".st"); if (el) toggleTile(el); });
  stp.addEventListener("keydown", (e) => {
    const el = e.target.closest(".st");
    if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleTile(el); }
  });
  for (const f of FLOAT) {
    const b = f.btn, d = { down: false, moved: false };
    let skipClick = false;
    try { f.pos = JSON.parse(localStorage.getItem(f.key)); } catch { f.pos = null; }
    if (!f.pos || !(f.pos.fx >= 0 && f.pos.fx <= 1 && f.pos.fy >= 0 && f.pos.fy <= 1)) f.pos = null;
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (skipClick) { skipClick = false; return; }
      setPanel(f, f.panel.hidden);
    });
    b.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (e.pointerType === "mouse") return;
      Object.assign(d, { down: true, moved: false, id: e.pointerId, x: e.clientX, y: e.clientY, l: b.offsetLeft, t: b.offsetTop });
      try { b.setPointerCapture(e.pointerId); } catch { /* sự kiện giả lập */ }
    });
    b.addEventListener("pointermove", (e) => {
      if (!d.down || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < 8) return;
      d.moved = true;
      const cw = cv.clientWidth, ch = cv.clientHeight, w = b.offsetWidth;
      f.pos = { fx: clamp(d.l + dx, 8, cw - w - 8) / cw, fy: clamp(d.t + dy, 8, ch - w - 8) / ch };
      placeBtn(f);
      placePanel(f);
    });
    const end = (e) => {
      if (!d.down || e.pointerId !== d.id) return;
      d.down = false;
      if (d.moved) {
        skipClick = true;
        setTimeout(() => (skipClick = false), 400);
        try { localStorage.setItem(f.key, JSON.stringify(f.pos)); } catch { /* bỏ qua */ }
      }
    };
    b.addEventListener("pointerup", end);
    b.addEventListener("pointercancel", end);
    f.panel.addEventListener("pointerdown", (e) => e.stopPropagation());
    f.unsetPos = () => { f.pos = null; skipClick = false; try { localStorage.removeItem(f.key); } catch { /* bỏ qua */ } };
  }


  /* ================= tủ rack: khung "mặt trước tủ chia U + danh sách thiết bị" (chủ dự án duyệt 17/11/2026) =================
     Dữ liệu D.tu_rack (thiet_bi_khac/tu_rack.py). Chạm / click vào tủ trên mặt bằng, hoặc tìm mã tủ / mã thiết bị trong tủ
     → mở khung bên phải (điện thoại: trượt lên từ cạnh dưới). Tủ không có IP; IP là của thiết bị trong tủ. */
  const TU = Object.fromEntries((D.tu_rack || []).map((t) => [t.ma, t]));
  const NHOM_TU = [["net", "Networking", "#34d1bc"], ["proc", "Processor", "#f2a11c"], ["acc", "Accessory", "#a897ff"],
    ["phu", "Phụ kiện tủ", "#6b778a"]];
  const TU_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2.5" width="14" height="17" rx="1.5"/><path d="M8 7h8M8 11h8M8 15h8M7 19.5V22M17 19.5V22"/></svg>';
  var tuMo = null;
  function closeRack() { if (tuMo) { tuMo.remove(); tuMo = null; } }
  function openRack(ma, chon = "") {          // chon: mã thiết bị trong tủ cần tô viền (khi tìm kiếm)
    const R = TU[ma];
    if (!R) return;
    closeRack();
    closeLens();
    const dt = matchMedia("(max-width: 760px)").matches;
    const uh = dt ? Math.min(9, 280 / R.u) : Math.min(15, 470 / R.u);
    const all = [...R.units.filter((x) => x.nhom !== "trong"), ...R.ngoai_u];
    const nma = all.filter((x) => x.ma).length, nip = all.filter((x) => x.ip).length;
    const uTxt = (x) => (x.u ? `U${x.h > 1 ? `${x.u - x.h + 1}–${x.u}` : x.u}` : "ngoài khe U");
    const ruler = Array.from({ length: R.u }, (_, k) => `<div style="height:${uh}px">${R.u - k}</div>`).join("");
    const slots = R.units.map((x) => `<div class="rk-s ${x.nhom}${x.ma && x.ma === chon ? " chon" : ""}" style="height:${x.h * uh + (x.h - 1)}px" title="${esc(x.ten)}">${esc(x.ma || x.ten)}</div>`).join("");
    const groups = NHOM_TU.map(([g, ten, mau]) => {
      const xs = all.filter((x) => x.nhom === g);
      if (!xs.length) return "";
      return `<div class="rk-g"><h5><i style="background:${mau}"></i>${ten} <em>${xs.length}</em></h5>` + xs.map((x) =>
        `<div class="rk-it${x.ma && x.ma === chon ? " chon" : ""}"><span class="m${x.ma ? "" : " no"}">${x.ma ? esc(x.ma) : "—"}</span><span class="n">${esc(x.ten)}</span>
           <span class="u">${uTxt(x)}</span><span class="d">${esc(x.model)}</span>
           <span class="ip${x.ip ? "" : " no"}">${x.ip ? esc(x.ip) : x.khong_ip ? "không dùng IP" : x.ma ? "chưa có IP" : ""}</span></div>`).join("") + `</div>`;
    }).join("");
    const el = document.createElement("div");
    el.className = "rk-dr";
    el.innerHTML = `<div class="rk-h"><div class="rk-ico">${TU_ICON}</div><div><div class="ma">${esc(R.ma)}</div>
        <div class="sub">${esc(R.loai)} · ${R.he === "camera" ? "Camera" : "TEL-DATA & Wi-Fi"} · ${esc(R.khu_vuc)}</div></div>
        <button class="x" type="button" aria-label="Đóng">×</button></div>
      <div class="rk-tags"><span>Model tủ: <b>${esc(R.model)}</b></span><span><b>${nma}</b> thiết bị có mã · <b>${nip}</b> có IP</span>
        <span>Tủ không có IP riêng</span>${(R.mang || []).map((m) =>
          `<span class="mang">Mạng <b>${esc(m.mang)}</b>${m.vlan ? " · " + esc(m.vlan) : ""} – ${esc(m.dung_cho)}</span>`).join("")}</div>
      <div class="rk-b">
        <div class="rk-el"><div class="t">Mặt trước tủ · ${R.u}U</div>
          <div class="rk-frame"><div class="rk-u" style="line-height:${uh}px">${ruler}</div><div class="rk-slots">${slots}</div></div></div>
        <div class="rk-ds">${groups}</div>
      </div>
      <div class="rk-f"><b>Kết nối:</b> ${esc(R.ket_noi)}<ul>${R.ghi_chu.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`;
    el.querySelector(".x").addEventListener("click", closeRack);
    ["pointerdown", "wheel"].forEach((ev) => el.addEventListener(ev, (e) => e.stopPropagation()));
    cv.appendChild(el);
    tuMo = el;
    const hl = el.querySelector(".rk-it.chon");
    if (hl) hl.scrollIntoView({ block: "nearest" });
    // dời mặt bằng để tủ nằm giữa phần còn nhìn thấy (máy tính: bên trái khung; điện thoại: phía trên khung)
    const k = P.items.findIndex((it) => it.ma === ma);
    if (k >= 0) {
      const s = P.items[k].sym_box, l = P.items[k].label_box;
      const cx = (Math.min(s[0], l[0]) + Math.max(s[2], l[2])) / 2, cy = (Math.min(s[1], l[1]) + Math.max(s[3], l[3])) / 2;
      const W = dt ? cv.clientWidth : cv.clientWidth - el.offsetWidth - 80, H = dt ? cv.clientHeight - el.offsetHeight : cv.clientHeight;
      view.z = clamp(Math.max(view.z, 16 / P.fs), 0.2, MAX_Z);
      view.tx = W / 2 - cx * view.z;
      view.ty = H / 2 - cy * view.z;
      apply();
    }
  }
  const moTu = (i) => (P.items[i].loai === "RK" && TU[P.items[i].ma] ? (openRack(P.items[i].ma), true) : false);

  /* ================= tìm kiếm (4 bộ mặt bằng) ================= */
  const ALL = PLAN_TABS.flatMap((t) => MB[t].flatMap((p, pi) => p.items.map((it, i) => ({
    ma: it.ma, ip: it.ip, t, pi, i, kv: `${INFO[t].ten} · ${p.khu_vuc}${isTrunking(p) ? " · trunking" : ""}` }))));
  for (const R of D.tu_rack || []) {
    const t = R.he === "camera" ? "camera" : "tel";
    MB[t].forEach((p, pi) => p.items.forEach((it, i) => {
      if (it.ma !== R.ma) return;
      for (const x of [...R.units, ...R.ngoai_u]) if (x.ma) ALL.push({ ma: x.ma, ip: x.ip, khong_ip: x.khong_ip, t, pi, i, rk: R.ma, kv: `Trong tủ ${R.ma} · ${p.khu_vuc}` });
    }));
  }
  const top = $("#top"), input = $(".search input");
  const drop = document.createElement("div");
  drop.className = "drop"; drop.hidden = true;
  $(".search").appendChild(drop);
  let hits = [], sel = 0;
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mark = (s, q) => esc(s).replace(new RegExp(reEsc(esc(q)), "ig"), (m) => `<mark>${m}</mark>`);
  function renderDrop() {
    const q = input.value.trim();
    if (!q) { drop.hidden = true; return; }
    const ql = q.toLowerCase();
    hits = ALL.filter((x) => x.ma.toLowerCase().includes(ql) || (x.ip && x.ip.includes(ql))).slice(0, 8);
    sel = 0;
    drop.innerHTML = hits.length
      ? hits.map((x, k) => `<div class="res${k === 0 ? " sel" : ""}" data-k="${k}"><b>${mark(x.ma, q)}</b>
          <span>${x.ip ? mark(x.ip, q) : x.khong_ip ? "không dùng IP" : "chưa có IP"}</span><em>${esc(x.kv)}</em></div>`).join("")
      : `<div class="res-empty">Không tìm thấy “${esc(q)}”.</div>`;
    drop.hidden = false;
    $$(".res", drop).forEach((r) => r.addEventListener("mousedown", (e) => { e.preventDefault(); go(hits[+r.dataset.k]); }));
  }
  input.addEventListener("input", renderDrop);
  input.addEventListener("focus", renderDrop);
  input.addEventListener("blur", () => setTimeout(() => {
    drop.hidden = true;
    if (!input.value.trim()) top.classList.remove("tim");
  }, 150));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { input.value = ""; input.blur(); return; }
    if (drop.hidden || !hits.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sel = (sel + (e.key === "ArrowDown" ? 1 : hits.length - 1)) % hits.length;
      $$(".res", drop).forEach((r, k) => r.classList.toggle("sel", k === sel));
    }
    if (e.key === "Enter") { e.preventDefault(); go(hits[sel]); }
  });
  $("#s-btn").addEventListener("click", () => {
    const on = !top.classList.contains("tim");
    top.classList.toggle("tim", on);
    if (on) input.focus(); else input.blur();
  });
  function go(x) {
    drop.hidden = true;
    input.value = x.ma;
    input.blur();
    top.classList.remove("tim");
    lastPage[x.t] = x.pi;
    showTab(x.t);
    if (cur !== x.pi) loadPlan(x.pi);
    const F = filter[x.t];
    if (F && !F.has(P.items[x.i].loai)) clearFilter();
    focusOn(x.i);
    if (x.rk) openRack(x.rk, x.ma); else moTu(x.i);
    history.replaceState(null, "", "#ma=" + encodeURIComponent(x.ma));
  }
  function focusOn(i) {
    const it = P.items[i], s = it.sym_box, l = it.label_box;
    const cx = (Math.min(s[0], l[0]) + Math.max(s[2], l[2])) / 2, cy = (Math.min(s[1], l[1]) + Math.max(s[3], l[3])) / 2;
    closeLens();
    view.z = clamp(Math.max(view.z, 16 / P.fs), 0.2, MAX_Z);      // mã nhãn hiện cao ~16 px
    view.tx = cv.clientWidth / 2 - cx * view.z;
    view.ty = cv.clientHeight / 2 - cy * view.z;
    apply();
    openLens(i, true);
  }

  /* ================= khởi động ================= */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || e.target === input) return;
    closeLens();
    closeRack();
    FLOAT.forEach((f) => { if (!f.panel.hidden) setPanel(f, false); });
  });
  window.addEventListener("resize", () => { if (P && PLAN_TABS.includes(curTab)) { apply(); placeAll(); } });
  window.addEventListener("hashchange", route);

  /* phím tắt – CHỈ MÁY TÍNH (có chuột, màn hình > 760px), không có trên điện thoại (chủ dự án đổi phím 16/11/2026):
     - A / D: tab bên trái / bên phải, chạy vòng (Tổng quan ←A→ Lưu ý).
     - W / S: mặt bằng phía trên / phía dưới trong danh sách bên trái (chỉ ở 4 tab mặt bằng), chạy vòng qua cả danh sách
       – tab Ổ cắm: "Mặt bằng ổ cắm & tủ điện" Tầng 4 ←S→ "Mặt bằng trunking – tủ điện" Tầng hầm, và trunking Tầng 4 ←S→ ổ cắm Tầng hầm.
     Bộ gõ tiếng Việt kiểu Telex (Unikey, EVKey…) chạy cả khi không gõ vào ô chữ: khi cần đổi chữ, nó NUỐT phím vừa bấm,
     gửi Backspace rồi gửi chữ mới KHÔNG có mã phím. Ví dụ: "dd" → "đ", "aa" → "â", "w" → "ư", "as" → "á" (S là dấu sắc),
     "aw" → "ă"; bấm thêm lần nữa thì hoàn tác, gửi lại chữ thường ("ddd" → "dd"). Vì vậy:
       - sự kiện có mã phím (e.code = KeyA…) dùng ngay;
       - chuỗi chữ không có mã phím được gom lại (25 ms) và suy ra phím vừa bấm bằng cách so chữ CUỐI với chữ trước đó:
         thêm dấu thanh → phím dấu (sắc = S…); thêm dấu trăng/móc (ă ơ ư) → W; thêm dấu mũ (â ê ô) → chính chữ đó;
         đ → D; chữ không dấu (hoàn tác) → chính chữ đó;
       - các lần nhận cùng phím cách nhau < 120 ms tính là MỘT lần bấm.
     Bỏ qua khi đang gõ (ô tìm kiếm, ô chọn), khi giữ Ctrl/Alt/⌘, và khi giữ phím (chỉ chuyển 1 bước mỗi lần nhấn). */
  const MAY_TINH = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 761px)");
  const isPC = () => MAY_TINH.matches || /[?&]demo=phim/.test(location.search);   // ?demo=phim: chụp ảnh kiểm tra (Edge chạy ngầm không có chuột)
  const markPC = () => document.documentElement.classList.toggle("may-tinh", isPC());
  markPC();
  MAY_TINH.addEventListener("change", markPC);
  function stepTab(d) {
    const i = TAB_IDS.indexOf(curTab);
    location.hash = "#" + TAB_IDS[(i + d + TAB_IDS.length) % TAB_IDS.length];   // nút Back của trình duyệt quay lại tab trước
    route();   // áp dụng ngay (hashchange đến sau, không đổi gì); tab mặt bằng mở lại đúng tầng đang xem
  }
  function stepPlan(d) {
    if (!PLAN_TABS.includes(curTab) || !PLANS) return;
    loadPlan((cur + d + PLANS.length) % PLANS.length);
    setHash();
    const on = $(".floor.on");
    if (on) on.scrollIntoView({ block: "nearest" });
  }
  const PHIM = { a: () => stepTab(-1), d: () => stepTab(1), w: () => stepPlan(-1), s: () => stepPlan(1) };
  // dấu (ký tự tổ hợp Unicode) → phím Telex tạo ra dấu đó
  const DAU_THANH = { "́": "s", "̀": "f", "̉": "r", "̃": "x", "̣": "j" };
  const DAU_W = new Set(["̆", "̛"]), DAU_MU = "̂";
  const dauCua = (ch) => [...ch.normalize("NFD")].slice(1);
  function phimTuChu(ch, truocDo) {
    if (ch === "đ") return "d";
    const goc = ch.normalize("NFD")[0], cu = truocDo ? dauCua(truocDo) : [];
    const moi = dauCua(ch).filter((x) => !cu.includes(x));
    for (const x of moi) {
      if (DAU_THANH[x]) return DAU_THANH[x];
      if (DAU_W.has(x)) return "w";
      if (x === DAU_MU) return goc;
    }
    return dauCua(ch).length ? "" : goc;          // chữ không dấu: bộ gõ hoàn tác, gửi lại chính chữ đã bấm
  }
  let truoc = { c: "", t: -1e9 }, chuTruoc = "", gom = null;
  function bam(c, t) {
    if (!PHIM[c]) return;
    if (c === truoc.c && t - truoc.t < 120) return;     // chuỗi sự kiện bộ gõ gửi liền = 1 lần bấm
    truoc = { c, t };
    PHIM[c]();
  }
  document.addEventListener("keydown", (e) => {
    if (!isPC() || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    const key = (e.key || "").toLowerCase();
    const m = /^Key([A-Z])$/.exec(e.code || "");
    if (m) {                                             // phím thật, có mã phím
      if (gom) { clearTimeout(gom.to); gom = null; }
      chuTruoc = key.length === 1 ? key : "";
      const c = m[1].toLowerCase();
      if (PHIM[c]) { e.preventDefault(); bam(c, e.timeStamp); }
      return;
    }
    if ([...key].length !== 1 || !/\p{L}/u.test(key)) return;   // Backspace… của bộ gõ: bỏ qua
    e.preventDefault();
    if (!gom) gom = { truocDo: chuTruoc };
    gom.cuoi = key;
    gom.t = e.timeStamp;
    clearTimeout(gom.to);
    gom.to = setTimeout(() => {                          // hết chuỗi: suy ra phím từ chữ cuối
      const g = gom;
      gom = null;
      chuTruoc = g.cuoi;
      bam(phimTuChu(g.cuoi, g.truocDo), g.t);
    }, 25);
  });
  renderOverview();
  renderDownloads();
  renderNotes();
  FLOAT.forEach((f) => setPanel(f, false));
  route();
  const Q = new URLSearchParams(location.search);
  const demo = Q.get("demo");
  if (demo === "legend" && PLAN_TABS.includes(curTab)) setLegend(true);
  if (demo === "hinh" && PLAN_TABS.includes(curTab)) setPanel(FLOAT[1], true);
  if (demo === "keo-hinh" && PLAN_TABS.includes(curTab)) {     // giả lập ngón tay kéo nút ⋮⋮⋮ (không lưu vị trí)
    const f = FLOAT[1], r = f.btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ev = (type, dx, dy) => f.btn.dispatchEvent(new PointerEvent(type,
      { bubbles: true, pointerId: 7, pointerType: "touch", clientX: x + dx, clientY: y + dy }));
    ev("pointerdown", 0, 0); ev("pointermove", -150, 200); ev("pointermove", -300, 330); ev("pointerup", -300, 330);
    f.unsetPos();
    setPanel(f, true);
  }
  if ((demo === "chon" || demo === "loc") && PLAN_TABS.includes(curTab)) {
    setPanel(FLOAT[1], true);
    for (const c of (Q.get("chon") || "").split(",")) { const el = $$(".st", stp).find((e) => e.dataset.ma === c); if (el) toggleTile(el); }
    if (demo === "loc") setPanel(FLOAT[1], false);
  }
  if (demo === "phim") for (const k of (Q.get("phim") || "").split(",").filter(Boolean)) {
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Key" + k.toUpperCase(), key: k.toLowerCase(), bubbles: true }));
  }
  if (Q.get("demo") === "search") { top.classList.add("tim"); input.value = Q.get("q") || "CX0"; renderDrop(); }
  if (demo === "xem-tu" && PLAN_TABS.includes(curTab)) {      // phóng to quanh tủ (gồm bảng IP cạnh tủ), không mở khung tủ
    const k = P.items.findIndex((it) => it.ma === Q.get("tu"));
    if (k >= 0) {
      const bx = [P.items[k].sym_box, P.items[k].label_box];
      const b = $(`.ip-tu[data-i="${k}"]`, stage);
      if (b) bx.push([b.offsetLeft, b.offsetTop, b.offsetLeft + b.offsetWidth, b.offsetTop + b.offsetHeight]);
      const x0 = Math.min(...bx.map((v) => v[0])), y0 = Math.min(...bx.map((v) => v[1]));
      const x1 = Math.max(...bx.map((v) => v[2])), y1 = Math.max(...bx.map((v) => v[3]));
      const pad = +(Q.get("pad") || 1.8);                       // khung nhìn = pad × cỡ vùng tủ + bảng
      view.z = clamp(Math.min(cv.clientWidth / ((x1 - x0) * pad), cv.clientHeight / ((y1 - y0) * pad)), 0.2, MAX_Z);
      view.tx = cv.clientWidth / 2 - (x0 + x1) / 2 * view.z;
      view.ty = cv.clientHeight / 2 - (y0 + y1) / 2 * view.z;
      apply();
    }
  }
})();
