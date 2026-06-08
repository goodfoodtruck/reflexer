import { Schema, model, type Document, type Types } from 'mongoose';

export interface NotificationDocument extends Document {
  userId: Types.ObjectId; // destinataire
  fromName: string; // pseudo de celui qui défie
  fightId: Types.ObjectId; // le combat simulé
  winner: string; // qui a gagné
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fromName: { type: String, required: true },
    fightId: { type: Schema.Types.ObjectId, ref: 'PvpFight', required: true },
    winner: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const NotificationModel = model<NotificationDocument>('Notification', NotificationSchema);
