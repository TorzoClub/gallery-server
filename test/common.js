'use strict';

const assert = require('assert');
const mock = require('egg-mock');

let globalApp;
async function createApp(noSync) {
  // if (globalApp) {
  //   return globalApp;
  // }

  globalApp = mock.app();
  // 等待 app 启动成功，才能执行测试用例

  if (!noSync) {
    await globalApp.ready();
    await globalApp.model.sync({
      force: true,
    });
  }

  return globalApp;
}

async function uploadImage(token, app, imagePath = `${__dirname}/avatar.png`) {
  const { body: newImage } = await app.httpRequest()
    .post('/api/admin/image/upload')
    .set('Authorization', token)
    .field('name', `image-${Date.now()}`)
    .attach('avatar', imagePath)
    .expect(200);

  assert(/^http/.test(newImage.srcUrl));
  assert(/^http/.test(newImage.thumbUrl));

  assert(typeof newImage.src === 'string');
  assert(typeof newImage.thumb === 'string');

  assert(/^http/.test(newImage.imagePrefix));
  assert(/^http/.test(newImage.imageThumbPrefix));

  // await new Promise(r => setTimeout(r, 50));

  return newImage;
}

function getToken(app) {
  return app.httpRequest()
    .post('/api/admin/login')
    .type('json')
    .send({
      pass: app.config.adminPass,
    })
    .expect(200)
    .then(res => {
      const { token } = res.body;
      return token;
    });
}

async function createMember(token, app, appendmemberData = {}) {
  const newImage = await uploadImage(token, app);
  const data = {
    name: 'member name',
    avatar_src: newImage.src,
    qq_num: 114514,
    ...appendmemberData,
  };

  return app.httpRequest()
    .post('/api/admin/member')
    .set('Authorization', token)
    .type('json')
    .send(data)
    .expect(200)
    .then(res => {
      const member = res.body;
      assert(member.avatar_src === newImage.srcUrl);
      return member;
    });
}

function getMemberById(token, app, id, expectStatusCode = 200) {
  return app.httpRequest()
    .get(`/api/admin/member/${id}`)
    .set('Authorization', token)
    .expect(expectStatusCode)
    .then(res => res.body);
}

function removeMemberById(token, app, id) {
  return app.httpRequest()
    .delete(`/api/admin/member/${id}`)
    .set('Authorization', token)
    .expect(200)
    .then(res => res.body);
}

function createGallery(token, app) {
  return app.httpRequest()
    .post('/api/admin/gallery')
    .set('Authorization', token)
    .type('json')
    .send({
      name: 'gallery name',
      index: 0,
      vote_expire: new Date(),
      vote_limit: 3,
    })
    .expect(200)
    .then(res => {
      const gallery = res.body;
      assert(gallery.index === 0);
      assert(gallery.vote_limit === 3);
      assert(gallery.name === 'gallery name');
      return gallery;
    });
}
function getGalleryById(token, app, id, expectStatusCode = 200) {
  return app.httpRequest()
    .get(`/api/admin/gallery/${id}`)
    .set('Authorization', token)
    .expect(expectStatusCode)
    .then(res => {
      const gallery = res.body;
      return gallery;
    });
}
function updateGalleryById(token, app, id, updateData = {}) {
  return app.httpRequest()
    .patch(`/api/admin/gallery/${id}`)
    .set('Authorization', token)
    .type('json')
    .send({
      ...updateData,
    })
    .expect(200)
    .then(res => res.body);
}

function removeGalleryById(token, app, id) {
  return app.httpRequest()
    .delete(`/api/admin/gallery/${id}`)
    .set('Authorization', token)
    .expect(200)
    .then(res => {
      const gallery = res.body;
      return gallery;
    });
}

async function createPhoto(token, app, appendmemberData = {}) {
  const newImage = await uploadImage(token, app);
  const data = {
    member_id: -1,
    gallery_id: -1,
    desc: 'desc',
    src: newImage.src,
    ...appendmemberData,
  };

  return app.httpRequest()
    .post('/api/admin/photo')
    .set('Authorization', token)
    .type('json')
    .send(data)
    .expect(200)
    .then(res => {
      const photo = res.body;
      assert(photo.src === newImage.srcUrl);
      return photo;
    });
}

async function getPhotoById(token, app, photoId, expectStatusCode = 200) {
  return app.httpRequest()
    .get(`/api/admin/photo/${photoId}`)
    .set('Authorization', token)
    .expect(expectStatusCode)
    .then(res => res.body);
}

async function removePhotoById(token, app, photoId, expectStatusCode = 200) {
  return app.httpRequest()
    .delete(`/api/admin/photo/${photoId}`)
    .set('Authorization', token)
    .expect(expectStatusCode)
    .then(res => res.body);
}

module.exports = {
  createApp,
  getToken,
  uploadImage,

  createMember,
  getMemberById,
  removeMemberById,

  createGallery,
  getGalleryById,
  updateGalleryById,
  removeGalleryById,

  createPhoto,
  getPhotoById,
  removePhotoById,
};
