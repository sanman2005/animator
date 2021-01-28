export default (
  title: string,
  appState: object = {},
  content: string = '',
  staticRoot: string = '',
) =>
  `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport"
        content="initial-scale=1.0, width=device-width, maximum-scale=1.0, user-scalable=no" />
      <title>${title}</title>
      <link href="${staticRoot}/css/main.css" rel="stylesheet" />
    </head>
    <body>
      <div id="app">${content}</div>
      <script>
        window.__STATE__ = ${JSON.stringify(appState)};
      </script>
      <script src="${staticRoot}/js/client.js"></script>
    </body>
    </html>
    `;
