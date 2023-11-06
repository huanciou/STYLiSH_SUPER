import mongoose from "mongoose";
// Create Schemas
const colorSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});
const recipientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
});
const listSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    color: colorSchema,
    size: {
        type: String,
        required: true,
    },
    qty: {
        type: Number,
        required: true,
    },
});
/* export Schemas */
const productSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ["men", "women", "accessories"],
    },
    tags: {
        type: [String],
        required: false,
    },
    click: {
        type: Number,
        required: false,
        default: 0,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    texture: {
        type: String,
        required: true,
    },
    wash: {
        type: String,
        required: true,
    },
    place: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    story: {
        type: String,
        required: true,
    },
    size: {
        type: [String],
        required: true,
    },
    stock: {
        type: [Number],
        required: true,
        min: 0,
    },
    color: {
        type: [String],
        required: true,
    },
    colorName: {
        type: [String],
        required: true,
    },
    main_image: {
        type: String,
        required: true,
    },
    images: [String],
    time: {
        type: Number,
    }
});
productSchema.pre('save', function (next) {
    if (!this.time && this._id) {
        this.time = this._id.getTimestamp().getTime();
    }
    next();
});
const UserSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: "user",
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: false,
    },
    picture: {
        type: String,
        required: false,
    },
});
const OrderSchema = new mongoose.Schema({
    order: {
        shipping: {
            type: String,
            required: true,
        },
        payment: {
            type: String,
            required: true,
        },
        subtotal: {
            type: String,
            required: true,
        },
        freight: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        recipient: recipientSchema,
        list: [listSchema],
    },
});
const CampaignSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "product",
    },
    picture: {
        type: String,
    },
    story: {
        type: String,
    },
});
// Create Models
export const product = mongoose.model("Product", productSchema);
export const campaign = mongoose.model("Campaign", CampaignSchema);
export const orderModel = mongoose.model("Order", OrderSchema);
export const user = mongoose.model("User", UserSchema);
