import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes } from 'react';
const variants=cva('btn',{variants:{variant:{default:'primary',outline:'outline',ghost:'ghost',destructive:'danger'}},defaultVariants:{variant:'default'}});
export function Button({className,variant,asChild=false,...props}:ButtonHTMLAttributes<HTMLButtonElement>&VariantProps<typeof variants>&{asChild?:boolean}){const C=asChild?Slot:'button';return <C className={twMerge(clsx(variants({variant}),className))} {...props}/>}
