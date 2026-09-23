export interface EligibilityFormData {
  appNo: string;
  date: string;
  fullName: string;
  cnic: string;
  fatherName: string;
  dob: string;
  mobile: string;
  altContact: string;
  address: string;
  categories: string[];
  applicantIncome: string;
  applicantIncomeType?: string;
  householdIncome: string;
  earningMembers?: string;
  dependents?: string;
  livingArrangement?: string;
  participationAmount: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeCnic: string;
  nomineeMobile: string;
  declarationAccepted?: boolean;
  photoUrl?: string;
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  
  // Optional fields jo backend/database tracking ke liye use ho sakte hain:
  currentDepartmentId?: string;
  status?: string;
}