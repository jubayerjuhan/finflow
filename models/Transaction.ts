import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface ITransaction extends Document {
  _id: string;
  walletId: mongoose.Types.ObjectId;
  toWalletId?: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  categoryId: mongoose.Types.ObjectId;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    toWalletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer'],
      required: true,
    },
    amount: { type: Number, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
