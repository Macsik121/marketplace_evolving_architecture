'use strict';

/**
 * @interface IUserRepository
 * @description Repository contract for User persistence
 */
class IUserRepository {
  /**
   * Find user by ID
   * @param {number} userId
   * @returns {Promise<User|null>}
   */
  async findById(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * Save user to repository
   * @param {User} user
   * @returns {Promise<User>}
   */
  async save(user) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete user from repository
   * @param {number} userId
   * @returns {Promise<boolean>}
   */
  async delete(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Find all users by role
   * @param {string} role
   * @returns {Promise<User[]>}
   */
  async findByRole(role) {
    throw new Error('Method not implemented');
  }
}

module.exports = IUserRepository;
