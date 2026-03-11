import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'auth.validation.email_required')
    .email('auth.validation.email_invalid'),
  password: z
    .string()
    .min(1, 'auth.validation.password_required')
    .min(6, 'auth.validation.password_min_length')
})

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, 'auth.validation.name_required')
    .min(2, 'auth.validation.name_min_length')
    .max(50, 'auth.validation.name_max_length'),
  email: z
    .string()
    .min(1, 'auth.validation.email_required')
    .email('auth.validation.email_invalid'),
  password: z
    .string()
    .min(1, 'auth.validation.password_required')
    .min(8, 'auth.validation.password_min_length')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      'auth.validation.password_strength'
    ),
  confirmPassword: z
    .string()
    .min(1, 'auth.validation.confirm_password_required'),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'auth.validation.accept_terms_required'
    })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'auth.validation.passwords_dont_match',
  path: ['confirmPassword']
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>