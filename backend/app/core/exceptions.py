from fastapi import HTTPException, status

class CodexNexusException(HTTPException):
    """基础异常类"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str | None = None,
        headers: dict | None = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code

class AuthenticationError(CodexNexusException):
    """认证错误"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code="AUTH_ERROR",
            headers={"WWW-Authenticate": "Bearer"}
        )

class ValidationError(CodexNexusException):
    """数据验证错误"""
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_code="VALIDATION_ERROR"
        )

class DuplicateError(CodexNexusException):
    """数据重复错误"""
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code="DUPLICATE_ERROR"
        )

class NotFoundError(CodexNexusException):
    """资源不存在错误"""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code="NOT_FOUND_ERROR"
        ) 