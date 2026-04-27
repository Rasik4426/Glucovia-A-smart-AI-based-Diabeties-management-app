import React, { useState } from 'react';
import { searchFoods } from '@/utils/foodDatabase';
import { Plus, Minus, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CarbCounter({ onTotalCarbsChange, onFoodItemsChange }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]); // { food, qty }
  const results = searchFoods(query);

  const addFood = (food) => {
    const existing = selected.find(s => s.food.name === food.name);
    let updated;
    if (existing) {
      updated = selected.map(s => s.food.name === food.name ? { ...s, qty: s.qty + 1 } : s);
    } else {
      updated = [...selected, { food, qty: 1 }];
    }
    setSelected(updated);
    notify(updated);
    setQuery('');
  };

  const changeQty = (name, delta) => {
    const updated = selected
      .map(s => s.food.name === name ? { ...s, qty: Math.max(0, s.qty + delta) } : s)
      .filter(s => s.qty > 0);
    setSelected(updated);
    notify(updated);
  };

  const remove = (name) => {
    const updated = selected.filter(s => s.food.name !== name);
    setSelected(updated);
    notify(updated);
  };

  const notify = (items) => {
    const total = Math.round(items.reduce((sum, s) => sum + s.food.carbs_per_serving * s.qty, 0));
    const foodStr = items.map(s => `${s.qty}x ${s.food.name}`).join(', ');
    onTotalCarbsChange(total);
    onFoodItemsChange(foodStr);
  };

  const totalCarbs = Math.round(selected.reduce((sum, s) => sum + s.food.carbs_per_serving * s.qty, 0));

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search food (e.g. rice, banana...)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-9 h-11 rounded-xl"
        />
      </div>

      {/* Search Results */}
      {query.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg max-h-52 overflow-y-auto z-10">
          {results.length === 0 ? (
            <p className="text-sm text-slate-400 px-4 py-3">No foods found</p>
          ) : (
            results.map(food => (
              <button
                key={food.name}
                type="button"
                onClick={() => addFood(food)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-teal-50 transition-colors text-left"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-lg">{food.emoji}</span>
                  <div>
                    <p className="font-medium">{food.name}</p>
                    <p className="text-xs text-slate-400">{food.serving_label}</p>
                  </div>
                </span>
                <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                  {food.carbs_per_serving}g carbs
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected Items */}
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map(({ food, qty }) => (
            <div key={food.name} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <span className="text-lg">{food.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{food.name}</p>
                <p className="text-xs text-amber-600">{Math.round(food.carbs_per_serving * qty)}g carbs</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => changeQty(food.name, -1)} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50">
                  <Minus className="w-3 h-3 text-slate-600" />
                </button>
                <span className="text-sm font-bold text-slate-700 w-5 text-center">{qty}</span>
                <button type="button" onClick={() => changeQty(food.name, 1)} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-teal-50">
                  <Plus className="w-3 h-3 text-slate-600" />
                </button>
                <button type="button" onClick={() => remove(food.name)} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 ml-1">
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center justify-between bg-amber-400 text-white rounded-xl px-4 py-2.5">
            <span className="font-semibold text-sm">Total Carbohydrates</span>
            <span className="text-lg font-bold">{totalCarbs}g</span>
          </div>
        </div>
      )}
    </div>
  );
}