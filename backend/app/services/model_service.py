import joblib
from pathlib import Path

from typing import Any

import numpy as np
import pandas as pd


# ==========================================================
# PATHS
# ==========================================================

BASE_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = BASE_DIR / "models"


# ==========================================================
# MODEL FILES
# ==========================================================

MODEL_PATHS = {
    "supply_chain_model":
        MODELS_DIR / "final_supply_chain_model.pkl",

    "supply_chain_preprocessor":
        MODELS_DIR / "supply_chain_preprocessor.pkl",

    "supply_chain_feature_config":
        MODELS_DIR / "feature_config.pkl",

    "retail_model":
        MODELS_DIR / "final_retail_elite_model.pkl",

    "retail_preprocessor":
        MODELS_DIR / "retail_preprocessor.pkl",

    "retail_feature_config":
        MODELS_DIR / "retail_feature_config.pkl",

    "retail_ensemble_config":
        MODELS_DIR / "retail_ensemble_config.pkl",

    "logistics_kpi_model":
        MODELS_DIR / "final_logistics_kpi_model.pkl",

    "logistics_stockout_model":
        MODELS_DIR / "logistics_stockout_model.pkl",

    "logistics_preprocessor":
        MODELS_DIR / "logistics_preprocessor.pkl",

    "logistics_feature_config":
        MODELS_DIR / "logistics_feature_config.pkl",
}


# ==========================================================
# CACHE
# ==========================================================

_model_cache = {}


# ==========================================================
# LOAD PICKLE
# ==========================================================

def load_pickle(path: Path):
    """
    Load trusted ML artifacts saved with joblib.
    """

    key = str(path)

    if key in _model_cache:
        return _model_cache[key]

    if not path.exists():
        raise FileNotFoundError(
            f"Required model artifact not found: {path}"
        )

    try:
        artifact = joblib.load(path)

    except Exception as error:
        raise RuntimeError(
            f"Unable to load artifact '{path.name}'. "
            f"{type(error).__name__}: {error}"
        ) from error

    _model_cache[key] = artifact

    print(
        f"Loaded artifact successfully: {path.name}"
    )

    return artifact


# ==========================================================
# FEATURE CONFIG
# ==========================================================

def extract_feature_names(
    config: Any,
    feature_type: str | None = None,
):
    """
    Extract the correct feature list from a saved feature config.
    """

    if config is None:
        return None

    if isinstance(config, (list, tuple)):
        return list(config)

    if not isinstance(config, dict):
        return None

    # Logistics KPI model
    if feature_type == "regression":
        features = config.get("regression_features")

        if isinstance(features, (list, tuple)):
            return list(features)

    # Logistics stockout model
    if feature_type == "classification":
        features = config.get("classification_features")

        if isinstance(features, (list, tuple)):
            return list(features)

    # Supply chain / retail configs
    possible_keys = [
        "features",
        "feature_names",
        "input_features",
        "all_features",
        "selected_features",
        "model_features",
    ]

    for key in possible_keys:
        value = config.get(key)

        if isinstance(value, (list, tuple)):
            return list(value)

    return None


# ==========================================================
# PREPARE INPUT
# ==========================================================

def prepare_dataframe(
    input_data: dict,
    feature_config=None,
    feature_type: str | None = None,
):
    if not isinstance(input_data, dict):
        raise ValueError(
            "input_data must be a JSON object."
        )

    if not input_data:
        raise ValueError(
            "input_data cannot be empty."
        )

    feature_names = extract_feature_names(
        feature_config,
        feature_type,
    )

    if feature_names:

        missing_features = [
            feature
            for feature in feature_names
            if feature not in input_data
        ]

        if missing_features:
            raise ValueError(
                "Missing required features: "
                + ", ".join(missing_features)
            )

        row = {
            feature: input_data[feature]
            for feature in feature_names
        }

    else:
        row = input_data

    return pd.DataFrame([row])


# ==========================================================
# CONVERT NUMPY TYPES
# ==========================================================

def to_python_value(value):

    if isinstance(value, np.generic):
        return value.item()

    if isinstance(value, np.ndarray):
        return value.tolist()

    return value


# ==========================================================
# GENERIC PREDICTION
# ==========================================================

def make_prediction(
    model_path: Path,
    preprocessor_path: Path,
    feature_config_path: Path,
    input_data: dict,
    feature_type: str | None = None,
):
    model = load_pickle(
        model_path
    )

    preprocessor = load_pickle(
        preprocessor_path
    )

    feature_config = load_pickle(
        feature_config_path
    )

    dataframe = prepare_dataframe(
        input_data,
        feature_config,
        feature_type,
    )

    transformed_data = preprocessor.transform(
        dataframe
    )

    prediction = model.predict(
        transformed_data
    )

    result = to_python_value(
        prediction[0]
    )

    return {
        "prediction": result,
    }

# ==========================================================
# SUPPLY CHAIN PREDICTION
# ==========================================================

def predict_supply_chain(
    input_data: dict,
):
    result = make_prediction(
        MODEL_PATHS["supply_chain_model"],
        MODEL_PATHS[
            "supply_chain_preprocessor"
        ],
        MODEL_PATHS[
            "supply_chain_feature_config"
        ],
        input_data,
    )

    return {
        "model": "Extra Trees",
        "prediction_type": "demand_forecast",
        **result,
    }


# ==========================================================
# RETAIL PREDICTION
# ==========================================================

def predict_retail(
    input_data: dict,
):
    result = make_prediction(
        MODEL_PATHS["retail_model"],
        MODEL_PATHS[
            "retail_preprocessor"
        ],
        MODEL_PATHS[
            "retail_feature_config"
        ],
        input_data,
    )

    return {
        "model": "Elite Ensemble",
        "prediction_type": "retail_demand_forecast",
        **result,
    }


# ==========================================================
# LOGISTICS KPI ESTIMATION
# ==========================================================

def predict_logistics_kpi(
    input_data: dict,
):
    model = load_pickle(
        MODEL_PATHS[
            "logistics_kpi_model"
        ]
    )

    feature_config = load_pickle(
        MODEL_PATHS[
            "logistics_feature_config"
        ]
    )

    dataframe = prepare_dataframe(
        input_data,
        feature_config,
        feature_type="regression",
    )

    categorical_features = (
        feature_config.get(
            "categorical_features",
            [],
        )
    )

    for column in categorical_features:
        dataframe[column] = (
            dataframe[column].astype(str)
        )

    prediction = model.predict(
        dataframe
    )

    result = to_python_value(
        prediction[0]
    )

    return {
        "model": "CatBoost KPI Estimator",
        "prediction_type": "kpi_estimation",
        "prediction": result,
    }


# ==========================================================
# STOCKOUT PREDICTION
# ==========================================================
def predict_stockout(
    input_data: dict,
):
    model = load_pickle(
        MODEL_PATHS[
            "logistics_stockout_model"
        ]
    )

    feature_config = load_pickle(
        MODEL_PATHS[
            "logistics_feature_config"
        ]
    )

    dataframe = prepare_dataframe(
        input_data,
        feature_config,
        feature_type="classification",
    )

    categorical_features = (
        feature_config.get(
            "categorical_features",
            [],
        )
    )

    for column in categorical_features:
        dataframe[column] = (
            dataframe[column].astype(str)
        )

    prediction = (
        model.predict(
            dataframe
        )
        .flatten()
    )

    predicted_class = to_python_value(
        prediction[0]
    )

    confidence = None
    stockout_probability = None

    if hasattr(
        model,
        "predict_proba",
    ):
        probabilities = model.predict_proba(
            dataframe
        )[0]

        confidence = float(
            np.max(probabilities)
        )

        if len(probabilities) > 1:
            stockout_probability = float(
                probabilities[1]
            )

    return {
        "model": "CatBoost Stockout Classifier",
        "prediction_type": "stockout_risk",
        "prediction": predicted_class,
        "confidence": confidence,
        "stockout_probability":
            stockout_probability,
    }

# ==========================================================
# MODEL STATUS
# ==========================================================

def get_model_status():

    return {
        key: {
            "path": str(path),
            "exists": path.exists(),
        }
        for key, path in MODEL_PATHS.items()
    }