'use strict';

const IUserRepository = require('../../../domain/repositories/IUserRepository');
const User = require('../../../domain/entities/User');
const Email = require('../../../domain/value-objects/Email');

class PostgresUserRepository extends IUserRepository {
  #pool;

  constructor(pool) {
    super();
    this.#pool = pool;
  }

  async findById(userId) {
    const result = await this.#pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findByEmail(email) {
    const result = await this.#pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async save(user) {
    const dto = user.toDTO();
    const result = await this.#pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dto.email, user.passwordHash, dto.role]
    );
    return this.#mapToEntity(result.rows[0]);
  }

  async delete(userId) {
    const result = await this.#pool.query(
      'DELETE FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }

  async findByRole(role) {
    const result = await this.#pool.query(
      'SELECT * FROM users WHERE role = $1',
      [role]
    );
    return result.rows.map(row => this.#mapToEntity(row));
  }

  #mapToEntity(row) {
    return new User({
      userId: row.user_id,
      email: new Email(row.email),
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: row.created_at,
    });
  }
}

module.exports = PostgresUserRepository;
