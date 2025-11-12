import mongoose, { Schema, Document } from "mongoose";

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  price: number;
  ml?: number;
  originalPrice?: number;
  gender: "male" | "female" | "unisex";
  notes: string[];
  description: string;
  ageRange: {
    min: number;
    max: number;
  };
  characteristics: string[];
  shopierLink?: string;
  category?: string;
  status?: string;
  stock?: number;
  sku?: string;
}

export interface IProductDocument extends Omit<Perfume, "_id">, Document {
  id: string;
}

const productSchema = new Schema<IProductDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    ml: {
      type: Number,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      required: true,
    },
    category: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
    },
    notes: {
      type: [String],
      default: [],
    },
    characteristics: {
      type: [String],
      default: [],
    },
    ageRange: {
      min: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    shopierLink: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

// Indexes for better query performance
productSchema.index({ name: "text", brand: "text", description: "text" });
productSchema.index({ category: 1, gender: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });

export const Product = mongoose.model<IProductDocument>(
  "Product",
  productSchema
);

