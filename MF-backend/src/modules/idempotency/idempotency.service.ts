import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { IdempotencyKey } from './idempotency-key.entity';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly repo: Repository<IdempotencyKey>,
  ) {}

  /**
   * Wraps an async operation with idempotency protection.
   *
   * Behaviour:
   * - No key supplied  → execute fn() normally (no idempotency).
   * - Key found in DB  → return cached response (fn() is NOT called again).
   * - Key not found    → call fn(), persist result under the key, return result.
   *
   * The combination (key + centreId + endpoint) is unique, so:
   *   - Same key on a different endpoint is treated as a new request.
   *   - Keys from a different centre are fully isolated.
   *
   * Keys expire after 24 hours; any request after that is treated as new.
   *
   * @param idempotencyKey  Value of the `Idempotency-Key` request header.
   * @param userId          ID of the authenticated user making the request.
   * @param centreId        Centre the request belongs to.
   * @param endpoint        Short identifier for the API operation.
   * @param fn              The async business-logic function to protect.
   */
  async wrap<T>(
    idempotencyKey: string | undefined,
    userId: string,
    centreId: string,
    endpoint: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    // No key → passthrough; backward-compatible
    if (!idempotencyKey?.trim()) return fn();

    // S-3: Reject oversized keys before they can cause DB issues
    if (idempotencyKey.trim().length > 128) {
      throw new Error('Idempotency-Key must not exceed 128 characters');
    }

    const key = idempotencyKey.trim();
    const now  = new Date();

    // Check for an existing, non-expired record
    const existing = await this.repo.findOne({
      where: { key, centreId, endpoint, expiresAt: MoreThan(now) },
    });

    if (existing) {
      this.logger.debug(`Idempotency hit — key=${key} endpoint=${endpoint}`);
      return existing.responseBody as T;
    }

    // Execute the real operation
    const result = await fn();

    // Persist key → response (24-hour window)
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const record = this.repo.create({
        key,
        userId,
        centreId,
        endpoint,
        responseBody: result as object,
        expiresAt,
      });
      await this.repo.save(record);
    } catch (err) {
      // Swallow duplicate-key errors caused by a race between two identical
      // concurrent requests — the unique constraint ensures only one wins,
      // and both requests will return the same logically correct result.
      this.logger.warn(
        `Idempotency store failed (likely race): key=${key} — ${(err as Error).message}`,
      );
    }

    return result;
  }
}
