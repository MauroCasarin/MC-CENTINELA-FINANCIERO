import { kv } from "@vercel/kv";

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const latestAnalysis = await kv.get("latest_global_analysis");
      if (latestAnalysis) {
        return res.status(200).json(latestAnalysis);
      } else {
        return res.status(404).json({ error: "No hay informes de cierre disponibles aún." });
      }
    } catch (error: any) {
      console.error("KV Error (get analysis):", error);
      return res.status(500).json({ error: "Error al recuperar el informe global." });
    }
  } 
  
  if (req.method === 'POST') {
    const { content, displayDate } = req.body;
    if (!content || !displayDate) {
      return res.status(400).json({ error: "Content and displayDate are required" });
    }

    try {
      await kv.set("latest_global_analysis", {
        content,
        displayDate,
        timestamp: Date.now()
      });
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("KV Error (save analysis):", error);
      return res.status(500).json({ error: "Error al guardar el informe global." });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
