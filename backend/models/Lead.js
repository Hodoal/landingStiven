const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    monthly_consultations: {
      type: String,
      enum: ['0–10', '10–30', '30–60', '60+'],
      required: true
    },
    is_labor_lawyer: {
      type: Boolean,
      required: true
    },
    works_quota_litis: {
      type: String,
      enum: ['Sí', 'No', 'A veces']
    },
    ads_budget_range: {
      type: String
    },
    willing_to_invest_ads: {
      type: Boolean
    },
    main_problem: [String],
    lead_type: {
      type: String,
      enum: ['Ideal', 'Scale', null],
      default: null
    },
    status: {
      type: String,
      enum: ['applied', 'scheduled', 'meeting-completed', 'sold', 'No califica'],
      default: 'applied'
    },
    scheduled_date: String,
    scheduled_time: String,
    googleCalendarEventId: String,
    googleMeetLink: String,
    sale_amount: Number,
    sold_at: Date,
    disqualified_reason: String,
    disqualified_at: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Add unique index on email to prevent duplicates at database level
leadSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
