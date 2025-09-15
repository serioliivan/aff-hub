import { supaAdmin } from '../lib/supabase.js';
import { sha256, cleanRef } from '../lib/utils.js';

export default async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const address = url.searchParams.get('address');
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const checkin = url.searchParams.get('checkin');
    const checkout = url.searchParams.get('checkout');
    const campaign = cleanRef(url.searchParams.get('campaign') || '');

    const dest = new URL('https://www.stay22.com/allez/roam');
    // AID per primo (best practice Stay22)
    dest.searchParams.set('aid', process.env.STAY22_AID);
    if (lat && lng) { dest.searchParams.set('lat', lat); dest.searchParams.set('lng', lng); }
    else if (address) dest.searchParams.set('address', address);
    if (checkin) dest.searchParams.set('checkin', checkin);
    if (checkout) dest.searchParams.set('checkout', checkout);
    if (campaign) dest.searchParams.append('campaign', campaign);

    const partnerUrl = dest.toString();

    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '';
      await supaAdmin.from('clicks').insert({
        ref: campaign || null,
        network: 'STAY22',
        target: partnerUrl,
        ua: req.headers['user-agent'] || null,
        ip_hash: sha256(ip)
      });
    } catch (e) { /* non bloccare redirect */ }

    res.writeHead(302, { Location: partnerUrl }); res.end();
  } catch (e) {
    res.status(500).send('go-stay22 error');
  }
};
