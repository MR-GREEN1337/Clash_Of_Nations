import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[10rem] grid-cols-1 md:grid-cols-3 gap-x-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "h-[150px] rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input shadow-gold p-4 dark:bg-black dark:border-gold bg-transparent border border-gold justify-between flex flex-col space-y-2",
        className
      )}
    >
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        {icon}
        <div className="font-sans text-xl font-bold text-gold dark:text-gold 200 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-bold text-gold-600 text-xs dark:text-gold-300">
          {description}
        </div>
      </div>
    </div>
  );
};
