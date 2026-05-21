import { Model, DataTypes, Sequelize } from 'sequelize';

interface MultilingualText {
  fr: string;
  en: string;
}

export class BlogPost extends Model {
  // Utilise "declare" au lieu de "public"
  declare id: number;
  declare slug: string;
  declare date: string;
  declare title: MultilingualText;
  declare excerpt: MultilingualText;
  declare body: MultilingualText;
  declare category: MultilingualText;
  declare cover: string;
  declare status: 'draft' | 'published' | 'archived';
}

export const initBlogPostModel = (sequelize: Sequelize) => {
  BlogPost.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: DataTypes.STRING(255), unique: true, allowNull: false },
      date: { 
        type: DataTypes.STRING(50), 
        allowNull: false,
        defaultValue: () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      },
      // Gestion sécurisée du JSON pour MySQL
      title: { 
        type: DataTypes.JSON, 
        allowNull: false,
        get() { return JSON.parse(JSON.stringify(this.getDataValue('title') || { fr: '', en: '' })); }
      },
      excerpt: { 
        type: DataTypes.JSON, 
        allowNull: false,
        get() { return JSON.parse(JSON.stringify(this.getDataValue('excerpt') || { fr: '', en: '' })); }
      },
      body: { 
        type: DataTypes.JSON, 
        allowNull: false,
        get() { return JSON.parse(JSON.stringify(this.getDataValue('body') || { fr: '', en: '' })); }
      },
      category: { 
        type: DataTypes.JSON, 
        allowNull: false,
        get() { return JSON.parse(JSON.stringify(this.getDataValue('category') || { fr: 'Inspiration', en: 'Inspiration' })); }
      },
      cover: { type: DataTypes.STRING(500), allowNull: false },
      status: { 
        type: DataTypes.ENUM('draft', 'published', 'archived'), 
        defaultValue: 'published',
        allowNull: false
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