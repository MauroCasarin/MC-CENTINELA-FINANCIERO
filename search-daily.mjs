const fetch = globalThis.fetch;
async function search(q) {
  try {
    const res = await fetch(`https://apis.datos.gob.ar/series/api/search?q=${q}&limit=10`);
    const data = await res.json();
    console.log(`Search: ${q}`);
    data.data.forEach(d => {
      console.log(`ID: ${d.field.id} | Title: ${d.field.title} | Desc: ${d.field.description} | Units: ${d.field.units} | Freq: ${d.field.frequency}`);
    });
  } catch (e) {
    console.error(`Error searching ${q}: ${e.message}`);
  }
}

async function run() {
  await search("Reservas Internacionales diarias");
}
run();
