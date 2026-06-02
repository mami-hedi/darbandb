import { Model, DataTypes, Sequelize } from 'sequelize';

interface MultilingualText {
  fr: string;
  en: string;
}

export class BlogPost extends Model {
  declare id: number;
  declare slug: string;
  declare date: string;
  declare title: MultilingualText;
  declare excerpt: MultilingualText;
  declare body: MultilingualText;
  declare category: MultilingualText;
  declare cover: string;
  declare status: 'draft' | 'published' | 'archived';
  declare metaTitle: MultilingualText;
  declare metaDescription: MultilingualText;
  declare imageAlt: MultilingualText;
}

export const initBlogPostModel = (sequelize: Sequelize) => {
  BlogPost.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: DataTypes.STRING(255), unique: true, allowNull: false },
      date: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: () =>
          new Date().toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
      },
      title: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
          return JSON.parse(JSON.stringify(this.getDataValue('title') || { fr: '', en: '' }));
        },
      },
      excerpt: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
          return JSON.parse(JSON.stringify(this.getDataValue('excerpt') || { fr: '', en: '' }));
        },
      },
      body: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
          return JSON.parse(JSON.stringify(this.getDataValue('body') || { fr: '', en: '' }));
        },
      },
      category: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
          return JSON.parse(
            JSON.stringify(this.getDataValue('category') || { fr: 'Inspiration', en: 'Inspiration' })
          );
        },
      },
      cover: { type: DataTypes.STRING(500), allowNull: false },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'published',
        allowNull: false,
      },

      // ── Nouveaux champs SEO ──
      metaTitle: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: { fr: '', en: '' },
        get() {
          return JSON.parse(
            JSON.stringify(this.getDataValue('metaTitle') || { fr: '', en: '' })
          );
        },
      },
      metaDescription: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: { fr: '', en: '' },
        get() {
          return JSON.parse(
            JSON.stringify(this.getDataValue('metaDescription') || { fr: '', en: '' })
          );
        },
      },
      imageAlt: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: { fr: '', en: '' },
        get() {
          return JSON.parse(
            JSON.stringify(this.getDataValue('imageAlt') || { fr: '', en: '' })
          );
        },
      },
    },
    {
      sequelize,
      tableName: 'blogposts',
      timestamps: true,
    }
  );

  return BlogPost;
};