import argparse
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error
import xgboost as xgb


def load_data(path: str):
    """Load a CSV file and separate features from the target."""
    df = pd.read_csv(path)
    if "trust_score" not in df.columns:
        raise ValueError("Input data must contain a 'trust_score' column")
    X = df.drop(columns=["trust_score"])
    y = df["trust_score"]
    num_cols = X.select_dtypes(include=["number"]).columns.tolist()
    cat_cols = X.select_dtypes(exclude=["number"]).columns.tolist()

    preprocessor = ColumnTransformer(
        [
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ]
    )
    return X, y, preprocessor


def train_model(X, y, preprocessor):
    """Train an XGBoost regressor with preprocessing."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = xgb.XGBRegressor(
        objective="reg:squarederror",
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )

    pipeline = Pipeline([("preprocessor", preprocessor), ("regressor", model)])
    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    # Older versions of scikit-learn may not support the ``squared`` parameter.
    mse = mean_squared_error(y_test, preds)
    rmse = mse ** 0.5
    print(f"Test RMSE: {rmse:.4f}")

    return pipeline


def print_feature_importance(pipe: Pipeline, preprocessor: ColumnTransformer):
    """Print feature importance for the trained model."""
    booster = pipe.named_steps["regressor"].get_booster()
    feature_names = preprocessor.get_feature_names_out()
    importance = booster.get_score(importance_type="gain")

    scores = [(feature_names[i], importance.get(f"f{i}", 0.0))
               for i in range(len(feature_names))]
    scores.sort(key=lambda x: x[1], reverse=True)

    print("\nFeature Importance (gain):")
    for name, score in scores:
        print(f"{name}: {score:.4f}")


def main():
    parser = argparse.ArgumentParser(description="Train trust score XGBoost model")
    parser.add_argument("--data", required=True, help="Path to CSV dataset")
    parser.add_argument("--model-out", default="xgb_model.json", help="Path to save model")
    args = parser.parse_args()

    X, y, preprocessor = load_data(args.data)
    pipeline = train_model(X, y, preprocessor)
    print_feature_importance(pipeline, preprocessor)

    # Save the trained booster
    booster = pipeline.named_steps["regressor"].get_booster()
    booster.save_model(args.model_out)
    print(f"Model saved to {args.model_out}")


if __name__ == "__main__":
    main()
