import { supaAdmin } from '../lib/supabase.js';

export default async (req, res) => {
  try {
    const since = new Date(); since.setDate(since.getDate()-60);
    const url = new URL(process.env.STAY22_REPORT_URL);
    url.searchParams.set('start_date', since.toISOString().slice(0,10));
    url.searchParams.set('end_date',   new Date().toISOString().slice(0,10));

    const r = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${process.env.STAY22_REPORT_TOKEN}` }
    });
    if (!r.ok) throw new Error('Stay22 http ' + r.status);
    const data = await r.json();
    const rows = data?.results || data || [];

    const payload = rows.map(x => ({
      booking_id: String(x.booking_id || x.id),
      ref: (x.campaign||'').trim() || null,
      merchant: x.merchant || null,
      state: (x.state||x.status||'').toLowerCase(),
      currency: x.currency || 'EUR',
      amount: x.amount != null ? Number(x.amount) : null,
      commission: x.commission != null ? Number(x.commission) : null,
      checkin: x.checkin || null,
      checkout: x.checkout || null,
      created_at: x.created_at ? new Date(x.created_at).toISOString() : null
    }));

    while (payload.length) {
      const chunk = payload.splice(0, 1000);
      const { error } = await supaAdmin.from('conversions_stay22').upsert(chunk, { onConflict: 'booking_id' });
      if (error) throw error;
    }

    res.status(200).json({ ok:true, count: rows.length });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e) });
  }
};
