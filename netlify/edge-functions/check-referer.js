// netlify/edge-functions/check-referer-v2.js

export default async (request, context) => {
  const referer = request.headers.get('referer');
  const requestUrl = request.url;

  console.log('Incoming request URL:', requestUrl);
  console.log('Referer header:', referer);

  // Разрешённые домены
  // Здесь мы оставляем те домены, которые разрешил ChatGPT,
  // и добавляем домен самого Netlify сайта.
  const allowedReferers = [
    'https://pro-culinaria.ru',
    'http://pro-culinaria.ru',
    'https://www.pro-culinaria.ru',
    'http://www.pro-culinaria.ru',
    'pro-culinaria.ru',         // Оставляем эти как есть, чтобы не нарушать логику ChatGPT
    'www.pro-culinaria.ru',     // Оставляем эти как есть, чтобы не нарушать логику ChatGPT

    // !!! ВАЖНО !!!
    // Добавляем домен самого Netlify сайта, чтобы он мог загружать свои ресурсы (изображения, CSS).
    // Когда браузер запрашивает картинки со страницы pesto-book.netlify.app,
    // реферером будет сам pesto-book.netlify.app.
    'https://pesto-book.netlify.app',
    'http://pesto-book.netlify.app',
  ];

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;

      console.log('Parsed Referer Origin:', refererOrigin);

      // Проверяем, входит ли refererOrigin в список разрешённых доменов.
      const isAllowed = allowedReferers.includes(refererOrigin);

      console.log('Is referer allowed?', isAllowed);

      if (isAllowed) {
        // Если реферер разрешён, пропускаем запрос
        return context.next();
      }
    } catch (e) {
      console.error("Invalid referer URL or parsing error:", referer, e);
    }
  } else {
    // Если заголовок Referer отсутствует (например, прямой заход),
    // текущая логика блокирует доступ.
    console.log('No referer header found. Blocking.');
  }

  // Если реферер отсутствует или не разрешён, блокируем доступ
  console.log('Blocking request: Referer not allowed or missing.');
  return new Response('Access Denied: This page is only accessible from allowed sources.', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
