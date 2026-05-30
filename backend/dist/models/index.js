"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
// src/models/index.ts
const database_1 = require("../config/database"); // Votre fichier actuel
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const CustomPrice_1 = require("./CustomPrice");
const Reservation_1 = require("./Reservation"); // Assurez-vous d'avoir une fonction init ici
// Initialiser les modèles
(0, CustomPrice_1.initCustomPriceModel)(database_1.sequelize);
(0, Reservation_1.initReservationModel)(database_1.sequelize);
