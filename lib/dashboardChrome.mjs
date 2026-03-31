const DASHBOARD_TONES = {
  blue: {
    tone: "blue",
    glowClassName: "bg-gradient-to-r from-blue-600/20 to-purple-600/20",
    iconClassName:
      "bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-600/20",
    badgeClassName: "bg-blue-50 text-blue-600 border-blue-100",
    accentTextClassName: "text-blue-600",
  },
  indigo: {
    tone: "indigo",
    glowClassName: "bg-gradient-to-r from-blue-600/20 to-purple-600/20",
    iconClassName:
      "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-600/20",
    badgeClassName: "bg-indigo-50 text-indigo-600 border-indigo-100",
    accentTextClassName: "text-indigo-600",
  },
  emerald: {
    tone: "emerald",
    glowClassName: "bg-gradient-to-r from-blue-600/20 to-purple-600/20",
    iconClassName:
      "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-600/20",
    badgeClassName: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accentTextClassName: "text-emerald-600",
  },
  orange: {
    tone: "orange",
    glowClassName: "bg-gradient-to-r from-blue-600/20 to-purple-600/20",
    iconClassName:
      "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-600/20",
    badgeClassName: "bg-orange-50 text-orange-600 border-orange-100",
    accentTextClassName: "text-orange-600",
  },
  pink: {
    tone: "pink",
    glowClassName: "bg-gradient-to-r from-blue-600/20 to-purple-600/20",
    iconClassName:
      "bg-gradient-to-br from-pink-500 to-pink-600 shadow-pink-600/20",
    badgeClassName: "bg-pink-50 text-pink-600 border-pink-100",
    accentTextClassName: "text-pink-600",
  },
  purple: {
    tone: "purple",
    glowClassName: "bg-gradient-to-r from-blue-600/20 to-purple-600/20",
    iconClassName:
      "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-600/20",
    badgeClassName: "bg-purple-50 text-purple-600 border-purple-100",
    accentTextClassName: "text-purple-600",
  },
};

export function getDashboardToneStyles(tone = "blue") {
  return DASHBOARD_TONES[tone] || DASHBOARD_TONES.blue;
}
