import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formApplications, properties, transactionHistory, inventory, officeUsers, users, internalCashLogs, inventoryProfit, activityLogs } from '@/db/schema';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const todayStr = new Date().toISOString().split('T')[0];
    
    const startDate = searchParams.get('startDate') || todayStr;
    const endDate = searchParams.get('endDate') || todayStr;

    // 1. Applications Stats
    const allApps = await db.select().from(formApplications);
    const totalApplications = allApps.length;
    const completedCount = allApps.filter((app: any) => (app.status || "").toLowerCase() === 'completed').length;
    const pendingCount = allApps.filter((app: any) => ['pending', 'forwarded'].includes((app.status || "").toLowerCase())).length;
    const rejectedCount = allApps.filter((app: any) => (app.status || "").toLowerCase() === 'rejected').length;

    // 2. Properties Stats
    const allProperties = await db.select().from(properties);
    const totalProperties = allProperties.length;
    const activeProperties = allProperties.filter((p: any) => p.status === 'Active').length;
    const inactiveProperties = totalProperties - activeProperties;

    // 3. Inventory Stats & Unit Calculations (1 Unit = 100,000)
    const allInventory = await db.select().from(inventory);
    const allInventoryProfits = await db.select().from(inventoryProfit);

    let totalInventoryUnits = 0;
    let totalActiveUnits = 0;
    let totalSoldUnits = 0;

    const enrichedInventory = allInventory.map((item: any) => {
      const itemPrice = Number(item.price || 0);
      const totalUnits = Math.round(itemPrice / 100000); // 1 Unit = 100,000

      // Find how many units of this inventory are currently active/sold to customers
      const itemProfits = allInventoryProfits.filter((p: any) => p.inventoryId === item.id && p.status === 'Active');
      const soldUnits = itemProfits.reduce((acc, curr) => acc + Number(curr.customerUnit || 0), 0);
      
      const availableUnits = Math.max(0, totalUnits - soldUnits);

      totalInventoryUnits += totalUnits;
      totalSoldUnits += soldUnits;
      totalActiveUnits += availableUnits;

      return {
        ...item,
        totalUnits,
        soldUnits,
        availableUnits,
        customerDetails: itemProfits
      };
    });

    const totalInventoryCount = allInventory.length;
    const activeInventoryCount = allInventory.filter((i: any) => i.status === 'Active').length;
    const inactiveInventoryCount = totalInventoryCount - activeInventoryCount;

    // 4. Plans Breakdown (Kitne units kis plan me hain)
    const planBreakdown: { [key: string]: number } = {};
    allInventoryProfits.forEach((p: any) => {
      if (p.status === 'Active') {
        const planName = p.plan || 'Standard Plan';
        planBreakdown[planName] = (planBreakdown[planName] || 0) + Number(p.customerUnit || 0);
      }
    });

    // 5. Transaction History Stats
    const allTransactions = await db.select().from(transactionHistory);
    const filteredTransactions = allTransactions.filter((tx: any) => {
      if (!tx.date) return false;
      const txDate = tx.date.split('T')[0];
      return txDate >= startDate && txDate <= endDate;
    });
    const totalTransactionsAmount = filteredTransactions.reduce((acc, curr) => acc + Number(curr.calculatedAmount || 0), 0);

    // 6. Internal Cash Logs Stats
    const allCashLogs = await db.select().from(internalCashLogs);
    const filteredCashLogs = allCashLogs.filter((log: any) => {
      if (!log.createdAt) return false;
      const logDate = log.createdAt.split('T')[0];
      return logDate >= startDate && logDate <= endDate;
    });

    const cashInTotal = filteredCashLogs
      .filter((log: any) => (log.transactionType || "").toLowerCase().includes('cash in'))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      
    const cashSendTotal = filteredCashLogs
      .filter((log: any) => {
        const t = (log.transactionType || "").toLowerCase();
        return t.includes('cash send') || t.includes('cash out');
      })
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    // 7. Activity Logs
    const allActivityLogs = await db.select().from(activityLogs);

    // 8. Users Count
    const allStaffUsers = await db.select().from(officeUsers);
    const allClientUsers = await db.select().from(users);

    return NextResponse.json({
      success: true,
      stats: {
        applications: { total: totalApplications, completed: completedCount, pending: pendingCount, rejected: rejectedCount },
        properties: { total: totalProperties, active: activeProperties, inactive: inactiveProperties, list: allProperties },
        inventory: { 
          total: totalInventoryCount, 
          active: activeInventoryCount, 
          inactive: inactiveInventoryCount, 
          totalUnits: totalInventoryUnits,
          activeUnits: totalActiveUnits,
          soldUnits: totalSoldUnits,
          list: enrichedInventory,
          plans: planBreakdown
        },
        transactions: { totalCount: filteredTransactions.length, totalAmount: totalTransactionsAmount, list: filteredTransactions },
        cashFlow: { cashIn: cashInTotal, cashSend: cashSendTotal, logs: filteredCashLogs },
        activityLogs: allActivityLogs,
        usersCount: { staff: allStaffUsers.length, clients: allClientUsers.length, staffList: allStaffUsers, clientList: allClientUsers }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('HOD Dashboard API Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}