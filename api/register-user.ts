import { kv } from "@vercel/kv";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificación defensiva de variables de entorno
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error("Faltan variables de entorno KV");
    return res.status(500).json({ 
      error: "Error de configuración: Faltan las credenciales de la base de datos (KV_REST_API_URL/TOKEN)." 
    });
  }

  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: "Nombre inválido" });
  }

  try {
    const timestamp = new Date().toISOString();
    const userData = { name: name.trim(), timestamp };
    
    // Guardamos en una lista de usuarios en Vercel KV
    await kv.lpush('site_users', JSON.stringify(userData));
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("KV Error:", error);
    return res.status(500).json({ error: "Error al guardar en base de datos" });
  }
}
