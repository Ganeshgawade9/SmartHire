import os
import sys
from pathlib import Path

from django.core.wsgi import get_wsgi_application

# Add the folder containing manage.py to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smarthire.settings")

application = get_wsgi_application()
app = application