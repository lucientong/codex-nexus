import i18n
import os
from app.core.config import settings

def setup_i18n():
    """初始化国际化配置"""
    i18n.load_path.append(os.path.join(os.path.dirname(__file__), '../../locales'))
    i18n.set('filename_format', '{locale}.{format}')
    i18n.set('locale', settings.DEFAULT_LANGUAGE)
    i18n.set('fallback', 'en')
    i18n.set('skip_locale_root_data', True)
    i18n.set('enable_memoization', True) 