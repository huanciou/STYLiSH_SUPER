import elasticClient from "./elasticsearch.js";

const PRODUCTS_PER_PAGE = 2;

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
      id: "desc",
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

  const result: any = await elasticClient.search({
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

  return result.hits.hits.map((product: any) => product["_source"]["id"]);
}

// interface product {
//   _index: string;
//   _id: string;
//   _score: number | null;
//   _source: {
//     id: number;
//     category: string;
//     tags: string[];
//     click: 3;
//     title: string;
//     price: number;
//     colors: {
//       code: string;
//       name: string;
//     }[];
//     sizes: string[];
//   };
//   sort: number[];
// }
