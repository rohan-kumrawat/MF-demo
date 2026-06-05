import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('customer_files')
@Index(['customerId'])
@Index(['loanId'])
@Index(['centreId', 'customerId'])
@Index(['centreId', 'customerId', 'loanId'])
@Index(['uploadedAt'])
export class CustomerFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Reference to the customer (User with role=customer) */
  @Column('uuid')
  customerId: string;

  /** Optional loan reference for loan-specific documents */
  @Column({ type: 'uuid', nullable: true })
  loanId: string | null;

  /** Centre ID for filtering/organizing files */
  @Column('uuid')
  centreId: string;

  /** Cloudinary Public ID for easy retrieval and deletion */
  @Column({ type: 'varchar', length: 255, unique: true })
  cloudinaryPublicId: string;

  /** Full Cloudinary URL of the uploaded file */
  @Column({ type: 'varchar', length: 500 })
  fileUrl: string;

  /** Original filename */
  @Column({ type: 'varchar', length: 255 })
  originalFileName: string;

  /** File type/MIME type (e.g., 'image/jpeg', 'application/pdf') */
  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  /** File size in bytes */
  @Column({ type: 'integer' })
  fileSize: number;

  /** Document type/category (e.g., 'loan_receipt', 'kyc_document', etc.) */
  @Column({ type: 'varchar', length: 50, nullable: true })
  documentType: string | null;

  /** Optional description or notes about the file */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  uploadedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
