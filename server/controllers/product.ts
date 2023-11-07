import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { NextFunction, Request, Response } from "express";
import { fileTypeFromBuffer } from "file-type";
import { product, campaign, order, user } from "../schema/schema.js"

function mapId<Item extends { id: number }>(item: Item) {
  return item.id;
}

function mapImages(imagesObj: {
  [productId: string]: { main_image: string; images: string[] };
}) {
  return <Product extends { id: number }>(product: Product) => ({
    ...product,
    main_image: `${imagesObj[product.id]?.main_image}` ?? "",
    images: imagesObj[product.id]?.images?.map?.((image) => `${image}`) ?? [],
  });
}

function mapVariants(variantsObj: {
  [productId: string]: {
    variants: {
      color_code: string;
      size: string;
      stock: number;
    }[];
    sizes: Set<string>;
    colorsMap: { [colorCode: string]: string };
  };
}) {
  return <Product extends { id: number }>(product: Product) => ({
    ...product,
    ...variantsObj[product.id],
    sizes: Array.from(variantsObj[product.id].sizes),
    colors: Object.entries(variantsObj[product.id].colorsMap).map(
      ([key, value]) => ({
        code: key,
        name: value,
      })
    ),
  });
}

function resp(productsData: any, next_paging: any = -1){
  
  if(next_paging === -1){
    const resData = {
      data: [productsData].map((i: any) => {
        const colors: any = [];
        i.color.forEach((color: any, index: number) => {
          colors.push({
            code: color,
            name: i.colorName[index],
          });
        });
    
        const sizes = i.size;
    
        const variants: any = [];
        i.color.forEach((color: any, index: number) => {
          variants.push({
            color_code: color,
            size: sizes[index],
            stock: i.stock[index],
          });
        });
    
        return {
          id: i._id,
          category: i.category,
          tags: i.tags,
          title: i.title,
          description: i.description,
          price: i.price,
          texture: i.texture,
          wash: i.wash,
          place: i.place,
          note: i.note,
          story: i.story,
          colors,
          sizes,
          variants,
          main_image: i.main_image,
          images: i.images,
        };
      }),
    };
    return resData;
  } else {

  const resData = {
    data: productsData.map((i: any) => {
      const colors: any = [];
      i.color.forEach((color: any, index: number) => {
        colors.push({
          code: color,
          name: i.colorName[index],
        });
      });
  
      const sizes = i.size;
  
      const variants: any = [];
      i.color.forEach((color: any, index: number) => {
        variants.push({
          color_code: color,
          size: sizes[index],
          stock: i.stock[index],
        });
      });
  
      return {
        id: i._id,
        category: i.category,
        tags: i.tags,
        title: i.title,
        description: i.description,
        price: i.price,
        texture: i.texture,
        wash: i.wash,
        place: i.place,
        note: i.note,
        story: i.story,
        colors,
        sizes,
        variants,
        main_image: i.main_image,
        images: i.images,
      };
    }),
    next_paging, 
  };
  return resData;
}
} 

export async function getProducts(req: Request, res: Response) {
  try {
    const paging = Number(req.query.paging) || 0;
    const category = req.params.category;
    const PAGE_COUNT = 7;
    const PAGE_SKIP = 6;

    if(category === 'all'){
      const productsData = await product.find().skip(paging*PAGE_SKIP).limit(PAGE_COUNT);
      console.log(paging, );
    let next_paging: number | null = paging + 1;
    if(productsData.length > 6){
      productsData.pop();
    } else {
      next_paging = null;
    }
      const resData = resp(productsData, next_paging);
      return res.json(resData);
    }

    const productsData: any = await product.find({category}).skip(paging*PAGE_SKIP).limit(PAGE_COUNT);

    let next_paging: number | null = paging + 1;
    if(productsData.length > 6){
      productsData.pop();
    } else {
      next_paging = null;
    }
    const resData = resp(productsData, next_paging);
    res.json(resData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ data: []});
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const id = String(req.query.id);

    const productData = await product.findOneAndUpdate(
      { _id: id },
      { $inc: { click: 1 } },
      { new: true }
    );
    const resData = resp(productData);
    res.json(resData);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "get products failed" });
  }
}

export async function searchProducts(req: Request, res: Response) {
  try {
    const paging = Number(req.query.paging) || 0;
    const keyword =
      typeof req.query.keyword === "string" ? req.query.keyword : "";
      const PAGE_COUNT = 7;
      const PAGE_SKIP = 6;

    const productsData = await product.find({title:{$regex: keyword, $options: "i"}
    })
      .sort({id: 1})
      .skip(paging*PAGE_SKIP)
      .limit(PAGE_COUNT);

    let next_paging: number | null = paging + 1;
    if(productsData.length > 6){
      productsData.pop();
    } else {
      next_paging = null;
    }

    const resData = resp(productsData, next_paging);
    res.json(resData);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "search products failed" });
  }
}

function generateImages(files: { [fieldname: string]: Express.Multer.File[] }) {
  const images = Object.values(files).reduce(
    (acc: Express.Multer.File[], value) => {
      if (Array.isArray(value)) {
        acc.push(...value);
      }
      return acc;
    },
    []
  );
  return images;
}

function isFilesObject(object: any): object is {
  [fieldname: string]: Express.Multer.File[];
} {
  return (
    typeof object === "object" && Object.values(object).every(Array.isArray)
  );
}

export async function checkFileType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (isFilesObject(req.files)) {
    const images = await Promise.all(
      generateImages(req.files).map(async (file) => {
        const fileType = await fileTypeFromBuffer(file.buffer);
        return { ...file, ...fileType };
      })
    );
    images.forEach((image) => {
      if (image.mime !== image.mimetype) {
        throw new Error("fake type");
      }
    });
    res.locals.images = images;
  }
  next();
}

export async function saveImagesToDisk(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (Array.isArray(res.locals.images) && res.locals.images.length > 0) {
      const images = await Promise.all(
        res.locals.images.map(
          (image) =>
            new Promise((resolve, reject) => {
              const __filename = fileURLToPath(import.meta.url);
              const __dirname = path.dirname(__filename);
              const filename = `${nanoid(12)}.${image.ext}`;
              const imagePath = path.join(
                __dirname,
                `../../uploads/${filename}`
              );
              fs.writeFile(imagePath, image.buffer, (err) => {
                if (err) {
                  reject(err);
                }
                resolve({ ...image, filename, path: `/uploads/${filename}` });
              });
            })
        )
      );
      res.locals.images = images;
    }
    next();
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    return res.status(500).json({ errors: "save images failed" });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {

      const updatedImages = [];
      for (let i = 0; i < res.locals.images.length; i++) {
        updatedImages.push(res.locals.images[i].filename);
      }

      req.body.main_image = res.locals.images[0].filename;
      req.body.images = updatedImages;


      const CATE_TAGS: any = req.body.tags;

      console.log(CATE_TAGS);

      const CATE = req.body.category;
      console.log(CATE);

      req.body.tags = CATE_TAGS.map((tag: String)=>{
        return `${CATE}_${tag}`;
      })
      console.log(req.body);
      const productData = await product.create(req.body);

      const productId = productData._id.toString();
      // console.log(productId);
      // product.updateOne({_id: productId}, {main_image: res.locals.images[0].filename});
      
      // product.updateOne({ _id: productId }, { images: updatedImages });
      
    // }

    // if (typeof req.body.color === "string" && req.body.color.length > 0) {
    //   await productVariantModel.createProductVariants([
    //     {
    //       productId,
    //       color: req.body.color,
    //       colorName: req.body.colorName,
    //       size: req.body.size,
    //       stock: req.body.stock,
    //     }, 
    //   ]);
    // }
    // if (Array.isArray(req.body.color) && req.body.color.length > 0) {
    //   const variants = req.body.color.map((color: string, index: number) => {
    //     return {
    //       productId,
    //       color,
    //       colorName: req.body.colorName[index],
    //       size: req.body.size[index],
    //       stock: req.body.stock[index],
    //     };
    //   });
    //   await productVariantModel.createProductVariants(variants);
    // }

    
    res.status(200).json(productId);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "create product failed" });
  }
}
