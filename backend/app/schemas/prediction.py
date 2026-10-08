from typing import Any

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):

    input_data: dict[str, Any] = Field(
        ...,
        description=(
            "Feature names and values required "
            "by the trained model."
        ),
    )


class RunAnalysisRequest(BaseModel):

    model: str = Field(
        ...,
        description=(
            "supply_chain, retail, "
            "logistics_kpi or stockout"
        ),
    )

    input_data: dict[str, Any]