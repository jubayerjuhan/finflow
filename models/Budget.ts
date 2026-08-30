import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  month: string; // YYYY-MM
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // YYYY-MM
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

export default Budget;
