module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define('category', {
        name: {
            type: Sequelize.CHAR(50),
            unique: true,
            allowNull: false,
            validate: {
                max: {
                    args: 50,
                    msg: 'Category should be less than 50 characters.'
                }
            }
        }
    }, {
        timestamps: false
    });

    Category.associate = function (models) {
        Category.hasMany(models.post);
    }

    return Category;
}