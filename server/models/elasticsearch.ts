import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: "https://elastic:F1X-OtoXeFVBGfh7trH5@localhost:9200",
});

export default client;
