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
  time: number;
}) {
  try {
    const { id, category, tags, title, price, colors, sizes, time } =
      productData;

    console.log("=============");
    console.log("time is:" + time);

    console.log("=============");
    console.log(typeof price);

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
        time,
      },
    });
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
    console.log("keyword exist~~~~~~");

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

  let sorts: any;

  if (sorting === "newest") {
    console.log("newest~~~~~~~~~~~~~~~~~~~~~~~");
    //sorts = "time:desc";
    sorts = {
      time: {
        order: "desc",
      },
    };
  } else if (sorting === "price_asc") {
    //sorts = "price:asc";
    sorts = {
      price: { order: "asc" },
    };
  } else if (sorting === "price_desc") {
    //sorts = "price:desc";
    sorts = {
      price: { order: "desc" },
    };
  } else {
    //sorts = "click:desc";
    sorts = {
      click: { order: "desc" },
    };
  }

  const result: any = await client.search({
    index: "products",

    _source: [
      "id",
      "category",
      "tags",
      "click",
      "title",
      "price",
      "colors",
      "sizes",
    ],
    body: {
      sort: [sorts],
      size: PRODUCTS_PER_PAGE + 1,
      from: PRODUCTS_PER_PAGE * paging,

      query: {
        bool: {
          must: must,
          filter: [],
          should: [],
          must_not: [],
        },
      },
    },
  });

  console.log(JSON.stringify(result, null, 4));

  return result.hits.hits.map((product: any) => {
    console.log("~~~~~~~~~~~~~~~~~~~~~");
    console.log(product["_source"]["id"]);
    console.log("~~~~~~~~~~~~~~~~~~~~~");

    return product["_source"]["id"];
  });
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
