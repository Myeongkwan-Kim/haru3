/* 하루 세 아이 — 오프라인 캐시.
   유치원 무선망이 끊겨도 홈 화면 아이콘으로 앱이 열려야 한다.
   기록 자체는 localStorage에 있으므로 여기서 캐시하는 것은 앱 껍데기뿐이다. */
var CACHE = "haru3-shell-v1";
var ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* network-first: 새로 배포한 버전이 바로 반영되고, 망이 없을 때만 캐시로 떨어진다.
   외부 요청(구글 폰트)은 건드리지 않는다 — 폰트는 실패해도 대체 글꼴로 읽힌다. */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var url;
  try { url = new URL(e.request.url); } catch(err){ return; }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(function(res){
      if (res && res.status === 200){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        return m || caches.match("./index.html");
      });
    })
  );
});
