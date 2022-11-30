# Backend API for the project

## Setup

Run the following commands after starting the API docker container for the first
time or after clearing the volume:

```bash
docker exec -i trpo_api_1 bash init.sh
```

## API endpoints docs

You can find the API endpoints docs at http://localhost:<your_port>/swagger-ui/

## Default values initialization

### Color

```bash
docker exec -i trpo_api_1 python manage.py init_colors
```

### Icon

```bash
docker exec -i trpo_api_1 python manage.py init_icons
```

### Currency

```bash
docker exec -i trpo_api_1 python manage.py init_currencies
```
