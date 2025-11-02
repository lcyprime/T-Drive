export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    const authHeader = request.headers.get('Authorization');
    const validKey = `Bearer ${env.API_KEY}`;
    if (pathname !== '/login' && authHeader !== validKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (pathname === '/login' && method === 'POST') {
      const body = await request.json();
      if (body.password === env.LOGIN_PASSWORD) return new Response(JSON.stringify({ token: env.API_KEY }));
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 403 });
    }

    if (pathname === '/upload' && method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file) return new Response('Missing file', { status: 400 });
      const arrayBuffer = await file.arrayBuffer();

      const tgResp = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: new FormData([['chat_id', env.TELEGRAM_CHAT_ID], ['document', new File([arrayBuffer], file.name)]])
      });
      const tgData = await tgResp.json();
      const fileId = tgData.result?.document?.file_id;

      let thumbUrl = null;
      if (file.type.startsWith('image/')) {
        await env.THUMB_CACHE.put(file.name, 'thumb-placeholder');
        thumbUrl = `/thumb/${encodeURIComponent(file.name)}`;
      }

      await env.DB.put(file.name, JSON.stringify({ fileId, type: file.type, thumbUrl }));
      return new Response(JSON.stringify({ success: true }));
    }

    if (pathname === '/list') {
      const list = [];
      for await (const entry of env.DB.list()) list.push({ name: entry.name, ...JSON.parse(entry.value) });
      return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } });
    }

    if (pathname.startsWith('/thumb/')) {
      const key = decodeURIComponent(pathname.split('/thumb/')[1]);
      const cached = await env.THUMB_CACHE.get(key);
      if (cached) return new Response(cached, { headers: { 'Content-Type': 'image/jpeg' } });
      return new Response('Not Found', { status: 404 });
    }

    return new Response('Not Found', { status: 404 });
  }
};
