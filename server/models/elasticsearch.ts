import { Client } from "@elastic/elasticsearch";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PRODUCTS_PER_PAGE = 6;

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
  _id: string;
  category: string;
  tags: string;
  title: string;
  price: number;
  colors: {
    code: string;
    name: string;
  }[];
  sizes: string[];
  time: number;
}) {
  try {
    const { _id, category, tags, title, price, colors, sizes, time } =
      productData;

    const createResult = await client.index({
      index: "products",
      body: {
        _id,
        category,
        tags,
        click: 0,
        title,
        price,
        colors,
        sizes,
        time,
      },
    });

    console.log(createResult);
  } catch (err) {
    console.log(err);
    console.log("something is wrong creating product to elasticsearch");
  }
}

export async function searchProductsIdsFromElastic(
  paging: number,
  keyword: string,
  color: string,
  size: string,
  category: string,
  sorting: string
) {
  const must = [];

  if (keyword) {
    must.push({
      match: {
        title: keyword,
      },
    });
  }

  if (color) {
    must.push({
      match: {
        "colors.name": color,
      },
    });
  }

  if (size) {
    must.push({
      match: {
        sizes: size,
      },
    });
  }

  if (category) {
    must.push({
      match: {
        category: category,
      },
    });
  }

  let sorts = [];

  if (sorting === "newest") {
    sorts.push({
      time: "desc",
    });
  } else if (sorting === "price_asc") {
    sorts.push({
      price: "asc",
    });
  } else if (sorting === "price_desc") {
    sorts.push({
      price: "desc",
    });
  } else {
    sorts.push({
      click: "desc",
    });
  }

  const result: any = await client.search({
    index: "products",
    _source: [
      "_id",
      "category",
      "tags",
      "click",
      "title",
      "price",
      "colors",
      "sizes",
    ],
    size: PRODUCTS_PER_PAGE + 1,
    from: PRODUCTS_PER_PAGE * paging,
    sort: [{ click: "asc" }],
    query: {
      bool: {
        must: must,
        filter: [],
        should: [],
        must_not: [],
      },
    },
  });

  console.log(JSON.stringify(result, null, 4));

  return result.hits.hits.map((product: any) => product["_source"]["_id"]);
}

export async function addClickToElasticSearch(productId: string) {
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
                  _id: productId,
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
