'use strict';

const IPaymentRepository = require('../../../domain/repositories/IPaymentRepository');
const Payment = require('../../../domain/entities/Payment');

class PostgresPaymentRepository extends IPaymentRepository {
  #pool;

  constructor(pool) {
    super();
    this.#pool = pool;
  }

  async findById(paymentId) {
    const result = await this.#pool.query(
      'SELECT * FROM payments WHERE payment_id = $1',
      [paymentId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findByOrderId(orderId) {
    const result = await this.#pool.query(
      'SELECT * FROM payments WHERE order_id = $1',
      [orderId]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async findByTransactionReference(transactionReference) {
    const result = await this.#pool.query(
      'SELECT * FROM payments WHERE transaction_reference = $1',
      [transactionReference]
    );
    if (result.rows.length === 0) return null;
    return this.#mapToEntity(result.rows[0]);
  }

  async save(payment) {
    const dto = payment.toDTO();
    const result = await this.#pool.query(
      `INSERT INTO payments (order_id, payment_method, transaction_reference, amount, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [dto.orderId, dto.paymentMethod, dto.transactionReference, dto.amount, dto.status]
    );
    return this.#mapToEntity(result.rows[0]);
  }

  async updateStatus(paymentId, status, transactionReference) {
    const result = await this.#pool.query(
      `UPDATE payments
       SET status = $1, transaction_reference = $2, processed_at = NOW()
       WHERE payment_id = $3`,
      [status, transactionReference, paymentId]
    );
    return result.rowCount > 0;
  }

  #mapToEntity(row) {
    return new Payment({
      paymentId: row.payment_id,
      orderId: row.order_id,
      paymentMethod: row.payment_method,
      transactionReference: row.transaction_reference,
      amount: parseFloat(row.amount),
      status: row.status,
      processedAt: row.processed_at,
    });
  }
}

module.exports = PostgresPaymentRepository;
