function switchLanguage() {
  const current = window.location.pathname;
  if (current.includes("_en")) {
    window.location.href = current.replace("_en", "_kr");
  } else if (current.includes("_kr")) {
    window.location.href = current.replace("_kr", "_en");
  } else {
    // Fallback
    window.location.href = current.replace(".html", "_kr.html");
  }
}
