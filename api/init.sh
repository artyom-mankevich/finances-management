#!/bin/bash

# Collect static files
echo "Collect static files"
python manage.py collectstatic --noinput

# Apply database migrations
echo "Apply database migrations"
python manage.py migrate
echo

python manage.py init_colors
echo

python manage.py init_icons
echo

python manage.py init_currencies
echo

python manage.py init_news_languages
echo
