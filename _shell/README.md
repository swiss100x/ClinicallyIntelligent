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
