import type {VariantProps} from 'class-variance-authority'
import {cva} from 'class-variance-authority'

export {default as Button} from './Button.vue'

export const buttonVariants = cva(
    'select-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-stone-950 dark:focus-visible:ring-stone-300',
    {
        variants: {
            variant: {
                default: 'bg-stone-900 text-stone-50 dark:text-stone-900 hover:bg-stone-900/90 dark:bg-stone-50 dark:hover:bg-stone-50/90',
                destructive:
                    'bg-red-500 text-stone-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-stone-50 dark:hover:bg-red-900/90',
                outline:
                    'border border-stone-200 hover:bg-stone-200 bg-white hover:text-stone-900 dark:border-stone-800 dark:bg-transparent dark:hover:bg-stone-800 dark:hover:text-stone-50',
                secondary:
                    'bg-blue-600 text-white hover:bg-blue-600/80',
                ghost: 'hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-50',
                link: 'text-stone-900 underline-offset-4 hover:underline dark:text-stone-50',
                premium: "bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500 hover:from-green-500 hover:via-blue-600 hover:to-indigo-600 text-white " +
                    "dark:bg-gradient-to-r dark:from-yellow-400 dark:via-red-500 dark:to-pink-500 dark:hover:from-yellow-500 dark:hover:via-red-600 dark:hover:to-pink-600",
                telegram: "bg-[#0088cc] text-white hover:bg-[#0088cc]/80"
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
                tiny: 'w-fit px-2 py-1 text-[13px] rounded-md'
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
