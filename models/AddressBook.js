import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, default: "USA" },
        isDefault: { type: Boolean, default: false },
    }
);

const addressBookSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        addresses: [addressSchema],
    },
    { timestamps: true }
);


export default mongoose.model("AddressBook", addressBookSchema);