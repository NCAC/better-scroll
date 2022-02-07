import path from "path";
import log from "./utils/log.js";
import { fileURLToPath } from "url";
import { isUndefined, isNull, has, get, set } from "lodash-es";
import fileSystem from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootPath = path.join(__dirname, "..");
const pkg = fileSystem.readJSONSync("./package.json");

export default {
  rootPath: rootPath,

  init() {
    this.set("distPath", path.join(rootPath, "dist"));
    this.set("main.outJs", path.join(rootPath, pkg.main));
    this.set("main.outDts", path.join(rootPath, pkg.types));
    // this.set("main.outTempDts", this.get("main.outDts".replace(/\.d\.ts/, ".temp.d.ts")));
    this.set("main.src", path.join(rootPath, pkg.src));
  },

  set(key, value) {
    if (isUndefined(value) || isNull(value) || value === "") {
      log.error("Vous devez attribuer une valeur à la clé " + key);
      throw "A value must be defined !";
    }
    if (has(this, key)) {
      log.error(
        "Vous ne pouvez pas mettre à jour la clé " +
          key +
          " avec la méthode set(), utilisez plutôt config.update()"
      );
      throw (
        "Use the update method instead of set, because the key " +
        key +
        " has already a value."
      );
    }

    set(this, key, value);
  },

  update(key, value) {
    if (isUndefined(value) || isNull(value) || value === "") {
      log.error("Vous devez attribuer une valeur à la clé " + key);
      throw "A value must be defined !";
    }

    set(this, key, value);
  },

  get(path) {
    if (!has(this, path)) {
      log.error("Le chemin " + path + " n'existe pas dans l'objet config");
      throw "the path " + path + " does not exist in config object";
    }

    return get(this, path);
  }
};
