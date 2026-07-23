export interface ProposalMember {
  fullName: string;
  email: string;
  department?: string | null;
  role?: string | null;
  workMonths: number;
  academicTitle?: string | null;
  memberRoleCode?: string | null;
  isSecretary: boolean;
}
