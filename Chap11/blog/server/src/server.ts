import "dotenv/config";
import Api from "./app.js";
import { repo } from "./repository/Repository.js";

const port = process.env.PORT || 4001;

const api = new Api(repo);
const app = api.App;

app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});
