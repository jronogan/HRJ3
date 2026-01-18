import React, { useState } from "react";

const FoodItemRow = ({ foodItem, onSave }) => {
  const [name, setName] = useState(foodItem?.name ?? "");
  const [calories, setCalories] = useState(foodItem?.calories ?? "");
  const [protein, setProtein] = useState(foodItem?.protein ?? "");
  const [carbs, setCarbs] = useState(foodItem?.carbs ?? "");
  const [fats, setFats] = useState(foodItem?.fats ?? "");

  return (
    <tr>
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
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
      </td>
      <td>
        <input
          className="fitnessInput"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
        />
      </td>
      <td>
        <input
          className="fitnessInput"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
        />
      </td>
      <td>
        <input
          className="fitnessInput"
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
              name,
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
