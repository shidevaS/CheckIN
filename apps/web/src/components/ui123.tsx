import { forwardRef, isValidElement, cloneElement, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";

/** Render a child element with the parent's className + event props (a tiny Slot). */
function Slot({ children, className, ...props }: { children: ReactNode } & Record<string, unknown>) {
  if (isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      className: className ? clsx(className, (children.props as { className?: string }).className) : (children.props as { className?: string }).className,
    });
  }
  return null;
}

/* ---------- Button ---------- */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const btnVariants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted",
  ghost: "hover:bg-muted text-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
};

const btnSizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "primary", size = "md", asChild, children, ...props }, ref) {
    const base = clsx(
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      btnVariants[variant],
      btnSizes[size],
      className
    );
    if (asChild) {
      return (
        <Slot {...props} className={base}>
          {children}
        </Slot>
      );
    }
    return (
      <button ref={ref} className={clsx(base)} {...props}>
        {children}
      </button>
    );
  }
);

/* ---------- Input ---------- */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

/* ---------- Textarea ---------- */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

/* ---------- Label ---------- */
export function Label({ className, ...props }: { className?: string; children: ReactNode } & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={clsx("text-sm font-medium text-foreground", className)} {...props} />;
}

/* ---------- Card ---------- */
export function Card({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("rounded-xl border border-border bg-card text-card-foreground", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("flex flex-col space-y-1 p-5 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx("font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("p-5 pt-3", className)} {...props} />;
}

/* ---------- Badge ---------- */
export function Badge({
  className,
  tone = "neutral",
  variant = "default",
  ...props
}: {
  className?: string;
  tone?: "neutral" | "gold" | "teal" | "live";
  variant?: "default" | "outline" | "secondary";
} & React.HTMLAttributes<HTMLSpanElement>) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    gold: "bg-[rgb(var(--primary)/0.14)] text-[rgb(var(--primary))]",
    teal: "bg-[rgb(var(--accent)/0.14)] text-[rgb(var(--accent))]",
    live: "bg-red-100 text-red-700",
  };
  const variants = {
    default: "",
    outline: "bg-transparent border border-border",
    secondary: "bg-secondary text-secondary-foreground",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

/* ---------- Switch ---------- */
export function Switch({ className, checked, onChange, id, ...props }: { className?: string; checked?: boolean; onChange?: (checked: boolean) => void; id?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={clsx("relative inline-flex items-center cursor-pointer", className)}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
        {...props}
      />
      <div className={clsx(
        "w-11 h-6 rounded-full border-2 transition-colors",
        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
        "peer-checked:bg-[rgb(var(--primary))] peer-checked:border-[rgb(var(--primary))]",
        "peer-checked:bg-[rgb(var(--primary))] peer-checked:border-transparent",
        "bg-transparent border-border",
        "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
      )} />
      <div className={clsx(
        "absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-transform",
        "peer-checked:translate-x-5"
      )} />
    </label>
  );
}

/* ---------- Select ---------- */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={clsx(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

export function SelectTrigger({ className, children, ...props }: { className?: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded="false"
      aria-haspopup="listbox"
      className={clsx(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ className, children, ...props }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx("truncate", className)} {...props}>{children}</span>;
}

export function SelectContent({ className, children, ...props }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    >
      <div className="max-h-96 overflow-y-auto">{children}</div>
    </div>
  );
}

export function SelectItem({ className, value, children, ...props }: { className?: string; value: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="option"
      data-value={value}
      className={clsx(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
      </span>
      {children}
    </div>
  );
}

/* ---------- Separator ---------- */
export function Separator({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={clsx("border-border", className)} {...props} />;
}

/* ---------- ScrollArea ---------- */
export function ScrollArea({ className, children, ...props }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("overflow-auto", className)} {...props}>
      {children}
    </div>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ className, ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />;
}

export function AvatarImage({ className, ...props }: { className?: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className={clsx("aspect-square h-full w-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />;
}

/* ---------- Progress ---------- */
export function Progress({ className, value = 0, ...props }: { className?: string; value?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ---------- Tabs ---------- */
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  // Just a context provider wrapper - actual state handled by parent
  return <div className={clsx(className)} data-value={value}>{children}</div>;
}

function TabsList({ className, children, ...props }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props}>{children}</div>;
}

function TabsTrigger({ className, value, children, ...props }: { className?: string; value: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={false}
      data-value={value}
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ className, value, children, ...props }: { className?: string; value: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mt-2 ring-offset-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", className)} data-value={value} {...props}>{children}</div>;
}

export { TabsList, TabsTrigger, TabsContent };
