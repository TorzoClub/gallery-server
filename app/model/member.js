'use strict';

const fs = require('fs');

module.exports = app => {
  const { BIGINT, STRING, VIRTUAL } = app.Sequelize;

  const Member = app.model.define('member', {
    qq_num: {
      type: BIGINT,
      allowNull: false,
    },

    avatar_src: {
      type: STRING(2048),
      allowNull: false,
      get() {
        const src = this.getDataValue('avatar_src');
        return app.serviceClasses.image.toSrcUrl(src);
      },

      set(avatar_src) {
        const localPath = app.serviceClasses.image.toLocalSrcPath(avatar_src);
        if (!fs.existsSync(localPath)) {
          throw new app.WarningError('avatar_src is not exists', 400);
        }

        return this.setDataValue('avatar_src', avatar_src);
      },
    },

    avatar_thumb: {
      type: VIRTUAL,
      get() {
        const src = this.getDataValue('avatar_src');
        return app.serviceClasses.image.toThumbUrl(src);
      },
    },

    name: {
      type: STRING,
      allowNull: false,
    },
  });

  Member.associate = () => {
    app.model.Member.hasMany(app.model.Photo, { foreignKey: 'member_id' });
  };

  return Member;
};
