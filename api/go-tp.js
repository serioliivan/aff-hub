import { supaAdmin } from '../lib/supabase.js';
import { sha256, cleanRef } from '../lib/utils.js';

export default async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const target = url.searchParams.get('target');
    const subid  = cleanRef(url.searchParams.get('subid') || '');
    if (!target) return res.status(400).send('Missing target');

    const body = {
      trs: Number(process.env.TP_TRS),
      marker: Number(process.env.TP_MARKER),
      shorten: true,
      links: [{ url: target, sub_id: subid || undefined }]
    };
    const r = await fetch('https://api.travelpayouts.com/links/v1/create', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'X-Access-Token': process.env.TP_TOKEN },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    const partnerUrl = data?.result?.links?.[0]?.partner_url || target;

    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '';
      await supaAdmin.from('clicks').insert({
        ref: subid || null, network:'TP', target: partnerUrl,
        ua: req.headers['user-agent'] || null, ip_hash: sha256(ip)
      });
    } catch {}

    res.writeHead(302, { Location: partnerUrl }); res.end();
  } catch (e) {
    res.status(500).send('go-tp error');
  }
};
