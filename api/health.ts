export default function handler(req: any, res: any) {
  res.status(200).json({ 
    status: "ok", 
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    time: new Date().toISOString()
  });
}
