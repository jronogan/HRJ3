import React, { useState } from "react";

const FoodItemRow = ({ foodItem, onSave }) => {
  const [meal, setMeal] = useState(foodItem?.meal ?? "breakfast");
  const [name, setName] = useState(foodItem?.name ?? "");
  const [amount, setAmount] = useState(foodItem?.amount ?? "");
  const [calories, setCalories] = useState(foodItem?.calories ?? "");
  const [protein, setProtein] = useState(foodItem?.protein ?? "");
  const [carbs, setCarbs] = useState(foodItem?.carbs ?? "");
  const [fats, setFats] = useState(foodItem?.fats ?? "");

  return (
    <tr>
      <td>
        <select
          className="fitnessInput"
          value={meal}
          onChange={(e) => setMeal(e.target.value)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </td>
      <td>
        <input
          className="fitnessInput"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </td>
      <td>
        <input
          className="fitnessInput"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 100g"
        />
      </td>
      <td>
        <input
          className="fitnessInput fitnessInputNarrow"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
      </td>
      <td>
        <input
          className="fitnessInput fitnessInputNarrow"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
        />
      </td>
      <td>
        <input
          className="fitnessInput fitnessInputNarrow"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
        />
      </td>
      <td>
        <input
          className="fitnessInput fitnessInputNarrow"
          value={fats}
          onChange={(e) => setFats(e.target.value)}
        />
      </td>
      <td>
        <button
          className="fitnessButton"
          type="button"
          onClick={() =>
            onSave({
              meal,
              name,
              amount: String(amount || "").trim() || undefined,
              calories: calories === "" ? undefined : Number(calories),
              protein: protein === "" ? undefined : Number(protein),
              carbs: carbs === "" ? undefined : Number(carbs),
              fats: fats === "" ? undefined : Number(fats),
            })
          }
        >
          Save item
        </button>
      </td>
    </tr>
  );
};

export default FoodItemRow;
