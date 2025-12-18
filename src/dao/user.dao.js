import User from "../models/user.model.js";

/**
 * User Data Access Object
 * ----------------------
 * Single default export
 * Multiple methods attached to one object
 */

const userDAO = {
    /**
     * Create a new user
     */
    async create(data) {
        return await User.create(data);
    },

    /**
     * Find user by email (login use-case)
     * Password included explicitly
     */
    async findByEmail(email) {
        return await User.findOne({ email }).select("+password");
    },

    async findByUsername(username) {
        return await User.findOne({ username }).select("+password");
    },

    /**
     * Find user by ID (safe fields)
     */
    async findById(userId) {
        return await User.findById(userId).select("-password -__v");
    },

    /**
     * Update user by ID
     */
    async updateById(userId, updates) {
        return await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("-password -__v");
    },

    /**
     * Delete user by ID
     */
    async deleteById(userId) {
        return await User.findByIdAndDelete(userId);
    },

    /**
     * Paginated users list
     */
    async findAll({ page = 1, limit = 20 } = {}) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find()
                .select("-password -__v")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            User.countDocuments(),
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    /**
     * Check email existence
     */
    async isEmailTaken(email) {
        const user = await User.findOne({ email }).lean();
        return Boolean(user);
    },
};

export default userDAO;
