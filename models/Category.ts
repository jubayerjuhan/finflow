import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '📦' },
    color: { type: String, default: '#6366f1' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
