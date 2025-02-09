from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException

from app.core.config import settings
from app.core.i18n import setup_i18n, get_locale, t
from app.core.exceptions import CodexNexusException
from app.api.v1 import api_router

app = FastAPI(
    title="Codex Nexus API",
    description="藏书云廊后端API服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 设置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化国际化
setup_i18n()

# 异常处理
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    locale = get_locale(request)
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VALIDATION_ERROR",
            "detail": t("common.validation_error", locale=locale),
            "errors": exc.errors()
        },
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    locale = get_locale(request)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": getattr(exc, "error_code", "HTTP_ERROR"),
            "detail": t(f"common.{exc.status_code}", locale=locale, default=str(exc.detail))
        },
        headers=getattr(exc, "headers", None)
    )

@app.exception_handler(CodexNexusException)
async def codex_nexus_exception_handler(request: Request, exc: CodexNexusException):
    locale = get_locale(request)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "detail": t(exc.detail, locale=locale) if exc.detail.startswith("common.") else exc.detail
        },
        headers=exc.headers
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    locale = get_locale(request)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_ERROR",
            "detail": t("common.internal_error", locale=locale)
        }
    )

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# 注册路由
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 