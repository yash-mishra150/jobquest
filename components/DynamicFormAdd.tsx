import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormFieldType = "text" | "email" | "select" | "textarea" | "file" | "tags";
export type FormFieldConfig = {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  accept?: string;
  maxLength?: number;
  minLength?: number;
  regex?: string;
  fullWidth?: boolean;
  tagOptions?: string[];
};

type FormValues = { [key: string]: unknown };

interface DynamicFormProps {
  config: FormFieldConfig[];
  onSubmit: (values: FormValues) => void;
  buttonTitle: string;
  formRef: React.RefObject<HTMLFormElement>;
  title: string;
  description: string;
  submitButtonText?: string;
  drawerHeight?: string;
  defaultValues?: Record<string, any>;
  // Controlled open state (optional). When provided, the dialog/drawer will be controlled by parent
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Hide the trigger button when using controlled mode or when you don't want a button rendered
  hideTrigger?: boolean;
}

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

export function DynamicForm({
  config,
  onSubmit,
  buttonTitle,
  title,
  description,
  submitButtonText = "Submit",
  drawerHeight = "h-auto",
  formRef,
  defaultValues = {},
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: DynamicFormProps & { formRef?: React.RefObject<HTMLFormElement> }) {
  // Controlled/uncontrolled open state
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? (controlledOpen as boolean) : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const handleClear = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const sections = React.useMemo(() => {
    const grouped: { [key: string]: FormFieldConfig[] } = {};
    config.forEach((field) => {
      const section = (typeof field === 'object' && 'section' in field && field.section) ? (field as { section?: string }).section || "" : "";
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(field);
    });
    return grouped;
  }, [config]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      ...config.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.type === "file" ? null : field.type === "tags" ? [] : "",
        }),
        {}
      ),
      ...defaultValues,
    },
  });

  // Reset form when defaultValues change (for editing)
  React.useEffect(() => {
    reset({
      ...config.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.type === "file" ? null : field.type === "tags" ? [] : "",
        }),
        {}
      ),
      ...defaultValues,
    });
  }, [JSON.stringify(defaultValues)]);

  const renderField = (field: FormFieldConfig) => {
    const fieldError = errors[field.name] as { message?: string } | undefined;
    const validation: Record<string, unknown> = {};
    if (field.required) validation.required = `${field.label} is required`;
    if (field.minLength)
      validation.minLength = {
        value: field.minLength,
        message: `${field.label} must be at least ${field.minLength} characters`,
      };
    if (field.maxLength)
      validation.maxLength = {
        value: field.maxLength,
        message: `${field.label} must be at most ${field.maxLength} characters`,
      };
    if (field.regex)
      validation.pattern = {
        value: new RegExp(field.regex),
        message: `${field.label} format is invalid`,
      };

    if (field.name === "description") {
      return (
        <div className={cn(field.fullWidth ? "col-span-1 md:col-span-2" : "grid gap-2")}>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            {...register(field.name as string, validation)}
          />
          {fieldError && (
            <p className="text-sm text-red-500">{fieldError.message as string}</p>
          )}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div className={cn(field.fullWidth ? "col-span-1 md:col-span-2 w-full" : "grid gap-2 w-full")}>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Controller
            name={field.name as string}
            control={control}
            rules={validation}
            render={({ field: { onChange, value } }) => (
              <Select
                onValueChange={onChange}
                value={value as string | undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={field.placeholder || `Select ${field.label}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {fieldError && (
            <p className="text-sm text-red-500">{fieldError.message as string}</p>
          )}
        </div>
      );
    }

    if (field.type === "tags") {
      // Custom component to handle tags input state
      const TagsInput: React.FC<{
        value: string[];
        onChange: (tags: string[]) => void;
        field: FormFieldConfig;
      }> = ({ value = [], onChange, field }) => {
        const [input, setInput] = React.useState("");
        const tags = Array.isArray(value) ? value : [];
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
        const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
              onChange([...tags, input.trim()]);
            }
            setInput("");
          }
        };
        const removeTag = (tag: string) => {
          onChange(tags.filter((t) => t !== tag));
        };
        return (
          <div className="flex flex-wrap items-center gap-2 border rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-[#7367F0] bg-white">
            {tags.map((tag) => (
              <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                {tag}
                <button type="button" className="ml-1 text-gray-500 hover:text-red-500" onClick={() => removeTag(tag)}>
                  ×
                </button>
              </span>
            ))}
            <input
              id={field.name}
              placeholder={field.placeholder || "Enter tag"}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-gray-700"
              autoComplete="off"
            />
          </div>
        );
      };

      return (
        <div className="col-span-1 md:col-span-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Controller
            name={field.name}
            control={control}
            rules={validation}
            render={({ field: { value = [], onChange } }) => (
              <TagsInput value={Array.isArray(value) ? value : []} onChange={onChange} field={field} />
            )}
          />
          {fieldError && (
            <p className="text-sm text-red-500">{fieldError.message as string}</p>
          )}
        </div>
      );
    }

    switch (field.type) {
      case "textarea":
        return (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name as string, validation)}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );
      case "file":
        return (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="file"
              accept={field.accept}
              {...register(field.name as string, {
                ...validation,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  return e.target.files?.[0] || null;
                },
              })}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );
      default:
        return (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name as string, validation)}
            />
            {fieldError && (
              <p className="text-sm text-red-500">{fieldError.message as string}</p>
            )}
          </div>
        );
    }
  };

  const FormContent = () => (
    <form
      ref={formRef}
      onSubmit={handleSubmit((values) => onSubmit({ ...values }))}
      className={cn("flex flex-col gap-8")}
      tabIndex={-1}
    >
      {Object.entries(sections).map(([section, fields], idx) => (
        <div key={section || idx} className="">
          {section && (
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#7367F0] text-white mr-3">
                {idx === 0 ? (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" fill="white" fillOpacity="0.15"/><path d="M12 8v8m4-4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="8" fill="white" fillOpacity="0.15"/><path d="M17 9l-5 5-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
              </div>
              <div>
                <div className="text-xl font-semibold text-[#2360c6]" style={{ color: '#2360c6' }}>{section}</div>
                <div className="text-gray-500 text-sm">{idx === 0 ? "Enter vendor details" : "Enter document details for verification"}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <React.Fragment key={field.name}>{renderField(field)}</React.Fragment>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-center mt-4 gap-4">
        <Button
          className="bg-[#7367F0] hover:bg-[#5a4fd6] text-white font-semibold px-10 py-3 rounded-lg shadow text-lg"
          type="submit"
          disabled={isSubmitting}
        >
          {submitButtonText}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-[#7367F0] text-[#7367F0] font-semibold px-10 py-3 rounded-lg shadow text-lg"
          onClick={handleClear}
        >
          Clear
        </Button>
      </div>
    </form>
  );

  const TopBar = (
    <div className="flex items-center px-8 py-5 bg-[#7367F0] rounded-t-xl">
      <div>
        <div className="text-2xl font-bold text-white">{title}</div>
        <div className="text-white text-sm opacity-80">{description}</div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {!hideTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-[#7367F0] text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-[#5a4fd6]">
              {buttonTitle}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[900px] p-0 bg-white border-none shadow-none">
          {TopBar}
          <div className="px-8 py-6">
            <FormContent />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DrawerTrigger asChild>
          <Button variant="outline" className="bg-[#7367F0] text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-[#5a4fd6]">
            {buttonTitle}
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent className={cn("bg-white border-none shadow-none")}>
        {TopBar}
        <div
          className="px-4 py-4 sm:px-8 sm:py-6 w-full"
          style={{
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            minHeight: '300px',
            boxSizing: 'border-box',
          }}
        >
          <FormContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}