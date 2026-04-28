'use client'

import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Select({
  value,
  onValueChange,
  children,
  ...props
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div data-slot="select" {...props}>
      {children}
    </div>
  )
}

function SelectGroup({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

function SelectValue({
  placeholder,
}: {
  placeholder?: string
}) {
  if (!placeholder) return null
  return <option value="" disabled>{placeholder}</option>
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<'select'> & {
  size?: 'sm' | 'default'
  value?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        data-slot="select-trigger"
        data-size={size}
        className={cn(
          "border-input text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9 appearance-none cursor-pointer pr-8",
          "data-[size=sm]:h-8",
          className,
        )}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 opacity-50 pointer-events-none" />
    </div>
  )
}

function SelectContent({
  children,
  ...props
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

function SelectLabel({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <optgroup label={typeof children === 'string' ? children : ''} {...props} />
  )
}

function SelectItem({
  value,
  children,
  ...props
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  )
}

function SelectSeparator() {
  return null
}

function SelectScrollUpButton() {
  return null
}

function SelectScrollDownButton() {
  return null
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
