const filesToCache = [
    //"/",
    "manifest.json",
    //"/api/racuni/",
    //"/racun"
];

const staticCacheName = "static-cache-v1";

self.addEventListener('install', (event) => {
  	console.log('SW installing...');
	event.waitUntil(
		caches.open(staticCacheName).then((cache) => {
		    return cache.addAll(filesToCache);
		})
	);
	console.log("Caches setup!");
  
});

self.addEventListener('activate', (event) => {
  	console.log('SW activating');
});

self.addEventListener('fetch', (event) => {
	//console.log('Fetching:', event.request.url);
	var urlString = event.request.url.toString();

	event.respondWith(
		fetch(event.request).then((response) => {
		
			if (response.status === 404) {
				return caches.match("404.html");
			}
		
			const clone = response.clone();
			caches.open(staticCacheName).then((cache) => {
		    	//console.log("Kesiram: " + event.request.url);
				cache.put(event.request, clone);                    
			});
			return response;
		
		})
	);	
	//event.respondWith(fetch(event.request));
});
