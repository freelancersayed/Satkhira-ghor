import mongoose from 'mongoose';

const SiteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    updatedBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
