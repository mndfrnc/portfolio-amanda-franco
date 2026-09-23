export function createFocusTrap(dialog, close) {
  let trigger = null;
  function onKeydown(event) {
    if (event.key === "Escape") return hide();
    if (event.key === "Tab") { event.preventDefault(); close.focus(); }
  }
  function show(from) { trigger = from; dialog.hidden = false; dialog.addEventListener("keydown", onKeydown); close.focus(); }
  function hide() { dialog.hidden = true; dialog.removeEventListener("keydown", onKeydown); trigger?.focus(); }
  return { show, hide };
}
