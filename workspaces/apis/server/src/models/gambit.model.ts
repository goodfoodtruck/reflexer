import { Schema, model, type Document, type Types } from 'mongoose';
import type { ConditionGroup, Gambit, GambitIntent, TargetSelector } from '@reflexer/engine';

export interface GambitDocument extends Omit<Gambit, 'id'>, Document {
  userId: Types.ObjectId;
  name: string;
  characterId: Types.ObjectId;
  priority: number;
  conditions: ConditionGroup;
  targetSelector: TargetSelector;
  intent: GambitIntent;
  createdAt: Date;
  updatedAt: Date;
}

const GambitSchema = new Schema<GambitDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    priority: { type: Number, required: true },
    conditions: { type: Schema.Types.Mixed, required: true },
    targetSelector: { type: Schema.Types.Mixed, required: true },
    intent: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

export const GambitModel = model<GambitDocument>('Gambit', GambitSchema);
