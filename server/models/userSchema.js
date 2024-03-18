const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const keysecret = "10e4945fa1fd5e083f0e1ec0f668e0b7ec2836cc9a107be78669631582d7aff4";

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email format");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
    userType: {
        type: String,
        required: true,
        enum: ['recruiter', 'candidate']
    },
    // Champs  recruteurs
    company: {
        type: String,
        required: function () {
            return this.userType === 'recruiter';
        },
        trim: true
    },
    jobTitle: {
        type: String,
        required: function () {
            return this.userType === 'recruiter';
        },
        trim: true
    },
    // Champs  les candidats
    education: {
        type: String,
        required: function () {
            return this.userType === 'candidate';
        },
        trim: true
    },
    experience: {
        type: String,
        required: function () {
            return this.userType === 'candidate';
        },
        trim: true
    }
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }
    next();
});

userSchema.methods.generateAuthToken = async function () {
    try {
        let token23 = jwt.sign({ _id: this._id }, keysecret, {
            expiresIn: "7d"
        });
        this.tokens = this.tokens.concat({ token: token23 });
        await this.save();
        return token23;
    } catch (error) {
        throw new Error(error.message);
    }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
