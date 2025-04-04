import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/10 dark:group-[.toaster]:bg-[#1D1D1F]/40 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border group-[.toaster]:border-white/20 dark:group-[.toaster]:border-white/10 group-[.toaster]:text-black dark:group-[.toaster]:text-white group-[.toaster]:shadow-lg group-[.toaster]:rounded-full group-[.toaster]:px-1 group-[.toaster]:py-0.5 group-[.toaster]:text-[8px] group-[.toaster]:whitespace-nowrap",
          description: "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-300 group-[.toast]:text-[7px]",
          actionButton:
            "group-[.toast]:bg-white/10 dark:group-[.toast]:bg-white/10 group-[.toast]:text-black dark:group-[.toast]:text-white group-[.toast]:text-[7px] group-[.toast]:px-0.5 group-[.toast]:py-0",
          cancelButton:
            "group-[.toast]:bg-white/10 dark:group-[.toast]:bg-white/10 group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-300 group-[.toast]:text-[7px] group-[.toast]:px-0.5 group-[.toast]:py-0",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
