/** The reviewer's single "my work" list — four different id fields with different purposes:
 *  memberId (respond to invite), councilId (almost everything else), proposalId (documents),
 *  projectId (optional field in minutes payload only). Do not conflate them. */
export interface MyMembership {
  memberId: string;
  councilId: string;
  roundId?: string | null;
  roundType?: string | null;
  roundStatus?: string | null;
  memberRole?: string | null;
  status?: string | null;
  proposalId: string;
  projectId?: string | null;
  proposalTitleVI?: string | null;
  proposalStatus?: string | null;
}
