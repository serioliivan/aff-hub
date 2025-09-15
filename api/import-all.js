export default async (req, res) => {
  try {
    const base = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '';
    const [tp, s22] = await Promise.all([
      fetch(base + '/api/import-travelpayouts', { method:'POST' }).then(r=>r.json()).catch(e=>({ok:false,error:String(e)})),
      fetch(base + '/api/import-stay22', { method:'POST' }).then(r=>r.json()).catch(e=>({ok:false,error:String(e)}))
    ]);
    res.status(200).json({ ok:true, tp, s22 });
  } catch (e) {
    res.status(500).json({ ok:false, error:String(e) });
  }
};
