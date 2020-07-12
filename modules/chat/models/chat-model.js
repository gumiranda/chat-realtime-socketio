const mongoose = require('mongoose');

const schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const chatModel = new schema(
  {
    userDest: {
      type: ObjectId,
      ref: 'User',
    },
    userRemet: {
      type: ObjectId,
      ref: 'User',
    },
    lastMessage: { type: String },
    countMessages: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    messages: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now },
        user: { type: ObjectId, ref: 'User' },
      },
    ],
  },
  { versionKey: false },
);

chatModel.pre('save', (next) => {
  const now = new Date();
  if (!this.createdAt) this.createdAt = now;
  next();
});

module.exports = mongoose.model('Chat', chatModel);
