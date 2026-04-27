// Food database with average carbohydrate values per standard serving
// carbs_per_serving: grams of carbs
// serving_label: what "1 serving" means

export const FOOD_DATABASE = [
  // Grains & Starches
  { name: 'White Rice', emoji: '🍚', category: 'Grains', carbs_per_serving: 45, serving_label: '1 cup cooked' },
  { name: 'Brown Rice', emoji: '🍚', category: 'Grains', carbs_per_serving: 45, serving_label: '1 cup cooked' },
  { name: 'White Bread', emoji: '🍞', category: 'Grains', carbs_per_serving: 15, serving_label: '1 slice' },
  { name: 'Whole Wheat Bread', emoji: '🍞', category: 'Grains', carbs_per_serving: 13, serving_label: '1 slice' },
  { name: 'Pasta', emoji: '🍝', category: 'Grains', carbs_per_serving: 40, serving_label: '1 cup cooked' },
  { name: 'Oatmeal', emoji: '🥣', category: 'Grains', carbs_per_serving: 27, serving_label: '1 cup cooked' },
  { name: 'Cornflakes', emoji: '🥣', category: 'Grains', carbs_per_serving: 24, serving_label: '1 cup' },
  { name: 'Tortilla (flour)', emoji: '🌮', category: 'Grains', carbs_per_serving: 22, serving_label: '1 medium' },
  { name: 'Potato (baked)', emoji: '🥔', category: 'Grains', carbs_per_serving: 37, serving_label: '1 medium' },
  { name: 'Sweet Potato', emoji: '🍠', category: 'Grains', carbs_per_serving: 26, serving_label: '1 medium' },
  { name: 'Noodles', emoji: '🍜', category: 'Grains', carbs_per_serving: 40, serving_label: '1 cup cooked' },
  { name: 'Crackers', emoji: '🫙', category: 'Grains', carbs_per_serving: 18, serving_label: '5 crackers' },

  // Fruits
  { name: 'Apple', emoji: '🍎', category: 'Fruits', carbs_per_serving: 25, serving_label: '1 medium' },
  { name: 'Banana', emoji: '🍌', category: 'Fruits', carbs_per_serving: 27, serving_label: '1 medium' },
  { name: 'Orange', emoji: '🍊', category: 'Fruits', carbs_per_serving: 15, serving_label: '1 medium' },
  { name: 'Grapes', emoji: '🍇', category: 'Fruits', carbs_per_serving: 16, serving_label: '½ cup' },
  { name: 'Mango', emoji: '🥭', category: 'Fruits', carbs_per_serving: 25, serving_label: '1 cup chunks' },
  { name: 'Watermelon', emoji: '🍉', category: 'Fruits', carbs_per_serving: 12, serving_label: '1 cup diced' },
  { name: 'Strawberries', emoji: '🍓', category: 'Fruits', carbs_per_serving: 11, serving_label: '1 cup' },
  { name: 'Blueberries', emoji: '🫐', category: 'Fruits', carbs_per_serving: 21, serving_label: '1 cup' },
  { name: 'Pear', emoji: '🍐', category: 'Fruits', carbs_per_serving: 27, serving_label: '1 medium' },
  { name: 'Peach', emoji: '🍑', category: 'Fruits', carbs_per_serving: 15, serving_label: '1 medium' },

  // Dairy
  { name: 'Milk (whole)', emoji: '🥛', category: 'Dairy', carbs_per_serving: 12, serving_label: '1 cup' },
  { name: 'Milk (skim)', emoji: '🥛', category: 'Dairy', carbs_per_serving: 12, serving_label: '1 cup' },
  { name: 'Yogurt (plain)', emoji: '🫙', category: 'Dairy', carbs_per_serving: 17, serving_label: '1 cup' },
  { name: 'Yogurt (fruit)', emoji: '🫙', category: 'Dairy', carbs_per_serving: 30, serving_label: '1 cup' },
  { name: 'Ice Cream', emoji: '🍦', category: 'Dairy', carbs_per_serving: 25, serving_label: '½ cup' },

  // Snacks & Sweets
  { name: 'Chocolate Bar', emoji: '🍫', category: 'Snacks', carbs_per_serving: 26, serving_label: '1 bar (45g)' },
  { name: 'Chips (potato)', emoji: '🥔', category: 'Snacks', carbs_per_serving: 15, serving_label: '1 oz (~15 chips)' },
  { name: 'Cookies', emoji: '🍪', category: 'Snacks', carbs_per_serving: 20, serving_label: '2 cookies' },
  { name: 'Cake', emoji: '🎂', category: 'Snacks', carbs_per_serving: 35, serving_label: '1 slice' },
  { name: 'Donut', emoji: '🍩', category: 'Snacks', carbs_per_serving: 27, serving_label: '1 donut' },
  { name: 'Granola Bar', emoji: '🫙', category: 'Snacks', carbs_per_serving: 29, serving_label: '1 bar' },
  { name: 'Juice (orange)', emoji: '🧃', category: 'Drinks', carbs_per_serving: 26, serving_label: '1 cup' },
  { name: 'Soda/Cola', emoji: '🥤', category: 'Drinks', carbs_per_serving: 39, serving_label: '12 oz can' },
  { name: 'Sports Drink', emoji: '🥤', category: 'Drinks', carbs_per_serving: 21, serving_label: '12 oz' },

  // Proteins (low carb)
  { name: 'Chicken Breast', emoji: '🍗', category: 'Protein', carbs_per_serving: 0, serving_label: '3 oz' },
  { name: 'Egg', emoji: '🥚', category: 'Protein', carbs_per_serving: 1, serving_label: '1 large' },
  { name: 'Fish', emoji: '🐟', category: 'Protein', carbs_per_serving: 0, serving_label: '3 oz' },
  { name: 'Beef', emoji: '🥩', category: 'Protein', carbs_per_serving: 0, serving_label: '3 oz' },
  { name: 'Beans (black)', emoji: '🫘', category: 'Protein', carbs_per_serving: 20, serving_label: '½ cup' },
  { name: 'Lentils', emoji: '🫘', category: 'Protein', carbs_per_serving: 20, serving_label: '½ cup cooked' },

  // Vegetables
  { name: 'Broccoli', emoji: '🥦', category: 'Vegetables', carbs_per_serving: 6, serving_label: '1 cup' },
  { name: 'Carrots', emoji: '🥕', category: 'Vegetables', carbs_per_serving: 12, serving_label: '1 cup' },
  { name: 'Corn', emoji: '🌽', category: 'Vegetables', carbs_per_serving: 21, serving_label: '½ cup' },
  { name: 'Peas', emoji: '🟢', category: 'Vegetables', carbs_per_serving: 11, serving_label: '½ cup' },
  { name: 'Salad (mixed)', emoji: '🥗', category: 'Vegetables', carbs_per_serving: 3, serving_label: '2 cups' },

  // Indian Breads & Rice
  { name: 'Chapati / Roti', emoji: '🫓', category: 'Indian', carbs_per_serving: 15, serving_label: '1 medium roti' },
  { name: 'Paratha (plain)', emoji: '🫓', category: 'Indian', carbs_per_serving: 30, serving_label: '1 medium' },
  { name: 'Paratha (stuffed)', emoji: '🫓', category: 'Indian', carbs_per_serving: 38, serving_label: '1 medium' },
  { name: 'Naan', emoji: '🫓', category: 'Indian', carbs_per_serving: 45, serving_label: '1 piece' },
  { name: 'Puri', emoji: '🫓', category: 'Indian', carbs_per_serving: 20, serving_label: '2 puris' },
  { name: 'Idli', emoji: '🍚', category: 'Indian', carbs_per_serving: 24, serving_label: '2 idlis' },
  { name: 'Dosa (plain)', emoji: '🥞', category: 'Indian', carbs_per_serving: 30, serving_label: '1 medium' },
  { name: 'Dosa (masala)', emoji: '🥞', category: 'Indian', carbs_per_serving: 45, serving_label: '1 medium' },
  { name: 'Upma', emoji: '🍚', category: 'Indian', carbs_per_serving: 35, serving_label: '1 cup' },
  { name: 'Poha', emoji: '🍚', category: 'Indian', carbs_per_serving: 38, serving_label: '1 cup' },
  { name: 'Basmati Rice', emoji: '🍚', category: 'Indian', carbs_per_serving: 44, serving_label: '1 cup cooked' },
  { name: 'Biryani (chicken)', emoji: '🍛', category: 'Indian', carbs_per_serving: 55, serving_label: '1 cup' },
  { name: 'Pulao / Pilaf', emoji: '🍛', category: 'Indian', carbs_per_serving: 48, serving_label: '1 cup' },
  { name: 'Khichdi', emoji: '🍲', category: 'Indian', carbs_per_serving: 40, serving_label: '1 cup' },

  // Indian Dals & Curries
  { name: 'Dal (lentil soup)', emoji: '🍲', category: 'Indian', carbs_per_serving: 20, serving_label: '1 cup' },
  { name: 'Chana Dal', emoji: '🫘', category: 'Indian', carbs_per_serving: 22, serving_label: '½ cup cooked' },
  { name: 'Rajma (kidney beans)', emoji: '🫘', category: 'Indian', carbs_per_serving: 23, serving_label: '½ cup' },
  { name: 'Chole / Chickpeas', emoji: '🫘', category: 'Indian', carbs_per_serving: 25, serving_label: '½ cup' },
  { name: 'Sambar', emoji: '🍲', category: 'Indian', carbs_per_serving: 15, serving_label: '1 cup' },
  { name: 'Paneer curry', emoji: '🍛', category: 'Indian', carbs_per_serving: 8, serving_label: '½ cup' },
  { name: 'Aloo curry (potato)', emoji: '🥔', category: 'Indian', carbs_per_serving: 30, serving_label: '½ cup' },
  { name: 'Mixed Veg curry', emoji: '🥘', category: 'Indian', carbs_per_serving: 12, serving_label: '1 cup' },

  // Indian Snacks & Sweets
  { name: 'Samosa', emoji: '🔺', category: 'Indian', carbs_per_serving: 25, serving_label: '1 piece' },
  { name: 'Pakora / Bhajiya', emoji: '🍘', category: 'Indian', carbs_per_serving: 18, serving_label: '3 pieces' },
  { name: 'Dhokla', emoji: '🍰', category: 'Indian', carbs_per_serving: 20, serving_label: '2 pieces' },
  { name: 'Vada / Medu Vada', emoji: '🍩', category: 'Indian', carbs_per_serving: 22, serving_label: '2 pieces' },
  { name: 'Gulab Jamun', emoji: '🍮', category: 'Indian', carbs_per_serving: 30, serving_label: '2 pieces' },
  { name: 'Rasgulla', emoji: '🍮', category: 'Indian', carbs_per_serving: 28, serving_label: '2 pieces' },
  { name: 'Halwa (sooji)', emoji: '🍮', category: 'Indian', carbs_per_serving: 45, serving_label: '½ cup' },
  { name: 'Kheer (rice pudding)', emoji: '🍮', category: 'Indian', carbs_per_serving: 35, serving_label: '½ cup' },
  { name: 'Ladoo (besan)', emoji: '🟠', category: 'Indian', carbs_per_serving: 22, serving_label: '1 piece' },
  { name: 'Jalebi', emoji: '🟡', category: 'Indian', carbs_per_serving: 35, serving_label: '2 pieces' },
  { name: 'Murukku', emoji: '🌀', category: 'Indian', carbs_per_serving: 18, serving_label: '5 pieces' },

  // Indian Drinks
  { name: 'Lassi (sweet)', emoji: '🥛', category: 'Indian', carbs_per_serving: 32, serving_label: '1 cup' },
  { name: 'Chai (with sugar)', emoji: '🍵', category: 'Indian', carbs_per_serving: 12, serving_label: '1 cup' },
  { name: 'Mango Lassi', emoji: '🥭', category: 'Indian', carbs_per_serving: 42, serving_label: '1 cup' },
];

export const FOOD_CATEGORIES = [...new Set(FOOD_DATABASE.map(f => f.category))];

export function searchFoods(query) {
  if (!query) return FOOD_DATABASE.slice(0, 20);
  const q = query.toLowerCase();
  return FOOD_DATABASE.filter(f =>
    f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );
}