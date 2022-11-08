# Backend API for the project

## Setup

Run the following commands after starting the API docker container for the first
time or after clearing the volume:

```bash
docker exec -ti <container_name> bash
python manage.py migrate
python manage.py collectstatic
```

## API endpoints docs

You can find the API endpoints docs at swagger-ui/
