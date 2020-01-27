# Run local laboite app in container :

```
cp config/settings.development.json.sample config/settings.development.json

docker-compose build

./run.sh
```

Browse to localhost url with user 'eole@ac-dijon.fr' and password 'changeme'.


# Run laboite with the dev image from [docker-hub](https://hub.docker.com/repository/docker/eoleteam/laboite) :

```
docker-compose -f docker-compose-hub.yml up -d
```

__Caution__ : you may want to clean previous volume :
```docker-compose -f docker-compose-hub.yml down -v```
