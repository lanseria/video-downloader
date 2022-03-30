import { createApp } from "vue";
import App from "./App.vue";
import { db } from "@render/db";
import { setupRouter } from "./router";
import { setupStore } from "./store/";

import "@render/styles/index.css";

async function bootstrap() {
  const app = createApp(App);
  // Configure store
  setupStore(app);

  // Configure routing
  setupRouter(app);

  app.mount("#app", true);
}

void bootstrap();
