# Socket API Generation

1. Update `swagger.json` by getting new one from Socket SwaggerUI. By the time of writing you can extract it from `var options = {...}` in [this .js file](https://backend.movr.network/v2/swagger/swagger-ui-init.js). Exporting `swagger.json` may change in future, if it happends then [this thread](https://stackoverflow.com/questions/48525546/how-to-export-swagger-json-or-yaml) can be helpful. It's also a good idea to validate the file with https://editor.swagger.io/ for potential errors that may cause generator to compain or generate faulty code.
2. Run codegen:

```bash
yarn run openapi-generator-cli generate --skip-validate-spec -i ./src/services/EcoBridge/Socket/api/swagger.json -g typescript-fetch -o ./src/services/EcoBridge/Socket/api/generated --additional-properties=typescriptThreePlus=true && sed -i "1s;^;// @ts-nocheck\n;" ./src/**/generated/**/*.ts
```

3. Keep `openapitools.json` in version control.
4. Enjoy!
