'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RecipeIngredient {
  id: string; ingredientName: string; quantity: number; unit: string; costPerUnit: number | null; notes: string | null
}

interface Recipe {
  id: string; menuItemId: string; name: string; servings: number; prepTime: number | null
  instructions: string | null; costPrice: number | null; profitMargin: string
  menuItem: { name: string; price: number; category: string | null }
  ingredients: RecipeIngredient[]
}

interface MenuItem {
  id: string; name: string; price: number; category: string | null
  recipe: { id: string } | null
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState('')
  const [recipeName, setRecipeName] = useState('')
  const [ingredients, setIngredients] = useState<Array<{ name: string; qty: string; unit: string; cost: string }>>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/recipes').then(r => r.json()),
      fetch('/api/menu-items').then(r => r.json()),
    ]).then(([rData, mData]) => {
      if (rData.recipes) setRecipes(rData.recipes)
      if (mData.items) setMenuItems(mData.items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const addIngredient = () => setIngredients([...ingredients, { name: '', qty: '1', unit: 'g', cost: '0' }])
  const updateIngredient = (idx: number, field: string, value: string) => {
    const updated = [...ingredients]
    updated[idx] = { ...updated[idx], [field]: value }
    setIngredients(updated)
  }
  const removeIngredient = (idx: number) => setIngredients(ingredients.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!selectedItem || !recipeName) return
    setSaving(true)
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: selectedItem,
          name: recipeName,
          ingredients: ingredients.map(i => ({
            ingredientName: i.name,
            quantity: parseFloat(i.qty) || 0,
            unit: i.unit,
            costPerUnit: parseFloat(i.cost) || 0,
          })),
        }),
      })
      if (res.ok) {
        setShowForm(false); setSelectedItem(''); setRecipeName(''); setIngredients([])
        const rData = await fetch('/api/recipes').then(r => r.json())
        if (rData.recipes) setRecipes(rData.recipes)
      }
    } catch {} finally { setSaving(false) }
  }

  const getMarginColor = (m: string) => {
    const val = parseFloat(m)
    if (val >= 50) return 'text-[#27500A]'
    if (val >= 25) return 'text-[#854F0B]'
    return 'text-[#A32D2D]'
  }

  if (loading) return <div className="space-y-4"><h1 className="text-xl font-semibold">Recipe BOM</h1><p className="text-sm text-[hsl(var(--color-text-tertiary))]">Loading...</p></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">Recipe BOM</h1>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))] mt-0.5">{recipes.length} dishes with recipes • Auto-calculate profit margin</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#7B3F00] text-[#FAC775] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#8B4A00]">
          <i className="ti ti-plus text-sm mr-1"></i>{showForm ? 'Cancel' : 'Add Recipe'}</button>
      </div>

      {/* Add Recipe Form */}
      {showForm && (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium">New Recipe</h3>
          <select value={selectedItem} onChange={(e) => { setSelectedItem(e.target.value); const m = menuItems.find(x => x.id === e.target.value); if (m) setRecipeName(m.name) }}
            className="w-full px-3 py-2 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]">
            <option value="">Select menu item...</option>
            {menuItems.filter(m => !m.recipe).map(m => (
              <option key={m.id} value={m.id}>{m.name} — RM {m.price.toFixed(2)}</option>
            ))}
          </select>

          <div>
            <label className="text-xs font-medium text-[hsl(var(--color-text-secondary))]">Ingredients</label>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 mt-2 items-start">
                <input type="text" value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                  placeholder="Ingredient name" className="flex-1 px-2 py-1.5 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-primary))]" />
                <input type="number" value={ing.qty} onChange={(e) => updateIngredient(idx, 'qty', e.target.value)}
                  className="w-16 px-2 py-1.5 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))]" />
                <select value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  className="w-16 px-2 py-1.5 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))]">
                  <option>g</option><option>kg</option><option>ml</option><option>L</option><option>pcs</option>
                </select>
                <input type="number" step="0.01" value={ing.cost} onChange={(e) => updateIngredient(idx, 'cost', e.target.value)}
                  placeholder="Cost/unit" className="w-20 px-2 py-1.5 text-sm border border-[hsl(var(--color-border-tertiary))] rounded-md bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))]" />
                <button onClick={() => removeIngredient(idx)} className="text-[#A32D2D] mt-1"><i className="ti ti-trash"></i></button>
              </div>
            ))}
            <button onClick={addIngredient} className="text-xs text-[#7B3F00] mt-2 font-medium"><i className="ti ti-plus mr-1"></i>Add Ingredient</button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !selectedItem}
              className="flex-1 bg-[#27500A] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Recipe'}</button>
            <button onClick={() => setShowForm(false)}
              className="bg-[hsl(var(--color-background-secondary))] text-[hsl(var(--color-text-secondary))] px-4 py-2 rounded-md text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Recipe Cards */}
      {recipes.length === 0 ? (
        <div className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-12 text-center">
          <p className="text-sm text-[hsl(var(--color-text-tertiary))] mb-2">No recipes yet</p>
          <p className="text-xs text-[hsl(var(--color-text-tertiary))]">Create recipes to auto-calculate food cost and profit margin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recipes.map((r) => {
            const totalCost = r.costPrice || r.ingredients.reduce((s, i) => s + (i.costPerUnit || 0) * i.quantity, 0)
            const price = r.menuItem?.price || 0
            const margin = price > 0 ? ((price - totalCost) / price * 100) : 0
            return (
              <div key={r.id} className="bg-[hsl(var(--color-background-primary))] border border-[hsl(var(--color-border-tertiary))] rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--color-text-primary))]">{r.menuItem?.name || r.name}</h3>
                    <p className="text-xs text-[hsl(var(--color-text-tertiary))]">{r.menuItem?.category || 'Uncategorized'}</p>
                  </div>
                  <span className={`text-xs font-bold ${getMarginColor(margin.toString())}`}>
                    {margin.toFixed(1)}% margin
                  </span>
                </div>

                <div className="flex justify-between text-xs mb-3">
                  <span className="text-[hsl(var(--color-text-tertiary))]">Selling: <strong className="text-[hsl(var(--color-text-primary))]">RM {price.toFixed(2)}</strong></span>
                  <span className="text-[hsl(var(--color-text-tertiary))]">Cost: <strong className="text-[#A32D2D]">RM {totalCost.toFixed(2)}</strong></span>
                  <span className="text-[hsl(var(--color-text-tertiary))]">Profit: <strong className="text-[#27500A]">RM {(price - totalCost).toFixed(2)}</strong></span>
                </div>

                {/* Ingredients mini-list */}
                <div className="space-y-1">
                  {r.ingredients.slice(0, 5).map((ing) => (
                    <div key={ing.id} className="flex justify-between text-[11px] text-[hsl(var(--color-text-tertiary))]">
                      <span>{ing.ingredientName}</span>
                      <span>{ing.quantity} {ing.unit}</span>
                    </div>
                  ))}
                  {r.ingredients.length > 5 && (
                    <p className="text-[10px] text-[hsl(var(--color-text-tertiary))]">+{r.ingredients.length - 5} more</p>
                  )}
                </div>

                {/* Profit bar */}
                <div className="mt-3 bg-[hsl(var(--color-background-secondary))] rounded-full h-1.5">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(margin, 100)}%`,
                    backgroundColor: margin >= 50 ? '#27500A' : margin >= 25 ? '#854F0B' : '#A32D2D',
                  }}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
