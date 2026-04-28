import re

# Fix Settings.jsx
with open('pages/Settings.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { base44 } from '@/api/base44Client';", "import { me, updateMe } from '@/api/api';")
content = content.replace("base44.auth.me()", "me()")
content = content.replace("base44.auth.updateMe", "updateMe")

with open('pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Settings.jsx fixed')

# Fix Reports.jsx - replace LLM integration with local AI summary
with open('pages/Reports.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the LLM call block with a simple local analysis function
old_block = '''    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a friendly diabetes health assistant for a child (age 12+). Analyze this health data and provide:
1. A brief summary of their glucose control
2. Any patterns or concerns you notice
3. 2-3 simple, encouraging tips

Be encouraging, use simple language, and add relevant emojis.

Health data: ${JSON.stringify(summary)}`,
    });'''

new_block = '''    // Local AI insight (no external LLM - uses simple template analysis)
    const result = generateLocalInsight(summary);'''

content = content.replace(old_block, new_block)

# Also need to remove base44 import if any
content = content.replace("import { base44 } from '@/api/base44Client';", "")

# Add the helper function before the component
helper_func = '''
function generateLocalInsight(summary) {
  const { avg_glucose, in_range_pct, low_count, high_count, total_carbs, total_insulin, meals_logged, period } = summary;
  
  let insights = [];
  
  // Glucose control summary
  if (in_range_pct >= 70) {
    insights.push('🌟 **Great job!** Your glucose is in range most of the time. Keep up the excellent work!');
  } else if (in_range_pct >= 50) {
    insights.push('📊 **Doing okay!** About half your readings are in range. There\\'s room for improvement.');
  } else {
    insights.push('⚠️ **Needs attention.** Many readings are outside the target range. Talk to your doctor or parent.');
  }
  
  insights.push('');
  
  // Patterns
  if (low_count > high_count && low_count > 2) {
    insights.push('🍬 **Watch for lows!** You\\'ve had several low readings. Make sure to carry snacks.');
  } else if (high_count > low_count && high_count > 2) {
    insights.push('💉 **High readings spotted.** Consider checking insulin timing and carb counting.');
  }
  
  if (meals_logged > 0 && total_carbs > 0) {
    const avgCarbs = Math.round(total_carbs / meals_logged);
    insights.push(`🍽️ You averaged **${avgCarbs}g carbs** per meal. Great tracking!`);
  }
  
  insights.push('');
  
  // Tips
  insights.push('💡 **Tips:**');
  insights.push('1. 🧘 Try to log meals around the same time each day.');
  insights.push('2. 💧 Drink water and stay active — it helps glucose stay steady!');
  insights.push('3. 🎉 Celebrate small wins. Every in-range reading is a victory!');
  
  return insights.join('\\\\n');
}

'''

# Insert before export default
content = content.replace('export default function Reports() {', helper_func + 'export default function Reports() {')

with open('pages/Reports.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Reports.jsx fixed')
