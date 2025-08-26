import app from "./app.js";
import { config } from "./config/env.js";

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
