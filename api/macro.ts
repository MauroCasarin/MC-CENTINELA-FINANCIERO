import { kv } from "@vercel/kv";

const SERIES_IDS = {
  reservas: "174.1_RRVAS_IDOS_0_0_36",
  baseMonetaria: "331.2_SALDO_BASERIA__15",
  emae: "302.2_S_ORIGINALRAL_0_M_21",
  badlar: "89.2_TS_INTELAR_0_D_20"
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Intentamos obtener de caché (Vercel KV) para no saturar la API oficial
    const cacheKey = "macro_indicators_latest";
    const cached = await kv.get(cacheKey);
    
    // Si hay caché y tiene menos de 1 hora, lo usamos
    if (cached && (Date.now() - (cached as any).timestamp < 3600000)) {
      return res.status(200).json(cached);
    }

    const fetchSeries = async (id: string) => {
      const url = `https://apis.datos.gob.ar/series/api/series?ids=${id}&limit=5&sort=desc`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const json = await response.json();
      
      if (json && json.data && json.data.length > 0) {
        const latestValid = json.data.find((row: any[]) => row[1] !== null);
        if (latestValid) {
          return {
            data: [latestValid],
            meta: json.meta
          };
        }
      }
      return json;
    };

    const keys = Object.keys(SERIES_IDS);
    const results = await Promise.all(keys.map(key => fetchSeries((SERIES_IDS as any)[key])));
    
    const result: any = {
      timestamp: Date.now(),
      data: {}
    };

    results.forEach((data, index) => {
      const key = keys[index];
      if (data && data.data && data.data[0]) {
        const metaWithField = data.meta.find((m: any) => m.field);
        if (metaWithField) {
          result.data[key] = {
            valor: data.data[0][1],
            fecha: data.data[0][0],
            unidades: metaWithField.field.units,
            descripcion: metaWithField.field.description
          };
        }
      }
    });

    // Guardamos en caché
    await kv.set(cacheKey, result);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching macro data:", error);
    res.status(500).json({ error: "Failed to fetch macro indicators" });
  }
}
