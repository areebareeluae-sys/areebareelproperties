import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formApplications, properties, transactionHistory, inventoryProfit, inventory } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    // 1. Fetch All Applications Stats
    const allApps = await db.select().from(formApplications);
    const totalApplications = allApps.length;
    const completedCount = allApps.filter((app: any) => (app.status || "").toLowerCase() === 'completed').length;
    const pendingCount = allApps.filter((app: any) => ['pending', 'forwarded'].includes((app.status || "").toLowerCase())).length;
    const rejectedCount = allApps.filter((app: any) => (app.status || "").toLowerCase() === 'rejected').length;

    // 2. Fetch Properties / Inventory Stats
    const allProperties = await db.select().from(properties);
    const totalProperties = allProperties.length;
    const activeProperties = allProperties.filter((p: any) => p.status === 'Active').length;

    // 3. Fetch Transaction History Stats
    const allTransactions = await db.select().from(transactionHistory);
    const totalTransactionsAmount = allTransactions.reduce((acc, curr) => acc + Number(curr.calculatedAmount || 0), 0);

    // 4. Fetch Inventory Profit Records (Active & Deactive)
    const allProfits = await db.select().from(inventoryProfit);
    const activeProfitsCount = allProfits.filter((p: any) => (p.status || 'Active') === 'Active').length;
    const deactiveProfitsCount = allProfits.filter((p: any) => (p.status || 'Active') !== 'Active').length;
    
    const totalInventoryPrice = allProfits.reduce((acc, curr) => {
      const units = Number(curr.customerUnit || 0);
      return acc + (units * 100000);
    }, 0);

    // Map customer & inventory details for Inventory Profit grid
    const formattedProfits = await Promise.all(
      allProfits.map(async (item) => {
        const customer = await db.select().from(formApplications).where(eq(formApplications.id, item.customerId)).limit(1);
        const inv = await db.select().from(inventory).where(eq(inventory.id, item.inventoryId)).limit(1);
        
        const units = Number(item.customerUnit || 0);
        const totalPrice = units * 100000;

        return {
          ...item,
          customerName: customer[0]?.fullName || 'N/A',
          customerPhone: customer[0]?.mobile || 'N/A',
          customerCnic: customer[0]?.cnic || 'N/A', // Customer CNIC add kar diya hai
          propertyTitle: inv[0]?.property_title || 'N/A',
          status: item.status || 'Active',
          customerUnit: units,
          calculatedPrice: totalPrice
        };
      })
    );

    return NextResponse.json({
      success: true,
      stats: {
        applications: { total: totalApplications, completed: completedCount, pending: pendingCount, rejected: rejectedCount },
        properties: { total: totalProperties, active: activeProperties },
        transactions: { totalCount: allTransactions.length, totalAmount: totalTransactionsAmount },
        inventoryProfit: { totalActive: activeProfitsCount, totalDeactive: deactiveProfitsCount, totalPriceSum: totalInventoryPrice }
      },
      inventoryProfits: formattedProfits,
    }, { status: 200 });

  } catch (error) {
    console.error('HOD Dashboard API Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}