import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowLogo } from "@/components/hackathon/GlowLogo";
import { Link } from "react-router-dom";
import {
  User, Mail, Lightbulb, Link2, Send, AppWindow,
  CheckCircle2, ArrowLeft, AlertCircle
} from "lucide-react";
import type { Topic } from "@/types/hackathon";
import { userFriendlyError } from "@/lib/errorMessages";

interface FieldErrors {
  fullName?: string;
  email?: string;
  appName?: string;
  appTopic?: string;
  appLink?: string;
}

function validateForm(form: {
  fullName: string;
  email: string;
  appName: string;
  appTopic: string;
  appLink: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!form.appName.trim()) {
    errors.appName = "App name is required";
  } else if (form.appName.trim().length > 25) {
    errors.appName = "App name must be 25 characters or less";
  }

  if (form.appTopic.trim() && form.appTopic.trim().length > 25) {
    errors.appTopic = "App topic must be 25 characters or less";
  }

  if (form.appLink.trim()) {
    try {
      new URL(form.appLink.trim());
    } catch {
      errors.appLink = "Please enter a valid URL (e.g. https://...)";
    }
  }

  return errors;
}

export default function SubmitPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);

  const { data: topicsList = [] } = useQuery({
    queryKey: ["topics-list"],
    queryFn: async () => {
      const { data } = await supabase.from("topics").select("*");
      return (data || []) as Topic[];
    },
  });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    appName: "",
    appTopic: "",
    appLink: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fhyuvjznkaklefkxvgse.supabase.co";
      const res = await fetch(`${supabaseUrl}/functions/v1/submit-app`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: data.fullName.trim(),
          email: data.email.trim(),
          app_name: data.appName.trim(),
          app_topic: data.appTopic.trim() || null,
          app_link: data.appLink.trim() || null,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Submission failed");
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Submission received!" });
    },
    onError: (err: Error) => {
      console.error("Submission error:", err);
      toast({
        title: "Submission failed",
        description: userFriendlyError(err),
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
    setTouched({
      fullName: true,
      email: true,
      appName: true,
      appTopic: true,
      appLink: true,
    });

    if (Object.keys(errors).length > 0) return;
    submitMutation.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px]" />
        </div>
        <Card className="w-full max-w-md relative z-10 bg-black/30 border-white/20 backdrop-blur-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Submission Received!</h2>
            <p className="text-white/60 mb-6">
              Your app has been submitted successfully. It will appear on the live dashboard shortly.
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full">
                  View Live Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white bg-transparent hover:bg-white/10"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ fullName: "", email: "", appName: "", appTopic: "", appLink: "" });
                  setFieldErrors({});
                  setTouched({});
                }}
              >
                Submit Another App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button size="icon" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <GlowLogo />
          <button
            onClick={() => window.open('/Help.html', '_blank')}
            className="w-10 h-10 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Help
          </button>
        </div>

        <Card className="bg-black/30 border-white/20 backdrop-blur-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-white">Submit Your App</CardTitle>
            <p className="text-sm text-white/50 mt-1">
              Share your hackathon project with the community
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-white/70 text-xs flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    fieldErrors.fullName && touched.fullName ? "border-red-400" : ""
                  }`}
                />
                {fieldErrors.fullName && touched.fullName && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-white/70 text-xs flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    fieldErrors.email && touched.email ? "border-red-400" : ""
                  }`}
                />
                {fieldErrors.email && touched.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="appName" className="text-white/70 text-xs flex items-center gap-1.5 mb-1.5">
                  <AppWindow className="w-3.5 h-3.5" />
                  App Name * <span className="text-white/30 ml-auto">{form.appName.length}/25</span>
                </Label>
                <Input
                  id="appName"
                  placeholder="e.g. NutriMama"
                  maxLength={25}
                  value={form.appName}
                  onChange={(e) => handleChange("appName", e.target.value)}
                  onBlur={() => handleBlur("appName")}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    fieldErrors.appName && touched.appName ? "border-red-400" : ""
                  }`}
                />
                {fieldErrors.appName && touched.appName && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.appName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="appTopic" className="text-white/70 text-xs flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  App Topic <span className="text-white/30 ml-auto">{form.appTopic.length}/25</span>
                </Label>
                <div className="relative">
                  <Input
                    id="appTopic"
                    placeholder="e.g. AI-powered health tracker"
                    maxLength={25}
                    value={form.appTopic}
                    autoComplete="off"
                    onChange={(e) => {
                      handleChange("appTopic", e.target.value);
                      setShowTopicSuggestions(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (form.appTopic.trim().length > 0) setShowTopicSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowTopicSuggestions(false), 150);
                      handleBlur("appTopic");
                    }}
                    className={`bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                      fieldErrors.appTopic && touched.appTopic ? "border-red-400" : ""
                    }`}
                  />
                  {showTopicSuggestions && (() => {
                    const q = form.appTopic.trim().toLowerCase();
                    const matches = topicsList.filter(t => t.name.toLowerCase().includes(q));
                    return matches.length > 0 ? (
                      <ul className="absolute z-50 w-full mt-1 bg-[#1a1a2e] border border-white/20 rounded-md overflow-hidden shadow-lg">
                        {matches.map((topic) => (
                          <li
                            key={topic.id}
                            className="px-3 py-2 text-sm text-white cursor-pointer hover:bg-white/10"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleChange("appTopic", topic.name);
                              setShowTopicSuggestions(false);
                            }}
                          >
                            {topic.name}
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
                {fieldErrors.appTopic && touched.appTopic && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.appTopic}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="appLink" className="text-white/70 text-xs flex items-center gap-1.5 mb-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  App Link
                </Label>
                <Input
                  id="appLink"
                  placeholder="https://your-app.example.com"
                  value={form.appLink}
                  onChange={(e) => handleChange("appLink", e.target.value)}
                  onBlur={() => handleBlur("appLink")}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/30 ${
                    fieldErrors.appLink && touched.appLink ? "border-red-400" : ""
                  }`}
                />
                {fieldErrors.appLink && touched.appLink && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.appLink}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#5271FF] to-[#E83F9B] hover:from-[#4060ee] hover:to-[#d72f8a] text-white border-0 mt-2"
                disabled={submitMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? "Submitting..." : "Submit App"}
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
