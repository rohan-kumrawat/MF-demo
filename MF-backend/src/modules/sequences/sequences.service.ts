import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { CentreSequence } from './entities/centre-sequence.entity';
import { SequenceType } from '../../common/enums/sequence-type.enum';

@Injectable()
export class SequencesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  /**
   * Atomically increment and return the next sequence value.
   * Must be called inside an existing QueryRunner transaction.
   */
  async next(centreId: string, type: SequenceType, qr: QueryRunner): Promise<string> {
    const result = await qr.manager
      .createQueryBuilder()
      .update(CentreSequence)
      .set({ currentValue: () => '"currentValue" + 1' })
      .where('centreId = :centreId AND type = :type', { centreId, type })
      .returning(['currentValue', 'centreCode'])
      .execute();

    const row = result.raw[0];
    if (!row) throw new Error(`Sequence not found: centreId=${centreId} type=${type}`);

    const num = String(row.currentValue).padStart(5, '0');
    const code = row.centreCode;

    switch (type) {
      case SequenceType.LOAN: return `${code}-L${num}`;        // Ex: SS-L0001
      case SequenceType.CUSTOMER: return `${code}-C${num}`;    // Ex: SS-C0001
      case SequenceType.RECEIPT: return `${code}-R${num}`;      // Ex: SS-R0001
      case SequenceType.DIARY: return `${code}-D${num}`;          // Ex: SS-D0001
      case SequenceType.UDHAR_KHATA: return `${code}-U${num}`;    // Ex: SS-U0001
      default: return `${code}-${num}`;
    }
  }

  /**
   * Initialize a centre's sequence row if it doesn't exist.
   * Also ensures the prefix is properly assigned.
   */
  async initForCentre(centreId: string, centreCode: string) {
    const repo = this.dataSource.getRepository(CentreSequence);
    const types = Object.values(SequenceType);

    // Hardcode specific prefixes for these two centres, default to DEF for others
    let finalCentreCode = centreCode || 'DEF';
    if (centreId === '7e8667c6-d555-4d20-b9b4-241065ef4750') finalCentreCode = 'SS';
    else if (centreId === '1c34dc23-daf4-4b6d-8254-d4a232430721') finalCentreCode = 'GK';

    for (const type of types) {
      const exists = await repo.findOne({ where: { centreId, type } });
      if (!exists) {
        await repo.save(repo.create({ centreId, centreCode: finalCentreCode, type, currentValue: 0 }));
      } else if (exists.centreCode !== finalCentreCode) {
        exists.centreCode = finalCentreCode;
        await repo.save(exists);
      }
    }
  }
}
