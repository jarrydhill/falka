// ============================================================
// Simple client-side auth gate for the FALKA site.
// Deliberately low-security — intended as a friction layer while
// the site is in pre-launch, NOT as a real access control.
// Anyone reading the source can bypass it.
//
// Include this as the first <script> in <head> on every protected
// page. login.html does NOT include it (to avoid redirect loops).
// ============================================================

(function () {
  try {
    var authed = localStorage.getItem('falka-auth') === '1'
    var path = location.pathname
    var onLoginPage = /\/login(\.html)?$/.test(path)

    if (!authed && !onLoginPage) {
      // Preserve the destination so login can redirect back here
      var dest = path + location.search + location.hash
      sessionStorage.setItem('falka-auth-dest', dest)
      location.replace('/login.html')
    }
  } catch (err) {
    // If localStorage is unavailable for some reason, don't block
    // the page — fail open. "Deliberately easy" means broken-open
    // is fine too.
    console.warn('[FALKA auth] storage unavailable, allowing through:', err)
  }
})()
