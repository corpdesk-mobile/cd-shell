export function diag_css(message: string, data: any = {}) {
  console.log(
    `%c[CSS-DIAG] ${message}`,
    "background:#222;color:#0f0;padding:2px 4px;border-radius:3px",
    data
  );
}

export function diag_sidebar() {
  const sb = document.getElementById("cd-sidebar");
  if (!sb) return;

  const style = window.getComputedStyle(sb);

  console.warn(
    "%c[SIDEBAR-DIAG] Sidebar State:",
    "background:#440;color:#fff;padding:3px"
  );

  console.log("display:", style.display);
  console.log("position:", style.position);
  console.log("width:", style.width);
  console.log("flex-direction:", style.flexDirection);
  console.log("css file winning:", sb);
}
