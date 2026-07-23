import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const proposalMemberSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  department: z.string().optional(),
  role: z.string().optional(),
  workMonths: z.number().min(0, 'Work months must be 0 or more'),
  academicTitle: z.string().optional(),
  memberRoleCode: z.string().optional(),
  isSecretary: z.boolean(),
});

export const proposalWizardSchema = z.object({
  cycleId: z.number({ error: 'Please select a cycle' }),
  trackId: z.string().min(1, 'Please select a track'),
  researchType: z.number({ error: 'Please select a research type' }),
  orderId: z.number().optional(),
  titleVI: z.string().min(1, 'Vietnamese title is required'),
  titleEN: z.string().optional(),
  abstractEN: z.string().optional(),
  objectives: z.string().min(1, 'Objectives are required'),
  methodology: z.string().optional(),
  expectedOutput: z.string().optional(),
  urgency: z.string().optional(),
  novelty: z.string().optional(),
  applicationPotential: z.string().optional(),
  transferPotential: z.string().optional(),
  facilities: z.string().optional(),
  fundingMethod: z.enum(['WHOLE', 'PARTIAL']),
  durationMonths: z.number().positive('Duration must be greater than 0'),
  members: z.array(proposalMemberSchema),
});

export const reviewScoreSchema = z.object({
  criteriaScores: z.array(
    z.object({
      criteriaId: z.string(),
      criteriaName: z.string(),
      score: z.number().min(0).max(10),
      maxScore: z.number(),
      comment: z.string().optional(),
    }),
  ),
  feedback: z
    .string()
    .min(20, 'Feedback must be at least 20 characters'),
  revisionInstructions: z.string().optional(),
  decision: z.enum(['APPROVE', 'REJECT', 'REVISION_REQUIRED']),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ProposalWizardFormValues = z.infer<typeof proposalWizardSchema>;
export type ReviewScoreFormValues = z.infer<typeof reviewScoreSchema>;
