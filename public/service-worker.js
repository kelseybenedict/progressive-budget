const CACHE_NAME = "budget-tracker-cache";
const DATA_CACHE_NAME = "data-cache";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/db.js",
    "/index.js",
    "/icons/icon-192X192.png",
    "/icons/icon-512x512.png",
    "/manifest.webmanifest"
  ];
  
 // installation for cache
 self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });

  // activating cache -- taking care of cleaning up old caches
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            // remove old cache data if key is not equal to our cache & data name
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
});

// fetch cache
self.addEventListener("fetch", function(evt) {
    // if successful, cache requests to the API
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              //  If we get a 200 - OK, clone it and then add to cache
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              // here we try to get info from cache if the network request failed
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
    // cache only behavior so we can utilize it offline
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
      );
    });