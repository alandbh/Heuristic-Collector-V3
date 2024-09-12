self.addEventListener("fetch", (event) => {
    // Regular requests not related to Web Share Target.
    if (event.request.method !== "POST") {
        event.respondWith(fetch(event.request));
        return;
    }

    // Requests related to Web Share Target.
    event.respondWith(
        (async () => {
            const formData = await event.request.formData();
            const link = formData.get("link") || "";
            // Instead of the original URL `/save-bookmark/`, redirect
            // the user to a URL returned by the `saveBookmark()`
            // function, for example, `/`.
            const responseUrl = await saveBookmark(link);
            return Response.redirect(responseUrl, 303);
        })()
    );
});
