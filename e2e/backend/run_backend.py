"""
Start the isolated E2E Django API:  python e2e/backend/run_backend.py [--port 8765] [--fresh]

* Never reads the backend .env (python-dotenv is neutralised before settings import).
* Strips DATABASE_URL / POSTGRES_* etc. from the environment so prod services can never be used.
* --fresh deletes e2e/.tmp (only that folder), then migrates and seeds test data.
"""
import argparse
import os
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
E2E_ROOT = HERE.parent
BACKEND = Path(os.environ.get('PB_BACKEND_DIR', E2E_ROOT.parent.parent / 'pinkbakes_backend')).resolve()
TMP = Path(os.environ.get('PB_E2E_TMP', E2E_ROOT / '.tmp')).resolve()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--port', default=os.environ.get('PB_E2E_API_PORT', '8765'))
    ap.add_argument('--fresh', action='store_true')
    ap.add_argument('--seed-only', action='store_true')
    args = ap.parse_args()

    import dotenv
    dotenv.load_dotenv = lambda *a, **k: False
    for key in list(os.environ):
        if key == 'DATABASE_URL' or key.startswith(('POSTGRES_', 'TWILIO_', 'WHATSAPP_', 'EMAIL_', 'RAZORPAY_')):
            os.environ.pop(key)
    os.environ['DJANGO_DEBUG'] = 'true'
    os.environ['SECURE_SSL_REDIRECT'] = 'false'
    os.environ['DB_ENGINE'] = 'sqlite3'
    os.environ['PB_E2E_TMP'] = str(TMP)
    os.environ['DJANGO_SETTINGS_MODULE'] = 'e2e_settings'
    sys.path[:0] = [str(HERE), str(BACKEND)]
    os.chdir(BACKEND)

    if args.fresh and TMP.exists():
        assert TMP.name == '.tmp', 'refusing to delete unexpected folder'
        shutil.rmtree(TMP)
    TMP.mkdir(parents=True, exist_ok=True)

    import django
    django.setup()
    from django.conf import settings
    db = settings.DATABASES['default']
    assert db['ENGINE'].endswith('sqlite3') and str(TMP) in str(db['NAME']), 'unsafe DB config'
    from django.core.management import call_command
    call_command('migrate', interactive=False, verbosity=0)
    import seed_e2e
    seed_e2e.seed()
    if args.seed_only:
        return
    call_command('runserver', f'127.0.0.1:{args.port}', use_reloader=False, use_threading=True)


if __name__ == '__main__':
    main()
