import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [80, 'Title cannot exceed 80 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than zero']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Food', 'Transport', 'Education', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'],
      message: 'Choose a valid category'
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: value => !Number.isNaN(value.getTime()),
      message: 'Enter a valid date'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['paid', 'pending'],
      message: 'Status must be paid or pending'
    },
    default: 'pending'
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters'],
    default: ''
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (document, record) => {
      delete record._id;
      delete record.__v;
      return record;
    }
  }
});

export default mongoose.model('Expense', expenseSchema);
