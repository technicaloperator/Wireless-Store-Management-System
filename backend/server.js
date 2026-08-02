import app from "./app.js";
import config from "./config/index.js";

const PORT = config.port || 4000;

app.listen(PORT, () => {
  console.log(`WSMS Backend listening on http://localhost:${PORT}`);
});
