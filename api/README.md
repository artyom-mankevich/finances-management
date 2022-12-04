# Backend API for the project

## Setup

Run the following commands after starting the API docker container for the first
time or after clearing the volume:

```bash
docker exec -i trpo_api_1 bash init.sh
```

## API endpoints docs

You can find the API endpoints docs at http://localhost:<your_port>/swagger-ui/

## Database access

You can access the database using the following command:

```bash
docker exec -ti trpo_db_1 psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

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
