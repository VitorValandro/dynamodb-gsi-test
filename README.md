For testing, use the postman collection exported in the root folder.
The only environment variable for postman is the `baseUrl`. Set to `http://localhost:3000` for the without-gsi version and `http://localhost:3001` for the with-gsi version. All collections will work for both depending on the baseUrl.

For testing, after installing the packages and running the docker compose just run `npm run start-with-gsi` or `npm run start-without-gsi`.
