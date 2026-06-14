// Relais OAuth "Device Flow" GitHub pour l'éditeur du site (admin.html).
//
// Le Device Flow ne nécessite AUCUN client_secret : il est fait pour les apps
// qui ne peuvent pas stocker de secret. Cette fonction sert uniquement de relais
// (les endpoints GitHub n'autorisent pas les appels directs depuis le navigateur,
// à cause de CORS). Elle ne détient donc aucun identifiant confidentiel.
//
// Variables d'environnement Netlify :
//   GITHUB_CLIENT_ID — ID public de l'OAuth App GitHub (Device Flow activé)
//   CMS_ORIGIN       — origine autorisée, ex. https://autumn477.github.io

const ALLOWLIST = [
  process.env.CMS_ORIGIN,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
].filter(Boolean);

function cors(origin) {
  const allow = ALLOWLIST.indexOf(origin) !== -1 ? origin : (process.env.CMS_ORIGIN || '*');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

exports.handler = async (event) => {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const headers = cors(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  if (!CLIENT_ID) return { statusCode: 500, headers, body: JSON.stringify({ error: 'missing_client_id' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'bad_request' }) }; }

  const json = (code, obj) => ({
    statusCode: code,
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
    body: JSON.stringify(obj),
  });

  try {
    // 1) Demande d'un code d'appairage
    if (body.action === 'code') {
      const r = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, scope: body.scope || 'repo' }),
      });
      return json(r.ok ? 200 : 502, await r.json());
    }

    // 2) Sondage du jeton (tant que l'utilisateur n'a pas validé)
    if (body.action === 'token' && body.device_code) {
      const r = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code: body.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });
      return json(200, await r.json());
    }

    return json(400, { error: 'unknown_action' });
  } catch (e) {
    return json(502, { error: 'github_unreachable' });
  }
};
