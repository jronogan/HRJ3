import React, { use, useEffect, useMemo, useState } from "react";
import UserContext from "../../context/user";
import sharedFetch from "../../shared/sharedFetch";
import { toLocalISODate } from "./fitnessUtils";
import "./FitnessDisplay.css";

const emptyFoodItem = () => ({
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
});

const NutritionLogsPage = () => {
  const userCtx = use(UserContext);
  const fetchData = useMemo(() => sharedFetch(), []);

  const [userId, setUserId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [meal, setMeal] = useState("breakfast");
  const [date, setDate] = useState(toLocalISODate(new Date()));
  const [foodItems, setFoodItems] = useState([emptyFoodItem()]);

  const [editingLogId, setEditingLogId] = useState(null);
  const [editMeal, setEditMeal] = useState("breakfast");
  const [editDate, setEditDate] = useState(toLocalISODate(new Date()));

  const [filterDate, setFilterDate] = useState("");

  const load = async () => {
    setIsLoading(true);
    setError(null);

    const meRes = await fetchData(
      "/users/me",
      "GET",
      undefined,
      userCtx.accessToken
    );
    if (!meRes.ok) {
      setIsLoading(false);
      setError(meRes.msg || "Failed to load /users/me");
      return;
    }

    const uid = meRes.data?.user?._id;
    if (!uid) {
      setIsLoading(false);
      setError("No userId in /users/me response");
      return;
    }

    setUserId(uid);

    const logsRes = await fetchData(
      `/nutritionlogs/users/${uid}`,
      "GET",
      undefined,
      userCtx.accessToken
    );

    if (!logsRes.ok) {
      setIsLoading(false);
      setError(logsRes.msg || "Failed to load nutrition logs");
      return;
    }

    const list = Array.isArray(logsRes.data) ? logsRes.data : [];
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLogs(list);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createLog = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      setError("Missing userId");
      return;
    }

    const cleanItems = foodItems
      .filter((i) => String(i.name).trim().length)
      .map((i) => ({
        name: String(i.name).trim(),
        calories: i.calories === "" ? undefined : Number(i.calories),
        protein: i.protein === "" ? undefined : Number(i.protein),
        carbs: i.carbs === "" ? undefined : Number(i.carbs),
        fats: i.fats === "" ? undefined : Number(i.fats),
      }));

    if (!cleanItems.length) {
      setError("Add at least one food item");
      return;
    }

    const body = {
      userId,
      meal,
      date: date ? new Date(date + "T12:00:00").toISOString() : undefined,
      foodItems: cleanItems,
    };

    const res = await fetchData(
      "/nutritionlogs",
      "POST",
      body,
      userCtx.accessToken
    );
    if (!res.ok) {
      setError(res.msg || "Failed to create nutrition log");
      return;
    }

    setFoodItems([emptyFoodItem()]);
    await load();
  };

  const deleteLog = async (id) => {
    setError(null);
    const res = await fetchData(
      `/nutritionlogs/${id}`,
      "DELETE",
      {},
      userCtx.accessToken
    );
    if (!res.ok) {
      setError(res.msg || "Failed to delete nutrition log");
      return;
    }
    await load();
  };

  const startEdit = (log) => {
    setEditingLogId(log._id);
    setEditMeal(log.meal);
    setEditDate(toLocalISODate(log.date));
  };

  const saveEdit = async () => {
    if (!editingLogId) return;
    setError(null);

    const body = {
      meal: editMeal,
      date: editDate
        ? new Date(editDate + "T12:00:00").toISOString()
        : undefined,
    };

    const res = await fetchData(
      `/nutritionlogs/${editingLogId}`,
      "PATCH",
      body,
      userCtx.accessToken
    );

    if (!res.ok) {
      setError(res.msg || "Failed to update nutrition log");
      return;
    }

    setEditingLogId(null);
    await load();
  };

  const patchFoodItem = async (logId, foodItemId, patch) => {
    setError(null);

    const res = await fetchData(
      `/nutritionlogs/${logId}/fooditems/${foodItemId}`,
      "PATCH",
      patch,
      userCtx.accessToken
    );

    if (!res.ok) {
      setError(res.msg || "Failed to update food item");
      return;
    }

    await load();
  };

  if (isLoading) {
    return <div className="fitnessCard">Loading nutrition logs...</div>;
  }

  const visibleLogs = filterDate
    ? logs.filter((l) => toLocalISODate(l?.date) === filterDate)
    : logs;

  return (
    <div>
      <div className="fitnessRow" style={{ justifyContent: "space-between" }}>
        <h2>Nutrition Logs</h2>
        <button className="fitnessButton" onClick={load}>
          Refresh
        </button>
      </div>

      {error ? (
        <div className="fitnessCard">
          <div className="fitnessError">{error}</div>
        </div>
      ) : null}

      <div className="fitnessCard" style={{ marginBottom: "1rem" }}>
        <h3>Add Nutrition Log</h3>
        <form onSubmit={createLog} className="fitnessGrid">
          <div className="fitnessRow" style={{ gridColumn: "1 / -1" }}>
            <div className="fitnessField">
              <label>Date</label>
              <input
                className="fitnessInput"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="fitnessField">
              <label>Meal</label>
              <select
                className="fitnessInput"
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
              >
                <option value="breakfast">breakfast</option>
                <option value="lunch">lunch</option>
                <option value="dinner">dinner</option>
                <option value="snack">snack</option>
              </select>
            </div>
          </div>

          <div className="fitnessTableWrap" style={{ gridColumn: "1 / -1" }}>
            <table className="fitnessTable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fats</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {foodItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        className="fitnessInput"
                        value={item.name}
                        onChange={(e) => {
                          const next = [...foodItems];
                          next[idx] = { ...next[idx], name: e.target.value };
                          setFoodItems(next);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="fitnessInput"
                        value={item.calories}
                        onChange={(e) => {
                          const next = [...foodItems];
                          next[idx] = {
                            ...next[idx],
                            calories: e.target.value,
                          };
                          setFoodItems(next);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="fitnessInput"
                        value={item.protein}
                        onChange={(e) => {
                          const next = [...foodItems];
                          next[idx] = { ...next[idx], protein: e.target.value };
                          setFoodItems(next);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="fitnessInput"
                        value={item.carbs}
                        onChange={(e) => {
                          const next = [...foodItems];
                          next[idx] = { ...next[idx], carbs: e.target.value };
                          setFoodItems(next);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="fitnessInput"
                        value={item.fats}
                        onChange={(e) => {
                          const next = [...foodItems];
                          next[idx] = { ...next[idx], fats: e.target.value };
                          setFoodItems(next);
                        }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="fitnessButton"
                        onClick={() => {
                          const next = foodItems.filter((_, i) => i !== idx);
                          setFoodItems(next.length ? next : [emptyFoodItem()]);
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="fitnessRow" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="fitnessButton"
                onClick={() => setFoodItems([...foodItems, emptyFoodItem()])}
              >
                Add Item
              </button>
              <button className="fitnessButtonPrimary" type="submit">
                Create Log
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="fitnessCard">
        <h3>Existing Logs</h3>
        <div
          className="fitnessRow"
          style={{ marginTop: "0.5rem", alignItems: "flex-end" }}
        >
          <div className="fitnessField">
            <label>Filter by date</label>
            <input
              className="fitnessInput"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="fitnessField">
            <label>&nbsp;</label>
            <button
              type="button"
              className="fitnessButton"
              onClick={() => setFilterDate("")}
            >
              Show all
            </button>
          </div>
        </div>

        {visibleLogs.length === 0 ? (
          <div className="fitnessMuted">No logs yet.</div>
        ) : null}

        {visibleLogs.map((log) => (
          <div key={log._id} style={{ marginTop: "1rem" }}>
            <div
              className="fitnessRow"
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <strong>{toLocalISODate(log.date)}</strong> — {log.meal}
              </div>
              <div className="fitnessRow">
                <button
                  className="fitnessButton"
                  onClick={() => startEdit(log)}
                >
                  Edit meal/date
                </button>
                <button
                  className="fitnessButton"
                  onClick={() => deleteLog(log._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {editingLogId === log._id ? (
              <div className="fitnessRow" style={{ marginTop: "0.5rem" }}>
                <input
                  className="fitnessInput"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
                <select
                  className="fitnessInput"
                  value={editMeal}
                  onChange={(e) => setEditMeal(e.target.value)}
                >
                  <option value="breakfast">breakfast</option>
                  <option value="lunch">lunch</option>
                  <option value="dinner">dinner</option>
                  <option value="snack">snack</option>
                </select>
                <button className="fitnessButtonPrimary" onClick={saveEdit}>
                  Save
                </button>
                <button
                  className="fitnessButton"
                  onClick={() => setEditingLogId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : null}

            <div className="fitnessTableWrap" style={{ marginTop: "0.5rem" }}>
              <table className="fitnessTable">
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Calories</th>
                    <th>Protein</th>
                    <th>Carbs</th>
                    <th>Fats</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(log.foodItems || []).map((fi) => (
                    <FoodItemRow
                      key={fi._id}
                      foodItem={fi}
                      onSave={(patch) => patchFoodItem(log._id, fi._id, patch)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

export default NutritionLogsPage;
