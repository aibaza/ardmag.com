// aiBaza portfolio beacon — pageview first-party, cookieless, fail-open.
//
// Inclus pe fiecare site cu: <script defer src="/a-b.js" data-site="aibaza.ro"></script>
// (fisierul se copiaza in public/ al fiecarui site sub un nume scurt, ne-listat
// in blocklists; endpoint-ul /a e first-party pe fiecare domeniu).
//
// NU foloseste cookies/localStorage persistent. UTM-urile se citesc din URL la
// aterizare si se pastreaza DOAR in sessionStorage (durata tabului) ca sa fie
// atasate conversiilor ulterioare din aceeasi sesiune de tab.
(function () {
  try {
    var script = document.currentScript
    var site = (script && script.getAttribute('data-site')) || location.hostname
    var endpoint = (script && script.getAttribute('data-endpoint')) || '/a'

    // capteaza UTM-urile o singura data per tab-session
    var KEY = '_ab_utm'
    try {
      var q = new URLSearchParams(location.search)
      if (q.get('utm_source') || q.get('utm_campaign')) {
        sessionStorage.setItem(KEY, JSON.stringify({
          utm_source: q.get('utm_source') || '',
          utm_medium: q.get('utm_medium') || '',
          utm_campaign: q.get('utm_campaign') || '',
          utm_content: q.get('utm_content') || '',
          utm_term: q.get('utm_term') || '',
        }))
      }
    } catch (e) {}

    function utm() {
      try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') } catch (e) { return {} }
    }

    function send(event, props) {
      try {
        var u = utm()
        var payload = JSON.stringify(Object.assign({
          site: site, event: event, path: location.pathname,
          ref: document.referrer || '',
          utm_source: u.utm_source || '', utm_medium: u.utm_medium || '',
          utm_campaign: u.utm_campaign || '', utm_content: u.utm_content || '',
          utm_term: u.utm_term || '',
        }, props || {}))
        if (navigator.sendBeacon) navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }))
        else fetch(endpoint, { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(function () {})
      } catch (e) {}
    }

    // pageview initial + navigari SPA (history API)
    send('pageview')
    var push = history.pushState
    history.pushState = function () { push.apply(this, arguments); send('pageview') }
    addEventListener('popstate', function () { send('pageview') })

    // contor tel: site-wide (contractul de masurare, sursa site_tel_click):
    // orice click pe a[href^="tel:"], pe orice pagina, delegat in capture-phase
    // ca sa prinda si linkuri adaugate dinamic. Cookieless, fail-open.
    addEventListener('click', function (e) {
      try {
        var t = e.target
        var a = t && t.closest ? t.closest('a[href^="tel:"]') : null
        if (a) send('tel_click', { extra: { href: a.getAttribute('href') || '' } })
      } catch (err) {}
    }, true)

    // expune pentru evenimente custom (ex: aB.track('cta_click'))
    window.aB = { track: send }
  } catch (e) { /* fail-open total */ }
})()
