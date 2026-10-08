import hashlib
import os
import secrets
import smtplib

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from email.message import EmailMessage


from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)

from fastapi.responses import RedirectResponse

from pydantic import (
    BaseModel,
    EmailStr,
)

from sqlalchemy.orm import Session


from app.core.oauth import oauth

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

from app.database import get_db

from app.models.user import User

from app.schemas.user import (
    LoginResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)


# ==========================================================
# ROUTER
# ==========================================================

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ==========================================================
# CONFIG
# ==========================================================

ALLOWED_ROLES = {
    "Analyst",
    "Executive / Viewer",
}

ANALYST_SIGNUP_CODE = os.getenv(
    "ANALYST_SIGNUP_CODE"
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)


GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://localhost:8000/api/auth/google/callback",
)


GITHUB_REDIRECT_URI = os.getenv(
    "GITHUB_REDIRECT_URI",
    "http://localhost:8000/api/auth/github/callback",
)


OTP_EXPIRY_MINUTES = int(
    os.getenv(
        "OTP_EXPIRY_MINUTES",
        "10",
    )
)


# ==========================================================
# LOCAL OTP STORE
#
# Fine for local/student project.
# Production should use Redis/database.
# ==========================================================

OTP_STORE: dict[str, dict] = {}


# ==========================================================
# OTP REQUEST SCHEMAS
# ==========================================================

class OtpSendRequest(BaseModel):
    email: EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str


# ==========================================================
# COOKIE HELPER
# ==========================================================

def set_auth_cookie(
    response: Response,
    user: User,
):

    access_token = create_access_token(
        user.id
    )


    response.set_cookie(
        key="scoptima_access_token",
        httponly=True,
        secure=os.getenv("APP_ENV", "development") == "production",
        samesite="lax",
        path="/",   
        value=access_token,

        httponly=True,

        # localhost development
        secure=False,

        samesite="lax",

        max_age=60 * 60,

        path="/",
    )


# ==========================================================
# OAUTH USER HELPER
# ==========================================================

def get_or_create_oauth_user(
    db: Session,
    email: str,
    full_name: str,
):
    email = (
        email
        .lower()
        .strip()
    )

    # ======================================================
    # CHECK IF USER ALREADY EXISTS
    # ======================================================

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if user:

        # Keep the existing SCOPTIMA role.
        #
        # Example:
        # Analyst stays Analyst.
        # Executive / Viewer stays Executive / Viewer.

        if not user.is_active:
            raise HTTPException(
                status_code=(
                    status.HTTP_403_FORBIDDEN
                ),
                detail=(
                    "Account access is disabled."
                ),
            )

        return user


    # ======================================================
    # NEW OAUTH USER
    # ======================================================
    #
    # Never automatically grant Analyst access.
    #
    # New Google/GitHub users start as:
    # Executive / Viewer
    #
    # Their role can only be upgraded through your
    # controlled SCOPTIMA user-management process.
    # ======================================================

    generated_password = (
        secrets.token_urlsafe(48)
    )


    new_user = User(
        full_name=(
            full_name.strip()
            if full_name
            else email.split("@")[0]
        ),

        email=email,

        hashed_password=(
            hash_password(
                generated_password
            )
        ),

        role="Executive / Viewer",

        is_active=True,
    )


    db.add(
        new_user
    )

    db.commit()

    db.refresh(
        new_user
    )


    return new_user


# ==========================================================
# OTP HASH
# ==========================================================

def hash_otp(
    email: str,
    code: str,
):

    secret = os.getenv(
        "SECRET_KEY",
        "",
    )


    raw_value = (
        f"{email.lower().strip()}:"
        f"{code}:"
        f"{secret}"
    )


    return hashlib.sha256(
        raw_value.encode(
            "utf-8"
        )
    ).hexdigest()


# ==========================================================
# SEND OTP EMAIL
# ==========================================================

def send_otp_email(
    email: str,
    code: str,
):

    smtp_host = os.getenv(
        "SMTP_HOST"
    )

    smtp_port = int(
        os.getenv(
            "SMTP_PORT",
            "587",
        )
    )

    smtp_username = os.getenv(
        "SMTP_USERNAME"
    )

    smtp_password = os.getenv(
        "SMTP_PASSWORD"
    )

    smtp_from_email = (
        os.getenv(
            "SMTP_FROM_EMAIL"
        )
        or
        smtp_username
    )


    if not all(
        [
            smtp_host,
            smtp_username,
            smtp_password,
            smtp_from_email,
        ]
    ):
        raise RuntimeError(
            "SMTP configuration is incomplete."
        )


    message = EmailMessage()


    message["Subject"] = (
        "SCOPTIMA Login Verification Code"
    )

    message["From"] = (
        smtp_from_email
    )

    message["To"] = email


    message.set_content(
        f"""
SCOPTIMA Secure Login

Your verification code is:

{code}

This code expires in {OTP_EXPIRY_MINUTES} minutes.

If you did not request this code,
you can ignore this email.
"""
    )


    smtp_use_tls = (
        os.getenv(
            "SMTP_USE_TLS",
            "true",
        )
        .lower()
        ==
        "true"
    )


    with smtplib.SMTP(
        smtp_host,
        smtp_port,
        timeout=20,
    ) as server:

        server.ehlo()


        if smtp_use_tls:
            server.starttls()
            server.ehlo()


        server.login(
            smtp_username,
            smtp_password,
        )


        server.send_message(
            message
        )


# ==========================================================
# REGISTER
# ==========================================================

@router.post(
    "/register",

    response_model=UserResponse,

    status_code=(
        status.HTTP_201_CREATED
    ),
)
# ============================================
# REGISTER
# ============================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):

    # ========================================
    # NORMALIZE EMAIL
    # ========================================

    email = (
        user_data.email
        .lower()
        .strip()
    )


    # ========================================
    # CHECK EXISTING USER
    # ========================================

    existing_user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if existing_user:

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),

            detail=(
                "An account with this email "
                "already exists."
            ),
        )


    # ========================================
    # VALIDATE ROLE
    # ========================================

    if (
        user_data.role
        not in
        ALLOWED_ROLES
    ):

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),

            detail=(
                "Invalid user role."
            ),
        )


    # ========================================
    # ANALYST REGISTRATION SECURITY
    # ========================================

    if user_data.role == "Analyst":

        if not ANALYST_SIGNUP_CODE:

            raise HTTPException(
                status_code=(
                    status.HTTP_503_SERVICE_UNAVAILABLE
                ),

                detail=(
                    "Analyst registration "
                    "is not enabled."
                ),
            )


        if not secrets.compare_digest(
            user_data.analyst_code or "",
            ANALYST_SIGNUP_CODE,
        ):

            raise HTTPException(
                status_code=(
                    status.HTTP_403_FORBIDDEN
                ),

                detail=(
                    "Invalid Analyst access code."
                ),
            )


    # ========================================
    # CREATE USER
    # ========================================

    new_user = User(
        full_name=(
            user_data
            .full_name
            .strip()
        ),

        email=email,

        hashed_password=(
            hash_password(
                user_data.password
            )
        ),

        role=user_data.role,

        is_active=True,
    )


    db.add(
        new_user
    )


    db.commit()


    db.refresh(
        new_user
    )


    return new_user


# ==========================================================
# NORMAL EMAIL/PASSWORD LOGIN
# ==========================================================

@router.post(
    "/login",

    response_model=LoginResponse,
)
def login_user(
    user_data: UserLogin,

    response: Response,

    db: Session = Depends(
        get_db
    ),
):

    email = (
        user_data.email
        .lower()
        .strip()
    )


    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if not user:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),

            detail=(
                "Invalid email or password."
            ),
        )


    if not verify_password(
        user_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),

            detail=(
                "Invalid email or password."
            ),
        )


    if not user.is_active:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),

            detail=(
                "Account access is disabled."
            ),
        )


    set_auth_cookie(
        response,
        user,
    )


    return {
        "message":
            "Login successful.",

        "user":
            user,
    }


# ==========================================================
# GOOGLE LOGIN
# ==========================================================

@router.get(
    "/google/login"
)
async def google_login(
    request: Request,
):

    if not (
        os.getenv(
            "GOOGLE_CLIENT_ID"
        )
        and
        os.getenv(
            "GOOGLE_CLIENT_SECRET"
        )
    ):
        raise HTTPException(
            status_code=500,

            detail=(
                "Google OAuth is not configured."
            ),
        )


    google = oauth.create_client(
        "google"
    )


    if google is None:
        raise HTTPException(
            status_code=500,

            detail=(
                "Google OAuth client is unavailable."
            ),
        )


    return await google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI,
    )


# ==========================================================
# GOOGLE CALLBACK
# ==========================================================

@router.get(
    "/google/callback"
)
async def google_callback(
    request: Request,

    db: Session = Depends(
        get_db
    ),
):

    try:

        google = oauth.create_client(
            "google"
        )


        if google is None:
            raise RuntimeError(
                "Google OAuth is not configured."
            )


        token = (
            await google.authorize_access_token(
                request
            )
        )


        user_info = (
            token.get(
                "userinfo"
            )
        )


        if not user_info:

            user_info = (
                await google.parse_id_token(
                    request,
                    token,
                )
            )


        if not user_info:
            raise RuntimeError(
                "Google profile could not be loaded."
            )


        email = (
            user_info.get(
                "email"
            )
        )


        email_verified = (
            user_info.get(
                "email_verified",
                False,
            )
        )


        if not email:
            raise RuntimeError(
                "Google did not provide an email address."
            )


        if not email_verified:
            raise RuntimeError(
                "Google email address is not verified."
            )


        full_name = (
            user_info.get(
                "name"
            )
            or
            email.split("@")[0]
        )


        user = (
            get_or_create_oauth_user(
                db=db,
                email=email,
                full_name=full_name,
            )
        )


        response = RedirectResponse(
            url=(
                f"{FRONTEND_URL}/dashboard"
            ),

            status_code=302,
        )


        set_auth_cookie(
            response,
            user,
        )


        return response


    except Exception as error:

        print(
            "GOOGLE OAUTH ERROR:",
            repr(error),
        )


        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}/login"
                "?auth_error=google"
            ),

            status_code=302,
        )


# ==========================================================
# GITHUB LOGIN
# ==========================================================

@router.get(
    "/github/login"
)
async def github_login(
    request: Request,
):

    if not (
        os.getenv(
            "GITHUB_CLIENT_ID"
        )
        and
        os.getenv(
            "GITHUB_CLIENT_SECRET"
        )
    ):
        raise HTTPException(
            status_code=500,

            detail=(
                "GitHub OAuth is not configured."
            ),
        )


    github = oauth.create_client(
        "github"
    )


    if github is None:
        raise HTTPException(
            status_code=500,

            detail=(
                "GitHub OAuth client is unavailable."
            ),
        )


    return await github.authorize_redirect(
        request,
        GITHUB_REDIRECT_URI,
    )


# ==========================================================
# GITHUB CALLBACK
# ==========================================================

@router.get(
    "/github/callback"
)
async def github_callback(
    request: Request,

    db: Session = Depends(
        get_db
    ),
):

    try:

        github = oauth.create_client(
            "github"
        )


        if github is None:
            raise RuntimeError(
                "GitHub OAuth is not configured."
            )


        token = (
            await github.authorize_access_token(
                request
            )
        )


        profile_response = (
            await github.get(
                "user",
                token=token,
            )
        )


        profile_response.raise_for_status()


        profile = (
            profile_response.json()
        )


        email = (
            profile.get(
                "email"
            )
        )


        # GitHub can hide the email.
        if not email:

            email_response = (
                await github.get(
                    "user/emails",
                    token=token,
                )
            )


            email_response.raise_for_status()


            emails = (
                email_response.json()
            )


            primary_verified = next(
                (
                    item
                    for item in emails
                    if (
                        item.get(
                            "primary"
                        )
                        and
                        item.get(
                            "verified"
                        )
                    )
                ),
                None,
            )


            any_verified = next(
                (
                    item
                    for item in emails
                    if item.get(
                        "verified"
                    )
                ),
                None,
            )


            selected_email = (
                primary_verified
                or
                any_verified
            )


            if selected_email:
                email = (
                    selected_email.get(
                        "email"
                    )
                )


        if not email:
            raise RuntimeError(
                "GitHub did not provide a verified email address."
            )


        full_name = (
            profile.get(
                "name"
            )
            or
            profile.get(
                "login"
            )
            or
            email.split("@")[0]
        )


        user = (
            get_or_create_oauth_user(
                db=db,
                email=email,
                full_name=full_name,
            )
        )


        response = RedirectResponse(
            url=(
                f"{FRONTEND_URL}/dashboard"
            ),

            status_code=302,
        )


        set_auth_cookie(
            response,
            user,
        )


        return response


    except Exception as error:

        print(
            "GITHUB OAUTH ERROR:",
            repr(error),
        )


        return RedirectResponse(
            url=(
                f"{FRONTEND_URL}/login"
                "?auth_error=github"
            ),

            status_code=302,
        )


# ==========================================================
# SEND EMAIL OTP
# ==========================================================

@router.post(
    "/otp/send"
)
def send_login_otp(
    payload: OtpSendRequest,

    db: Session = Depends(
        get_db
    ),
):

    email = (
        str(
            payload.email
        )
        .lower()
        .strip()
    )


    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    generic_message = {
        "message": (
            "If the account exists, "
            "a verification code has been sent."
        )
    }


    # Avoid exposing whether an account exists.
    if not user:
        return generic_message


    if not user.is_active:
        return generic_message


    code = (
        f"{secrets.randbelow(1000000):06d}"
    )


    expires_at = (
        datetime.now(
            timezone.utc
        )
        +
        timedelta(
            minutes=(
                OTP_EXPIRY_MINUTES
            )
        )
    )


    OTP_STORE[
        email
    ] = {
        "hash":
            hash_otp(
                email,
                code,
            ),

        "expires_at":
            expires_at,

        "attempts":
            0,
    }


    try:

        send_otp_email(
            email,
            code,
        )


    except Exception as error:

        OTP_STORE.pop(
            email,
            None,
        )


        print(
            "OTP EMAIL ERROR:",
            repr(error),
        )


        raise HTTPException(
            status_code=500,

            detail=(
                "Unable to send verification code."
            ),
        )


    return generic_message


# ==========================================================
# VERIFY EMAIL OTP
# ==========================================================

@router.post(
    "/otp/verify",

    response_model=LoginResponse,
)
def verify_login_otp(
    payload: OtpVerifyRequest,

    response: Response,

    db: Session = Depends(
        get_db
    ),
):

    email = (
        str(
            payload.email
        )
        .lower()
        .strip()
    )


    code = (
        payload.code
        .strip()
    )


    if (
        len(code) != 6
        or
        not code.isdigit()
    ):
        raise HTTPException(
            status_code=400,

            detail=(
                "Enter a valid 6-digit verification code."
            ),
        )


    stored = OTP_STORE.get(
        email
    )


    if not stored:
        raise HTTPException(
            status_code=400,

            detail=(
                "Verification code is invalid or expired."
            ),
        )


    now = datetime.now(
        timezone.utc
    )


    if (
        now
        >
        stored["expires_at"]
    ):
        OTP_STORE.pop(
            email,
            None,
        )


        raise HTTPException(
            status_code=400,

            detail=(
                "Verification code has expired."
            ),
        )


    stored["attempts"] += 1


    if stored["attempts"] > 5:

        OTP_STORE.pop(
            email,
            None,
        )


        raise HTTPException(
            status_code=429,

            detail=(
                "Too many verification attempts. "
                "Request a new code."
            ),
        )


    expected_hash = (
        stored["hash"]
    )


    received_hash = hash_otp(
        email,
        code,
    )


    if not secrets.compare_digest(
        expected_hash,
        received_hash,
    ):
        raise HTTPException(
            status_code=400,

            detail=(
                "Verification code is invalid or expired."
            ),
        )


    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if not user:
        raise HTTPException(
            status_code=401,

            detail=(
                "Authentication failed."
            ),
        )


    if not user.is_active:
        raise HTTPException(
            status_code=403,

            detail=(
                "Account access is disabled."
            ),
        )


    OTP_STORE.pop(
        email,
        None,
    )


    set_auth_cookie(
        response,
        user,
    )


    return {
        "message":
            "OTP login successful.",

        "user":
            user,
    }


# ==========================================================
# CURRENT USER DEPENDENCY
# ==========================================================

def get_current_user(
    scoptima_access_token:
        str | None = Cookie(
            default=None
        ),

    db: Session = Depends(
        get_db
    ),
):

    if not scoptima_access_token:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),

            detail=(
                "Authentication required."
            ),
        )


    user_id = decode_access_token(
        scoptima_access_token
    )


    if user_id is None:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),

            detail=(
                "Invalid or expired session."
            ),
        )


    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )


    if not user:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),

            detail=(
                "User account not found."
            ),
        )


    if not user.is_active:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),

            detail=(
                "Account access is disabled."
            ),
        )


    return user


# ==========================================================
# ME
# ==========================================================

@router.get(
    "/me",

    response_model=UserResponse,
)
def get_me(
    current_user:
        User = Depends(
            get_current_user
        ),
):

    return current_user


# ==========================================================
# LOGOUT
# ==========================================================

@router.post(
    "/logout"
)
def logout_user(
    response: Response,
):

    response.delete_cookie(
        key="scoptima_access_token",
        path="/",
    )


    return {
        "message":
            "Logout successful."
    }