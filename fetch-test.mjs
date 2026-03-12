const fetch = globalThis.fetch;
async function run() {
  const res = await fetch('https://api.argentinadatos.com/v1/cotizaciones/dolares');
  const text = await res.text();
  const data = JSON.parse(text);
  const casas = new Set(data.map(d => d.casa));
  console.log(Array.from(casas));
}
run();
