import i18n
import os
from typing import Any
from fastapi import Request
from app.core.config import settings

def setup_i18n():
    """初始化国际化配置"""
    i18n.load_path.append(os.path.join(os.path.dirname(__file__), '../../locales'))
    i18n.set('filename_format', '{locale}.{format}')
    i18n.set('locale', settings.DEFAULT_LANGUAGE)
    i18n.set('fallback', 'en')
    i18n.set('skip_locale_root_data', True)
    i18n.set('enable_memoization', True)

def get_locale(request: Request | None = None) -> str:
    """
    获取当前语言设置
    优先级：请求头 > 查询参数 > 默认语言
    """
    if request:
        # 从请求头获取
        if lang := request.headers.get('Accept-Language'):
            return lang.split(',')[0].strip()
        
        # 从查询参数获取
        if lang := request.query_params.get('lang'):
            return lang
    
    return settings.DEFAULT_LANGUAGE

def t(key: str, locale: str | None = None, **kwargs: Any) -> str:
    """
    获取翻译文本
    """
    if locale:
        i18n.set('locale', locale)
    
    # 获取翻译文本
    text = i18n.t(key, **kwargs)
    
    # 恢复默认语言
    if locale:
        i18n.set('locale', settings.DEFAULT_LANGUAGE)
    
    return text 