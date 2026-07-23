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

export const createProposalSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be under 200 characters'),
  abstract: z
    .string()
    .min(50, 'Abstract must be at least 50 characters')
    .max(2000, 'Abstract must be under 2000 characters'),
  researchField: z.string().min(1, 'Research field is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budget: z
    .number()
    .positive('Budget must be greater than 0'),
  objectives: z
    .string()
    .min(20, 'Objectives must be at least 20 characters'),
  methodology: z
    .string()
    .min(20, 'Methodology must be at least 20 characters'),
  expectedOutcomes: z
    .string()
    .min(20, 'Expected outcomes must be at least 20 characters'),
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
export type CreateProposalFormValues = z.infer<typeof createProposalSchema>;
export type ReviewScoreFormValues = z.infer<typeof reviewScoreSchema>;
