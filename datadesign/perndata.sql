CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "email" varchar(255) UNIQUE NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT 'NOW()',
  "updated_at" timestamp NOT NULL DEFAULT 'NOW()'
);

CREATE TABLE "user_add" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "user_id" uuid NOT NULL,
  "full_name" varchar(200) NOT NULL,
  "address_line1" varchar(255) NOT NULL,
  "address_line2" varchar(255),
  "city" varchar(100) NOT NULL,
  "state" varchar(100) NOT NULL,
  "postalcode" varchar(100) NOT NULL,
  "country" varchar(100) NOT NULL,
  "phone_number" varchar(50) NOT NULL,
  "is_default" BOOLEAN DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT 'NOW()',
  "updated_at" timestamp NOT NULL DEFAULT 'NOW()'
);

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) UNIQUE NOT NULL,
  "parent_id" uuid,
  "descriptiom" text,
  "image" varchar(255) NOT NULL
);

CREATE TABLE "product" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "category" uuid NOT NULL,
  "name" varchar(255),
  "price" decimal(10,2),
  "discounted_price" decimal(10,2) NOT NULL,
  "slug" varchar(255) UNIQUE NOT NULL,
  "descriptiom" text,
  "stock_qn" integer NOT NULL DEFAULT 0,
  "specification" JSONB,
  "is_featured" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT 'NOW()',
  "updated_at" timestamp NOT NULL DEFAULT 'NOW()'
);

CREATE TABLE "product_img" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "product_id" uuid,
  "img" varchar(255) NOT NULL,
  "alt" varchar(255),
  "display_order" integer DEFAULT 0,
  "is_primary" boolean DEFAULT false
);

CREATE TABLE "product_var" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "product_id" uuid,
  "variant_name" varchar(50) NOT NULL,
  "variant_val" varchar(50) NOT NULL,
  "price_adjustment" decimal(10,2) DEFAULT 0,
  "stock_quantity" integer DEFAULT 0,
  "img_url" varchar(255)
);

CREATE TABLE "carts" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "user_id" uuid,
  "session_id" varchar(255),
  "created_at" timestamp NOT NULL DEFAULT 'NOW()',
  "updated_at" timestamp NOT NULL DEFAULT 'NOW()'
);

CREATE TABLE "cart_items" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "cart_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "variant_id" uuid,
  "quantity" integer NOT NULL DEFAULT 1,
  "added_at" timestamp NOT NULL DEFAULT 'NOW()'
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "user_id" uuid NOT NULL,
  "status" varchar(50) NOT NULL,
  "total_amout" decimal(10,2) NOT NULL,
  "shipping_add_snapshot" JSONB NOT NULL,
  "payment_method" varchar(50) NOT NULL,
  "payment_status" varchar(50) NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT 'NOW()',
  "updated_at" timestamp NOT NULL DEFAULT 'NOW()'
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "product_snap" JSONB NOT NULL,
  "variant_snap" JSONB NOT NULL,
  "quantity" integer NOT NULL,
  "price_at_purchase" decimal(10,2) NOT NULL,
  "total_price" decimal(10,2) NOT NULL
);

CREATE TABLE "review" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "title" varchar(128),
  "product_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "rating" inetger NOT NULL,
  "comment" text,
  "is_verified" BOOLEAN DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT 'NOW()',
  "updated_at" timestamp NOT NULL DEFAULT 'NOW()'
);

COMMENT ON COLUMN "users"."email" IS 'Email Address Identifier';

COMMENT ON COLUMN "users"."password_hash" IS 'Hashed';

ALTER TABLE "user_add" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "categories" ADD FOREIGN KEY ("parent_id") REFERENCES "categories" ("id");

ALTER TABLE "product" ADD FOREIGN KEY ("category") REFERENCES "categories" ("id");

ALTER TABLE "product_img" ADD FOREIGN KEY ("product_id") REFERENCES "product" ("id");

ALTER TABLE "product_var" ADD FOREIGN KEY ("product_id") REFERENCES "product" ("id");

ALTER TABLE "carts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "cart_items" ADD FOREIGN KEY ("cart_id") REFERENCES "carts" ("id");

ALTER TABLE "cart_items" ADD FOREIGN KEY ("product_id") REFERENCES "product" ("id");

ALTER TABLE "cart_items" ADD FOREIGN KEY ("variant_id") REFERENCES "product_var" ("id");

ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "order_items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

ALTER TABLE "order_items" ADD FOREIGN KEY ("product_id") REFERENCES "product" ("id");

ALTER TABLE "review" ADD FOREIGN KEY ("product_id") REFERENCES "product" ("id");

ALTER TABLE "review" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
