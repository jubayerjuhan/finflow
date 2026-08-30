import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWallet extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: 'card' },
    color: { type: String, default: '#6366f1' },
    currency: { type: String, default: 'BDT' },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
