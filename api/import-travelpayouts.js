import { supaAdmin } from '../lib/supabase.js';

async function fetchTpProgram(programId, sinceDate) {
  const body = {
    fields: ["action_id","sub_id","state","price_eur","paid_profit_eur","date","created_at","updated_at","campaign_id"],
    filters: [
      { field:"type", op:"eq", value:"action" },
      { field:"campaign_id", op:"eq", value: Number(programId) },
      { field:"date", op:"ge", value: sinceDate }
    ],
    sort: [{ field:"date", order:"asc" }],
    limit: 10000, offset: 0
  };
  const r = await fetch('https://api.travelpayouts.com/statistics/v1/execute_query', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'X-Access-Token': process.env.TP_TOKEN },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('TP stats http ' + r.status);
  const data = await r.json();
  return data?.results || [];
}

export default async (req, res) => {
  try {
    const since = new Date(); since.setDate(since.getDate()-60);
    const sinceDate = since.toISOString().slice(0,10);

    const programs = [
      process.env.TP_PROGRAM_ID_AVIASALES || '100',
      process.env.TP_PROGRAM_ID_HOTELLOOK || '132'
    ];

    let rows = [];
    for (const pid of programs) {
      const part = await fetchTpProgram(pid, sinceDate);
      rows = rows.concat(part);
    }

    const payload = rows.map(x => ({
      action_id: String(x.action_id),
      ref: (x.sub_id||'').trim() || null,
      campaign_id: x.campaign_id ?? null,
      state: String(x.state||'').toLowerCase(),
      currency: 'EUR',
      price: x.price_eur != null ? Number(x.price_eur) : null,
      paid_profit: x.paid_profit_eur != null ? Number(x.paid_profit_eur) : null,
      date: x.date,
      created_at: x.created_at ? new Date(x.created_at).toISOString() : null,
      updated_at: x.updated_at ? new Date(x.updated_at).toISOString() : null
    }));

    while (payload.length) {
      const chunk = payload.splice(0, 1000);
      const { error } = await supaAdmin.from('conversions_tp').upsert(chunk, { onConflict: 'action_id' });
      if (error) throw error;
    }

    res.status(200).json({ ok:true, count: rows.length });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e) });
  }
};
