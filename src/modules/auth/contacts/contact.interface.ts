import { Merchants } from 'src/modules/merchants/schema/merchants.schema';
export interface IFindEmailOrCreate {
  email: string;
  merchantId?: string;
  fullName?: string;
  dateOfBirth?: Date | undefined;
  phoneNumber?: string;
  merchant?: Merchants;
}
