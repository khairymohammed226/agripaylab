const cardSchema = new mongoose.Schema(
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        cardName: {
          type: String,
          required: true,
        },

        accountNumber: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              return /^[0-9]{16}$/.test(v);
            },
            message: "Card number must be exactly 16 digits",
          },
        },

        cardType: {
          type: String,
          enum: ["debit", "credit"],
          required: true,
        },

        expiryDate: {
          type: String,
          required: true,
        },

        cvv: {
          type: String,
          required: true,
        },

        cardPassword: {
          type: String,
          required: true,
        },
      },
      { timestamps: true }
    );

    module.exports =
  mongoose.models.Card || mongoose.model("Card", cardSchema);

