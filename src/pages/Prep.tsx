import { motion } from "framer-motion";
import { Wifi, ClipboardList, UserPlus, LogIn, FileText, Rocket, HelpCircle } from "lucide-react";

const steps = [
  {
    number: 1,
    emoji: "📶",
    icon: Wifi,
    title: "Connect to WeWork WiFi or personal mobile hotspot",
    content: null,
  },
  {
    number: 2,
    emoji: "📋",
    icon: ClipboardList,
    title: "Fill pre-event survey",
    content: (
      <ul className="list-disc list-inside text-white/70 space-y-1 mt-1 text-xs">
        <li>
          Visit{" "}
          <a href="https://shebuilds-survey.lovable.app" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300 hover:text-cyan-200">
            shebuilds-survey.lovable.app
          </a>{" "}
          and complete the survey
        </li>
        <li>Select <span className="text-white/90 font-medium">Pune, India</span></li>
      </ul>
    ),
  },
  {
    number: 3,
    emoji: "🔐",
    icon: UserPlus,
    title: "Create Lovable Account",
    subtitle: "(skip if already created)",
    content: (
      <ul className="list-disc list-inside text-white/70 space-y-1 mt-1 text-xs">
        <li>
          Visit{" "}
          <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300 hover:text-cyan-200">
            lovable.dev
          </a>{" "}
          in a browser
        </li>
        <li>Create account with your SheBuilds registration email.</li>
      </ul>
    ),
  },
  {
    number: 4,
    emoji: "🔑",
    icon: LogIn,
    title: "Log into Lovable account",
    content: null,
  },
  {
    number: 5,
    emoji: "📝",
    icon: FileText,
    title: "Submit your details",
    content: (
      <ul className="list-disc list-inside text-white/70 space-y-1 mt-1 text-xs">
        <li>
          Visit{" "}
          <a href="https://shebuilds-dashboard.lovable.app/submit" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300 hover:text-cyan-200">
            shebuilds-dashboard.lovable.app/submit
          </a>
        </li>
        <li>Enter: your name, email (from SheBuilds registration), tentative app name, description
          <p className="ml-4 mt-1 text-white/50 italic">Note: App name and description can be changed later.</p>
        </li>
      </ul>
    ),
  },
];

export default function Prep() {
  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)",
      }}
    >
      {/* Background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Top bar: logo + help */}
        <div className="flex items-center justify-between mb-4">
          <img src="/shebuilds-logo.png" alt="SheBuilds" className="h-10 ml-1" />
          <button
            onClick={() => window.open("/Help.html", "_blank")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white/90 transition-colors text-sm"
          >
            <HelpCircle size={18} />
            Help
          </button>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Welcome, SheBuilds Pune Participants 👋
          </h1>
          <p className="text-white/70 text-lg">
            Let's prepare for the buildathon by following these steps:
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {step.number}
              </div>
              <div>
                <div className="flex items-start gap-1.5 mb-1">
                  <span className="text-base leading-tight">{step.emoji}</span>
                  <h2 className="text-sm font-semibold text-white leading-snug">{step.title}</h2>
                </div>
                {step.subtitle && (
                  <p className="text-white/50 text-xs mb-1">{step.subtitle}</p>
                )}
                {step.content}
              </div>
            </motion.div>
          ))}

          {/* 6th cell — closing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center"
          >
            <p className="text-center font-semibold text-white text-sm flex flex-col items-center gap-2">
              <Rocket className="text-yellow-300" size={24} />
              Now you're ready to build. Good luck! 🚀
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
