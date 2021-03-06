/*
 * Copyright 2020 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const oPath = require('path');
const oFunctions = require( oPath.resolve( __dirname, "./functions.js" ) );

(async function main() {
  const params = process.argv.slice(2)
  if(params.length >= 1) {
    const cn = params[0]
    const existingArn = params.length > 1 ? params[1] : undefined;

    return oFunctions.generateAndImport(cn, existingArn);

  } else {
    console.log("Usage: node app.js commonName [existingCertARN]")
  }

})()
