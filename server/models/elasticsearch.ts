import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const client = new Client({
  node: {
    url: new URL(process.env.ELASTICSEARCH_NODE || "undefined"),
  },
  tls: {
    ca: process.env.ELASTICSEARCH_CERTIFICATE,
    rejectUnauthorized: false,
  },
});
//
export default client;
