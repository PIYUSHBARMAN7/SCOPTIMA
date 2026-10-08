import traceback

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.services.supply_chain_upload_service import (
    predict_supply_chain_from_csv,
)

from app.services.retail_upload_service import (
    predict_retail_from_csv,
)

from app.services.logistics_upload_service import (
    predict_logistics_kpi_from_csv,
    predict_stockout_from_csv,
)

from app.models.user import User

from app.routes.auth import (
    get_current_user,
)

from app.schemas.prediction import (
    PredictionRequest,
    RunAnalysisRequest,
)

from app.services.model_service import (
    get_model_status,
    load_pickle,
    extract_feature_names,
    MODEL_PATHS,
    predict_logistics_kpi,
    predict_retail,
    predict_stockout,
    predict_supply_chain,
)


router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"],
)


# ==========================================================
# ERROR HANDLER
# ==========================================================

def execute_prediction(
    prediction_function,
    input_data,
):
    try:
        result = prediction_function(
            input_data
        )

        return result

    except FileNotFoundError as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=503,
            detail=f"Model file not found: {error}",
        )

    except ValueError as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=400,
            detail=f"Invalid model input: {error}",
        )

    except Exception as error:
        traceback.print_exc()

        print(
            "\n=============================="
        )
        print("PREDICTION ERROR")
        print("==============================")
        print("TYPE:", type(error).__name__)
        print("MESSAGE:", str(error))
        print("==============================\n")

        raise HTTPException(
            status_code=500,
            detail=(
                f"{type(error).__name__}: "
                f"{str(error)}"
            ),
        )

# ==========================================================
# MODEL STATUS
# ==========================================================

@router.get("/status")
def model_status(
    current_user: User = Depends(
        get_current_user
    ),
):

    return {
        "status": "ok",
        "artifacts": get_model_status(),
    }

@router.get("/requirements")
def prediction_requirements(
    current_user: User = Depends(
        get_current_user
    ),
):
    supply_config = load_pickle(
        MODEL_PATHS[
            "supply_chain_feature_config"
        ]
    )

    retail_config = load_pickle(
        MODEL_PATHS[
            "retail_feature_config"
        ]
    )

    logistics_config = load_pickle(
        MODEL_PATHS[
            "logistics_feature_config"
        ]
    )

    return {
        "supply_chain": {
            "target": supply_config.get(
                "target"
            ),
            "model": supply_config.get(
                "model_name"
            ),
            "features": extract_feature_names(
                supply_config
            ),
            "categorical_features":
                supply_config.get(
                    "categorical_features",
                    [],
                ),
        },

        "retail": {
            "target": retail_config.get(
                "target"
            ),
            "model": retail_config.get(
                "model_type"
            ),
            "features": extract_feature_names(
                retail_config
            ),
            "categorical_features":
                retail_config.get(
                    "categorical_features",
                    [],
                ),
        },

        "logistics_kpi": {
            "target":
                logistics_config.get(
                    "kpi_target"
                ),
            "features":
                extract_feature_names(
                    logistics_config,
                    "regression",
                ),
            "categorical_features":
                logistics_config.get(
                    "categorical_features",
                    [],
                ),
        },

        "stockout": {
            "target":
                logistics_config.get(
                    "stockout_target"
                ),
            "features":
                extract_feature_names(
                    logistics_config,
                    "classification",
                ),
            "categorical_features":
                logistics_config.get(
                    "categorical_features",
                    [],
                ),
        },
    }
@router.post(
    "/retail-from-csv"
)
async def retail_from_csv(
    file: UploadFile = File(...),

    current_user: User = Depends(
        get_current_user
    ),
):
    if (
        current_user.role
        != "Analyst"
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Only Analyst users "
                "can run CSV analysis."
            ),
        )


    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail=(
                "CSV file is required."
            ),
        )


    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only CSV files are supported."
            ),
        )


    try:
        file_bytes = (
            await file.read()
        )


        result = (
            predict_retail_from_csv(
                file_bytes
            )
        )


        return result


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:
        print(
        "Retail CSV prediction error:",
        repr(error),
        )

        raise HTTPException(
            status_code=500,
        detail=(
            f"{type(error).__name__}: "
            f"{str(error)}"
        ),
    )
# ==========================================================
# SUPPLY CHAIN
# ==========================================================

@router.post("/supply-chain")
def supply_chain_prediction(
    request: PredictionRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    return execute_prediction(
        predict_supply_chain,
        request.input_data,
    )


# ==========================================================
# RETAIL
# ==========================================================

@router.post("/retail")
def retail_prediction(
    request: PredictionRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    return execute_prediction(
        predict_retail,
        request.input_data,
    )

@router.post(
    "/logistics-kpi-from-csv"
)
async def logistics_kpi_from_csv(
    file: UploadFile = File(...),

    current_user: User = Depends(
        get_current_user
    ),
):
    if (
        current_user.role
        != "Analyst"
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Only Analyst users "
                "can run CSV analysis."
            ),
        )


    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="CSV file is required.",
        )


    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only CSV files are supported."
            ),
        )


    try:
        file_bytes = (
            await file.read()
        )


        return (
            predict_logistics_kpi_from_csv(
                file_bytes
            )
        )


    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:
        print(
            "Logistics KPI CSV error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"{type(error).__name__}: "
                f"{str(error)}"
            ),
        )
        
@router.post(
    "/stockout-from-csv"
)
async def stockout_from_csv(
    file: UploadFile = File(...),

    current_user: User = Depends(
        get_current_user
    ),
):
    if (
        current_user.role
        != "Analyst"
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Only Analyst users "
                "can run CSV analysis."
            ),
        )


    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="CSV file is required.",
        )


    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only CSV files are supported."
            ),
        )


    try:
        file_bytes = (
            await file.read()
        )


        return (
            predict_stockout_from_csv(
                file_bytes
            )
        )


    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:
        print(
            "Stockout CSV error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"{type(error).__name__}: "
                f"{str(error)}"
            ),
        )

# ==========================================================
# LOGISTICS KPI
# ==========================================================

@router.post("/logistics-kpi")
def logistics_kpi_prediction(
    request: PredictionRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    return execute_prediction(
        predict_logistics_kpi,
        request.input_data,
    )


# ==========================================================
# STOCKOUT
# ==========================================================

@router.post("/stockout")
def stockout_prediction(
    request: PredictionRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    return execute_prediction(
        predict_stockout,
        request.input_data,
    )


# ==========================================================
# RUN ANALYSIS
# ANALYST ONLY
# ==========================================================

@router.post(
    "/supply-chain-from-csv"
)
async def supply_chain_from_csv(
    file: UploadFile = File(...),

    current_user: User = Depends(
        get_current_user
    ),
):
    if (
        current_user.role
        != "Analyst"
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Only Analyst users "
                "can run CSV analysis."
            ),
        )


    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="CSV file is required.",
        )


    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only CSV files are supported."
            ),
        )


    try:
        file_bytes = await file.read()


        result = (
            predict_supply_chain_from_csv(
                file_bytes
            )
        )


        return result


    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    except Exception as error:
        print(
            "CSV prediction error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to process "
                "the uploaded dataset."
            ),
        )

@router.post("/run-analysis")
def run_analysis(
    request: RunAnalysisRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    if current_user.role != "Analyst":

        raise HTTPException(
            status_code=403,
            detail=(
                "Only Analyst users can run "
                "new model analysis."
            ),
        )


    prediction_functions = {
        "supply_chain":
            predict_supply_chain,

        "retail":
            predict_retail,

        "logistics_kpi":
            predict_logistics_kpi,

        "stockout":
            predict_stockout,
    }


    selected_function = (
        prediction_functions.get(
            request.model
        )
    )


    if selected_function is None:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid model. Use "
                "supply_chain, retail, "
                "logistics_kpi or stockout."
            ),
        )


    result = execute_prediction(
        selected_function,
        request.input_data,
    )


    return {
        "analysis_status": "completed",

        "requested_by": {
            "id": current_user.id,
            "name": current_user.full_name,
            "role": current_user.role,
        },

        "selected_model":
            request.model,

        "result":
            result,
    }