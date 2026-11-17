import "dotenv/config";
import Api from "./app.js";
import { repo } from "./repository/Repository.js";

const port = Number(process.env.PORT) || 4001;

const api = new Api(repo);
const app = api.App;

app.listen(port, (err?: Error) => {
  if (err) {
    console.error(`[server]: Failed to start on port ${port}:`, err.message);
    process.exit(1);
  }
  console.log(`[server]: Server is running on port ${port}`);
});
