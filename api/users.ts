import { kv } from "@vercel/kv";

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificación defensiva de variables de entorno
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(500).json({ 
      error: "Error de configuración: Faltan las credenciales de la base de datos." 
    });
  }

  try {
    const users = await kv.lrange('site_users', 0, -1);
    const parsedUsers = users.map(u => typeof u === 'string' ? JSON.parse(u) : u);
    return res.status(200).json(parsedUsers);
  } catch (error) {
    console.error("KV Error:", error);
    return res.status(500).json({ error: "Error al obtener usuarios" });
  }
}
