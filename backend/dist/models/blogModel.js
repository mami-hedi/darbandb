"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBlogPostModel = exports.BlogPost = void 0;
const sequelize_1 = require("sequelize");
class BlogPost extends sequelize_1.Model {
}
exports.BlogPost = BlogPost;
const initBlogPostModel = (sequelize) => {
    BlogPost.init({
        id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        slug: { type: sequelize_1.DataTypes.STRING(255), unique: true, allowNull: false },
        date: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            defaultValue: () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        },
        // Gestion sécurisée du JSON pour MySQL
        title: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            get() { return JSON.parse(JSON.stringify(this.getDataValue('title') || { fr: '', en: '' })); }
        },
        excerpt: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            get() { return JSON.parse(JSON.stringify(this.getDataValue('excerpt') || { fr: '', en: '' })); }
        },
        body: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            get() { return JSON.parse(JSON.stringify(this.getDataValue('body') || { fr: '', en: '' })); }
        },
        category: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            get() { return JSON.parse(JSON.stringify(this.getDataValue('category') || { fr: 'Inspiration', en: 'Inspiration' })); }
        },
        cover: { type: sequelize_1.DataTypes.STRING(500), allowNull: false },
        status: {
            type: sequelize_1.DataTypes.ENUM('draft', 'published', 'archived'),
            defaultValue: 'published',
            allowNull: false
        },
    }, {
        sequelize,
        tableName: 'blogposts',
        timestamps: true,
    });
    return BlogPost;
};
exports.initBlogPostModel = initBlogPostModel;
