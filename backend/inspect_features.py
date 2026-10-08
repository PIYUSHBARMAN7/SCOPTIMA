import pickle
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"


files = [
    "feature_config.pkl",
    "retail_feature_config.pkl",
    "logistics_feature_config.pkl",
]


for file_name in files:
    path = MODELS_DIR / file_name

    print("\n" + "=" * 80)
    print(file_name)
    print("=" * 80)

    try:
        with open(path, "rb") as file:
            data = pickle.load(file)

        print("TYPE:")
        print(type(data))

        print("\nCONTENT:")
        print(data)

    except Exception as error:
        print("ERROR:")
        print(error)