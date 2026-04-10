import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowLogo } from "@/components/hackathon/GlowLogo";
import { Link } from "react-router-dom";
import { User, Mail, UserPlus, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { userFriendlyError } from "@/lib/errorMessages";

interface FieldErrors {
  fullName?: string;
  email?: string;
}

function validateForm(form: { fullName: string; email: string }): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  } else if (form.fullName.trim().length > 100) {
    errors.fullName = "Full name must be 100 characters or less";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  } else if (form.email.trim().length > 255) {
    errors.email = "Email must be 255 characters or less";
  }

  return errors;
}

export default function RegisterPage() {
  const { toast } = useToast();
  const [registered, setRegistered] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({ fullName: "", email: "" });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/register-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: data.fullName.trim(),
          email: data.email.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Registration failed");
    },
    onSuccess: () => {
      setRegistered(true);
      toast({ title: "Registration successful!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Registration failed",
        description: err.message.includes("already registered")
          ? "This email is already registered."
          : userFriendlyError(err),
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const updated = { ...form, [field]: value };
      const errors = validateForm(updated);
      setFieldErrors((prev) => ({
        ...prev,
        [field]: errors[field as keyof FieldErrors],
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateForm(form);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: errors[field as keyof FieldErrors],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFieldErrors(errors);
    setTouched({ fullName: true, email: true });

    if (Object.keys(errors).length > 0) return;
    registerMutation.mutate(form);
  };

  if (registered) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            "linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px]" />
        </div>
        <Card className="w-full max-w-md relative z-10 bg-black/30 border-white/20 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              You&apos;re Registered!
            </h2>
            <p className="text-white/60 mb-6">
              Your registration has been received. We look forward to seeing you
              at the hackathon!
            </p>
            <Link to="/">
              <Button className="w-full">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button
              size="icon"
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <GlowLogo />
          <div className="w-10" />
        </div>

        <Card className="bg-black/30 border-white/20 backdrop-blur-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-white">Register</CardTitle>
            <p className="text-sm text-white/50 mt-1">
              Sign up for the SheBuilds Hackathon
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="fullName"
                  className="text-white/70 text-xs flex items-center gap-1.5 mb-1.5"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-help">
                        <User className="w-3.5 h-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Your full name (minimum 2 characters)
                    </TooltipContent>
                  </Tooltip>
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  aria-describedby={
                    fieldErrors.fullName && touched.fullName
                      ? "fullName-error"
                      : undefined
                  }
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    fieldErrors.fullName && touched.fullName
                      ? "border-red-400"
                      : ""
                  }`}
                />
                {fieldErrors.fullName && touched.fullName && (
                  <p
                    id="fullName-error"
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-white/70 text-xs flex items-center gap-1.5 mb-1.5"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-help">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Your unique email address — one registration per email
                    </TooltipContent>
                  </Tooltip>
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-describedby={
                    fieldErrors.email && touched.email
                      ? "email-error"
                      : undefined
                  }
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    fieldErrors.email && touched.email ? "border-red-400" : ""
                  }`}
                />
                {fieldErrors.email && touched.email && (
                  <p
                    id="email-error"
                    className="text-red-400 text-xs mt-1 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#5271FF] to-[#E83F9B] hover:from-[#4060ee] hover:to-[#d72f8a] text-white border-0 mt-2"
                disabled={registerMutation.isPending}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs mt-4">
          SheBuilds Hackathon &middot; Pune Edition
        </p>
      </div>
    </div>
  );
}
