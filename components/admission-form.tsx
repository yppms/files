"use client";
import { cn } from "@/lib/utils";
import type React from "react";

import { useState, useCallback, memo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { ImageUpload } from "./image-upload";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { default as SuccessPage } from "./success-page";
import { submitAdmissionForm } from "@/app/actions";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
// First, import the validation config at the top of the file
import { shouldValidate } from "@/lib/validation-config";

// Add this after the existing imports and before the STEPS constant
import { useSearchParams } from "next/navigation";

// Import the ValidationStatus component at the top of the file
import { ValidationStatus } from "./validation-status";
import { uploadFileToSupabaseClient } from "@/lib/client-upload";

const STEPS = ["Konfirmasi Dokumen", "Data Anak & Wali", "Lainnya"] as const;

// Validation types
type ValidationErrors = {
  [key: string]: string;
};

// Create optimized input component
const FormInput = memo(
  ({
    id,
    label,
    value,
    onChange,
    placeholder,
    required = false,
    helpText,
    className,
    error,
    type = "text", // Add type parameter with default "text"
    inputMode, // Add inputMode parameter
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    helpText?: string;
    className?: string;
    error?: string;
    type?: string;
    inputMode?:
      | "text"
      | "numeric"
      | "tel"
      | "email"
      | "url"
      | "search"
      | "none";
  }) => {
    // Use local state to prevent re-renders
    const [localValue, setLocalValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // For phone numbers, only allow digits
      if (type === "tel" && !/^\d*$/.test(e.target.value)) {
        return;
      }
      setLocalValue(e.target.value);
    };

    const handleBlur = () => {
      if (localValue !== value) {
        onChange(localValue);
      }
    };

    // Update local value if parent value changes
    if (value !== localValue && document.activeElement?.id !== id) {
      setLocalValue(value);
    }

    return (
      <div
        className={cn("space-y-2", className)}
        data-error={error ? true : undefined}
      >
        <div className="flex items-center gap-1.5">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
        <Input
          id={id}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          type={type}
          inputMode={inputMode}
          className={cn(
            "transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary",
            error &&
              "border-red-500 focus-within:ring-red-500 focus-within:border-red-500",
          )}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

// Create optimized textarea component
const FormTextarea = memo(
  ({
    id,
    label,
    value,
    onChange,
    placeholder,
    className,
    required = false,
    helpText,
    error,
  }: {
    id: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
    helpText?: string;
    error?: string;
  }) => {
    // Use local state to prevent re-renders
    const [localValue, setLocalValue] = useState(value);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
    };

    const handleBlur = () => {
      if (localValue !== value) {
        onChange(localValue);
      }
    };

    // Update local value if parent value changes
    if (value !== localValue && document.activeElement?.id !== id) {
      setLocalValue(value);
    }

    return (
      <div className="space-y-2" data-error={error ? true : undefined}>
        {label && (
          <div className="flex items-center gap-1.5">
            <Label htmlFor={id} className="text-sm font-medium">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        )}
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
        <Textarea
          id={id}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "min-h-[80px] transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary",
            className,
            error &&
              "border-red-500 focus-within:ring-red-500 focus-within:border-red-500",
          )}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

FormTextarea.displayName = "FormTextarea";

// Create a custom select component
const FormSelect = memo(
  ({
    id,
    label,
    value,
    onChange,
    placeholder,
    options,
    required = false,
    helpText,
    className,
    error,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
    required?: boolean;
    helpText?: string;
    className?: string;
    error?: string;
  }) => {
    return (
      <div
        className={cn("space-y-2", className)}
        data-error={error ? true : undefined}
      >
        <div className="flex items-center gap-1.5">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
        <Select>
          <SelectTrigger
            id={id}
            className={cn(
              "transition-all duration-200 focus:ring-1 focus:ring-primary/30 focus:border-primary",
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            )}
            value={value}
            onValueChange={onChange}
          >
            <SelectValue placeholder={placeholder} />
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectTrigger>
        </Select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";

// Create a notification component
const Notification = ({
  type,
  children,
}: {
  type: "info" | "warning" | "success";
  children: React.ReactNode;
}) => {
  const bgColor = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-primary-50 border-primary-200 text-primary-800",
  };

  const icons = {
    info: <Info className="h-4 w-4 text-blue-500" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
    success: <Check className="h-4 w-4 text-primary" />,
  };

  return (
    <div
      className={`flex items-start gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 ${bgColor[type]}`}
    >
      <div className="mt-0.5">{icons[type]}</div>
      <div className="text-xs sm:text-sm">{children}</div>
    </div>
  );
};

export function AdmissionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Fixed: Initialize with false instead of isSubmitting
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const formRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Add this right after the useState declarations
  const searchParams = useSearchParams();
  const needDocuments = searchParams.get("need_document") !== "false";

  const [formData, setFormData] = useState({
    // Student data
    class: "", // Add this new field
    studentName: "",
    nickname: "",
    birthCertificate: null as File | null,
    photo: null as File | null,
    hasKIA: null as string | null,
    kiaCard: null as File | null,
    bloodType: "",
    height: "",
    weight: "",
    medicalHistory: "",
    language: "",
    medicalHistoryDetails: "",
    hobby: "",

    // Guardian data
    relation: "",
    guardianName: "",
    guardianNickname: "",
    whatsapp: "",
    emergencyContacts: [{ phone: "", relationship: "" }] as {
      phone: string;
      relationship: "";
    }[],
    idCard: null as File | null,
    familyCard: null as File | null,
    addressDifferent: null as string | null,
    currentAddress: "",

    // Survey data
    source: "",
    sourceDetail: "",
    otherSource: "",
    extracurricular: [] as string[],
    expectations: "",
    occupation: "",
    instagram: "",
    email: "",
  });

  // Use useCallback to prevent function recreation on each render
  const updateFormData = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => {
        if (prev[field] === value) return prev;
        return { ...prev, [field]: value };
      });

      // Clear error for this field when it's updated
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors],
  );

  // Scroll to top when changing steps
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, isSubmitted]);

  // Function to scroll to the first error element
  const scrollToFirstError = useCallback(() => {
    setTimeout(() => {
      const firstErrorElement = document.querySelector(
        "[data-error='true']",
      ) as HTMLElement;
      if (firstErrorElement) {
        // Get the position of the element relative to the viewport
        const rect = firstErrorElement.getBoundingClientRect();

        // Calculate the absolute position on the page
        const absoluteTop = window.pageYOffset + rect.top;

        // Scroll to the element with some offset to make it visible
        window.scrollTo({
          top: absoluteTop - 100, // 100px offset to show the element clearly
          behavior: "smooth",
        });

        // Add a temporary highlight effect
        firstErrorElement.classList.add("error-highlight");
        setTimeout(() => {
          firstErrorElement.classList.remove("error-highlight");
        }, 2000);
      }
    }, 100); // Small delay to ensure DOM is updated
  }, []);

  // Validation functions
  const validateStep1 = () => {
    // Step 1 doesn't have any form fields to validate
    return true;
  };

  // Update the validateStep2 function to check if validation should be performed
  const validateStep2 = () => {
    // If validation is disabled, return true to bypass validation
    if (!shouldValidate()) {
      return true;
    }

    const newErrors: ValidationErrors = {};

    // Student data validation
    if (!formData.class) {
      newErrors.class = "Kelas harus dipilih";
    }

    if (!formData.studentName) {
      newErrors.studentName = "Nama lengkap anak harus diisi";
    } else if (formData.studentName.length < 3) {
      newErrors.studentName = "Nama lengkap anak minimal 3 karakter";
    }

    if (!formData.nickname) {
      newErrors.nickname = "Nama panggilan anak harus diisi";
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = "Nama panggilan anak minimal 2 karakter";
    }

    // Document validation - only if documents are needed
    if (needDocuments) {
      if (!formData.birthCertificate) {
        newErrors.birthCertificate = "Akta kelahiran harus diunggah";
      }

      if (!formData.photo) {
        newErrors.photo = "Pas foto harus diunggah";
      }

      if (!formData.hasKIA) {
        newErrors.hasKIA = "Pilih apakah anak memiliki KIA atau tidak";
      } else if (formData.hasKIA === "yes" && !formData.kiaCard) {
        newErrors.kiaCard = "Kartu Identitas Anak harus diunggah";
      }

      if (!formData.idCard) {
        newErrors.idCard = "KTP harus diunggah";
      }

      if (!formData.familyCard) {
        newErrors.familyCard = "Kartu Keluarga harus diunggah";
      }
    }

    if (!formData.bloodType) {
      newErrors.bloodType = "Golongan darah harus dipilih";
    }

    if (!formData.height) {
      newErrors.height = "Tinggi badan harus dipilih";
    }

    if (!formData.weight) {
      newErrors.weight = "Berat badan harus dipilih";
    }

    if (!formData.medicalHistory) {
      newErrors.medicalHistory =
        "Pilih apakah anak memiliki riwayat penyakit atau tidak";
    } else if (
      formData.medicalHistory === "yes" &&
      (!formData.medicalHistoryDetails ||
        formData.medicalHistoryDetails.length < 3)
    ) {
      newErrors.medicalHistoryDetails =
        "Detail riwayat penyakit minimal 3 karakter";
    }

    if (!formData.language) {
      newErrors.language = "Bahasa komunikasi harus dipilih";
    }

    // Guardian data validation
    if (!formData.relation) {
      newErrors.relation = "Hubungan dengan anak harus dipilih";
    }

    if (!formData.guardianName) {
      newErrors.guardianName = "Nama lengkap wali harus diisi";
    } else if (formData.guardianName.length < 3) {
      newErrors.guardianName = "Nama lengkap wali minimal 3 karakter";
    }

    if (!formData.guardianNickname) {
      newErrors.guardianNickname = "Nama panggilan wali harus diisi";
    } else if (formData.guardianNickname.length < 2) {
      newErrors.guardianNickname = "Nama panggilan wali minimal 2 karakter";
    }

    if (!formData.whatsapp) {
      newErrors.whatsapp = "Nomor WhatsApp harus diisi";
    } else if (!/^[0-9]{10,13}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Nomor WhatsApp tidak valid (10-13 digit)";
    }

    // Emergency contacts validation
    if (formData.emergencyContacts.length === 0) {
      newErrors.emergencyContacts = "Minimal harus ada 1 kontak darurat";
    } else {
      formData.emergencyContacts.forEach((contact, index) => {
        if (!contact.phone) {
          newErrors[`emergencyContacts.${index}.phone`] =
            "Nomor telepon harus diisi";
        } else if (!/^[0-9]{10,13}$/.test(contact.phone)) {
          newErrors[`emergencyContacts.${index}.phone`] =
            "Nomor telepon tidak valid (10-13 digit)";
        }

        if (!contact.relationship) {
          newErrors[`emergencyContacts.${index}.relationship`] =
            "Hubungan harus dipilih";
        }
      });
    }

    if (!formData.addressDifferent) {
      newErrors.addressDifferent =
        "Pilih apakah alamat domisili sama dengan KK atau tidak";
    } else if (
      formData.addressDifferent === "different" &&
      (!formData.currentAddress || formData.currentAddress.length < 10)
    ) {
      newErrors.currentAddress = "Alamat domisili minimal 10 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the validateStep3 function to check if validation should be performed
  const validateStep3 = () => {
    // If validation is disabled, return true to bypass validation
    if (!shouldValidate()) {
      return true;
    }

    const newErrors: ValidationErrors = {};

    // Survey data validation
    if (!formData.source) {
      newErrors.source = "Sumber informasi harus dipilih";
    } else if (formData.source === "self" && !formData.sourceDetail) {
      newErrors.sourceDetail = "Detail sumber informasi harus dipilih";
    } else if (formData.source === "other" && !formData.otherSource) {
      newErrors.otherSource = "Sumber informasi lainnya harus diisi";
    }

    if (formData.extracurricular.length < 3) {
      newErrors.extracurricular = "Pilih minimal 3 ekstrakurikuler";
    }

    if (!formData.expectations) {
      newErrors.expectations = "Harapan harus diisi";
    } else if (formData.expectations.length < 10) {
      newErrors.expectations = "Harapan minimal 10 karakter";
    }

    if (!formData.occupation) {
      newErrors.occupation = "Pekerjaan harus diisi";
    } else if (formData.occupation.length < 5) {
      newErrors.occupation = "Pekerjaan minimal 5 karakter";
    }

    if (formData.instagram && formData.instagram.length < 5) {
      newErrors.instagram = "Instagram minimal 5 karakter";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the toast calls to use more compact messages on mobile
  const handleNextStep = () => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = validateStep1();
    } else if (currentStep === 1) {
      isValid = validateStep2();
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Scroll to the first error
      scrollToFirstError();

      toast({
        title: "Validasi Gagal",
        description:
          window.innerWidth < 640
            ? "Mohon periksa data"
            : "Mohon periksa kembali data yang dimasukkan",
        variant: "destructive",
      });
    }
  };

  // Update the form submission handling to show detailed error messages

  // 1. Add a state for detailed error information:
  const [submissionError, setSubmissionError] = useState<{
    message: string;
    step?: string;
    details?: any;
  } | null>(null);

  // 2. Update the handleSubmit function to capture and display detailed errors:

  const checkTotalFileSize = () => {
    const files = [
      formData.birthCertificate,
      formData.photo,
      formData.kiaCard,
      formData.idCard,
      formData.familyCard,
    ].filter(Boolean) as File[];

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log("Total file size:", `${totalSizeMB}MB`);
    console.log("Individual file sizes:");

    files.forEach((file) => {
      console.log(
        `- ${file.name}: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      );
    });

    // We're no longer checking against Vercel's limit since we're uploading directly to Supabase
    return {
      totalSize,
      totalSizeMB,
      files: files.map((f) => ({
        name: f.name,
        size: f.size,
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
      })),
    };
  };

  const handleSubmit = async () => {
    // Declare these variables at the top of the function
    const uploadedFiles: { [key: string]: string } = {};
    const uploadErrors: { [key: string]: string } = {};

    // Log file sizes but don't block submission based on total size
    const sizeCheck = checkTotalFileSize();
    console.log("Pre-submission size check:", sizeCheck);

    // Check for individual file size limits (5MB per file)
    const oversizedFiles = sizeCheck.files.filter(
      (f) => Number.parseFloat(f.sizeMB) > 5,
    );

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles
        .map((f) => `${f.name} (${f.sizeMB}MB)`)
        .join(", ");
      toast({
        title: "File Terlalu Besar",
        description: `File ${fileNames} melebihi batas 5MB per file. Mohon kompres terlebih dahulu.`,
        variant: "destructive",
      });
      return;
    }

    // If validation is enabled, validate the form
    const isValid = shouldValidate() ? validateStep3() : true;

    if (!isValid) {
      // Scroll to the first error
      scrollToFirstError();

      toast({
        title: "Validasi Gagal",
        description:
          window.innerWidth < 640
            ? "Mohon periksa data"
            : "Mohon periksa kembali data yang dimasukkan",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(10);
      setSubmissionError(null);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 1000);

      // Check file sizes and compress if needed - only if documents are needed
      if (needDocuments) {
        const filesToCheck = [
          { name: "Akta Kelahiran", file: formData.birthCertificate },
          { name: "Pas Foto", file: formData.photo },
          { name: "KTP", file: formData.idCard },
          { name: "Kartu Keluarga", file: formData.familyCard },
        ];

        if (formData.hasKIA === "yes" && formData.kiaCard) {
          filesToCheck.push({
            name: "Kartu Identitas Anak",
            file: formData.kiaCard,
          });
        }

        // Check for any oversized files
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = filesToCheck.filter(
          (f) => f.file && f.file.size > maxSize,
        );

        if (oversizedFiles.length > 0) {
          clearInterval(progressInterval);
          setUploadProgress(0);
          setIsSubmitting(false);

          const fileNames = oversizedFiles.map((f) => f.name).join(", ");
          setSubmissionError({
            message: `File terlalu besar: ${fileNames}. Maksimal 5MB.`,
            step: "file_validation",
            details: `Mohon kompres file terlebih dahulu sebelum mengunggah. File yang terlalu besar: ${fileNames}`,
          });

          toast({
            title: "File Terlalu Besar",
            description:
              window.innerWidth < 640
                ? `File melebihi 5MB`
                : `File ${fileNames} melebihi batas 5MB. Mohon kompres terlebih dahulu.`,
            variant: "destructive",
          });

          return;
        }

        // Upload files only if documents are needed
        for (const { name: key, file } of filesToCheck.filter((f) => f.file)) {
          if (!file) continue;

          try {
            setUploadProgress((prev) => Math.min(prev + 5, 85));
            console.log(`Client uploading ${key}...`);
            uploadedFiles[key] = await uploadFileToSupabaseClient(
              file,
              "documents",
              formData.studentName || "unnamed_student",
            );
            console.log(
              `${key} uploaded:`,
              uploadedFiles[key] ? "success" : "failed",
            );
          } catch (error) {
            console.error(`Error uploading ${key}:`, error);
            uploadErrors[key] =
              error instanceof Error ? error.message : String(error);
          }
        }

        // Check if there were any upload errors
        if (Object.keys(uploadErrors).length > 0) {
          clearInterval(progressInterval);
          setUploadProgress(0);
          setIsSubmitting(false);

          const errorMessage = `Error uploading files: ${Object.values(uploadErrors).join(", ")}`;
          setSubmissionError({
            message: errorMessage,
            step: "client_upload_files",
            details: uploadErrors,
          });

          toast({
            title: "Upload Gagal",
            description: errorMessage,
            variant: "destructive",
          });

          return;
        }
      } else {
        // If documents are not needed, set progress to 85% to simulate file upload completion
        setUploadProgress(85);
      }

      // Now create a version of formData without the actual files
      // to avoid sending large payloads to the server
      const formDataWithoutFiles = {
        ...formData,
        // Replace file objects with their URLs
        birthCertificate: uploadedFiles.birthCertificate || null,
        photo: uploadedFiles.photo || null,
        kiaCard: uploadedFiles.kiaCard || null,
        idCard: uploadedFiles.idCard || null,
        familyCard: uploadedFiles.familyCard || null,
        // Add file metadata
        fileMetadata: Object.entries(uploadedFiles).map(([key, url]) => {
          const file = formData[key] as File;
          return {
            key,
            url,
            name: file?.name || "",
            size: file?.size || 0,
            type: file?.type || "",
          };
        }),
      };

      // Submit form data to server action (without the actual files)
      const result = await submitAdmissionForm(formDataWithoutFiles).catch(
        (error) => {
          console.error("Caught error during form submission:", error);
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unknown error during submission",
            details: error instanceof Error ? error.stack : String(error),
          };
        },
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Form submission result:", result);

      if (result.success) {
        setTimeout(() => {
          setIsSubmitted(true);
        }, 500); // Small delay to show 100% progress
      } else {
        const errorMessage =
          result.error || "Terjadi kesalahan saat mengirim formulir";
        console.error("Form submission failed:", errorMessage, result);

        setSubmissionError({
          message: errorMessage,
          step: result.step || "unknown_step",
          details: result.details || JSON.stringify(result),
        });

        toast({
          title: "Pengiriman Gagal",
          description: errorMessage,
          variant: "destructive",
        });

        // Increment retry count
        setRetryCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);

      setSubmissionError({
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengirim formulir",
        details: error instanceof Error ? error.stack : String(error),
      });

      toast({
        title: "Pengiriman Gagal",
        description: "Terjadi kesalahan saat mengirim formulir",
        variant: "destructive",
      });

      // Increment retry count
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If form is submitted, show success page
  if (isSubmitted) {
    return <SuccessPage />;
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="mb-4">
          Assalamualaikum Ayah Bunda, Saat ini kita memasuki proses pemberkasan.
          {needDocuments ? (
            <>
              Mohon dapat menyiapkan dokumen terlebih dulu sesuai daftar
              dibawah. Kemudian harap mengisi formulir dengan data
              sebenar-benarnya 🙏.
            </>
          ) : (
            <>Mohon mengisi formulir dengan data sebenar-benarnya 🙏.</>
          )}
        </p>

        <Notification type="warning">
          <p>
            Semua data dan dokumen yang diberikan adalah bersifat rahasia. Kami
            tidak akan membagikan data tersebut kepada pihak manapun, kecuali
            untuk keperluan yang relevan, seperti pendataan dinas pendidikan,
            asuransi siswa, atau keperluan legal lainnya.
          </p>
        </Notification>

        {!needDocuments && (
          <Notification type="info">
            <p>
              Mode pengisian tanpa dokumen. Dokumen sudah atau dapat diserahkan
              secara offline
            </p>
          </Notification>
        )}
      </div>

      {needDocuments && (
        <Card className="border-primary-100 shadow-md overflow-hidden">
          <CardHeader className="p-4 sm:p-6 pt-4 sm:pt-6 pb-3 bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100">
            <CardTitle className="text-xl flex items-center gap-2 text-primary-800">
              Dokumen yang dibutuhkan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Dokumen Anak - Dedicated Card */}
            <Card className="border-primary-100 shadow-sm overflow-hidden">
              <CardHeader className="p-3 sm:p-4 bg-gradient-to-r from-primary-400/10 to-primary-300/5 border-b border-primary-100">
                <CardTitle className="text-lg flex items-center gap-2 text-primary-700">
                  Dokumen Anak
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <ul className="list-disc pl-5 space-y-3">
                  <li className="py-1">
                    <span className="font-medium">Akta Kelahiran</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-bold">
                      Wajib
                    </span>
                  </li>
                  <li className="py-1">
                    <span className="font-medium">Pas Foto</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-bold">
                      Wajib
                    </span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Apabila belum ada: dapat difoto menggunakan handphone,
                      tidak harus formal, tampak muka depan
                    </p>
                  </li>
                  <li className="py-1">
                    <span className="font-medium">Kartu Identitas Anak</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">
                      Opsional
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Dokumen Wali - Dedicated Card */}
            <Card className="border-primary-100 shadow-sm overflow-hidden">
              <CardHeader className="p-3 sm:p-4 bg-gradient-to-r from-primary-400/10 to-primary-300/5 border-b border-primary-100">
                <CardTitle className="text-lg flex items-center gap-2 text-primary-700">
                  Dokumen Wali
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <ul className="list-disc pl-5 space-y-3">
                  <li className="py-1">
                    <span className="font-medium">Kartu Keluarga</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-bold">
                      Wajib
                    </span>
                  </li>
                  <li className="py-1">
                    <span className="font-medium">KTP</span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-bold">
                      Wajib
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="mt-2 flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Format dokumen
                </p>
                <p className="text-sm text-slate-600">
                  File dokumen berupa gambar dengan format jpg/jpeg/png ukuran
                  maksimal 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <div></div> {/* Empty div to maintain spacing */}
        <Button
          onClick={handleNextStep}
          className="bg-primary hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group"
        >
          {needDocuments ? "Dokumen telah siap" : "Lanjut mengisi formulir"}
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6" ref={formRef}>
      <Card className="border-primary-100 shadow-md overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pt-4 sm:pt-6 pb-3 bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-primary-800">
            Data Anak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-3 sm:pt-5 px-3 sm:px-5">
          <div className="space-y-5">
            <FormSelect
              id="class"
              label="Kelas"
              value={formData.class}
              onChange={(value) => updateFormData("class", value)}
              placeholder="Pilih kelas"
              options={[
                { value: "KB", label: "KB" },
                { value: "TK A", label: "TK A" },
                { value: "TK B", label: "TK B" },
              ]}
              required
              error={errors.class}
            />

            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2">
              <FormInput
                id="studentName"
                label="Nama Lengkap Anak"
                value={formData.studentName}
                onChange={(value) => updateFormData("studentName", value)}
                required
                error={errors.studentName}
              />
              <FormInput
                id="nickname"
                label="Nama Panggilan Anak"
                value={formData.nickname}
                onChange={(value) => updateFormData("nickname", value)}
                required
                error={errors.nickname}
              />
            </div>

            {needDocuments && (
              <>
                <ImageUpload
                  id="birthCertificate"
                  label="Akta Kelahiran"
                  value={formData.birthCertificate}
                  onChange={(file) => updateFormData("birthCertificate", file)}
                  required
                  error={errors.birthCertificate}
                />

                <ImageUpload
                  id="photo"
                  label="Pas Foto"
                  value={formData.photo}
                  onChange={(file) => updateFormData("photo", file)}
                  required
                  error={errors.photo}
                />

                <div
                  className="bg-primary-50 p-4 rounded-lg border border-primary-100"
                  data-error={errors.hasKIA ? true : undefined}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Label className="text-sm font-medium">
                      Apakah memiliki Kartu Identitas Anak?
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id="kia-yes"
                          checked={formData.hasKIA === "yes"}
                          onCheckedChange={(checked) => {
                            updateFormData("hasKIA", checked ? "yes" : null);
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor="kia-yes" className="text-sm">
                          Ya
                        </Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id="kia-no"
                          checked={formData.hasKIA === "no"}
                          onCheckedChange={(checked) => {
                            updateFormData("hasKIA", checked ? "no" : null);
                          }}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor="kia-no" className="text-sm">
                          Tidak
                        </Label>
                      </div>
                    </div>
                  </div>
                  {errors.hasKIA && (
                    <p className="text-xs text-red-500 mt-1">{errors.hasKIA}</p>
                  )}

                  {formData.hasKIA === "yes" && (
                    <ImageUpload
                      id="kiaCard"
                      label="Kartu Identitas Anak"
                      value={formData.kiaCard}
                      onChange={(file) => updateFormData("kiaCard", file)}
                      required
                      error={errors.kiaCard}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-5 pt-4">
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-3">
              <FormSelect
                id="bloodType"
                label="Golongan Darah"
                value={formData.bloodType}
                onChange={(value) => updateFormData("bloodType", value)}
                placeholder="Pilih golongan darah"
                options={[
                  { value: "unknown", label: "Belum Tahu" },
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "AB", label: "AB" },
                  { value: "O", label: "O" },
                ]}
                error={errors.bloodType}
              />

              <FormSelect
                id="height"
                label="Tinggi Badan (cm)"
                value={formData.height}
                onChange={(value) => updateFormData("height", value)}
                placeholder="Pilih tinggi badan"
                options={[
                  { value: "unknown", label: "Belum Tahu" },
                  ...Array.from({ length: 61 }, (_, i) => i + 80).map(
                    (height) => ({
                      value: height.toString(),
                      label: `${height} cm`,
                    }),
                  ),
                ]}
                error={errors.height}
              />

              <FormSelect
                id="weight"
                label="Berat Badan (kg)"
                value={formData.weight}
                onChange={(value) => updateFormData("weight", value)}
                placeholder="Pilih berat badan"
                options={[
                  { value: "unknown", label: "Belum Tahu" },
                  ...Array.from({ length: 31 }, (_, i) => i + 10).map(
                    (weight) => ({
                      value: weight.toString(),
                      label: `${weight} kg`,
                    }),
                  ),
                ]}
                error={errors.weight}
              />
            </div>

            <div
              className="bg-primary-50 p-4 rounded-lg border border-primary-100"
              data-error={errors.medicalHistory ? true : undefined}
            >
              <div className="flex items-center gap-2 mb-3">
                <Label className="text-sm font-medium">
                  Apakah anak memiliki riwayat penyakit berat / sedang ?
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="medical-history-yes"
                      checked={formData.medicalHistory === "yes"}
                      onCheckedChange={(checked) => {
                        updateFormData(
                          "medicalHistory",
                          checked ? "yes" : null,
                        );
                      }}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="medical-history-yes" className="text-sm">
                      Ya
                    </Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="medical-history-no"
                      checked={formData.medicalHistory === "no"}
                      onCheckedChange={(checked) => {
                        updateFormData("medicalHistory", checked ? "no" : null);
                      }}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="medical-history-no" className="text-sm">
                      Tidak
                    </Label>
                  </div>
                </div>
              </div>
              {errors.medicalHistory && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.medicalHistory}
                </p>
              )}

              {formData.medicalHistory === "yes" && (
                <FormTextarea
                  id="medicalHistoryDetails"
                  value={formData.medicalHistoryDetails || ""}
                  onChange={(value) =>
                    updateFormData("medicalHistoryDetails", value)
                  }
                  placeholder="Ceritakan penyakit-nya"
                  error={errors.medicalHistoryDetails}
                />
              )}
            </div>

            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <FormSelect
                  id="language"
                  label="Bahasa Komunikasi"
                  value={formData.language}
                  onChange={(value) => updateFormData("language", value)}
                  placeholder="Pilih bahasa"
                  options={[
                    { value: "indonesia", label: "Bahasa Indonesia" },
                    { value: "english", label: "Bahasa Inggris" },
                    { value: "javanese", label: "Bahasa Jawa" },
                    { value: "other", label: "Bahasa Daerah Lainnya" },
                  ]}
                  helpText="Bahasa sehari-hari anak di keluarga"
                  error={errors.language}
                />
              </div>

              <FormInput
                id="hobby"
                label="Hobi"
                value={formData.hobby}
                onChange={(value) => updateFormData("hobby", value)}
                helpText="Hobi / bakat / ketertarikan, kosongkan jika belum tahu"
                error={errors.hobby}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary-100 shadow-md overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pt-4 sm:pt-6 pb-3 bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-primary-800">
            Data Wali
          </CardTitle>
          <CardDescription>
            Mohon tentukan satu orang yang ditunjuk untuk mengisi data wali,
            misal Ayah saja atau Ibu saja. Wali yang terdaftar ini akan menjadi
            pihak utama dalam berkoordinasi dengan sekolah terkait anak.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-3 sm:pt-5 px-3 sm:px-5">
          <div className="space-y-5">
            <FormSelect
              id="relation"
              label="Hubungan dengan anak"
              value={formData.relation}
              onChange={(value) => updateFormData("relation", value)}
              placeholder="Pilih hubungan"
              options={[
                { value: "mother", label: "Ibu" },
                { value: "father", label: "Ayah" },
                { value: "grandmother", label: "Nenek" },
                { value: "grandfather", label: "Kakek" },
                { value: "aunt", label: "Bibi" },
                { value: "uncle", label: "Paman" },
                { value: "sibling", label: "Kakak" },
              ]}
              required
              error={errors.relation}
            />

            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2">
              <FormInput
                id="guardianName"
                label="Nama Lengkap Wali"
                value={formData.guardianName}
                onChange={(value) => updateFormData("guardianName", value)}
                required
                error={errors.guardianName}
              />
              <FormInput
                id="guardianNickname"
                label="Nama Panggilan Wali"
                value={formData.guardianNickname}
                onChange={(value) => updateFormData("guardianNickname", value)}
                required
                error={errors.guardianNickname}
              />
            </div>

            <div className="space-y-2">
              <FormInput
                id="whatsapp"
                label="Nomor Whatsapp"
                value={formData.whatsapp}
                onChange={(value) => {
                  // Only allow numbers (this is now handled in the component)
                  updateFormData("whatsapp", value);
                }}
                placeholder="08123456789"
                required
                helpText="Pastikan nomor WhatsApp adalah nomor yang digunakan sehari-hari dan dimiliki secara pribadi. Seluruh komunikasi termasuk yang bersifat rahasia akan kami sampaikan melalui nomor tersebut."
                error={errors.whatsapp}
                type="tel"
                inputMode="numeric"
              />
            </div>

            {needDocuments && (
              <>
                <ImageUpload
                  id="idCard"
                  label="KTP"
                  value={formData.idCard}
                  onChange={(file) => updateFormData("idCard", file)}
                  required
                  error={errors.idCard}
                />

                <ImageUpload
                  id="familyCard"
                  label="Kartu Keluarga"
                  value={formData.familyCard}
                  onChange={(file) => updateFormData("familyCard", file)}
                  required
                  error={errors.familyCard}
                />
              </>
            )}

            <div
              className="bg-primary-50 p-4 rounded-lg border border-primary-100"
              data-error={errors.addressDifferent ? true : undefined}
            >
              <div className="flex items-center gap-2 mb-3">
                <Label className="text-sm font-medium">
                  Apakah domisili saat ini sama dengan alamat di Kartu Keluarga?
                </Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="address-same"
                      checked={formData.addressDifferent === "same"}
                      onCheckedChange={(checked) => {
                        updateFormData(
                          "addressDifferent",
                          checked ? "same" : null,
                        );
                      }}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="address-same" className="text-sm">
                      Ya
                    </Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id="address-different"
                      checked={formData.addressDifferent === "different"}
                      onCheckedChange={(checked) => {
                        updateFormData(
                          "addressDifferent",
                          checked ? "different" : null,
                        );
                      }}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="address-different" className="text-sm">
                      Tidak
                    </Label>
                  </div>
                </div>
              </div>
              {errors.addressDifferent && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.addressDifferent}
                </p>
              )}

              {formData.addressDifferent === "different" && (
                <FormTextarea
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(value) => updateFormData("currentAddress", value)}
                  placeholder="Masukkan alamat lengkap domisili saat ini"
                  error={errors.currentAddress}
                />
              )}
            </div>

            <div
              className="space-y-4 pt-4"
              data-error={errors.emergencyContacts ? true : undefined}
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Kontak Darurat</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFormData("emergencyContacts", [
                      ...formData.emergencyContacts,
                      { phone: "", relationship: "" },
                    ]);
                  }}
                  className="text-primary border-primary/30 hover:bg-primary-50"
                >
                  Tambah Kontak
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Tambahkan kontak yang dapat dihubungi dalam keadaan darurat.
                Minimal 1.
              </p>
              {errors.emergencyContacts && (
                <p className="text-xs text-red-500">
                  {errors.emergencyContacts}
                </p>
              )}

              {formData.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 rounded-md bg-primary-50 border border-primary-100"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                        {index + 1}
                      </span>
                      Kontak Darurat {index + 1}
                    </h4>
                    {formData.emergencyContacts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newContacts = [...formData.emergencyContacts];
                          newContacts.splice(index, 1);
                          updateFormData("emergencyContacts", newContacts);
                        }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                    <FormSelect
                      id={`emergency-relation-${index}`}
                      label="Hubungan"
                      value={contact.relationship}
                      onChange={(value) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index].relationship = value;
                        updateFormData("emergencyContacts", newContacts);
                      }}
                      placeholder="Pilih hubungan"
                      options={[
                        { value: "mother", label: "Ibu" },
                        { value: "father", label: "Ayah" },
                        { value: "grandmother", label: "Nenek" },
                        { value: "grandfather", label: "Kakek" },
                        { value: "aunt", label: "Bibi" },
                        { value: "uncle", label: "Paman" },
                        { value: "sibling", label: "Kakak" },
                        { value: "neighbor", label: "Tetangga" },
                        { value: "friend", label: "Teman" },
                        { value: "other", label: "Lainnya" },
                      ].filter((option) => option.value !== formData.relation)} // Filter out the main guardian relation
                      error={errors[`emergencyContacts.${index}.relationship`]}
                    />
                    <FormInput
                      id={`emergency-phone-${index}`}
                      label="Nomor Telepon"
                      value={contact.phone}
                      onChange={(value) => {
                        const newContacts = [...formData.emergencyContacts];
                        newContacts[index].phone = value;
                        updateFormData("emergencyContacts", newContacts);
                      }}
                      placeholder="08123456789"
                      error={errors[`emergencyContacts.${index}.phone`]}
                      type="tel"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(1)}
          className="border-primary/30 text-primary hover:bg-primary-50 flex items-center gap-2 group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </Button>
        <Button
          onClick={handleNextStep}
          className="bg-primary hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group"
        >
          Lanjut
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6" ref={formRef}>
      <Card className="border-primary-100 shadow-md overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pt-4 sm:pt-6 pb-3 bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-primary-800">
            Survei
          </CardTitle>
          <CardDescription>
            Survei ini bertujuan untuk mengumpulkan data. Seluruh keputusan
            terkait program selalu melaui diskusi dengan wali murid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-3 sm:pt-5 px-3 sm:px-5">
          <div className="space-y-5">
            <div
              className="space-y-3"
              data-error={errors.extracurricular ? true : undefined}
            >
              <Label
                htmlFor="extracurricular"
                className="block text-sm font-medium"
              >
                <span className="font-medium">
                  Dari sembilan daftar ekstrakurikuler dibawah ini, menurut Ayah
                  Bunda manakah yang paling dibutuhkan?
                </span>
              </Label>
              <Notification type="warning">
                <p>
                  Urutan 1 untuk paling penting. Urutan 9 untuk paling tidak
                  penting. Minimal memilih 3.
                </p>
              </Notification>
              <div className="bg-white p-5 rounded-lg border border-primary-100 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Angklung",
                    "Drumband",
                    "English",
                    "Gambar / Lukis",
                    "Renang",
                    "Robotic",
                    "Tahfidz",
                    "Tari",
                    "Vokal",
                  ].map((activity) => {
                    const isSelected =
                      formData.extracurricular.includes(activity);
                    const priority = isSelected
                      ? formData.extracurricular.indexOf(activity) + 1
                      : null;

                    // Define priority colors and styles
                    const getPriorityStyles = (priority: number | null) => {
                      if (!priority) return {};

                      // Define distinct colors for top 3 priorities
                      if (priority === 1) {
                        return {
                          background:
                            "linear-gradient(135deg, #00bb9d 0%, #00a88e 100%)",
                          color: "white",
                          border: "2px solid #00bb9d",
                        };
                      } else if (priority === 2) {
                        return {
                          background:
                            "linear-gradient(135deg, #33cfb7 0%, #00bb9d 100%)",
                          color: "white",
                          border: "2px solid #33cfb7",
                        };
                      } else if (priority === 3) {
                        return {
                          background:
                            "linear-gradient(135deg, #66dbc9 0%, #33cfb7 100%)",
                          color: "white",
                          border: "2px solid #66dbc9",
                        };
                      } else {
                        // Lower priorities get progressively lighter
                        const lightness = Math.min(95, 75 + (priority - 3) * 5);
                        return {
                          background: `linear-gradient(135deg, hsl(168, 100%, ${lightness}%) 0%, hsl(168, 100%, ${lightness - 5}%) 100%)`,
                          color: "#00826f",
                          border: `2px solid hsl(168, 100%, ${lightness - 10}%)`,
                        };
                      }
                    };

                    const styles = getPriorityStyles(priority);

                    return (
                      <div
                        key={activity}
                        className={cn(
                          "relative flex items-center justify-between p-4 rounded-lg transition-all duration-300",
                          isSelected
                            ? "shadow-md transform scale-[1.02]"
                            : "border border-slate-200 hover:border-primary/30 hover:bg-slate-50",
                          "cursor-pointer overflow-hidden",
                        )}
                        style={isSelected ? styles : {}}
                        onClick={() => {
                          if (isSelected) {
                            // If already selected, remove it
                            updateFormData(
                              "extracurricular",
                              formData.extracurricular.filter(
                                (item) => item !== activity,
                              ),
                            );
                          } else {
                            // If not selected, add it
                            updateFormData("extracurricular", [
                              ...formData.extracurricular,
                              activity,
                            ]);
                          }
                        }}
                      >
                        <span
                          className={cn(
                            "font-medium",
                            isSelected
                              ? priority && priority <= 3
                                ? "text-white"
                                : ""
                              : "",
                          )}
                        >
                          {activity}
                        </span>

                        {isSelected && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary text-base font-bold shadow-sm border-2 border-primary z-10">
                            {priority}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors.extracurricular && (
                  <div className="flex items-center gap-2 mt-3 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{errors.extracurricular}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-400" />
                  Apabila ingin membatalkan urutan dapat meng-klik kembali item.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-primary-100">
              <FormSelect
                id="source"
                label="Darimana Ayah Bunda tahu dan akhirnya tertarik memilih TKIT Miftahussalam?"
                value={formData.source}
                onChange={(value) => updateFormData("source", value)}
                placeholder="Pilih sumber informasi"
                options={[
                  {
                    value: "recommendation",
                    label: "Rekomendasi saudara / kerabat",
                  },
                  { value: "self", label: "Saya cari dan riset sendiri" },
                  {
                    value: "location",
                    label: "Sering atau pernah lewat lokasi",
                  },
                  { value: "other", label: "Lainnya" },
                ]}
                required
                error={errors.source}
              />

              {formData.source === "self" && (
                <FormSelect
                  id="sourceDetail"
                  label="Darimana informasi pertama-nya?"
                  value={formData.sourceDetail}
                  onChange={(value) => updateFormData("sourceDetail", value)}
                  placeholder="Pilih sumber informasi"
                  options={[
                    { value: "google", label: "Google Pencarian" },
                    { value: "google-review", label: "Google Review" },
                    { value: "instagram", label: "Instagram" },
                    { value: "tiktok", label: "Tiktok" },
                    { value: "whatsapp", label: "WhatsApp" },
                    { value: "website", label: "Website" },
                    { value: "facebook", label: "Facebook" },
                  ]}
                  error={errors.sourceDetail}
                />
              )}

              {formData.source === "other" && (
                <FormInput
                  id="otherSource"
                  label="Sumber informasi lainnya"
                  value={formData.otherSource}
                  onChange={(value) => updateFormData("otherSource", value)}
                  placeholder="Tuliskan sumber informasi"
                  error={errors.otherSource}
                />
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-primary-100">
              <div className="space-y-1">
                <Label
                  htmlFor="occupation"
                  className="block text-sm font-medium"
                >
                  <span className="font-medium">
                    Detail pekerjaan Ayah / Ibu / Wali
                  </span>
                </Label>
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-sm text-muted-foreground">
                    Mengapa kami membutuhkan detail pekerjaan Ayah Bunda?
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-primary hover:bg-transparent"
                      >
                        <span className="text-sm">Cek manfaatnya</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-sm border-primary-100">
                      <p className="text-sm">
                        Informasi pekerjaan Ayah Bunda sangat bermanfaat karena
                        dapat membuka peluang kolaborasi dengan sekolah maupun
                        wali murid lainnya dalam berbagai hal: seperti
                        pengembangan karir, peluang bisinis, perluasan jaringan
                        profesional, dan tentu saja: memperkuat silaturahmi.
                        Kami juga aktif mengadakan kegiatan Job Day dengan
                        mengundang orang tua untuk berbagi pengalaman pekerjaan
                        kepada Anak. Hal ini bertujuan agar anak dapat mengenal
                        beragam profesi dari sumber pertama, sekaligus
                        menginspirasi mereka dalam merencanakan masa depan.
                        Jangan ragu untuk berbagi, karena keterbukaan ini bisa
                        membawa banyak manfaat! 😊
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Textarea
                id="occupation"
                value={formData.occupation}
                onChange={(e) => updateFormData("occupation", e.target.value)}
                placeholder="Apabila Ayah dan Ibu keduanya bekerja, mohon dapat ditulis keduanya"
                className={cn(
                  "min-h-[100px] transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary",
                  errors.occupation &&
                    "border-red-500 focus-within:ring-red-500 focus-within:border-red-500",
                )}
              />
              {errors.occupation && (
                <p className="text-xs text-red-500">{errors.occupation}</p>
              )}
              <div className="flex items-center gap-1.5 mb-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-primary hover:bg-transparent"
                    >
                      <span className="text-sm">Contoh pengisian</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-sm border-primary-100">
                    <p className="text-sm">
                      Jualan Mebel di JCM, Guru SMA 1 Sleman, PNS Kecamatan
                      Mlati, Sales Honda Motor Godean, Dokter Bedah Saraf RS
                      Sardjito, Youtuber Review Alat Rumah Tangga, Programmer di
                      GOTO, dsj.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary-100 shadow-md overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pt-4 sm:pt-6 pb-3 bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-primary-800">
            Komunikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-3 sm:pt-5 px-3 sm:px-5">
          <FormInput
            id="instagram"
            label="Instagram (apabila ada)"
            value={formData.instagram}
            onChange={(value) => updateFormData("instagram", value)}
            placeholder="username, username"
            helpText="Saling follow sama instagram TK ya Kak 😊"
            error={errors.instagram}
          />

          <FormInput
            id="email"
            label="Email (apabila ada)"
            value={formData.email}
            onChange={(value) => updateFormData("email", value)}
            placeholder="email@example.com"
            helpText="Biasanya untuk sharing file atau dokumen"
            error={errors.email}
          />
        </CardContent>
      </Card>

      <Card className="border-primary-100 shadow-md overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pt-4 sm:pt-6 pb-3 bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-primary-800">
            Bebas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-3 sm:pt-5 px-3 sm:px-5">
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 flex gap-3">
            <div className="mt-0.5 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm">
              Pada bagian ini, Ayah Bunda bebas menyampaikan apa saja. Bisa
              berupa harapan untuk anak, untuk sekolah, atau permintaan terkait
              fasilitas, program, dan hal lain yang dirasa penting. Kami ingin
              mendengatkan setiap masukan yang diberikan, agar selalu dapat
              memberikan layanan pendidikan terbaik untuk anak-anak kita. 😊
            </p>
          </div>
          <FormTextarea
            id="expectations"
            label="Harapan / Permintaan / Apa Saja"
            value={formData.expectations}
            onChange={(value) => updateFormData("expectations", value)}
            placeholder="Sampaikan apapun, dari hal-hal kecil sampai yang besar"
            className="min-h-[120px]"
            error={errors.expectations}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(1)}
          className="border-primary/30 text-primary hover:bg-primary-50 flex items-center gap-2 group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium px-6 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Kirim
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-3xl py-4 sm:py-8 px-2 sm:px-4">
      {/* Add CSS for error highlight animation */}
      <style jsx global>{`
        .error-highlight {
          animation: pulse-error 1s ease-in-out;
        }

        @keyframes pulse-error {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.2);
          }
        }
      `}</style>

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">
              Mengunggah Data
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Mohon tunggu sementara kami mengunggah data dan dokumen Anda...
            </p>
            <Progress value={uploadProgress} className="h-2 mb-2" />
            <p className="text-xs text-right text-gray-500">
              {uploadProgress}%
            </p>
          </div>
        </div>
      )}

      {submissionError && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full mx-2">
            <h2 className="text-lg sm:text-xl font-bold mb-2 text-red-600">
              Pengiriman Gagal
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3 max-h-40 sm:max-h-60 overflow-auto">
              <p className="font-medium text-red-800 text-sm sm:text-base">
                {submissionError.message}
              </p>

              {submissionError.step && (
                <p className="text-xs sm:text-sm text-red-700 mt-1">
                  Langkah: {submissionError.step}
                </p>
              )}

              <div className="mt-2 hidden sm:block">
                <p className="text-xs font-medium text-red-700">Detail:</p>
                <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-auto whitespace-pre-wrap text-xs">
                  {typeof submissionError.details === "object"
                    ? JSON.stringify(submissionError.details, null, 2)
                    : String(
                        submissionError.details || "Tidak ada detail tambahan",
                      )}
                </pre>
              </div>

              <div className="mt-2 text-xs text-red-600">
                <p>Percobaan ke-{retryCount}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSubmissionError(null)}
                className="w-1/2 mr-2"
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  setSubmissionError(null);
                  handleSubmit();
                }}
                className="w-1/2 ml-2 bg-primary"
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-10">
        <div className="relative flex items-center justify-between">
          {/* Background track - full width */}
          <div className="absolute left-0 right-0 h-1 bg-gray-200 top-4 sm:top-5"></div>

          {/* Active track - grows based on current step */}
          <div
            className={`absolute left-0 h-1 bg-primary transition-all duration-500 top-4 sm:top-5`}
            style={{
              width:
                currentStep === 0 ? "0%" : currentStep === 1 ? "50%" : "100%",
            }}
          ></div>

          {/* Step indicators */}
          {STEPS.map((step, index) => (
            <div
              key={step}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={cn(
                  "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-all duration-300 text-sm sm:text-base bg-white",
                  index <= currentStep
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-muted",
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium mt-1 transition-all duration-300 text-center",
                  index <= currentStep
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add the ValidationStatus component here */}
      <div className="mb-4">
        <ValidationStatus />
      </div>

      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}

      {/* Footer space */}
      <div className="mt-6"></div>
    </div>
  );
}
