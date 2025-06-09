import os
import pandas as pd
from supabase import create_client
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error
import joblib


def fetch_task_history() -> pd.DataFrame:
    """Fetch historical task data from Supabase."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise EnvironmentError("Missing Supabase credentials")

    supabase = create_client(url, key)

    # Retrieve required fields from the tasks table
    query = (
        supabase.table("tasks")
        .select("agent_id,status,assigned_at,completed_at,trust_score_delta,created_at")
    )
    result = query.execute()
    data = result.data if hasattr(result, "data") else result

    df = pd.DataFrame(data)
    # Drop rows with missing values needed for features
    df = df.dropna(subset=["agent_id", "assigned_at", "completed_at", "trust_score_delta"])
    df["latency"] = (
        pd.to_datetime(df["completed_at"]) - pd.to_datetime(df["assigned_at"])
    ).dt.total_seconds()
    df["taskResult"] = (df["status"] == "completed").astype(int)
    df.rename(
        columns={
            "agent_id": "agentId",
            "trust_score_delta": "trustDelta",
            "created_at": "timestamp",
        },
        inplace=True,
    )
    return df[["agentId", "taskResult", "trustDelta", "latency", "timestamp"]]


def train_model(df: pd.DataFrame):
    """Train Gradient Boosting model to predict trustDelta."""
    label_encoder = LabelEncoder()
    df["agent_label"] = label_encoder.fit_transform(df["agentId"])

    features = df[["agent_label", "taskResult", "latency"]]
    target = df["trustDelta"]

    X_train, X_test, y_train, y_test = train_test_split(
        features, target, test_size=0.2, random_state=42
    )

    model = GradientBoostingRegressor(random_state=42)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    print(f"Test MSE: {mse:.4f}")

    joblib.dump({"model": model, "label_encoder": label_encoder}, "trust_model.pkl")


def main():
    df = fetch_task_history()
    df.to_csv("task_history.csv", index=False)
    train_model(df)


if __name__ == "__main__":
    main()
