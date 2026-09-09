import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  property_title: text('property_title').notNull(),
  location: text('location').notNull(),
  country: text('country').notNull().default('Pakistan'), // Country column added
  currency: text('currency').notNull().default('PKR'), // Currency column added (PKR / AED)
  category: text('category').notNull(),
  status: text('status').default('Active'),
  slug: text('slug').notNull(),
  tag: text('tag').default('For Sale'),
  price: real('price').notNull().default(0),
  beds: integer('beds').notNull().default(0),
  baths: integer('baths').notNull().default(0),
  garages: integer('garages').notNull().default(0),
  image: text('image'), 
  createdAt: text('created_at').default(new Date().toISOString()),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});