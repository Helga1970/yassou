// netlify/edge-functions/check-referer-v2.js

export default async (request, context) => {
  const referer = request.headers.get('referer');
  const requestUrl = request.url;

  console.log('Incoming request URL:', requestUrl);
  console.log('Referer header:', referer);

  // Разрешённые домены
  const allowedReferers = [
    // Домены, с которых разрешен переход на ваш сайт
    'https://pro-culinaria.ru',
    'http://pro-culinaria.ru',
    'https://www.pro-culinaria.ru',
    'http://www.pro-culinaria.ru',
    'pro-culinaria.ru',
    'www.pro-culinaria.ru',

    // Домен Netlify для yassou1, чтобы внутренние ресурсы грузились, если сайт открыт напрямую через него
    'https://yassou1.netlify.app',
    'http://yassou1.netlify.app',

    // ВАШ НОВЫЙ ПОЛЬЗОВАТЕЛЬСКИЙ ДОМЕН (для внутренних ресурсов сайта yassou)
    'https://yassou.proculinaria-book.ru', // <-- ДОБАВИТЬ ЭТУ СТРОКУ
    'http://yassou.proculinaria-book.ru',  // <-- И ЭТУ СТРОКУ
  ];

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;

      console.log('Parsed Referer Origin:', refererOrigin);

      const isAllowed = allowedReferers.includes(refererOrigin);

      console.log('Is referer allowed?', isAllowed);

      if (isAllowed) {
        return context.next();
      }
    } catch (e) {
      console.error("Invalid referer URL or parsing error:", referer, e);
    }
  } else {
    console.log('No referer header found. Blocking.');
  }

  console.log('Blocking request: Referer not allowed or missing.');
  return new Response('Access Denied: This page is only accessible from allowed sources.', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
