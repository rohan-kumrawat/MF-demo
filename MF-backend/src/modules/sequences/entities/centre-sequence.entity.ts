import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';
import { SequenceType } from '../../../common/enums/sequence-type.enum';

@Entity('centre_sequences')
@Index(['centreId', 'type'], { unique: true })
export class CentreSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  /** Short code used in formatted numbers, e.g. "C1" */
  @Column({ length: 10 })
  centreCode: string;

  @Column({ type: 'enum', enum: SequenceType })
  type: SequenceType;

  @Column({ type: 'int', default: 0 })
  currentValue: number;

  @CreateDateColumn()
  createdAt: Date;
}
