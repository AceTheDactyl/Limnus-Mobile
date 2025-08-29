const primaryPurple = "#2c003e";
const secondaryPurple = "#4a0e4e";
const accentPurple = "#6b1e7a";
const lightPurple = "#8b3a9c";
const backgroundPurple = "#1a0026";
const cardPurple = "#2d0040";

export default {
  light: {
    text: "#ffffff",
    textSecondary: "#b8a9c9",
    background: primaryPurple,
    backgroundSecondary: backgroundPurple,
    card: cardPurple,
    border: "#4a0e4e",
    tint: lightPurple,
    accent: accentPurple,
    tabIconDefault: "#7a6b8a",
    tabIconSelected: "#ffffff",
    notification: "#ff6b9d",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#ef4444",
    errorBackground: "#2d1b1b",
    errorBorder: "#4a2626",
  },
  dark: {
    text: "#ffffff",
    textSecondary: "#b8a9c9",
    background: primaryPurple,
    backgroundSecondary: backgroundPurple,
    card: cardPurple,
    border: "#4a0e4e",
    tint: lightPurple,
    accent: accentPurple,
    tabIconDefault: "#7a6b8a",
    tabIconSelected: "#ffffff",
    notification: "#ff6b9d",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#ef4444",
    errorBackground: "#2d1b1b",
    errorBorder: "#4a2626",
  },
};

export const gradients = {
  primary: [primaryPurple, secondaryPurple],
  secondary: [accentPurple, lightPurple],
  success: ['#4ade80', '#22c55e'],
  background: [backgroundPurple, primaryPurple],
  card: [cardPurple, secondaryPurple],
};

export const quickPrompts = [
  {
    id: 'mythic',
    title: 'Mythic Weaving',
    icon: 'Sparkles',
    color: lightPurple,
    prompt: 'Help me weave a story that explores the mythic depths of',
  },
  {
    id: 'glitch',
    title: 'Pattern Breaking',
    icon: 'Zap',
    color: '#fbbf24',
    prompt: 'I feel stuck in this pattern. Help me find a new way to approach',
  },
  {
    id: 'mirror',
    title: 'Deep Reflection',
    icon: 'BookOpen',
    color: '#4ade80',
    prompt: 'Mirror back to me what you sense about',
  },
  {
    id: 'memory',
    title: 'Sacred Memory',
    icon: 'BarChart3',
    color: accentPurple,
    prompt: 'Help me honor and understand this memory:',
  },
];
