# CI shell

One header and one footer for every page on clinicallyintelligent.com.

Already applied to: /overview/, /publication/, /work-with-ci/, /build/, /work/would-you-send-it/.

To apply it to any other page (homepage, Field Guide pages, templates, problems):
1. Delete the page's existing header/nav and footer.
2. Add the contents of shell.css at the end of the page's <style> block.
3. Paste header.html as the first thing inside <body>.
4. Paste footer.html after the page content.
5. Paste shell.js just before </body>.
6. Check: the logo sits in the top-left corner, the menu opens on a phone, nothing scrolls sideways.

Fonts: the shell expects Fraunces and Inter Tight. If a page doesn't load them, add the same Google Fonts link the new pages use.

Favicon: every page includes these four lines just before </head>, so the CI logo shows in browser tabs and Google results:

    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96">
    <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
