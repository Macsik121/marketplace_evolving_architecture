'use strict';

const Email = require('../value-objects/Email');

class User {
  #userId;
  #email;
  #passwordHash;
  #role;
  #createdAt;

  static VALID_ROLES = ['buyer', 'seller', 'admin'];

  constructor({ userId, email, passwordHash, role, createdAt }) {
    if (!User.VALID_ROLES.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${User.VALID_ROLES.join(', ')}`);
    }

    this.#userId = userId;
    this.#email = email instanceof Email ? email : new Email(email);
    this.#passwordHash = passwordHash;
    this.#role = role;
    this.#createdAt = createdAt || new Date();
    Object.freeze(this);
  }

  get userId() { return this.#userId; }
  get email() { return this.#email; }
  get passwordHash() { return this.#passwordHash; }
  get role() { return this.#role; }
  get createdAt() { return this.#createdAt; }

  isSeller() { return this.#role === 'seller'; }
  isBuyer() { return this.#role === 'buyer'; }
  isAdmin() { return this.#role === 'admin'; }

  canCreateProducts() { return this.isSeller() || this.isAdmin(); }
  canPlaceOrders() { return this.isBuyer() || this.isAdmin(); }

  toDTO() {
    return {
      userId: this.#userId,
      email: this.#email.toDTO(),
      role: this.#role,
      createdAt: this.#createdAt instanceof Date ? this.#createdAt.toISOString() : this.#createdAt,
    };
  }

  toJSON() {
    return this.toDTO();
  }

  static fromDTO(dto) {
    return new User({
      userId: dto.userId,
      email: dto.email,
      passwordHash: dto.passwordHash,
      role: dto.role,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
    });
  }
}

module.exports = User;
