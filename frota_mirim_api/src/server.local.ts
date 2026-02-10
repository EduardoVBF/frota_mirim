import { app } from "./app"; // Importação nomeada aqui

async function start() {
  try {
    await app.ready(); 
    await app.listen({ port: 3333, host: "0.0.0.0" });
    console.log("🚀 API running on http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();