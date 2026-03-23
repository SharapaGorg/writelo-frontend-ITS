import {cva, type VariantProps} from 'class-variance-authority'

export {default as Toggle} from './Toggle.vue'

export const toggleVariants = cva(
    'select-none inline-flex items-center justify-center gap-x-1.5 rounded-2xl text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-transparent',
                // hover:dark:text-white  hover:text-black
                outline: `
          border border-input bg-transparent shadow-sm transition-all duration-200 
           data-[state=on]:hover:bg-blue-500/20  
           text-black/80 dark:text-white/90 data-[state=on]:text-blue-500 data-[state=on]:bg-blue-500/30
        data-[state=off]:hover:bg-blue-500/10 data-[state=on]:hover:text-blue-500
        data-[state=off]:hover:text-black/80 data-[state=off]:hover:dark:text-white/90
        `,
            },
            size: {
                default: 'h-9 px-2.5 min-w-9',
                sm: 'h-8 px-1.5 min-w-8',
                lg: 'h-10 px-2.5 min-w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

export type ToggleVariants = VariantProps<typeof toggleVariants>
