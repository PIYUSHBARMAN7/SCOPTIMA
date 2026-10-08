from datetime import datetime
from pathlib import Path

import pandas as pd


BACKEND_DIR = Path(__file__).resolve().parents[2]

DATA_DIR = BACKEND_DIR / "data"

HISTORY_FILE = DATA_DIR / "prediction_history.csv"


HISTORY_COLUMNS = [
    "timestamp",
    "model_type",
    "record_id",
    "location_id",
    "date",
    "actual_demand",
    "forecast_demand",
]


# ==========================================================
# SAVE PREDICTION HISTORY
# ==========================================================

def save_prediction_history(
    model_type: str,
    record_id: str,
    location_id: str,
    date: str,
    forecast_demand: float,
    actual_demand=None,
):
    DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


    row = {
        "timestamp":
            datetime.now().isoformat(),

        "model_type":
            str(model_type),

        "record_id":
            str(record_id),

        "location_id":
            str(location_id),

        "date":
            str(date),

        "actual_demand":
            actual_demand,

        "forecast_demand":
            float(forecast_demand),
    }


    new_df = pd.DataFrame(
        [row],
        columns=HISTORY_COLUMNS,
    )


    if HISTORY_FILE.exists():

        try:
            existing_df = pd.read_csv(
                HISTORY_FILE
            )

        except Exception:
            existing_df = pd.DataFrame(
                columns=HISTORY_COLUMNS
            )


        combined_df = pd.concat(
            [
                existing_df,
                new_df,
            ],
            ignore_index=True,
        )

    else:

        combined_df = new_df


    combined_df.to_csv(
        HISTORY_FILE,
        index=False,
    )


# ==========================================================
# GET PREDICTION HISTORY
# ==========================================================

def get_prediction_history(
    limit: int = 30,
):
    if not HISTORY_FILE.exists():
        return []


    try:
        df = pd.read_csv(
            HISTORY_FILE
        )

    except Exception as error:
        print(
            "Prediction history read error:",
            repr(error),
        )

        return []


    if df.empty:
        return []


    required_columns = [
        "date",
        "forecast_demand",
    ]


    for column in required_columns:
        if column not in df.columns:
            return []


    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce",
    )


    df["forecast_demand"] = pd.to_numeric(
        df["forecast_demand"],
        errors="coerce",
    )


    if "actual_demand" not in df.columns:
        df["actual_demand"] = None


    df["actual_demand"] = pd.to_numeric(
        df["actual_demand"],
        errors="coerce",
    )


    df = (
        df
        .dropna(
            subset=[
                "date",
                "forecast_demand",
            ]
        )
        .sort_values(
            "date"
        )
        .tail(limit)
    )


    points = []


    for _, row in df.iterrows():

        actual_value = row.get(
            "actual_demand"
        )


        if pd.isna(
            actual_value
        ):
            actual_value = None


        points.append(
            {
                "date":
                    row[
                        "date"
                    ].strftime(
                        "%Y-%m-%d"
                    ),

                "actual":
                    (
                        float(
                            actual_value
                        )
                        if actual_value
                        is not None
                        else None
                    ),

                "forecast":
                    float(
                        row[
                            "forecast_demand"
                        ]
                    ),

                "model_type":
                    str(
                        row.get(
                            "model_type",
                            "supply_chain",
                        )
                    ),
            }
        )


    return points