export default async function handler(req: any, res: any) {
  try {
    const response = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares');
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    const data = await response.json();
    
    // Group by casa and take the last 15 items
    const grouped: Record<string, any[]> = {};
    for (const item of data) {
      if (!grouped[item.casa]) {
        grouped[item.casa] = [];
      }
      grouped[item.casa].push(item);
    }
    
    const result: Record<string, any[]> = {};
    for (const casa in grouped) {
      // The API returns data sorted chronologically (oldest first)
      result[casa] = grouped[casa].slice(-15);
    }
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching historico:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
}
