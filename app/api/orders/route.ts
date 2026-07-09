import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, totalAmount, shippingCost, adminFee, shippingOpt, paymentMethod, addressData } = await req.json();

    // Group items by storeId
    const itemsByStore = items.reduce((acc: any, item: any) => {
      // In case there is an old cart item, we skip it or assign a dummy store, 
      // but we assume db is reset so they have storeId
      const storeId = item.storeId;
      if (!storeId) return acc;
      
      if (!acc[storeId]) acc[storeId] = [];
      acc[storeId].push(item);
      return acc;
    }, {});

    const createdOrders = [];
    const storeIds = Object.keys(itemsByStore);
    
    if (storeIds.length === 0) {
      return NextResponse.json({ message: "No valid items with storeId" }, { status: 400 });
    }

    // Split the admin fee and shipping (simple approach: shipping per store)
    // The frontend should have already sent the totalAmount considering this, 
    // but we will calculate per-store totals just to be safe.
    
    for (const storeId of storeIds) {
      const storeItems = itemsByStore[storeId];
      const storeSubtotal = storeItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      const storeTotal = storeSubtotal + shippingCost + adminFee; // Full shipping & admin fee per store for now

      const orderNumber = `ANT${Math.floor(Math.random() * 1000000000)}`;

      const newOrder = await prisma.order.create({
        data: {
          // @ts-ignore
          userId: session.user.id,
          storeId: storeId,
          orderNumber,
          status: "PAID",
          totalAmount: storeTotal,
          shippingCost,
          adminFee,
          shippingOpt,
          paymentMethod,
          addressData: JSON.stringify(addressData),
          items: {
            create: storeItems.map((item: any) => ({
              productId: item.productId || item.id.split('-')[0],
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });
      createdOrders.push(newOrder);
    }

    // Return the first order just to satisfy the frontend redirect for now
    return NextResponse.json(createdOrders[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}
