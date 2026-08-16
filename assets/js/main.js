/* ==========================================================================
   (주)데이터스톤 홈페이지 공용 스크립트
   --------------------------------------------------------------------------
   왜 이렇게 했는가:
   - 프레임워크·번들러를 쓰지 않는다. 이 사이트는 정적 파일 그대로 GitHub Pages에
     올라간다. 빌드 단계가 생기는 순간 "고치려면 환경부터 살려야" 하는 물건이 된다.
   - 자바스크립트가 꺼져도 내용은 전부 읽혀야 한다. 여기 있는 건 전부 "있으면 편한 것"뿐이다.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1) 모바일 메뉴
     aria-expanded 를 진짜 상태값으로 쓴다. 스크린리더가 이 값을 읽는다.
     ---------------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    // 메뉴 밖을 누르면 닫는다 (모바일에서 메뉴가 떠 있는 채로 갇히는 걸 막는다)
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     2) 스크롤하면 헤더에 그림자
     ---------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------------------
     3) 수행실적 분류 필터
     data-category 속성만 보고 거른다. 항목이 늘어도 스크립트는 그대로다.
     ---------------------------------------------------------------------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-category]"));
    var emptyNote = document.querySelector("[data-empty-note]");

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;

      var want = btn.getAttribute("data-filter");
      var shown = 0;

      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      items.forEach(function (item) {
        var match = want === "all" || item.getAttribute("data-category") === want;
        item.hidden = !match;
        if (match) shown++;
      });

      if (emptyNote) emptyNote.hidden = shown !== 0;
    });
  }

  /* ----------------------------------------------------------------------
     4) 문의 폼
     정적 사이트라 서버가 없다. 두 가지 모드로 동작한다.

       (가) form 에 data-endpoint 가 채워져 있으면  → 그 주소로 fetch 전송
            (Formspree 등 외부 폼 서비스. 설정 방법은 CONTENT.md 참고)
       (나) 비어 있으면(초기 상태)                → 메일 클라이언트를 열어준다

     (나)를 기본값으로 둔 이유: 외부 서비스 가입 전에도 문의가 끊기지 않아야 하고,
     "보내기를 눌렀는데 아무 일도 안 일어나는" 상태로 배포되는 게 최악이기 때문이다.
     ---------------------------------------------------------------------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector('button[type="submit"]');

    var say = function (msg, isError) {
      if (!status) return;
      status.textContent = msg;
      status.style.color = isError ? "#c53030" : "var(--blue)";
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var endpoint = (form.getAttribute("data-endpoint") || "").trim();

      if (!endpoint) {
        // (나) 메일 클라이언트로 넘긴다
        var to = form.getAttribute("data-mailto") || "";
        var lines = [
          "회사/기관: " + (data.get("company") || ""),
          "성함: " + (data.get("name") || ""),
          "연락처: " + (data.get("phone") || ""),
          "이메일: " + (data.get("email") || ""),
          "문의유형: " + (data.get("topic") || ""),
          "",
          data.get("message") || ""
        ];
        var subject = "[홈페이지 문의] " + (data.get("topic") || "일반") +
          " - " + (data.get("company") || data.get("name") || "");
        window.location.href =
          "mailto:" + to +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        say("메일 프로그램을 엽니다. 창이 뜨지 않으면 아래 이메일 주소로 직접 보내주세요.");
        return;
      }

      // (가) 외부 폼 서비스로 전송
      if (submitBtn) { submitBtn.disabled = true; }
      say("전송 중입니다…");

      fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("전송 실패 " + res.status);
          form.reset();
          say("문의가 접수되었습니다. 영업일 기준 1~2일 내에 회신드리겠습니다.");
        })
        .catch(function () {
          say("전송에 실패했습니다. 번거로우시겠지만 아래 이메일로 직접 보내주세요.", true);
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; }
        });
    });
  }

  /* ----------------------------------------------------------------------
     5) 푸터 저작권 연도 — 해마다 손으로 고치는 걸 잊는다
     ---------------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ----------------------------------------------------------------------
     6) 공지사항
     --------------------------------------------------------------------
     공지는 notices.json 한 곳에만 있다. 이 함수가 두 자리를 함께 그린다.

       (가) 상단바의 "최신 공지 한 줄"  — 전 페이지 공통
       (나) notice.html 의 목록

     이렇게 한 이유: 공지를 하나 올릴 때마다 HTML 8개를 고쳐야 한다면
     결국 아무도 안 올리게 된다.
     지금 구조에서는 notices.json 에 세 줄 추가하고 push 하면 끝이다.

     ⚠️ 상단바는 기본이 hidden 이다. 공지를 못 읽으면(파일 없음·네트워크 실패·
        브라우저에서 파일 직접 열기) 빈 띠가 남지 않고 그냥 사라진다.
     ---------------------------------------------------------------------- */
  var noticeBar = document.querySelector("[data-notice-bar]");
  var noticeList = document.getElementById("notice-list");

  if (noticeBar || noticeList) {
    var esc = function (s) {
      return String(s).replace(/[&<>"]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
      });
    };

    // 2026-08-16 → 2026.08.16 (국내 표기)
    var fmt = function (iso) {
      return String(iso).replace(/-/g, ".");
    };

    fetch("notices.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("notices.json " + res.status);
        return res.json();
      })
      .then(function (items) {
        if (!Array.isArray(items) || !items.length) throw new Error("공지 없음");

        // 고정 공지가 먼저, 그 다음 최신순
        items.sort(function (a, b) {
          if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
          return String(b.date).localeCompare(String(a.date));
        });

        if (noticeBar) {
          var top = items[0];
          noticeBar.querySelector("[data-notice-title]").textContent = top.title;
          var t = noticeBar.querySelector("[data-notice-date]");
          t.textContent = fmt(top.date);
          t.setAttribute("datetime", top.date);
          noticeBar.hidden = false;
        }

        if (noticeList) {
          noticeList.innerHTML = items.map(function (n) {
            return '<article class="notice-item">' +
              '<div class="notice-meta">' +
                (n.pinned ? '<span class="tag">고정</span>' : "") +
                (n.category ? '<span class="tag tag--muted">' + esc(n.category) + "</span>" : "") +
                '<time datetime="' + esc(n.date) + '">' + fmt(esc(n.date)) + "</time>" +
              "</div>" +
              "<h2>" + esc(n.title) + "</h2>" +
              // body 는 우리가 직접 쓰는 값이라 HTML 을 그대로 넣는다
              // (외부 입력이 아니다 — 사용자 입력을 여기 넣지 말 것)
              '<div class="notice-body">' + (n.body || "") + "</div>" +
              "</article>";
          }).join("");
        }
      })
      .catch(function () {
        if (noticeBar) noticeBar.hidden = true;
        if (noticeList) {
          noticeList.innerHTML =
            '<p class="empty-note">등록된 공지사항이 없습니다.</p>';
        }
      });
  }
})();
