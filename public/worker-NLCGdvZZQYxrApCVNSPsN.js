self.addEventListener("fetch",(e=>{"POST"===e.request.method?e.respondWith((async()=>{const t=(await e.request.formData()).get("link")||"",r=await saveBookmark(t);return Response.redirect(r,303)})()):e.respondWith(fetch(e.request))}));