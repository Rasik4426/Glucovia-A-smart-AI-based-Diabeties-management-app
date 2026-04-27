import React, { useState } from 'react';
import { BookOpen, Play, ChevronDown, ChevronUp, Stethoscope, Utensils, Syringe, Heart, Sun, AlertTriangle, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const videos = [
  { id: 'BNPfxMGXN0M', title: 'Type 1 Diabetes Explained 🩺', channel: 'Diabetes UK' },
  { id: 'uoGklH5GsFA', title: 'How Insulin Works 💉', channel: 'TED-Ed' },
  { id: 'F1EMPi_3CGI', title: 'Blood Sugar & Food 🍎', channel: 'Nucleus Medical Media' },
  { id: 'Mj-ItGCJBa4', title: 'Carb Counting Basics 🍕', channel: 'Mayo Clinic' },
  { id: 'PkBSFRMAlbc', title: 'Exercise with Diabetes 🏃', channel: 'Diabetes UK' },
  { id: '3fqBVEYdNFw', title: 'Living Well with Type 1 🌟', channel: 'JDRF' },
];

function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {playing ? (
        <div className="aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          className="relative w-full aspect-video bg-slate-900 group"
          onClick={() => setPlaying(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>
        </button>
      )}
      <div className="p-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-sm text-slate-800 leading-tight">{video.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{video.channel}</p>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-red-500 hover:text-red-600"
          title="Open on YouTube"
        >
          <Youtube className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

const topics = [
  {
    id: 'sick',
    icon: Stethoscope,
    color: 'from-red-400 to-rose-500',
    title: 'Diabetes Care During Sick Days 🤒',
    summary: 'Being sick can raise your blood sugar even if you\'re not eating much.',
    content: [
      { heading: 'Why does illness affect blood sugar?', text: 'When you\'re sick, your body releases stress hormones that raise blood sugar levels — even if you haven\'t eaten. This is called the "illness effect."' },
      { heading: 'Keep testing more often', text: 'Check your blood sugar every 2–4 hours when sick. Don\'t skip checks even if you feel too tired.' },
      { heading: 'Stay hydrated', text: 'Drink plenty of water or sugar-free fluids. Dehydration can make blood sugar harder to control.' },
      { heading: 'Never skip insulin', text: 'Even if you can\'t eat, your body still needs some basal insulin. Talk to your doctor about sick-day insulin rules.' },
      { heading: '🚨 Call your doctor if:', text: 'Blood sugar is above 300 mg/dL, you\'re vomiting, or you have signs of ketones.' },
    ],
  },
  {
    id: 'insulin',
    icon: Syringe,
    color: 'from-purple-400 to-violet-500',
    title: 'Proper Insulin Usage 💉',
    summary: 'Learn how to inject insulin safely and effectively.',
    content: [
      { heading: 'Types of insulin', text: 'Rapid-acting insulin works quickly (15–30 min) and is taken with meals. Long-acting insulin works all day and is usually taken once a day.' },
      { heading: 'Injection sites', text: 'The best places to inject are: abdomen (belly), outer thighs, upper arms, and buttocks. Rotate sites to prevent skin problems.' },
      { heading: 'Storage', text: 'Keep insulin in the refrigerator. Once opened, most pens and vials can stay at room temperature for 28–30 days.' },
      { heading: 'Timing matters', text: 'Rapid insulin is usually taken 10–15 minutes before a meal. Ask your doctor for your specific timing.' },
      { heading: 'Never share needles', text: 'Insulin pens and syringes are for one person only. Sharing can spread infections.' },
    ],
  },
  {
    id: 'diet',
    icon: Utensils,
    color: 'from-amber-400 to-orange-500',
    title: 'Diet & Nutrition Tips 🥗',
    summary: 'What you eat directly affects your blood sugar. Learn to eat smart.',
    content: [
      { heading: 'Count your carbs', text: 'Carbohydrates raise blood sugar the most. Aim to spread carbs evenly across meals rather than eating a lot at once.' },
      { heading: 'Choose complex carbs', text: 'Whole grains, vegetables, and legumes digest slower, causing gentler blood sugar rises compared to sweets and white bread.' },
      { heading: 'Don\'t skip meals', text: 'Skipping meals can cause low blood sugar (hypoglycemia), especially if you\'ve taken insulin.' },
      { heading: 'Limit sugary drinks', text: 'Soda, juice, and sports drinks raise blood sugar very fast. Choose water, sparkling water, or diet drinks instead.' },
      { heading: 'Healthy plate guide', text: '½ plate: non-starchy vegetables | ¼ plate: lean protein | ¼ plate: complex carbs' },
    ],
  },
  {
    id: 'lifestyle',
    icon: Heart,
    color: 'from-pink-400 to-rose-500',
    title: 'Lifestyle Tips for Diabetes 🏃',
    summary: 'Healthy habits make managing diabetes much easier.',
    content: [
      { heading: 'Exercise is your friend', text: 'Physical activity helps insulin work better and can lower blood sugar. Aim for 30–60 minutes of activity most days.' },
      { heading: 'Check before exercise', text: 'Test your blood sugar before exercise. If it\'s below 100 mg/dL, have a snack first to prevent low blood sugar.' },
      { heading: 'Sleep matters', text: 'Poor sleep can raise blood sugar and make diabetes harder to manage. Aim for 8–10 hours per night.' },
      { heading: 'Stress management', text: 'Stress hormones can spike blood sugar. Try deep breathing, talking to someone, or doing a hobby you enjoy.' },
      { heading: 'Wear a medical ID', text: 'Always carry or wear identification that says you have diabetes, in case of an emergency.' },
    ],
  },
  {
    id: 'hypo',
    icon: AlertTriangle,
    color: 'from-yellow-400 to-amber-500',
    title: 'Treating Low Blood Sugar (Hypo) 🍬',
    summary: 'Know what to do when your blood sugar drops too low.',
    content: [
      { heading: 'Signs of low blood sugar', text: 'Shakiness, sweating, dizziness, confusion, fast heartbeat, hunger, or feeling weak.' },
      { heading: 'The 15-15 Rule', text: 'Eat 15g of fast-acting carbs (e.g., glucose tablets, ½ cup juice, 4 glucose gummies). Wait 15 minutes and recheck. Repeat if still low.' },
      { heading: 'Fast-acting carb examples', text: '• 4–5 glucose tablets\n• ½ cup (120ml) fruit juice or regular soda\n• 1 tablespoon of honey or sugar\n• Hard candy (check the label for ~15g carbs)' },
      { heading: 'After treating a low', text: 'Once blood sugar returns to normal, have a small snack with protein and carbs if your next meal is more than an hour away.' },
      { heading: '🚨 Severe hypoglycemia', text: 'If someone is unconscious or can\'t swallow, call emergency services immediately. Use a glucagon kit if available.' },
    ],
  },
  {
    id: 'monitoring',
    icon: Sun,
    color: 'from-teal-400 to-emerald-500',
    title: 'Understanding Your Numbers 📊',
    summary: 'Learn what your glucose numbers mean and what\'s normal.',
    content: [
      { heading: 'Target blood sugar ranges (general)', text: 'Before meals: 80–130 mg/dL\n2 hours after meals: below 180 mg/dL\nBedtime: 90–150 mg/dL\n(Your doctor may set different targets for you)' },
      { heading: 'What is HbA1c?', text: 'HbA1c is a blood test that shows your average blood sugar over the past 2–3 months. For most kids with diabetes, a target below 7% is common.' },
      { heading: 'Time in Range (TIR)', text: 'This measures the percentage of time your blood sugar stays in the target range. A goal of 70%+ in range is ideal.' },
      { heading: 'Record your readings', text: 'Keep a log of your blood sugar readings, meals, and insulin doses. Patterns in your log help your doctor adjust your treatment.' },
    ],
  },
];

function TopicCard({ topic }) {
  const [open, setOpen] = useState(false);
  const Icon = topic.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center shrink-0 shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-base leading-tight">{topic.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{topic.summary}</p>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
              {topic.content.map((section, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-sm text-slate-700 mb-1">{section.heading}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{section.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Education() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Learn & Grow 📚</h1>
        </div>
        <p className="text-slate-500 text-sm ml-1">Tap any topic to learn more about managing your diabetes</p>
      </div>

      {/* Quick tip banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-5 text-white">
        <p className="text-xs font-semibold opacity-80 mb-1">💡 Daily Tip</p>
        <p className="font-bold text-lg leading-snug">Logging your meals helps you understand how different foods affect your blood sugar! 🍽️</p>
      </div>

      {/* Video Lectures */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Youtube className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-slate-800">Video Guidance 🎬</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      </div>

      {/* Topics */}
      <div>
        <h2 className="font-bold text-slate-800 mb-3">📖 Learn by Topic</h2>
        <div className="space-y-3">
          {topics.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
        <p className="text-xs text-slate-400">📌 Always discuss changes to your care plan with your doctor or healthcare team.</p>
      </div>
    </div>
  );
}