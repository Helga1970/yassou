// netlify/edge-functions/check-referer-v2.js

export default async (request, context) => {
  const referer = request.headers.get('referer');
  const requestUrl = request.url;

  console.log('Incoming request URL:', requestUrl);
  console.log('Referer header:', referer);

  // Разрешённые домены
  const allowedReferers = [
    'https://pro-culinaria.ru',
    'http://pro-culinaria.ru',
    'https://www.pro-culinaria.ru',
    'http://www.pro-culinaria.ru',

    // !!! ВАЖНО !!!
    // Добавляем домен самого Netlify сайта, чтобы он мог загружать свои ресурсы (изображения, CSS, JS).
    // Реферер всегда будет включать протокол (http:// или https://).
    `https://${new URL(requestUrl).hostname}`, // Динамически получаем HTTPS домен Netlify сайта
    `http://${new URL(requestUrl).hostname}`,  // Динамически получаем HTTP домен Netlify сайта

    // Если у вас есть кастомный домен, привязанный к Netlify, добавьте его сюда тоже:
    // 'https://ваш-кастомный-домен.com',
    // 'http://ваш-кастомный-домен.com',
  ];

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin; // Получаем origin (например, "https://example.com")

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
      // Если URL реферера невалидный, его тоже нужно блокировать.
    }
  } else {
    // Если заголовок Referer отсутствует (например, прямой заход, или из-за настроек браузера/приватности),
    // текущая логика блокирует доступ. Это правильно для вашей цели "только с 1 сайта".
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
