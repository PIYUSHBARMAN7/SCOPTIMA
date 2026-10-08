from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd


# ==========================================================
# PATHS
# ==========================================================

BACKEND_DIR = Path(
    __file__
).resolve().parents[2]

DATA_DIR = BACKEND_DIR / "data"


DATASETS = {
    "inventory_optimization": {
        "name": "Inventory Optimization",
        "path": (
            DATA_DIR
            / "logistics_inventory_optimization.csv"
        ),
    },

    "stockout_predictions": {
        "name": "Stockout Predictions",
        "path": (
            DATA_DIR
            / "logistics_stockout_predictions.csv"
        ),
    },

    "prediction_history": {
        "name": "Prediction History",
        "path": (
            DATA_DIR
            / "prediction_history.csv"
        ),
    },
}


# ==========================================================
# COLUMN NORMALIZATION
# ==========================================================

def normalize_column_name(
    name: str,
):
    return (
        str(name)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        .replace("/", "_")
        .replace("(", "")
        .replace(")", "")
        .replace("%", "percent")
    )


def normalize_dataframe(
    df: pd.DataFrame,
):
    df = df.copy()

    df.columns = [
        normalize_column_name(
            column
        )
        for column in df.columns
    ]

    return df


# ==========================================================
# SAFE CALCULATIONS
# ==========================================================

def percentage(
    numerator: float,
    denominator: float,
):
    if denominator <= 0:
        return 0.0

    return (
        numerator
        /
        denominator
        *
        100
    )


# ==========================================================
# NEGATIVE VALUE CHECKS
# ==========================================================

NON_NEGATIVE_HINTS = [
    "stock",
    "inventory",
    "demand",
    "price",
    "cost",
    "value",
    "quantity",
    "units",
    "orders",
    "lead_time",
    "reorder",
    "safety",
    "probability",
    "confidence",
    "forecast",
    "fulfillment",
    "count",
]


def should_be_non_negative(
    column: str,
):
    column = column.lower()

    return any(
        hint in column
        for hint in NON_NEGATIVE_HINTS
    )


# ==========================================================
# DATASET ANALYSIS
# ==========================================================

def analyze_dataset(
    key: str,
    name: str,
    path: Path,
):
    if not path.exists():

        return {
            "key": key,
            "name": name,
            "available": False,
            "status": "Missing",
            "path": path.name,
            "rows": 0,
            "columns": 0,
            "total_cells": 0,
            "missing_values": 0,
            "missing_percentage": 0,
            "duplicate_rows": 0,
            "duplicate_percentage": 0,
            "negative_values": 0,
            "invalid_numeric_values": 0,
            "completeness_score": 0,
            "uniqueness_score": 0,
            "validity_score": 0,
            "quality_score": 0,
            "ml_ready": False,
            "file_size_bytes": 0,
            "last_modified": None,
            "issues": [
                "Dataset file was not found."
            ],
            "column_quality": [],
        }


    df = pd.read_csv(
        path
    )

    df = normalize_dataframe(
        df
    )


    rows = int(
        len(df)
    )

    columns = int(
        len(
            df.columns
        )
    )

    total_cells = (
        rows
        *
        columns
    )


    # ======================================================
    # MISSING VALUES
    # ======================================================

    missing_values = int(
        df
        .isna()
        .sum()
        .sum()
    )


    missing_percentage = (
        percentage(
            missing_values,
            total_cells,
        )
        if total_cells > 0
        else 0
    )


    completeness_score = max(
        0,
        100
        -
        missing_percentage,
    )


    # ======================================================
    # DUPLICATES
    # ======================================================

    duplicate_rows = int(
        df
        .duplicated()
        .sum()
    )


    duplicate_percentage = (
        percentage(
            duplicate_rows,
            rows,
        )
        if rows > 0
        else 0
    )


    uniqueness_score = max(
        0,
        100
        -
        duplicate_percentage,
    )


    # ======================================================
    # NEGATIVE VALUES
    # ======================================================

    negative_values = 0


    for column in df.columns:

        if not should_be_non_negative(
            column
        ):
            continue


        numeric = pd.to_numeric(
            df[column],
            errors="coerce",
        )


        negative_values += int(
            (
                numeric < 0
            ).sum()
        )


    # ======================================================
    # INVALID NUMERIC VALUES
    # ======================================================

    invalid_numeric_values = 0


    for column in df.columns:

        series = df[
            column
        ]


        if pd.api.types.is_numeric_dtype(
            series
        ):
            continue


        normalized_name = (
            column.lower()
        )


        numeric_hint = any(
            hint in normalized_name
            for hint in [
                "stock",
                "cost",
                "price",
                "value",
                "demand",
                "probability",
                "confidence",
                "ratio",
                "rate",
                "score",
                "time",
                "days",
                "orders",
                "count",
                "forecast",
                "reorder",
                "safety",
            ]
        )


        if not numeric_hint:
            continue


        converted = pd.to_numeric(
            series,
            errors="coerce",
        )


        invalid_mask = (
            series.notna()
            &
            converted.isna()
        )


        invalid_numeric_values += int(
            invalid_mask.sum()
        )


    validity_penalty = (
        negative_values
        +
        invalid_numeric_values
    )


    validity_percentage = (
        percentage(
            validity_penalty,
            total_cells,
        )
        if total_cells > 0
        else 0
    )


    validity_score = max(
        0,
        100
        -
        validity_percentage,
    )


    # ======================================================
    # COLUMN QUALITY
    # ======================================================

    column_quality = []


    for column in df.columns:

        series = df[
            column
        ]


        column_missing = int(
            series
            .isna()
            .sum()
        )


        column_missing_percentage = (
            percentage(
                column_missing,
                rows,
            )
            if rows > 0
            else 0
        )


        unique_values = int(
            series
            .nunique(
                dropna=True
            )
        )


        column_quality.append(
            {
                "column":
                    column,

                "dtype":
                    str(
                        series.dtype
                    ),

                "missing_values":
                    column_missing,

                "missing_percentage":
                    round(
                        column_missing_percentage,
                        2,
                    ),

                "unique_values":
                    unique_values,
            }
        )


    column_quality.sort(
        key=lambda item:
            item[
                "missing_percentage"
            ],
        reverse=True,
    )


    # ======================================================
    # OVERALL SCORE
    # ======================================================

    quality_score = (
        completeness_score
        *
        0.50
        +
        uniqueness_score
        *
        0.20
        +
        validity_score
        *
        0.30
    )


    quality_score = max(
        0,
        min(
            100,
            quality_score,
        ),
    )


    # ======================================================
    # STATUS
    # ======================================================

    if rows == 0:

        status = "Empty"

    elif quality_score >= 95:

        status = "Excellent"

    elif quality_score >= 85:

        status = "Good"

    elif quality_score >= 70:

        status = "Warning"

    else:

        status = "Critical"


    ml_ready = bool(
        rows > 0
        and quality_score >= 85
        and invalid_numeric_values == 0
    )


    # ======================================================
    # ISSUES
    # ======================================================

    issues = []


    if rows == 0:

        issues.append(
            "Dataset contains no records."
        )


    if missing_values > 0:

        issues.append(
            f"{missing_values:,} missing values detected."
        )


    if duplicate_rows > 0:

        issues.append(
            f"{duplicate_rows:,} duplicate rows detected."
        )


    if negative_values > 0:

        issues.append(
            f"{negative_values:,} unexpected negative values detected."
        )


    if invalid_numeric_values > 0:

        issues.append(
            f"{invalid_numeric_values:,} invalid numeric values detected."
        )


    if not issues:

        issues.append(
            "No major structural data-quality issues detected."
        )


    # ======================================================
    # FILE INFORMATION
    # ======================================================

    stat = path.stat()


    last_modified = datetime.fromtimestamp(
        stat.st_mtime
    ).isoformat()


    return {
        "key":
            key,

        "name":
            name,

        "available":
            True,

        "status":
            status,

        "path":
            path.name,

        "rows":
            rows,

        "columns":
            columns,

        "total_cells":
            total_cells,

        "missing_values":
            missing_values,

        "missing_percentage":
            round(
                missing_percentage,
                2,
            ),

        "duplicate_rows":
            duplicate_rows,

        "duplicate_percentage":
            round(
                duplicate_percentage,
                2,
            ),

        "negative_values":
            negative_values,

        "invalid_numeric_values":
            invalid_numeric_values,

        "completeness_score":
            round(
                completeness_score,
                2,
            ),

        "uniqueness_score":
            round(
                uniqueness_score,
                2,
            ),

        "validity_score":
            round(
                validity_score,
                2,
            ),

        "quality_score":
            round(
                quality_score,
                2,
            ),

        "ml_ready":
            ml_ready,

        "file_size_bytes":
            int(
                stat.st_size
            ),

        "last_modified":
            last_modified,

        "issues":
            issues,

        "column_quality":
            column_quality,
    }


# ==========================================================
# MAIN DATA QUALITY RESPONSE
# ==========================================================

def get_data_quality_summary():

    datasets = []


    for key, config in DATASETS.items():

        dataset = analyze_dataset(
            key=key,
            name=config[
                "name"
            ],
            path=config[
                "path"
            ],
        )


        datasets.append(
            dataset
        )


    available_datasets = [
        dataset
        for dataset in datasets
        if dataset[
            "available"
        ]
    ]


    total_rows = sum(
        dataset[
            "rows"
        ]
        for dataset
        in available_datasets
    )


    total_cells = sum(
        dataset[
            "total_cells"
        ]
        for dataset
        in available_datasets
    )


    total_missing = sum(
        dataset[
            "missing_values"
        ]
        for dataset
        in available_datasets
    )


    total_duplicates = sum(
        dataset[
            "duplicate_rows"
        ]
        for dataset
        in available_datasets
    )


    total_negative = sum(
        dataset[
            "negative_values"
        ]
        for dataset
        in available_datasets
    )


    total_invalid_numeric = sum(
        dataset[
            "invalid_numeric_values"
        ]
        for dataset
        in available_datasets
    )


    if available_datasets:

        overall_quality_score = (
            sum(
                dataset[
                    "quality_score"
                ]
                for dataset
                in available_datasets
            )
            /
            len(
                available_datasets
            )
        )

    else:

        overall_quality_score = 0


    ml_ready_datasets = sum(
        1
        for dataset
        in available_datasets
        if dataset[
            "ml_ready"
        ]
    )


    # ======================================================
    # GLOBAL STATUS
    # ======================================================

    if overall_quality_score >= 95:

        overall_status = (
            "Excellent"
        )

    elif overall_quality_score >= 85:

        overall_status = (
            "Good"
        )

    elif overall_quality_score >= 70:

        overall_status = (
            "Warning"
        )

    else:

        overall_status = (
            "Critical"
        )


    return {
        "generated_at":
            datetime.now().isoformat(),

        "summary": {

            "datasets_monitored":
                len(
                    datasets
                ),

            "datasets_available":
                len(
                    available_datasets
                ),

            "ml_ready_datasets":
                ml_ready_datasets,

            "total_rows":
                int(
                    total_rows
                ),

            "total_cells":
                int(
                    total_cells
                ),

            "missing_values":
                int(
                    total_missing
                ),

            "duplicate_rows":
                int(
                    total_duplicates
                ),

            "negative_values":
                int(
                    total_negative
                ),

            "invalid_numeric_values":
                int(
                    total_invalid_numeric
                ),

            "overall_quality_score":
                round(
                    overall_quality_score,
                    2,
                ),

            "overall_status":
                overall_status,
        },

        "datasets":
            datasets,
    }