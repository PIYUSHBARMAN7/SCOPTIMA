import os

from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv


load_dotenv()


oauth = OAuth()


# ==========================================================
# GOOGLE
# ==========================================================

google_client_id = os.getenv("GOOGLE_CLIENT_ID")
google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")


if google_client_id and google_client_secret:
    oauth.register(
        name="google",

        client_id=google_client_id,

        client_secret=google_client_secret,

        server_metadata_url=(
            "https://accounts.google.com/.well-known/openid-configuration"
        ),

        client_kwargs={
            "scope": "openid email profile"
        },
    )


# ==========================================================
# GITHUB
# ==========================================================

github_client_id = os.getenv("GITHUB_CLIENT_ID")
github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")


if github_client_id and github_client_secret:
    oauth.register(
        name="github",

        client_id=github_client_id,

        client_secret=github_client_secret,

        access_token_url=(
            "https://github.com/login/oauth/access_token"
        ),

        authorize_url=(
            "https://github.com/login/oauth/authorize"
        ),

        api_base_url=(
            "https://api.github.com/"
        ),

        client_kwargs={
            "scope": "read:user user:email"
        },
    )