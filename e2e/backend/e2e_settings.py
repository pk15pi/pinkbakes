"""
Isolated local settings for the PinkBakes E2E suite.

Imports the real project settings, then overrides only what is needed to run
safely on a developer machine:
  * a throw-away SQLite file under e2e/.tmp (never the dev db.sqlite3, never Postgres)
  * file-based email backend (OTP mails land in e2e/.tmp/mail, nothing is sent)
  * SMS / WhatsApp providers blank, payments disabled (local deterministic gateway ids)
  * relaxed throttles so the suite does not 429 itself (throttles are covered by Django tests)
No secrets live here; the signing secret below is a local-only test value.
"""
import os
from pathlib import Path

from pinkbakes_backend.settings import *  # noqa: F401,F403

E2E_TMP = Path(os.environ.get('PB_E2E_TMP', Path(__file__).resolve().parent.parent / '.tmp'))
E2E_TMP.mkdir(parents=True, exist_ok=True)

DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', "testserver"]
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': E2E_TMP / 'e2e.sqlite3',
    }
}
CACHES = {'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}}

EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
EMAIL_FILE_PATH = str(E2E_TMP / 'mail')
EMAIL_HOST = ''
EMAIL_HOST_PASSWORD = ''
SMS_PROVIDER = ''
TWILIO_ACCOUNT_SID = TWILIO_AUTH_TOKEN = TWILIO_FROM_NUMBER = ''
WHATSAPP_API_URL = WHATSAPP_TOKEN = WHATSAPP_PHONE_NUMBER_ID = ''

PAYMENT_ENABLED = False
RAZORPAY_KEY_ID = 'rzp_test_default_key'
RAZORPAY_KEY_SECRET = os.environ.get('PB_E2E_SIGNING_SECRET', 'e2e-local-signing-secret')
RAZORPAY_WEBHOOK_SECRET = RAZORPAY_KEY_SECRET

FRONTEND_URL = os.environ.get('PB_E2E_FRONTEND', 'http://localhost:5174')
PUBLIC_SITE_URL = FRONTEND_URL
CORS_ALLOWED_ORIGINS = [FRONTEND_URL, FRONTEND_URL.replace('localhost', '127.0.0.1')]
CSRF_TRUSTED_ORIGINS = list(CORS_ALLOWED_ORIGINS)

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0

MEDIA_ROOT = E2E_TMP / 'media'

_rates = dict(REST_FRAMEWORK.get('DEFAULT_THROTTLE_RATES', {}))
for _k in list(_rates):
    _rates[_k] = '100000/hour'
REST_FRAMEWORK = {**REST_FRAMEWORK, 'DEFAULT_THROTTLE_RATES': _rates}
