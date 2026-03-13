const fetch = globalThis.fetch;
async function run() {
  try {
    const res = await fetch('https://apis.datos.gob.ar/series/api/series?ids=430.1_REM_IPC_NAL_T_M_0_0_25_28&limit=1&sort=desc');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
