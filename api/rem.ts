export default async function handler(req: any, res: any) {
  try {
    // Usamos el ID de serie validado para la mediana de inflación mensual del REM
    const response = await fetch("https://apis.datos.gob.ar/series/api/series?ids=430.1_REM_IPC_NAL_T_M_0_0_25_28&limit=1&sort=desc");
    if (!response.ok) throw new Error(`Error API Gob: ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error("REM API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
