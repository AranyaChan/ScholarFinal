import mongoose from 'mongoose';

const paperSelectionSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    paper: {
      id: { type: String, default: '' },
      title: { type: String, required: true, trim: true },
      authors: { type: [String], default: [] },
      abstract: { type: String, default: '' },
      publishedDate: { type: String, default: '' },
      arxivId: { type: String, default: '' },
      semanticScholarId: { type: String, default: '' },
      citationCount: { type: Number, default: 0 },
      url: { type: String, default: '' },
      venue: { type: String, default: '' },
      source: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

paperSelectionSchema.index({ userId: 1, createdAt: -1 });
paperSelectionSchema.index({ 'paper.id': 1 });

export default mongoose.model('PaperSelection', paperSelectionSchema);
