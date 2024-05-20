"use server"

import { z } from "zod";
import fs from "fs/promises";
import { redirect } from "next/navigation";

const imageSchema = z.instanceof(File, {
  message: "Required",
}).refine(file => file.size === 0 || file.type.startsWith("image/"))

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(1),
  image: imageSchema.refine(file => file.size > 0, "Required"),
})

export async function addProduct(formData: FormData) {
  const result = postSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data;
  await fs.mkdir("public/products", {recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
  await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()));

  redirect("/")
}