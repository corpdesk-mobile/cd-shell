import { Main } from "./main";
console.log("start 1");
const app = new Main();
app.init();
app.run().catch((err) => {
  console.error("[BOOTSTRAP ERROR]", err);
});
