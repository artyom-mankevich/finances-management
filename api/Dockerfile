FROM python:3.10.0

WORKDIR /home/app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY gunicorn.conf.py .
ARG GUNICORN_WORKERS
ENV GUNICORN_WORKERS ${GUNICORN_WORKERS}

CMD sh -c 'gunicorn project.wsgi:application --bind 0.0.0.0:80 --workers ${GUNICORN_WORKERS} ${API_GUNICORN_RELOAD:+--reload} --log-level info --access-logfile - --timeout 360 --error-logfile - --config ./gunicorn.conf.py'
