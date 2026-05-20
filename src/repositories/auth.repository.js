/**
 * Auth Repository
 * Purpose: Perform user persistence queries for authentication workflows.
 */
import AuthContract from '../contracts/auth.contract.js';

const SAFE_USER_FIELDS = '_id username name email role status isEmailVerified createdAt updatedAt';

class AuthRepository extends AuthContract {
  constructor(model) {
    super();
    this.model = model;
  }

  async create(data) {
    const user = await this.model.create(data);
    const object = user.toObject();
    delete object.passwordHash;
    delete object.__v;
    return object;
  }

  async findById(id) {
    return this.model.findById(id).select(SAFE_USER_FIELDS).lean();
  }

  async findOne(filter) {
    return this.model.findOne(filter).select(SAFE_USER_FIELDS).lean();
  }

  async findAll({ page = 1, limit = 20, ...filters } = {}) {
    const normalizedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const normalizedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 50);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const [data, total] = await Promise.all([
      this.model
        .find(filters)
        .select(SAFE_USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(normalizedLimit)
        .lean(),
      this.model.countDocuments(filters),
    ]);

    return {
      data,
      total,
      page: normalizedPage,
      limit: normalizedLimit,
      totalPages: Math.ceil(total / normalizedLimit),
    };
  }

  async updateById(id, data) {
    return this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .select(SAFE_USER_FIELDS)
      .lean();
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id).select(SAFE_USER_FIELDS).lean();
  }

  async findByEmail(email) {
    return this.model.findOne({ email }).select(SAFE_USER_FIELDS).lean();
  }

  async findByUsername(username) {
    return this.model.findOne({ username }).select(SAFE_USER_FIELDS).lean();
  }

  async findByEmailWithPassword(email) {
    return this.model
      .findOne({ email })
      .select(`${SAFE_USER_FIELDS} +passwordHash`)
      .lean();
  }

  async updatePassword(id, passwordHash) {
    return this.model
      .findByIdAndUpdate(id, { passwordHash }, { new: true, runValidators: true })
      .select(SAFE_USER_FIELDS)
      .lean();
  }

  async markEmailVerified(id) {
    return this.model
      .findByIdAndUpdate(id, { isEmailVerified: true }, { new: true, runValidators: true })
      .select(SAFE_USER_FIELDS)
      .lean();
  }
}

export default AuthRepository;
