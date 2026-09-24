import { sqliteTable, text, integer, real ,numeric} from 'drizzle-orm/sqlite-core';
// Form Applications Table
export const formApplications = sqliteTable('form_applications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  
  // Section A: Application & Applicant Details
  appNo: text('app_no').notNull(),
  date: text('date').notNull(),
  fullName: text('full_name').notNull(),
  cnic: text('cnic').notNull(),
  fatherName: text('father_name').notNull(),
  dob: text('dob'),
  mobile: text('mobile').notNull(),
  altContact: text('alt_contact'),
  address: text('address'),
  photoUrl: text('photo_url'), // <-- Applicant Profile Photo

  // Section B: Categories (Stored as JSON String array)
  categories: text('categories'), 

  // Section C: Financial & Household Information
  applicantIncome: real('applicant_income').default(0),
  householdIncome: real('household_income').default(0),
  applicantIncomeType: text('applicant_income_type'),
  livingArrangement: text('living_arrangement'),
  earningMembers: text('earning_members'),
  dependents: text('dependents'),

  // Section D: Participation Details
  participationAmount: real('participation_amount').default(0),

  // Section E: CNIC Images (New Fields Added)
  cnicFrontUrl: text('cnic_front_url'), // <-- CNIC Front Image
  cnicBackUrl: text('cnic_back_url'),   // <-- CNIC Back Image

  // Section F: Nominee Details
  nomineeName: text('nominee_name'),
  nomineeRelation: text('nominee_relation'),
  nomineeCnic: text('nominee_cnic'),
  nomineeMobile: text('nominee_mobile'),

  // Section H: Solemn Declaration & Undertaking
  declarationAccepted: integer('declaration_accepted', { mode: 'boolean' }).notNull().default(false),
  currentDepartmentId: text('current_department_id').references(() => departments.id),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  status: text('status').notNull().default('Pending'), 
});

// Existing Properties Table
export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  property_title: text('property_title').notNull(),
  description: text('description'), // 500+ words detailed description
  mini_description: text('mini_description'), // ~25 words short summary
  property_type: text('property_type').notNull().default('Residential'),
  category: text('category').notNull(),
  tag: text('tag').default('For Sale'),
  price: real('price').notNull().default(0),
  currency: text('currency').notNull().default('PKR'),
  area_size: text('area_size'),
  country: text('country').notNull().default('Pakistan'),
  city: text('city').notNull().default('Lahore'),
  area: text('area').notNull().default('Gulberg III'),
  location: text('location').notNull(),
  pin_location: text('pin_location'), // Google Maps / Coordinates / Link
  agent_name: text('agent_name'),
  agent_number: text('agent_number'),
  status: text('status').default('Active'),
  slug: text('slug').notNull(),
  beds: integer('beds').notNull().default(0),
  baths: integer('baths').notNull().default(0),
  garages: integer('garages').notNull().default(0),
  image: text('image'),
  images: text('images'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});
export const inventory  = sqliteTable('inventory', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  property_title: text('property_title').notNull(),
  location: text('location').notNull(),
  country: text('country').notNull().default('Pakistan'),
  currency: text('currency').notNull().default('PKR'),
  category: text('category').notNull(),
  status: text('status').default('Active'),
  slug: text('slug').notNull(),
  tag: text('tag').default('For Sale'),
  price: real('price').notNull().default(0),
  beds: integer('beds').notNull().default(0),
  baths: integer('baths').notNull().default(0),
  sqrft: integer('sqrft').notNull().default(0),
  garages: integer('garages').notNull().default(0),
  image: text('image'),
  images: text('images'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// Existing Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cnic: text('cnic').notNull().unique(), // Email ki jagah CNIC
  phone: text('phone').notNull(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});
export const customerPins = sqliteTable('customer_pins', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  cnic: text('cnic').notNull().unique(),
  pin: text('pin').notNull(),
});

// 1. Departments Table (4 Departments ke liye)
export const departments = sqliteTable('departments', {
  id: text('id').primaryKey(), // e.g., 'dept_1', 'dept_2'
  name: text('name').notNull(), // e.g., "Department 1", "Department 2"
  stepOrder: integer('step_order').notNull(), // 1, 2, 3, 4
});

// 2. Office Users / Staff Table (Office ke users jo applications process karenge)
export const officeUsers = sqliteTable('office_users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  departmentId: text('department_id').references(() => departments.id), // Yeh user kis department se belong karta hai
  role: text('role').notNull().default('staff'), // 'staff', 'admin'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

// 3. Application Activity Logs Table (Renamed from leadLogs)
export const applicationLogs = sqliteTable('application_logs', {
  id: text('id').primaryKey(),
  formAppId: text('form_app_id').references(() => formApplications.id).notNull(), // formApplications table ki ID
  officeUserId: text('office_user_id').references(() => officeUsers.id).notNull(), // Kis office user ne kam kiya
  fromDepartmentId: text('from_department_id').references(() => departments.id),
  toDepartmentId: text('to_department_id').references(() => departments.id),
  action: text('action').notNull(), // 'FORWARDED', 'APPROVED', 'REJECTED'
  remarks: text('remarks'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});
// Naya Activity Logs table jo office users ki actions track karega
export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  officeUserId: text('office_user_id').references(() => officeUsers.id).notNull(), // Kis admin/user ne action kiya
  action: text('action').notNull(), // Jaise: 'CREATE_USER', 'UPDATE_USER', 'DEACTIVATE_USER'
  remarks: text('remarks'), // Details
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});
export const inventoryProfit = sqliteTable('inventory_profit', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(), // formApplications ya customers table ki ID
  cnic: text('cnic').notNull(),
  inventoryId: text('inventory_id').notNull(),
  inventoryPrice: real('inventory_price').notNull(),
  totalPrice: real('total_price').notNull(),
  customerUnit: integer('customer_unit').notNull(),
  plan: text('plan').notNull(),
  date: text('date').notNull(),
  profitDate: text('profit_date').notNull(),
  status: text('status').notNull().default('Active'),
});
export const transactionHistory = sqliteTable('transaction_history', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  cnic: text('cnic').notNull(),
  officeUserId: text('office_user_id').notNull(), // Jo admin transfer kar raha hai uska ID
  inventoryId: text('inventory_id').notNull(),
  plan: text('plan').notNull(),
  calculatedAmount: real('calculated_amount').notNull(),
  transactionNumber: text('transaction_number').notNull(),
  remarks: text('remarks').notNull(),
  date: text('date').notNull(),
});
export const adBanners = sqliteTable("ad_banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  image: text("image").notNull(),       // Cloudinary Secure URL
  public_id: text("public_id").notNull(), // Cloudinary Public ID (Delete ke liye zaroori hai)
  status: text("status").default("Active"),
});
export const customerPaymentMethods = sqliteTable("customer_payment_methods", {
  id: integer("id").primaryKey({ autoIncrement: true }), // Auto increment primary key
  cnic: text("cnic").notNull(),           
  accountHolder: text("account_holder").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
export const pendingAmmount = sqliteTable("pending_ammount", {
  id: text("id").primaryKey(),                  // Unique ID (UUID)
  cnic: text("cnic").notNull(),                 // Customer CNIC
  ammount: real("ammount").notNull(),           // Calculated prorated amount
  profitdate: text("profitdate").notNull(),     // Profit date reference
  reson: text("reson").notNull(),               // Reason description (e.g. upgrading units...)
  status: text("status").notNull().default("pending"), // Status: pending, paid, etc.
  remarks: text("remarks"),                     // Optional remarks (khali/null)
  sendData: text("send_data"),                  // Sending date or data (khali/null)
});
export const internalCashLogs = sqliteTable('internal_cash_logs', {
  id: text('id').primaryKey(),
  cnic: text('cnic').notNull(),
  customerName: text('customer_name'),
  agentId: text('agent_id').notNull(),
  agentName: text('agent_name').notNull(),
  transactionType: text('transaction_type').notNull().default('Cash In'), // 'Cash In' or 'Cash Send'
  receivedFrom: text('received_from').notNull(), // Kahan se aaya (Source)
  givenTo: text('given_to').notNull(),         // Kahan gaya (Destination)
  amount: numeric('amount').notNull(),
  slipOrRefNumber: text('slip_or_ref_number'),
  internalRemarks: text('internal_remarks'),
  createdAt: text('created_at').notNull(),
});