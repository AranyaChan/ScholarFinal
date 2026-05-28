import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    query: { type: String, required: true, trim: true },
    searchSource: { type: String, enum: ['both', 'arxiv', 'semantic'], default: 'both' },
    sortBy: { type: String, enum: ['relevance', 'date', 'citations'], default: 'relevance' },
    resultCount: { type: Number, default: 0 },
    warnings: { type: [String], default: [] },
  },
  { timestamps: true }
);

searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1, createdAt: -1 });

export default mongoose.model('SearchHistory', searchHistorySchema);
