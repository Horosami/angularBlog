const express = require('express');
const app     = express();
const router  = express.Router();

const models        = require('../../models');
const baseFunctions = require('./base');

const dbconfig   = require('../../config/database');
const Sequelize  = require('sequelize');
const sequelize  = new Sequelize(dbconfig.database, dbconfig.connection.user, dbconfig.connection.password, {
    dialect: 'mysql'
});

router.get('', (req, res) => {
    models.category.findAll()
        .then((categories) => {
            const categoriesRes = [];
            categories.map((category) => {
                categoriesRes.push({
                    id: category.dataValues.id,
                    name: category.dataValues.name
                });
            });
            res.send(categoriesRes);
            return;
        })
        .catch((error) => {
            const answer = baseFunctions.getAnswer(false, 500, error);
            res.send(answer);
            return;
        })
})

module.exports = router;