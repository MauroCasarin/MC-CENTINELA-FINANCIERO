const fetch = globalThis.fetch;
async function test() {
  const id = "331.2_SALDO_BASERIA__15";
  const url = `https://apis.datos.gob.ar/series/api/series?ids=${id}&limit=1&sort=desc`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
