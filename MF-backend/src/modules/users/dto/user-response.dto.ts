export class UserResponseDto {
  id: string;
  centreId: string;
  username: string;
  role: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  customerCode?: string;
  fatherHusbandName?: string;
  aadharNumber?: string;
  memberSince?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id               = user.id;
    this.centreId         = user.centreId;
    this.username         = user.username;
    this.role             = user.role;
    this.name             = user.name;
    this.phone            = user.phone;
    this.address          = user.address;
    this.email            = user.email;
    this.customerCode     = user.customerCode;
    this.fatherHusbandName = user.fatherHusbandName;
    this.aadharNumber     = user.aadharNumber;
    this.memberSince      = user.memberSince;
    this.nomineeName      = user.nomineeName;
    this.nomineeRelation  = user.nomineeRelation;
    this.isActive         = user.isActive;
    this.createdAt        = user.createdAt;
    this.updatedAt        = user.updatedAt;
  }

  static from(user: any): UserResponseDto {
    return new UserResponseDto(user);
  }

  static fromMany(users: any[]): UserResponseDto[] {
    return users.map(u => new UserResponseDto(u));
  }
}
