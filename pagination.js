(function() {
  const postsPerPage = 6;

  const newer = document.querySelector("#blog-pager-newer-link a");
  const older = document.querySelector("#blog-pager-older-link a");

  const container = document.getElementById("compact-pagination");
  if (!container) return;

  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.gap = "10px";
  container.style.marginTop = "40px";

  function addButton(text, url, active=false, disabled=false) {
    const btn = document.createElement("a");
    btn.textContent = text;
    btn.href = disabled ? "#" : url;
    btn.style.padding = "8px 14px";
    btn.style.borderRadius = "6px";
    btn.style.textDecoration = "none";
    btn.style.fontWeight = "bold";
    btn.style.border = "2px solid gold";
    btn.style.color = active ? "#0b2428" : disabled ? "#777" : "gold";
    btn.style.background = active ? "gold" : "transparent";
    btn.style.pointerEvents = disabled ? "none" : "auto";
    btn.style.transition = "0.3s";

    btn.onmouseover = () => {
      if (!active && !disabled) btn.style.background = "rgba(255,215,0,0.2)";
    };
    btn.onmouseout = () => {
      btn.style.background = active ? "gold" : "transparent";
    };

    container.appendChild(btn);
  }

  function addDots() {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.color = "gold";
    dots.style.padding = "8px 6px";
    dots.style.fontWeight = "bold";
    container.appendChild(dots);
  }

  let page = 1;
  const url = window.location.href;

  if (url.includes("updated-max")) {
    const allDates = document.querySelectorAll(".date-header span");
    page = Math.floor(allDates.length / postsPerPage) + 1;
  }

  const totalPages = 12;

  if (newer) addButton("«", newer.href);

  if (page > 2) addButton(1, "?page=1");
  if (page > 3) addDots();

  for (let i = page - 1; i <= page + 1; i++) {
    if (i > 1 && i < totalPages) {
      addButton(i, "?page=" + i, i === page);
    }
  }

  if (page < totalPages - 2) addDots();
  if (page < totalPages - 1) addButton(totalPages, "?page=" + totalPages);

  if (older) addButton("»", older.href);

})();
