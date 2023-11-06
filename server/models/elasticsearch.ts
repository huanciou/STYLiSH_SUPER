import { Client } from "@elastic/elasticsearch";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
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

export async function uploadProductsToElasticSearch(productData: {
  id: string;
  category: string;
  tags: string;
  title: string;
  price: number;
  colors: {
    code: string;
    name: string;
  }[];
  sizes: string[];
}) {
  try {
    const { id, category, tags, title, price, colors, sizes } = productData;

    const createResult = await client.index({
      index: "products",
      body: {
        id,
        category,
        tags,
        click: 0,
        title,
        price,
        colors,
        sizes,
      },
    });

    console.log(createResult);
  } catch (err) {
    console.log(err);
    console.log("something is wrong creating product to elasticsearch");
  }
}

export async function addClickToElasticSearch(productId: number) {
  try {
    const addResult = await client.updateByQuery({
      index: "products",
      body: {
        script: {
          source: "ctx._source.click=ctx._source.click+1;",
        },
        query: {
          bool: {
            must: [
              {
                match: {
                  id: productId,
                },
              },
            ],
          },
        },
      },
    });
    return addResult;
  } catch (err) {
    console.log(err);
    console.log("something goes wrong adding click to elastic");

    return null;
  }
}
//
export default client;
