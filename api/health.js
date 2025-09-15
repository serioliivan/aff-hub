export default async (_, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
};
