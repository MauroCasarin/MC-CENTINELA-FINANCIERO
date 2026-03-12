import { kv } from "@vercel/kv";

export default async function handler(req: any, res: any) {
  // Solo permitimos GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const visits = await kv.incr('site_visits');
    res.status(200).json({ visits });
  } catch (error) {
    console.error("KV Error (visits):", error);
    res.status(500).json({ error: "Error al actualizar visitas" });
  }
}
