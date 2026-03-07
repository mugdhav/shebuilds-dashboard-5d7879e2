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
      <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
        <li>
          Visit{" "}
          <a href="https://shebuilds-survey.lovable.app" target="_blank" rel="noopener noreferrer" className="underline text-cyan-300 hover:text-cyan-200">
            shebuilds-survey.lovable.app
          </a>{" "}
          and complete the survey
        </li>
        <li>Select <span className="text-white/90 font-medium">72. Pune, India (mugdhaAI)</span></li>
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
      <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
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
      <ul className="list-disc list-inside text-white/70 space-y-1 mt-2">
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

        {/* Steps */}
        <div className="space-y-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 * i }}
              className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-5 flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white">
                {step.number}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.emoji}</span>
                  <h2 className="text-lg font-semibold text-white">{step.title}</h2>
                  {step.subtitle && (
                    <span className="text-white/50 text-sm">{step.subtitle}</span>
                  )}
                </div>
                {step.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-10"
        >
          <p className="text-2xl font-semibold text-white flex items-center justify-center gap-2">
            <Rocket className="text-yellow-300" size={28} />
            Now you are ready to build. Good luck! 🚀
          </p>
        </motion.div>
      </div>
    </div>
  );
}
