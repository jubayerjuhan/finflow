import mongoose, { Schema, Document, Model } from 'mongoose';

export type UpcomingStatus = 'pending' | 'paid' | 'skipped';
export type RecurringType = 'none' | 'weekly' | 'monthly' | 'yearly';

export interface IUpcomingExpense extends Document {
  _id: string;
  title: string;
  amount: number;
  categoryId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  dueDate: Date;
  note?: string;
  status: UpcomingStatus;
  recurring: RecurringType;
  paidTransactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UpcomingExpenseSchema = new Schema<IUpcomingExpense>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    dueDate: { type: Date, required: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'skipped'],
      default: 'pending',
    },
    recurring: {
      type: String,
      enum: ['none', 'weekly', 'monthly', 'yearly'],
      default: 'none',
    },
    paidTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  { timestamps: true }
);

const UpcomingExpense: Model<IUpcomingExpense> =
  mongoose.models.UpcomingExpense ||
  mongoose.model<IUpcomingExpense>('UpcomingExpense', UpcomingExpenseSchema);

export default UpcomingExpense;
