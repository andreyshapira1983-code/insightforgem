// /js/admin.js — вызывает твои Netlify Functions и печатает JSON в <pre id="out">

const Admin = (() => {
  const OUT = () => document.getElementById('out');
  const TOKEN_INPUT = () => document.getElementById('token');
  const BG_INPUT = () => document.getElementById('bgUrl');
  const REASON_INPUT = () => document.getElementById('reason');

  // init
  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('adminToken') || '';
    TOKEN_INPUT().value = saved;
  });

  function saveToken() {
    const v = TOKEN_INPUT().value.trim();
    localStorage.setItem('adminToken', v);
    print({ ok: true, message: 'Токен сохранён локально' });
  }

  async function call(path, method = 'GET', body) {
    const token = (localStorage.getItem('adminToken') || '').trim();
    if (!token) {
      print({ ok: false, error: 'нет X-Admin-Token' });
      throw new Error('нет X-Admin-Token');
    }
    const init = {
      method,
      headers: {
        'x-admin-token': token
      }
    };
    if (body) {
      init.headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    const res = await fetch(path, init);
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok) {
      print({ ok: false, status: res.status, data });
      throw new Error('request failed');
    }
    print(data);
    return data;
  }

  function print(obj) {
    OUT().textContent = JSON.stringify(obj, null, 2);
  }

  // actions
  async function updateBackground() {
    const url = BG_INPUT().value.trim();
    const body = url ? { url } : undefined;
    return call('/.netlify/functions/updateBackground', 'POST', body);
  }

  async function refreshSite(clearCache = false) {
    const reason = REASON_INPUT().value.trim();
    const body = { clearCache: !!clearCache };
    if (reason) body.reason = reason;
    return call('/.netlify/functions/refreshSite', 'POST', body);
  }

  async function weeklyReport() {
    return call('/.netlify/functions/weeklyReport', 'GET');
  }

  async function newsPull() {
    return call('/.netlify/functions/newsPull', 'GET');
  }

  // public
  return { saveToken, updateBackground, refreshSite, weeklyReport, newsPull };
})();
