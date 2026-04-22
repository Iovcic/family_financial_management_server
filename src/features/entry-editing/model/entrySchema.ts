import { z } from 'zod'

const amountRegex = /^\d+(\.\d{1,2})?$/
const colorRegex = /^#[0-9a-fA-F]{6}$/

export const createEntrySchema = z.object({
  categoryName: z.string().max(100).default(''),
  note: z.string().max(200).nullable().optional(),
  amount: z.string().regex(amountRegex, 'Invalid amount'),
  color: z.string().regex(colorRegex).nullable().optional(),
  loanId: z.string().nullable().optional(),
  type: z.enum(['expense', 'income']).default('expense'),
})

export const patchEntrySchema = z.object({
  categoryName: z.string().min(1).max(100).optional(),
  note: z.string().max(200).nullable().optional(),
  amount: z.string().regex(amountRegex, 'Invalid amount').optional(),
  color: z.string().regex(colorRegex).nullable().optional(),
  loanId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
})

export type CreateEntryInput = z.infer<typeof createEntrySchema>
export type PatchEntryInput = z.infer<typeof patchEntrySchema>
