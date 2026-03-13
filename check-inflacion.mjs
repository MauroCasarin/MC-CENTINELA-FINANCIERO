const fetch = globalThis.fetch;
async function run() {
  try {
    const res = await fetch('https://api.argentinadatos.com/v1/finanzas/indices/inflacion');
    const data = await res.json();
    console.log(JSON.stringify(data.slice(-3), null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
