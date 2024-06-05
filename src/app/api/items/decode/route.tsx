import { ItemsDat } from "@/app/lib/ItemsDat";

export async function POST(request: Request) {
  const file = Buffer.from(await request.arrayBuffer());

  const itemsDat = new ItemsDat(file);
  await itemsDat.decode();

  return Response.json(itemsDat.meta);
}
