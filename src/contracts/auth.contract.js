/**
 * Auth Contract
 * Purpose: Declare persistence methods required by the authentication feature.
 */
/* eslint-disable no-unused-vars */
class AuthContract {
  async create(data) { throw new Error('Not implemented: create'); }

  async findById(id) { throw new Error('Not implemented: findById'); }

  async findOne(filter) { throw new Error('Not implemented: findOne'); }

  async findAll(filter, options) { throw new Error('Not implemented: findAll'); }

  async updateById(id, data) { throw new Error('Not implemented: updateById'); }

  async deleteById(id) { throw new Error('Not implemented: deleteById'); }

  async findByEmail(email) { throw new Error('Not implemented: findByEmail'); }

  async findByUsername(username) { throw new Error('Not implemented: findByUsername'); }

  async findByEmailWithPassword(email) { throw new Error('Not implemented: findByEmailWithPassword'); }

  async updatePassword(id, passwordHash) { throw new Error('Not implemented: updatePassword'); }

  async markEmailVerified(id) { throw new Error('Not implemented: markEmailVerified'); }
}

export default AuthContract;
